function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === "object" && req.body.code != null) {
      resolve(req.body);
      return;
    }
    if (typeof req.body === "string" && req.body.trim()) {
      try { resolve(JSON.parse(req.body)); } catch { resolve({}); }
      return;
    }
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(raw || "{}")); } catch { resolve({}); }
    });
    req.on("error", reject);
  });
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
  const expected = String(process.env.ADMIN_CODE || "").trim().replace(/^['"]|['"]$/g, "");
  if (!expected) {
    res.status(503).json({ ok: false, error: "ADMIN_CODE is not available to this function." });
    return;
  }
  const body = await readBody(req);
  const code = String(body.code || "").trim().replace(/^['"]|['"]$/g, "");
  if (!code || code !== expected) {
    res.status(401).json({ ok: false, error: "That code does not match." });
    return;
  }
  res.status(200).json({ ok: true });
}
