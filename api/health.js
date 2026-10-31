import { adminSecret, runtimeVar } from "../lib/runtime-env.js";

export const config = { runtime: "nodejs" };

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  res.status(200).json({
    ok: true,
    admin: Boolean(adminSecret()),
    mongo: Boolean(runtimeVar("MONGODB_URI")),
  });
}
