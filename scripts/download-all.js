// Download curated product images for all 120 products from data/product-images.csv.
// Deletes all previous files in public/assets/products-custom/ first, then saves new ones.
// Updates store.db so each matched product gets its custom image + per-slug spec/angle SVGs.

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

// === Seed data (mirror of server.js buildOverhaulSeedProducts) ===
const laptopData = [
  ["Apple", "MacBook Air M3", [13.6, 15.3], "", "", ["Midnight", "Silver", "Space Gray"]],
  ["Apple", "MacBook Pro 14 M3 Pro", [14.2], "", "", ["Space Black", "Silver"]],
  ["Dell", "XPS 13 Plus", [13.4], "", "", ["Platinum", "Graphite"]],
  ["Dell", "Inspiron 15 3520", [15.6], "", "", ["Mercury Gray", "Silver"]],
  ["Dell", "Alienware m16 R2", [16], "", "", ["Dark Metallic Moon"]],
  ["HP", "Pavilion 14", [14], "", "", ["Silver", "Pure White"]],
  ["HP", "Victus 15", [15.6], "", "", ["Mica Silver", "Shadow Black"]],
  ["HP", "Omen 16", [16.1], "", "", ["Shadow Black"]],
  ["HP", "EliteBook 840 G10", [14], "", "", ["Silver"]],
  ["Lenovo", "IdeaPad Slim 3", [15.6], "", "", ["Arctic Grey", "Cosmic Black"]],
  ["Lenovo", "ThinkPad X1 Carbon Gen 12", [14], "", "", ["Shadow Black"]],
  ["Lenovo", "Legion 5 Pro", [16], "", "", ["Storm Grey"]],
  ["Lenovo", "Yoga Slim 7i", [14], "", "", ["Cosmic Blue"]],
  ["ASUS", "Zenbook 14 OLED", [14], "", "", ["Jade Black", "Silver"]],
  ["ASUS", "VivoBook 15", [15.6], "", "", ["Transparent Silver"]],
  ["ASUS", "ROG Strix G16", [16], "", "", ["Eclipse Gray"]],
  ["ASUS", "TUF Gaming A15", [15.6], "", "", ["Mecha Gray"]],
  ["Acer", "Aspire 5", [15.6], "", "", ["Pure Silver"]],
  ["Acer", "Swift Go 14", [14], "", "", ["Pure Silver"]],
  ["Acer", "Predator Helios Neo 16", [16], "", "", ["Abyssal Black"]],
  ["MSI", "Modern 14", [14], "", "", ["Urban Silver"]],
  ["MSI", "Katana 15", [15.6], "", "", ["Black"]],
  ["MSI", "Raider GE78 HX", [17], "", "", ["Core Black"]],
  ["Razer", "Blade 14", [14], "", "", ["Cosmic Black"]],
  ["Razer", "Blade 16", [16], "", "", ["Cosmic Black"]],
  ["Microsoft", "Surface Laptop 6", [13.5, 15], "", "", ["Platinum", "Black"]],
  ["Microsoft", "Surface Laptop Go 3", [12.4], "", "", ["Sage", "Platinum"]],
  ["Apple", "MacBook Pro 16 M3 Max", [16.2], "", "", ["Space Black"]],
  ["Dell", "Latitude 7440", [14], "", "", ["Titan Gray"]],
  ["HP", "Spectre x360 14", [13.5], "", "", ["Nightfall Black", "Slate Blue"]]
];
const laptopRams = ["8GB RAM", "16GB RAM", "32GB RAM"];
const laptopStorages = ["256GB SSD", "512GB SSD", "1TB SSD"];

const mobileData = [
  ["Apple", "iPhone 15 Pro Max", ["Titanium Black", "Titanium White", "Titanium Blue"]],
  ["Apple", "iPhone 15", ["Pink", "Blue", "Midnight"]],
  ["Apple", "iPhone 14", ["Midnight", "Starlight"]],
  ["Samsung", "Galaxy S24 Ultra", ["Phantom Blue", "Titanium Black", "Lavender"]],
  ["Samsung", "Galaxy S24", ["Cobalt Violet", "Obsidian", "Pearl White"]],
  ["Samsung", "Galaxy A55 5G", ["Navy", "Lilac"]],
  ["Samsung", "Galaxy M15 5G", ["Celestine Blue", "Stone Gray"]],
  ["OnePlus", "12", ["Flowy Emerald", "Silky Black"]],
  ["OnePlus", "12R", ["Cool Blue", "Iron Gray"]],
  ["OnePlus", "Nord CE4", ["Celadon Marble", "Dark Chrome"]],
  ["Xiaomi", "14 Ultra", ["Black", "White"]],
  ["Xiaomi", "Redmi Note 13 Pro+", ["Fusion Black", "Fusion Purple"]],
  ["Xiaomi", "Redmi 13C", ["Starfrost White", "Midnight Black"]],
  ["Google", "Pixel 8 Pro", ["Obsidian", "Porcelain", "Bay"]],
  ["Google", "Pixel 8", ["Hazel", "Obsidian", "Rose Gold"]],
  ["Google", "Pixel 7a", ["Charcoal", "Sea"]],
  ["Realme", "GT 6", ["Fluid Silver", "Razor Green"]],
  ["Realme", "Narzo 70 Pro 5G", ["Glass Gold", "Glass Green"]],
  ["Vivo", "X100 Pro", ["Asteroid Black", "Titanium Gray"]],
  ["Vivo", "V30 Pro 5G", ["Peacock Green", "Classic Black"]],
  ["Vivo", "Y28s 5G", ["Vintage Red", "Twinkling Purple"]],
  ["Oppo", "Find X7 Ultra", ["Ocean Blue", "Tailored Black"]],
  ["Oppo", "Reno 11 Pro 5G", ["Pearl White", "Rock Grey"]],
  ["Oppo", "A79 5G", ["Mystery Black", "Glowing Green"]],
  ["Nothing", "Phone (2a)", ["Black", "White", "Milk"]],
  ["Nothing", "Phone (2)", ["Dark Gray", "White"]],
  ["Apple", "iPhone SE (3rd Gen)", ["Midnight", "Starlight", "Red"]],
  ["Samsung", "Galaxy Z Flip5", ["Mint", "Cream", "Graphite"]],
  ["Samsung", "Galaxy Z Fold5", ["Icy Blue", "Phantom Black"]],
  ["Apple", "iPhone 15 Pro", ["Natural Titanium", "Blue Titanium", "White Titanium"]]
];
const phoneRams = ["6GB RAM", "8GB RAM", "12GB RAM"];
const phoneStorages = ["128GB", "256GB", "512GB", "1TB"];

const headphoneData = [
  ["Sony", "WH-1000XM5", "Black", "Over-Ear"],
  ["Sony", "WH-CH720N", "White", "Over-Ear"],
  ["Sony", "MDR-ZX110", "Black", "On-Ear"],
  ["Sony", "WF-1000XM5", "Midnight", "In-Ear"],
  ["Bose", "QuietComfort Ultra", "Black", "Over-Ear"],
  ["Bose", "QuietComfort 45", "White", "Over-Ear"],
  ["Bose", "SoundLink 2", "Navy Blue", "On-Ear"],
  ["Apple", "AirPods Pro 2 (USB-C)", "White", "In-Ear"],
  ["Apple", "AirPods Max", "Midnight", "Over-Ear"],
  ["Apple", "EarPods USB-C", "White", "In-Ear"],
  ["JBL", "Tune 760NC", "Black", "Over-Ear"],
  ["JBL", "Live 770NC", "Rose Gold", "Over-Ear"],
  ["JBL", "Tune 510BT", "Black", "On-Ear"],
  ["JBL", "Quantum 100", "Black", "Over-Ear"],
  ["Sennheiser", "Momentum 4", "Black", "Over-Ear"],
  ["Sennheiser", "HD 450BT", "Black", "Over-Ear"],
  ["Sennheiser", "HD 206", "Black", "Over-Ear"],
  ["Audio-Technica", "ATH-M50xBT2", "Black", "Over-Ear"],
  ["Audio-Technica", "ATH-M20x", "Black", "Over-Ear"],
  ["Audio-Technica", "ATH-S300BT", "White", "Over-Ear"],
  ["Skullcandy", "Crusher Evo", "Black", "Over-Ear"],
  ["Skullcandy", "Hesh ANC", "Black", "Over-Ear"],
  ["boAt", "Rockerz 450", "Black", "On-Ear"],
  ["boAt", "Nirvana 751 ANC", "Navy Blue", "Over-Ear"],
  ["boAt", "BassHeads 100", "Black", "In-Ear"],
  ["boAt", "Airdopes 141", "White", "In-Ear"],
  ["HyperX", "Cloud III", "Red", "Over-Ear"],
  ["HyperX", "Cloud Stinger 2", "Black", "Over-Ear"],
  ["Sony", "WH-XB910N Extra Bass", "Midnight", "Over-Ear"],
  ["JBL", "Endurance Run 2", "Black", "In-Ear"]
];

const mouseData = [
  ["Logitech", "MX Master 3S", "Wireless", "Graphite"],
  ["Logitech", "MX Anywhere 3S", "Wireless", "Graphite"],
  ["Logitech", "G502 Hero", "Wired", "Black"],
  ["Logitech", "G Pro X Superlight 2", "Wireless", "Black"],
  ["Logitech", "M221 Silent", "Wireless", "Black"],
  ["Logitech", "B100", "Wired", "Black"],
  ["Razer", "DeathAdder V3 Pro", "Wireless", "Black"],
  ["Razer", "Basilisk V3", "Wired", "Black"],
  ["Razer", "Viper 8K", "Wired", "White"],
  ["Razer", "Orochi V2", "Wireless", "Black"],
  ["Corsair", "M65 RGB Ultra", "Wired", "Black"],
  ["Corsair", "Dark Core RGB Pro", "Wireless", "Black"],
  ["Corsair", "Harpoon RGB Pro", "Wired", "Black"],
  ["HP", "X1000", "Wired", "Black"],
  ["HP", "Z3700", "Wireless", "Silver"],
  ["HP", "Omen Vector Essential", "Wired", "Black"],
  ["Dell", "MS3320W", "Wireless", "Black"],
  ["Dell", "MS116", "Wired", "Black"],
  ["Dell", "Alienware AW610M", "Wireless", "Black"],
  ["Microsoft", "Surface Mouse", "Wireless", "White"],
  ["Microsoft", "Bluetooth Ergonomic Mouse", "Wireless", "Graphite"],
  ["Microsoft", "Classic IntelliMouse", "Wired", "Gray"],
  ["Zebronics", "Zeb-Transformer-M", "Wired", "Black"],
  ["Zebronics", "Zeb-Dash Plus", "Wired", "Black"],
  ["Zebronics", "Zeb-Bold Pro", "Wireless", "Black"],
  ["Redragon", "M711 Cobra", "Wired", "Black"],
  ["Redragon", "M908 Impact", "Wired", "Black"],
  ["Redragon", "M602 Griffin", "Wired", "Black"],
  ["Logitech", "Lift Vertical", "Wireless", "Graphite"],
  ["Razer", "Pro Click Mini", "Wireless", "White"]
];

function buildAllProducts() {
  const products = [];
  for (let i = 0; i < 30; i++) {
    const [brand, model, sizes, , , colors] = laptopData[i];
    const ram = laptopRams[i % 3];
    const storage = laptopStorages[i % 3];
    const size = sizes[i % sizes.length];
    const color = colors[i % colors.length];
    const name = `${brand} ${model} (${size}", ${ram}, ${storage}, ${color})`;
    products.push({ name, slug: slugify(name + "-" + i), prefix: `${brand} ${model}`, category: "Laptops" });
  }
  for (let i = 0; i < 30; i++) {
    const [brand, model, colors] = mobileData[i];
    const ram = phoneRams[i % 3];
    const storage = phoneStorages[i % 4];
    const color = colors[i % colors.length];
    const name = `${brand} ${model} (${ram}, ${storage}, ${color})`;
    products.push({ name, slug: slugify(name + "-" + i), prefix: `${brand} ${model}`, category: "Mobiles" });
  }
  for (let i = 0; i < 30; i++) {
    const [brand, model, color, form] = headphoneData[i];
    const name = `${brand} ${model} ${form} Headphones (${color})`;
    products.push({ name, slug: slugify(name + "-" + i), prefix: `${brand} ${model}`, category: "Headphones" });
  }
  for (let i = 0; i < 30; i++) {
    const [brand, model, conn, color] = mouseData[i];
    const name = `${brand} ${model} ${conn} Mouse (${color})`;
    products.push({ name, slug: slugify(name + "-" + i), prefix: `${brand} ${model}`, category: "Mouse" });
  }
  return products;
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

function matchEntry(csvEntry, allProducts) {
  // Try exact full-name match first
  let match = allProducts.find((p) => p.name === csvEntry.name);
  if (match) return match;
  // Try prefix match ("Apple iPhone 15 Pro Max" -> product with that prefix)
  const candidates = allProducts.filter((p) =>
    p.prefix.toLowerCase() === csvEntry.name.toLowerCase()
    || p.name.toLowerCase().startsWith(csvEntry.name.toLowerCase() + " (")
  );
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) return null; // ambiguous
  return null;
}

function extFromMime(mime) {
  const m = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
  return m[mime] || null;
}

function fetchUrl(url, hops = 0) {
  return new Promise((resolve, reject) => {
    if (hops > 6) return reject(new Error("too many redirects"));
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
      res.on("end", async () => {
        const buf = Buffer.concat(chunks);
        const ct = (res.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
        // If HTML, try to extract og:image
        if (ct.startsWith("text/html") || ct.startsWith("application/xhtml")) {
          const html = buf.toString("utf8");
          const og = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
            || html.match(/<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["']/i);
          if (og && og[1]) {
            const next = new URL(og[1], url).toString();
            try { return resolve(await fetchUrl(next, hops + 1)); } catch (e) { return reject(e); }
          }
          return reject(new Error("HTML page with no og:image"));
        }
        if (!buf.length) return reject(new Error("empty body"));
        let ext = extFromMime(ct);
        if (!ext) {
          const urlPath = url.split("?")[0];
          const m2 = urlPath.match(/\.(jpe?g|png|webp|gif|avif)$/i);
          ext = m2 ? m2[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
        }
        resolve({ buf, ext });
      });
    });
    req.on("error", reject);
    req.setTimeout(25000, () => req.destroy(new Error("timeout")));
  });
}

async function main() {
  // Step 1: Parse CSV
  const csvEntries = parseCsv();
  console.log(`CSV parsed: ${csvEntries.length} entries with URLs`);

  // Step 2: Build expected product catalog
  const allProducts = buildAllProducts();

  // Step 3: Match CSV entries to products
  const matched = [];
  const unmatched = [];
  const seenSlugs = new Set();
  for (const e of csvEntries) {
    const p = matchEntry(e, allProducts);
    if (!p) { unmatched.push(e); continue; }
    if (seenSlugs.has(p.slug)) { unmatched.push({ ...e, reason: "duplicate slug " + p.slug }); continue; }
    seenSlugs.add(p.slug);
    matched.push({ ...e, product: p });
  }
  console.log(`Matched ${matched.length} CSV rows to DB products`);
  if (unmatched.length) {
    console.log(`Unmatched CSV rows (${unmatched.length}):`);
    unmatched.forEach((e) => console.log("  - " + e.name + (e.reason ? " (" + e.reason + ")" : "")));
  }

  // Step 4: Wipe old custom files
  if (fs.existsSync(OUT_DIR)) {
    for (const f of fs.readdirSync(OUT_DIR)) {
      try { fs.unlinkSync(path.join(OUT_DIR, f)); } catch { /* ignore */ }
    }
    console.log("Cleared old files from products-custom/");
  } else {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  // Step 5: Open DB, reset all rows to default (products-v3) images so failed products still render
  const db = await openDatabase(DB_PATH);
  const catSlugMap = { "Laptops": "laptops", "Mobiles": "mobiles", "Headphones": "headphones", "Mouse": "mouse" };
  const getStmt = db.prepare("SELECT id, slug, category FROM products WHERE slug = ?");
  const updateStmt = db.prepare("UPDATE products SET images_json = ?, image = ? WHERE slug = ?");

  // Reset ALL products to default image pattern so the server-boot fixer won't see stale custom paths
  const allRows = db.prepare("SELECT id, slug, category FROM products ORDER BY category, id").all();
  const perCatCounter = {};
  for (const row of allRows) {
    const catSlug = catSlugMap[row.category];
    if (!catSlug) continue;
    perCatCounter[catSlug] = (perCatCounter[catSlug] || 0) + 1;
    const n = ((perCatCounter[catSlug] - 1) % 30) + 1;
    const defSrc = `/public/assets/products-v3/${catSlug}/${catSlug}-${String(n).padStart(2, "0")}.jpg`;
    const specUrl = `/asset/spec/${row.slug}.svg`;
    const angleUrl = `/asset/angle/${row.slug}.svg`;
    updateStmt.run(JSON.stringify([defSrc, specUrl, angleUrl]), defSrc, row.slug);
  }

  // Step 6: Download each matched URL, save file, update DB
  const results = { ok: [], failed: [] };
  for (const m of matched) {
    const slug = m.product.slug;
    try {
      const { buf, ext } = await fetchUrl(m.url);
      const filename = `${slug}.${ext}`;
      fs.writeFileSync(path.join(OUT_DIR, filename), buf);
      const imgPath = `/public/assets/products-custom/${filename}`;
      const images = [imgPath, `/asset/spec/${slug}.svg`, `/asset/angle/${slug}.svg`];
      updateStmt.run(JSON.stringify(images), imgPath, slug);
      results.ok.push({ name: m.product.name, file: filename, bytes: buf.length });
      console.log(`OK   [${m.product.category.padEnd(10)}] ${m.product.name}  ->  ${filename}  (${buf.length} B)`);
    } catch (err) {
      console.log(`FAIL [${m.product.category.padEnd(10)}] ${m.product.name}: ${err.message}`);
      results.failed.push({ name: m.product.name, url: m.url, reason: err.message });
    }
  }

  db.save();
  db.close();

  console.log(`\n==============================`);
  console.log(`Summary: OK=${results.ok.length}, Failed=${results.failed.length}, Unmatched CSV=${unmatched.length}`);
  if (results.failed.length) {
    console.log("\nFailed downloads (DB uses default image for these):");
    results.failed.forEach((f) => console.log("  - " + f.name + " [" + f.reason + "]\n    URL: " + f.url));
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
