const path = require("path");
const { openDatabase } = require("../db-shim.js");
(async () => {
  const db = await openDatabase(path.join(__dirname, "..", "data", "store.db"));
  const slug = "logitech-m221-silent-wireless-mouse-black-4";
  const img = `/public/assets/products-custom/${slug}.svg`;
  db.prepare("UPDATE products SET image = ?, images_json = ? WHERE slug = ?")
    .run(img, JSON.stringify([img, `/asset/spec/${slug}.svg`, `/asset/angle/${slug}.svg`]), slug);
  db.save();
  db.close();
  console.log("Updated M221 path ->", img);
})();
