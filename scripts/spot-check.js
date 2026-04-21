const path = require("path");
const { openDatabase } = require("../db-shim.js");
(async () => {
  const db = await openDatabase(path.join(__dirname, "..", "data", "store.db"));
  const rows = db.prepare("SELECT name, images_json FROM products WHERE category='Mouse' ORDER BY id LIMIT 4").all();
  rows.forEach((r) => { console.log(r.name); console.log("  ", r.images_json); });
  db.close();
})();
