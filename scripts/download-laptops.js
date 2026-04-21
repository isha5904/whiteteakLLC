// Download curated laptop images from data/product-images.csv,
// save to public/assets/products-custom/<slug>.<ext>, and update store.db
// so the PDP gallery uses the real product photo in slot 1 and the
// per-product spec/angle SVGs in slots 2 and 3.

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { openDatabase } = require("../db-shim.js");

const ROOT = path.join(__dirname, "..");
const CSV_PATH = path.join(ROOT, "data", "product-images.csv");
const DB_PATH = path.join(ROOT, "data", "store.db");
const OUT_DIR = path.join(ROOT, "public", "assets", "products-custom");

function slugify(v) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// EXACT copy of laptopData from server.js buildOverhaulSeedProducts()
const laptopData = [
  ["Apple", "MacBook Air M3", [13.6, 15.3], "macOS Sequoia", "Apple M3", ["Midnight", "Silver", "Space Gray"], [104990, 124990, 149990], "Apple Silicon"],
  ["Apple", "MacBook Pro 14 M3 Pro", [14.2], "macOS Sequoia", "Apple M3 Pro", ["Space Black", "Silver"], [199990, 234990], "Pro"],
  ["Dell", "XPS 13 Plus", [13.4], "Windows 11 Home", "Intel Core Ultra 7", ["Platinum", "Graphite"], [129990], "New"],
  ["Dell", "Inspiron 15 3520", [15.6], "Windows 11 Home", "Intel Core i5-1235U", ["Mercury Gray", "Silver"], [54990, 62990], "Best Seller"],
  ["Dell", "Alienware m16 R2", [16], "Windows 11 Home", "Intel Core i9-14900HX", ["Dark Metallic Moon"], [219990], "Gaming"],
  ["HP", "Pavilion 14", [14], "Windows 11 Home", "AMD Ryzen 7 7730U", ["Silver", "Pure White"], [64990], "Student Pick"],
  ["HP", "Victus 15", [15.6], "Windows 11 Home", "Intel Core i5-13420H", ["Mica Silver", "Shadow Black"], [72990], "Gaming"],
  ["HP", "Omen 16", [16.1], "Windows 11 Home", "Intel Core i7-13700HX", ["Shadow Black"], [139990], "Gaming"],
  ["HP", "EliteBook 840 G10", [14], "Windows 11 Pro", "Intel Core i7-1355U", ["Silver"], [109990], "Business"],
  ["Lenovo", "IdeaPad Slim 3", [15.6], "Windows 11 Home", "Intel Core i5-13420H", ["Arctic Grey", "Cosmic Black"], [48990, 56990], "Value"],
  ["Lenovo", "ThinkPad X1 Carbon Gen 12", [14], "Windows 11 Pro", "Intel Core Ultra 7 155H", ["Shadow Black"], [189990], "Business"],
  ["Lenovo", "Legion 5 Pro", [16], "Windows 11 Home", "AMD Ryzen 7 7745HX", ["Storm Grey"], [129990], "Gaming"],
  ["Lenovo", "Yoga Slim 7i", [14], "Windows 11 Home", "Intel Core Ultra 5", ["Cosmic Blue"], [84990], "Creator"],
  ["ASUS", "Zenbook 14 OLED", [14], "Windows 11 Home", "Intel Core Ultra 7", ["Jade Black", "Silver"], [109990], "OLED"],
  ["ASUS", "VivoBook 15", [15.6], "Windows 11 Home", "Intel Core i3-1215U", ["Transparent Silver"], [35990], "Budget"],
  ["ASUS", "ROG Strix G16", [16], "Windows 11 Home", "Intel Core i7-13650HX", ["Eclipse Gray"], [134990], "Gaming"],
  ["ASUS", "TUF Gaming A15", [15.6], "Windows 11 Home", "AMD Ryzen 7 7735HS", ["Mecha Gray"], [79990], "Gaming"],
  ["Acer", "Aspire 5", [15.6], "Windows 11 Home", "Intel Core i5-1335U", ["Pure Silver"], [52990], "Best Seller"],
  ["Acer", "Swift Go 14", [14], "Windows 11 Home", "Intel Core Ultra 5", ["Pure Silver"], [69990], "New"],
  ["Acer", "Predator Helios Neo 16", [16], "Windows 11 Home", "Intel Core i7-13700HX", ["Abyssal Black"], [119990], "Gaming"],
  ["MSI", "Modern 14", [14], "Windows 11 Home", "Intel Core i5-1335U", ["Urban Silver"], [55990], "Value"],
  ["MSI", "Katana 15", [15.6], "Windows 11 Home", "Intel Core i7-13620H", ["Black"], [94990], "Gaming"],
  ["MSI", "Raider GE78 HX", [17], "Windows 11 Home", "Intel Core i9-14900HX", ["Core Black"], [249990], "Gaming"],
  ["Razer", "Blade 14", [14], "Windows 11 Home", "AMD Ryzen 9 7940HS", ["Cosmic Black"], [199990], "Gaming"],
  ["Razer", "Blade 16", [16], "Windows 11 Home", "Intel Core i9-13950HX", ["Cosmic Black"], [239990], "Gaming"],
  ["Microsoft", "Surface Laptop 6", [13.5, 15], "Windows 11 Home", "Intel Core Ultra 5", ["Platinum", "Black"], [124990, 149990], "New"],
  ["Microsoft", "Surface Laptop Go 3", [12.4], "Windows 11 Home", "Intel Core i5-1235U", ["Sage", "Platinum"], [89990], "Compact"],
  ["Apple", "MacBook Pro 16 M3 Max", [16.2], "macOS Sequoia", "Apple M3 Max", ["Space Black"], [249990], "Pro"],
  ["Dell", "Latitude 7440", [14], "Windows 11 Pro", "Intel Core i7-1365U", ["Titan Gray"], [129990], "Business"],
  ["HP", "Spectre x360 14", [13.5], "Windows 11 Home", "Intel Core Ultra 7", ["Nightfall Black", "Slate Blue"], [154990], "Convertible"]
];
const rams = ["8GB RAM", "16GB RAM", "32GB RAM"];
const storages = ["256GB SSD", "512GB SSD", "1TB SSD"];

function buildLaptopNameAndSlug(i) {
  const [brand, model, sizes, os, cpu, colors] = laptopData[i];
  const ram = rams[i % rams.length];
  const storage = storages[i % storages.length];
  const size = sizes[i % sizes.length];
  const color = colors[i % colors.length];
  const name = `${brand} ${model} (${size}", ${ram}, ${storage}, ${color})`;
  return { name, slug: slugify(name + "-" + i), i };
}

function parseCsv() {
  const content = fs.readFileSync(CSV_PATH, "utf8");
  const lines = content.split(/\r?\n/);
  const entries = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const urlMatch = line.match(/,\s*(https?:\/\/\S+|data:[^\s,][^\s]*)\s*$/);
    if (!urlMatch) continue;
    const url = urlMatch[1];
    const name = line.slice(0, urlMatch.index).replace(/\s+$/, "");
    entries.push({ name, url });
  }
  return entries;
}

function extFromMime(mime) {
  const m = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
  return m[mime] || null;
}

function fetchUrl(url, hops = 0) {
  return new Promise((resolve, reject) => {
    if (hops > 5) return reject(new Error("too many redirects"));
    if (url.startsWith("data:")) {
      const m = url.match(/^data:([^;]+);base64,(.+)$/);
      if (!m) return reject(new Error("invalid data URI"));
      return resolve({ buf: Buffer.from(m[2], "base64"), ext: extFromMime(m[1]) || "jpg" });
    }
    const mod = url.startsWith("https:") ? https : http;
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      "Accept": "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": new URL(url).origin + "/"
    };
    const req = mod.get(url, { headers }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        const next = new URL(res.headers.location, url).toString();
        return resolve(fetchUrl(next, hops + 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error("HTTP " + res.statusCode));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const buf = Buffer.concat(chunks);
        const ct = (res.headers["content-type"] || "").split(";")[0].trim();
        let ext = extFromMime(ct);
        if (!ext) {
          const urlPath = url.split("?")[0];
          const m2 = urlPath.match(/\.(jpe?g|png|webp|gif|avif)$/i);
          ext = m2 ? m2[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
        }
        if (!buf.length) return reject(new Error("empty body"));
        resolve({ buf, ext });
      });
    });
    req.on("error", reject);
    req.setTimeout(25000, () => req.destroy(new Error("timeout")));
  });
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const csvEntries = parseCsv();
  console.log(`CSV parsed: ${csvEntries.length} entries with URLs`);

  const laptopMap = new Map();
  for (let i = 0; i < 30; i++) {
    const info = buildLaptopNameAndSlug(i);
    laptopMap.set(info.name, info);
  }

  const laptopEntries = csvEntries.filter((e) => laptopMap.has(e.name));
  console.log(`Matched ${laptopEntries.length} laptop rows from CSV`);

  // Report any laptop whose name starts with a known laptop brand but didn't exact-match
  const expectedNames = new Set([...laptopMap.keys()]);
  const missing = [...expectedNames].filter((n) => !csvEntries.some((e) => e.name === n));
  if (missing.length) {
    console.log(`\nLaptops with no CSV URL:`);
    missing.forEach((n) => console.log("  - " + n));
  }

  const db = await openDatabase(DB_PATH);
  const getStmt = db.prepare("SELECT id, slug, image FROM products WHERE slug = ?");
  const updateStmt = db.prepare("UPDATE products SET images_json = ?, image = ? WHERE slug = ?");

  const results = { ok: [], failed: [] };
  for (const e of laptopEntries) {
    const info = laptopMap.get(e.name);
    const slug = info.slug;
    try {
      const row = getStmt.get(slug);
      if (!row) {
        results.failed.push({ ...e, reason: "no DB row for slug " + slug });
        continue;
      }
      const { buf, ext } = await fetchUrl(e.url);
      const filename = `${slug}.${ext}`;
      fs.writeFileSync(path.join(OUT_DIR, filename), buf);
      const imgPath = `/public/assets/products-custom/${filename}`;
      const images = [imgPath, `/asset/spec/${slug}.svg`, `/asset/angle/${slug}.svg`];
      updateStmt.run(JSON.stringify(images), imgPath, slug);
      results.ok.push({ name: e.name, file: filename, bytes: buf.length });
      console.log(`OK   ${e.name}  ->  ${filename}  (${buf.length} B)`);
    } catch (err) {
      console.log(`FAIL ${e.name}: ${err.message}`);
      results.failed.push({ ...e, reason: err.message });
    }
  }

  db.save();
  db.close();

  console.log(`\nSummary: OK=${results.ok.length}, Failed=${results.failed.length}`);
  if (results.failed.length) {
    console.log("\nFailed entries:");
    results.failed.forEach((f) => console.log("  - " + f.name + ": " + f.reason));
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
