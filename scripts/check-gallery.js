const path = require("path");
const { openDatabase } = require("../db-shim.js");
(async () => {
  const db = await openDatabase(path.join(__dirname, "..", "data", "store.db"));
  const rows = db.prepare("SELECT id, name, category, image, images_json FROM products ORDER BY category, id").all();
  const counts = {};
  for (const r of rows) {
    let imgs = [];
    try { imgs = JSON.parse(r.images_json); } catch {}
    const triplicated = imgs.length === 3 && imgs[0] === imgs[1] && imgs[1] === imgs[2];
    counts[r.category] = counts[r.category] || { triplicated: 0, other: 0, samples: [] };
    if (triplicated) counts[r.category].triplicated++;
    else {
      counts[r.category].other++;
      if (counts[r.category].samples.length < 2) counts[r.category].samples.push({ name: r.name, imgs });
    }
  }
  for (const c of Object.keys(counts)) {
    const c2 = counts[c];
    console.log(`${c}: triplicated=${c2.triplicated}, other=${c2.other}`);
    c2.samples.forEach((s) => console.log("  NOT-TRIPLE:", s.name, s.imgs));
  }
  db.close();
})();
