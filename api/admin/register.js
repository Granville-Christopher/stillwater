import { adminExists, createAdmin, normalizeEmail, validEmail } from "../../lib/auth.js";
import { allow, fail, mongoMissing, readRequestBody } from "../../lib/http.js";

export default async function handler(req, res) {
  allow(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    fail(res, 405, "Use POST.");
    return;
  }
  try {
    if (await adminExists()) {
      fail(res, 409, "An admin account already exists. Sign in instead.");
      return;
    }
    const body = await readRequestBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    if (!validEmail(email)) {
      fail(res, 400, "Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      fail(res, 400, "Use a password with at least 8 characters.");
      return;
    }
    const result = await createAdmin({ name, email, password });
    res.status(201).json({ ok: true, token: result.token, admin: result.admin });
  } catch (error) {
    if (mongoMissing(res, error)) return;
    fail(res, 500, "The admin account could not be created.");
  }
}
