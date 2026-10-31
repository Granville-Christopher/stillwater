export function allow(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-token");
  res.setHeader("Cache-Control", "no-store");
}

export function readBody(req) {
  return req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body) ? req.body : {};
}

export async function readRequestBody(req) {
  const parsed = readBody(req);
  if (parsed && Object.keys(parsed).length > 0) return parsed;
  if (typeof req.body === "string" && req.body.trim()) {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  if (Buffer.isBuffer(req.body)) {
    try { return JSON.parse(req.body.toString("utf8") || "{}"); } catch { return {}; }
  }
  const raw = await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
  try { return JSON.parse(raw || "{}"); } catch { return {}; }
}

export function fail(res, status, error) {
  res.status(status).json({ ok: false, error });
}

export function mongoMissing(res, error) {
  if (error?.code === "NO_MONGO") {
    fail(res, 503, "Add the MongoDB Atlas integration in Vercel so MONGODB_URI is set.");
    return true;
  }
  return false;
}
