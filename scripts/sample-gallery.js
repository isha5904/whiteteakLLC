const path = require("path");
const { openDatabase } = require("../db-shim.js");
(async () => {
  const db = await openDatabase(path.join(__dirname, "..", "data", "store.db"));
  const rows = db.prepare("SELECT name, category, images_json FROM products WHERE id IN (1, 31, 61, 91) ORDER BY id").all();
  rows.forEach((r) => {
    console.log(`[${r.category}] ${r.name}`);
    console.log("  " + r.images_json);
  });
  db.close();
})();
