// Pure-JS SQLite shim that exposes a better-sqlite3-compatible API over sql.js
// Used for environments (like Vercel serverless) where native modules don't work.

const path = require("path");
const fs = require("fs");

let initSqlJs = null;
try { initSqlJs = require("sql.js"); } catch (e) {
  console.error("[db-shim] sql.js not installed:", e.message);
}

class Statement {
  constructor(db, sql) {
    this._db = db;
    this._sql = sql;
  }
  _normalizeParams(args) {
    // better-sqlite3 style: can accept a single object (named params) or positional args
    if (args.length === 1 && args[0] && typeof args[0] === "object" && !Array.isArray(args[0])) {
      const obj = args[0];
      const named = {};
      for (const key of Object.keys(obj)) {
        named[":" + key] = obj[key];
        named["@" + key] = obj[key];
        named["$" + key] = obj[key];
      }
      return named;
    }
    return args;
  }
  run(...args) {
    const params = this._normalizeParams(args);
    const stmt = this._db.prepare(this._sql);
    try {
      if (params && !Array.isArray(params) && typeof params === "object" && Object.keys(params).length > 0) {
        stmt.bind(params);
      } else if (Array.isArray(params) && params.length > 0) {
        stmt.bind(params);
      }
      stmt.step();
    } finally {
      stmt.free();
    }
    const changes = this._db.getRowsModified ? this._db.getRowsModified() : 0;
    let lastInsertRowid = 0;
    try {
      const r = this._db.exec("SELECT last_insert_rowid() AS id");
      if (r && r[0] && r[0].values && r[0].values[0]) lastInsertRowid = r[0].values[0][0];
    } catch { /* no row id */ }
    return { changes, lastInsertRowid };
  }
  get(...args) {
    const params = this._normalizeParams(args);
    const stmt = this._db.prepare(this._sql);
    try {
      if (params && !Array.isArray(params) && typeof params === "object" && Object.keys(params).length > 0) {
        stmt.bind(params);
      } else if (Array.isArray(params) && params.length > 0) {
        stmt.bind(params);
      }
      return stmt.step() ? stmt.getAsObject() : undefined;
    } finally {
      stmt.free();
    }
  }
  all(...args) {
    const params = this._normalizeParams(args);
    const stmt = this._db.prepare(this._sql);
    const rows = [];
    try {
      if (params && !Array.isArray(params) && typeof params === "object" && Object.keys(params).length > 0) {
        stmt.bind(params);
      } else if (Array.isArray(params) && params.length > 0) {
        stmt.bind(params);
      }
      while (stmt.step()) rows.push(stmt.getAsObject());
    } finally {
      stmt.free();
    }
    return rows;
  }
  iterate(...args) {
    return this.all(...args)[Symbol.iterator]();
  }
}

class DatabaseShim {
  constructor(sqlJsDb, filePath = null) {
    this._db = sqlJsDb;
    this._filePath = filePath;
  }
  prepare(sql) { return new Statement(this._db, sql); }
  exec(sql) { this._db.exec(sql); return this; }
  close() { if (this._db) this._db.close(); }
  pragma(pragmaStr) {
    try {
      const r = this._db.exec("PRAGMA " + pragmaStr);
      if (r && r[0]) {
        return r[0].values.map((v) => {
          const obj = {};
          r[0].columns.forEach((c, i) => { obj[c] = v[i]; });
          return obj;
        });
      }
    } catch { /* ignore */ }
    return [];
  }
  // Persist to disk (no-op on ephemeral filesystems)
  save() {
    if (!this._filePath) return;
    try {
      const buf = Buffer.from(this._db.export());
      fs.writeFileSync(this._filePath, buf);
    } catch (e) { /* ignore on readonly fs */ }
  }
}

function findWasmPath(file) {
  // Try common locations for sql.js wasm
  const candidates = [
    path.join(__dirname, "node_modules", "sql.js", "dist", file),
    path.join(process.cwd(), "node_modules", "sql.js", "dist", file)
  ];
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch { /* noop */ }
  }
  return file;
}

async function openDatabase(filePath) {
  if (!initSqlJs) throw new Error("sql.js not available");
  const SQL = await initSqlJs({ locateFile: findWasmPath });
  let db;
  if (filePath && fs.existsSync(filePath)) {
    try {
      const buf = fs.readFileSync(filePath);
      db = new SQL.Database(new Uint8Array(buf));
    } catch {
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }
  return new DatabaseShim(db, filePath);
}

module.exports = { openDatabase, DatabaseShim, Statement };
