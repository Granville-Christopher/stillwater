export const config = { runtime: "nodejs" };

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  const env = process.env || {};
  res.status(200).json({
    ok: true,
    admin: Boolean(String(env.ADMIN_CODE || "").trim()),
    mongo: Boolean(String(env.MONGODB_URI || "").trim()),
    envNames: Object.keys(env).filter((key) => /admin|mongo/i.test(key)),
    deploy: "env-standalone-1",
  });
}
