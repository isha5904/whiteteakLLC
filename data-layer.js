const crypto = require("crypto");
let MongoClient;

try {
  ({ MongoClient } = require("mongodb"));
} catch {
  MongoClient = null;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(check, "hex"));
}

class SqliteStore {
  constructor(db) {
    this.db = db;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        verified INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code_hash TEXT NOT NULL,
        purpose TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        consumed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_token TEXT UNIQUE NOT NULL,
        user_email TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    this.ensureDefaultAdmin();
  }

  ensureDefaultAdmin() {
    const email = "admin@electrohub.local";
    const existing = this.db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) return;
    const now = new Date().toISOString();
    const passwordHash = hashPassword("Admin@123");
    this.db.prepare(
      "INSERT INTO users (name, email, password_hash, verified, created_at) VALUES (?, ?, ?, 1, ?)"
    ).run("MAPLE Admin", email, passwordHash, now);
  }

  async getUserByEmail(email) {
    return this.db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) || null;
  }

  async createUser({ name, email, password }) {
    const now = new Date().toISOString();
    const passwordHash = hashPassword(password);
    this.db.prepare(
      "INSERT INTO users (name, email, password_hash, verified, created_at) VALUES (?, ?, ?, 0, ?)"
    ).run(name, email.toLowerCase(), passwordHash, now);
    return this.getUserByEmail(email);
  }

  async markUserVerified(email) {
    this.db.prepare("UPDATE users SET verified = 1 WHERE email = ?").run(email.toLowerCase());
  }

  async saveOtp({ email, code, purpose, expiresAt }) {
    const now = new Date().toISOString();
    const codeHash = hashPassword(code);
    this.db.prepare("UPDATE otp_codes SET consumed = 1 WHERE email = ? AND purpose = ? AND consumed = 0").run(email.toLowerCase(), purpose);
    this.db.prepare(
      "INSERT INTO otp_codes (email, code_hash, purpose, expires_at, consumed, created_at) VALUES (?, ?, ?, ?, 0, ?)"
    ).run(email.toLowerCase(), codeHash, purpose, expiresAt, now);
  }

  async verifyOtp({ email, code, purpose }) {
    const row = this.db.prepare(
      "SELECT * FROM otp_codes WHERE email = ? AND purpose = ? AND consumed = 0 ORDER BY id DESC LIMIT 1"
    ).get(email.toLowerCase(), purpose);
    if (!row) return false;
    if (new Date(row.expires_at).getTime() < Date.now()) return false;
    const ok = verifyPassword(code, row.code_hash);
    if (!ok) return false;
    this.db.prepare("UPDATE otp_codes SET consumed = 1 WHERE id = ?").run(row.id);
    return true;
  }

  async createSession(email) {
    const token = crypto.randomBytes(32).toString("hex");
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
    this.db.prepare(
      "INSERT INTO sessions (session_token, user_email, expires_at, created_at) VALUES (?, ?, ?, ?)"
    ).run(token, email.toLowerCase(), expiresAt, now);
    return { token, expiresAt };
  }

  async getSession(token) {
    const row = this.db.prepare("SELECT * FROM sessions WHERE session_token = ?").get(token);
    if (!row) return null;
    if (new Date(row.expires_at).getTime() < Date.now()) return null;
    const user = await this.getUserByEmail(row.user_email);
    return user ? { ...row, user } : null;
  }

  async deleteSession(token) {
    this.db.prepare("DELETE FROM sessions WHERE session_token = ?").run(token);
  }
}

class MongoMirrorStore {
  constructor(sqliteStore, uri) {
    this.sqliteStore = sqliteStore;
    this.uri = uri;
    this.client = null;
    this.db = null;
  }

  async init() {
    if (!MongoClient || !this.uri) return;
    try {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      this.db = this.client.db();
      await this.db.collection("users").createIndex({ email: 1 }, { unique: true });
      await this.db.collection("sessions").createIndex({ session_token: 1 }, { unique: true });
    } catch {
      this.db = null;
    }
  }

  async getUserByEmail(email) {
    if (this.db) {
      const user = await this.db.collection("users").findOne({ email: email.toLowerCase() });
      if (user) return user;
    }
    return this.sqliteStore.getUserByEmail(email);
  }

  async createUser(payload) {
    const user = await this.sqliteStore.createUser(payload);
    if (this.db) {
      await this.db.collection("users").updateOne(
        { email: user.email },
        { $set: user },
        { upsert: true }
      );
    }
    return user;
  }

  async markUserVerified(email) {
    await this.sqliteStore.markUserVerified(email);
    if (this.db) {
      await this.db.collection("users").updateOne(
        { email: email.toLowerCase() },
        { $set: { verified: 1 } }
      );
    }
  }

  async saveOtp(payload) {
    await this.sqliteStore.saveOtp(payload);
    if (this.db) {
      await this.db.collection("otp_codes").insertOne({
        email: payload.email.toLowerCase(),
        purpose: payload.purpose,
        expires_at: payload.expiresAt,
        created_at: new Date().toISOString()
      });
    }
  }

  async verifyOtp(payload) {
    return this.sqliteStore.verifyOtp(payload);
  }

  async createSession(email) {
    const session = await this.sqliteStore.createSession(email);
    if (this.db) {
      await this.db.collection("sessions").updateOne(
        { session_token: session.token },
        { $set: { session_token: session.token, user_email: email.toLowerCase(), expires_at: session.expiresAt } },
        { upsert: true }
      );
    }
    return session;
  }

  async getSession(token) {
    return this.sqliteStore.getSession(token);
  }

  async deleteSession(token) {
    await this.sqliteStore.deleteSession(token);
    if (this.db) {
      await this.db.collection("sessions").deleteOne({ session_token: token });
    }
  }
}

async function createDataLayer(db, mongoUri) {
  const sqliteStore = new SqliteStore(db);
  const store = new MongoMirrorStore(sqliteStore, mongoUri);
  await store.init();
  return store;
}

module.exports = {
  createDataLayer,
  hashPassword,
  verifyPassword
};
