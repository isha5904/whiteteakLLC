// Retry the 4 mice that had product-page URLs last round.
// CSV was updated with direct image links.
const fs = require("fs");
const path = require("path");
const https = require("https");
const { openDatabase } = require("../db-shim.js");

const ROOT = path.join(__dirname, "..");
const DB_PATH = path.join(ROOT, "data", "store.db");
const OUT_DIR = path.join(ROOT, "public", "assets", "products-custom");

const retries = [
  {
    slug: "corsair-m65-rgb-ultra-wired-mouse-black-10",
    url: "https://latestintech.com/wp-content/uploads/2022/09/corsair-m65-rgb-ultra-banner.jpg",
    label: "Corsair M65 RGB Ultra"
  },
  {
    slug: "dell-alienware-aw610m-wireless-mouse-black-18",
    url: "https://www.notebookcheck.net/fileadmin/Notebooks/News/_nc3/Alienware_AW620M_wireless_gaming_mouse.jpg",
    label: "Dell Alienware AW610M"
  },
  {
    slug: "logitech-mx-anywhere-3s-wireless-mouse-graphite-1",
    url: "https://static1.howtogeekimages.com/wordpress/wp-content/uploads/2023/05/angled-view-of-the-logitech-mx-anywhere-3s-in-front-of-a-keyboard-3jpg_52908950182_o.jpg",
    label: "Logitech MX Anywhere 3S"
  },
  {
    slug: "logitech-b100-wired-mouse-black-5",
    url: "https://tse4.mm.bing.net/th/id/OIP.oy8GY_OaXQVS8d_bbmHmPAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
    label: "Logitech B100"
  }
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
        if (!buf.length) return reject(new Error("empty body"));
        resolve({ buf, ext });
      });
    });
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error("timeout")));
  });
}

async function attempt(url, n = 3) {
  let err = null;
  for (let i = 0; i < n; i++) {
    try { return await fetchUrl(url); } catch (e) { err = e; await new Promise((r) => setTimeout(r, 1200)); }
  }
  throw err;
}

(async () => {
  const db = await openDatabase(DB_PATH);
  const updateStmt = db.prepare("UPDATE products SET images_json = ?, image = ? WHERE slug = ?");
  for (const r of retries) {
    try {
      const { buf, ext } = await attempt(r.url);
      const filename = `${r.slug}.${ext}`;
      fs.writeFileSync(path.join(OUT_DIR, filename), buf);
      const imgPath = `/public/assets/products-custom/${filename}`;
      // Triplicate so gallery slots 2 & 3 match slot 1
      updateStmt.run(JSON.stringify([imgPath, imgPath, imgPath]), imgPath, r.slug);
      console.log(`OK   ${r.label}  ->  ${filename}  (${buf.length} B)`);
    } catch (err) {
      console.log(`FAIL ${r.label}: ${err.message}`);
    }
  }
  db.save();
  db.close();
})();
