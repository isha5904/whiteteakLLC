// Restore gallery layout: slot 1 = hero photo, slot 2 = spec SVG, slot 3 = angle SVG.
const path = require("path");
const { openDatabase } = require("../db-shim.js");

(async () => {
  const db = await openDatabase(path.join(__dirname, "..", "data", "store.db"));
  const rows = db.prepare("SELECT id, slug, image FROM products ORDER BY id").all();
  const update = db.prepare("UPDATE products SET images_json = ? WHERE id = ?");
  let n = 0;
  for (const r of rows) {
    if (!r.image) continue;
    const imgs = [r.image, `/asset/spec/${r.slug}.svg`, `/asset/angle/${r.slug}.svg`];
    update.run(JSON.stringify(imgs), r.id);
    n++;
  }
  db.save();
  db.close();
  console.log(`Restored spec+angle gallery for ${n}/${rows.length} products.`);
})();
