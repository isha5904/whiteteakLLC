// Retry the 5 failed downloads with tweaks: longer timeout, bigger header buffer.
const fs = require("fs");
const path = require("path");
const https = require("https");
const { openDatabase } = require("../db-shim.js");

const ROOT = path.join(__dirname, "..");
const DB_PATH = path.join(ROOT, "data", "store.db");
const OUT_DIR = path.join(ROOT, "public", "assets", "products-custom");

// slug (from seed) => URL. Same ordering as seed arrays.
const retries = [
  {
    slug: "samsung-galaxy-a55-5g-12gb-ram-256gb-lilac-5",
    url: "https://pelitadigital.com/wp-content/uploads/2025/01/487078320.jpg",
    label: "Samsung Galaxy A55 5G"
  }
  // Other 4 URLs are product pages with anti-scraping; leaving them on defaults.
];

function extFromMime(mime) {
  return ({ "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" })[mime] || null;
}

function fetchUrl(url, hops = 0) {
  return new Promise((resolve, reject) => {
    if (hops > 6) return reject(new Error("too many redirects"));
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      "Accept": "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": new URL(url).origin + "/"
    };
    const req = https.get(url, { headers, maxHeaderSize: 65536 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(fetchUrl(new URL(res.headers.location, url).toString(), hops + 1));
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
          const m = url.split("?")[0].match(/\.(jpe?g|png|webp|gif|avif)$/i);
          ext = m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
        }
        resolve({ buf, ext });
      });
    });
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error("timeout")));
  });
}

async function tryWithRetries(url, attempts = 3) {
  let lastErr = null;
  for (let i = 0; i < attempts; i++) {
    try { return await fetchUrl(url); } catch (e) { lastErr = e; await new Promise((r) => setTimeout(r, 1500)); }
  }
  throw lastErr;
}

(async () => {
  const db = await openDatabase(DB_PATH);
  const updateStmt = db.prepare("UPDATE products SET images_json = ?, image = ? WHERE slug = ?");
  for (const r of retries) {
    try {
      const { buf, ext } = await tryWithRetries(r.url, 3);
      const filename = `${r.slug}.${ext}`;
      fs.writeFileSync(path.join(OUT_DIR, filename), buf);
      const imgPath = `/public/assets/products-custom/${filename}`;
      const images = [imgPath, `/asset/spec/${r.slug}.svg`, `/asset/angle/${r.slug}.svg`];
      updateStmt.run(JSON.stringify(images), imgPath, r.slug);
      console.log(`OK   ${r.label}  ->  ${filename}  (${buf.length} B)`);
    } catch (err) {
      console.log(`FAIL ${r.label}: ${err.message}`);
    }
  }
  db.save();
  db.close();
})();
