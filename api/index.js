// Vercel serverless entry point — wraps the main server handler
const handler = require("../server");

module.exports = async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error("[vercel] handler error:", err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error: " + (err.message || "unknown"));
    }
  }
};
