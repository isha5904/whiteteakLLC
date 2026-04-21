// Slot 2 := slot 1 (the product photo) for every product.
// Slot 3 stays as the angle SVG.
const path = require("path");
const { openDatabase } = require("../db-shim.js");

(async () => {
  const db = await openDatabase(path.join(__dirname, "..", "data", "store.db"));
  const rows = db.prepare("SELECT id, slug, image FROM products ORDER BY id").all();
  const update = db.prepare("UPDATE products SET images_json = ? WHERE id = ?");
  let n = 0;
  for (const r of rows) {
    if (!r.image) continue;
    const imgs = [r.image, r.image, `/asset/angle/${r.slug}.svg`];
    update.run(JSON.stringify(imgs), r.id);
    n++;
  }
  db.save();
  db.close();
  console.log(`Updated ${n}/${rows.length} products: slot 2 now matches slot 1.`);
})();
