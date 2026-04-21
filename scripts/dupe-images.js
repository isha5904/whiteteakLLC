// For every product, set images_json = [image, image, image]
// so slots 2 and 3 mirror slot 1 in the PDP gallery.
const path = require("path");
const { openDatabase } = require("../db-shim.js");

(async () => {
  const db = await openDatabase(path.join(__dirname, "..", "data", "store.db"));
  const rows = db.prepare("SELECT id, slug, image FROM products ORDER BY id").all();
  const update = db.prepare("UPDATE products SET images_json = ? WHERE id = ?");
  let updated = 0;
  for (const r of rows) {
    const img = r.image;
    if (!img) continue;
    update.run(JSON.stringify([img, img, img]), r.id);
    updated++;
  }
  db.save();
  db.close();
  console.log(`Updated ${updated}/${rows.length} products so gallery slots 2 & 3 mirror slot 1.`);
})();
