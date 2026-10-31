export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  res.status(200).json({
    ok: true,
    admin: Boolean(String(process.env.ADMIN_CODE || "").trim()),
    mongo: Boolean(String(process.env.MONGODB_URI || "").trim()),
  });
}
