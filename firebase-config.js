const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

let firebaseDb = null;
try {
  let serviceAccount;
  const keyPath = path.join(__dirname, "firebase-key.json");
  
  if (fs.existsSync(keyPath)) {
    serviceAccount = require("./firebase-key.json");
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  if (serviceAccount) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    firebaseDb = admin.firestore();
    console.log("[Firebase] Admin initialized successfully.");
  } else {
    console.warn("[Firebase] No service account found. Database disabled.");
  }
} catch (error) {
  console.warn("[Firebase] Initialization failed:", error.message);
}

module.exports = { admin, firebaseDb };
