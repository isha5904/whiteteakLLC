const path = require("path");
const fs = require("fs");
const { openDatabase } = require("../db-shim.js");

(async () => {
  const db = await openDatabase(path.join(__dirname, "..", "data", "store.db"));
  const rows = db.prepare("SELECT id, name, category, image FROM products ORDER BY category, id").all();
  const byCat = {};
  rows.forEach((r) => {
    byCat[r.category] = byCat[r.category] || { custom: 0, default: 0, names: [] };
    if ((r.image || "").startsWith("/public/assets/products-custom/")) byCat[r.category].custom++;
    else { byCat[r.category].default++; byCat[r.category].names.push(r.name); }
  });
  console.log("Total products:", rows.length);
  for (const c of Object.keys(byCat)) {
    console.log(`  ${c}: ${byCat[c].custom} custom, ${byCat[c].default} default`);
    if (byCat[c].names.length) byCat[c].names.forEach((n) => console.log("    (default) " + n));
  }
  const files = fs.readdirSync(path.join(__dirname, "..", "public", "assets", "products-custom"));
  console.log(`\nFiles in products-custom/: ${files.length}`);
  db.close();
})();
