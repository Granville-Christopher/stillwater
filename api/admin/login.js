import { adminCodeMatches, adminSecret } from "../../lib/runtime-env.js";

export const config = { runtime: "nodejs" };

async function readJson(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body) && req.body.code != null) {
    return req.body;
  }
  if (typeof req.body === "string" && req.body.trim()) {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const raw = await new Promise((resolve, reject) => {
    let text = "";
    req.on("data", (chunk) => { text += chunk; });
    req.on("end", () => resolve(text));
    req.on("error", reject);
  });
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-code");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Use POST." });
    return;
  }
  if (!adminSecret()) {
    res.status(503).json({ ok: false, error: "The server could not read an admin code." });
    return;
  }
  const body = await readJson(req);
  if (!adminCodeMatches(body.code)) {
    res.status(401).json({ ok: false, error: "That code does not match." });
    return;
  }
  res.status(200).json({ ok: true });
}
