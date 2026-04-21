// Fetch every product's spec + angle SVGs and confirm the embedded image
// has a valid MIME type matching the file's actual magic bytes.
const http = require("http");
const path = require("path");
const { openDatabase } = require("../db-shim.js");

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    }).on("error", reject);
  });
}

function matchesMime(mime, b64Prefix) {
  const buf = Buffer.from(b64Prefix + "====", "base64");
  if (mime === "image/jpeg") return buf[0] === 0xFF && buf[1] === 0xD8;
  if (mime === "image/png")  return buf.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
  if (mime === "image/webp") return buf.subarray(0, 4).toString("ascii") === "RIFF";
  if (mime === "image/avif") return buf.subarray(4, 8).toString("ascii") === "ftyp";
  if (mime === "image/gif")  return buf.subarray(0, 3).toString("ascii") === "GIF";
  if (mime === "image/svg+xml") return buf.subarray(0, 4).toString("ascii") === "<svg" || buf.subarray(0, 5).toString("ascii") === "<?xml";
  return false;
}

(async () => {
  const db = await openDatabase(path.join(__dirname, "..", "data", "store.db"));
  const rows = db.prepare("SELECT slug, name FROM products ORDER BY id").all();
  db.close();
  let ok = 0, bad = [];
  for (const r of rows) {
    for (const kind of ["spec", "angle"]) {
      const svg = await fetch(`http://localhost:3000/asset/${kind}/${r.slug}.svg`);
      const m = svg.match(/data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]{20})/);
      if (!m) { bad.push(`${r.name} [${kind}]: no data URI`); continue; }
      if (!matchesMime(m[1], m[2])) bad.push(`${r.name} [${kind}]: ${m[1]} magic mismatch (${m[2].slice(0, 12)})`);
      else ok++;
    }
  }
  console.log(`OK: ${ok}/${rows.length * 2}`);
  if (bad.length) { console.log("BAD:"); bad.slice(0, 15).forEach((b) => console.log("  " + b)); }
})();
