import { allow } from "../lib/http.js";

export const config = { runtime: "nodejs" };

export default function handler(req, res) {
  allow(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  const env = process.env || {};
  const admin = String(env.ADMIN_CODE || "").trim();
  const mongo = String(env.MONGODB_URI || "").trim();
  res.status(200).json({
    ok: true,
    admin: admin.length > 0,
    mongo: mongo.length > 0,
    envNames: Object.keys(env).filter((key) => /admin|mongo/i.test(key)),
  });
}
