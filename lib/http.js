export function allow(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-code");
}

export function readBody(req) {
  return req.body && typeof req.body === "object" ? req.body : {};
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
