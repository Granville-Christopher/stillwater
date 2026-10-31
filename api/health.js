import { runtimeEnv, runtimeVar } from "../lib/runtime-env.js";

export const config = { runtime: "nodejs" };

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  const env = runtimeEnv();
  res.status(200).json({
    ok: true,
    admin: Boolean(runtimeVar("ADMIN_CODE")),
    mongo: Boolean(runtimeVar("MONGODB_URI")),
    envNames: Object.keys(env).filter((key) => /admin|mongo/i.test(key)),
    vercel: Boolean(env.VERCEL),
    vercelEnv: env.VERCEL_ENV || "",
    deploy: "env-runtime-2",
  });
}
