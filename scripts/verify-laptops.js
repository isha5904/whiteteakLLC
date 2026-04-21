const path = require("path");
const { openDatabase } = require("../db-shim.js");

(async () => {
  const db = await openDatabase(path.join(__dirname, "..", "data", "store.db"));
  const rows = db.prepare("SELECT id, name, image, images_json FROM products WHERE category = 'Laptops' ORDER BY id").all();
  console.log(`Total laptops in DB: ${rows.length}`);
  let withCustom = 0;
  rows.forEach((r) => {
    const ok = (r.image || "").startsWith("/public/assets/products-custom/");
    if (ok) withCustom++;
    else console.log(`  NOT CUSTOM: ${r.name} -> ${r.image}`);
  });
  console.log(`With custom image: ${withCustom}/${rows.length}`);
  // Show 3 samples
  rows.slice(0, 3).forEach((r) => {
    console.log(`\n${r.name}`);
    console.log("  image:", r.image);
    console.log("  images_json:", r.images_json);
  });
  db.close();
})();
