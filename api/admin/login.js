import { allow, fail, readBody } from "../../lib/http.js";

export const config = { runtime: "nodejs" };

export default function handler(req, res) {
  allow(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    fail(res, 405, "Use POST.");
    return;
  }
  const expected = String((process.env || {}).ADMIN_CODE || "").trim();
  if (!expected) {
    fail(res, 503, "Set ADMIN_CODE in the Vercel environment.");
    return;
  }
  const code = String(readBody(req).code || "").trim();
  if (code !== expected) {
    fail(res, 401, "That code does not match.");
    return;
  }
  res.status(200).json({ ok: true });
}
