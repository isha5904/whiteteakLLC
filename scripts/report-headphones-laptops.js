// Fetch slot 2 (spec) + slot 3 (angle) SVG for every headphone + laptop,
// parse the embedded data URI, decode its magic bytes, confirm it matches
// the MIME and is a real image (not placeholder).
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

function magicOk(mime, b64) {
  const buf = Buffer.from(b64 + "====", "base64");
  if (mime === "image/jpeg") return buf[0] === 0xFF && buf[1] === 0xD8;
  if (mime === "image/png")  return buf.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
  if (mime === "image/webp") return buf.subarray(0, 4).toString("ascii") === "RIFF";
  if (mime === "image/avif") return buf.subarray(4, 8).toString("ascii") === "ftyp";
  if (mime === "image/svg+xml") return buf.subarray(0, 4).toString("ascii") === "<svg" || buf.subarray(0, 5).toString("ascii") === "<?xml";
  return false;
}

(async () => {
  const db = await openDatabase(path.join(__dirname, "..", "data", "store.db"));
  const rows = db.prepare("SELECT slug, name, category FROM products WHERE category IN ('Headphones','Laptops') ORDER BY category, id").all();
  db.close();

  for (const r of rows) {
    const parts = [];
    for (const kind of ["spec", "angle"]) {
      const svg = await fetch(`http://localhost:3000/asset/${kind}/${r.slug}.svg`);
      const m = svg.match(/data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]{20,})/);
      if (!m) { parts.push(`${kind}=NO_IMG`); continue; }
      const ok = magicOk(m[1], m[2].slice(0, 32));
      parts.push(`${kind}=${m[1].replace("image/", "")}${ok ? "✓" : "✗"}`);
    }
    console.log(`[${r.category.padEnd(10)}] ${parts.join(" | ")}  ${r.name}`);
  }
})();
