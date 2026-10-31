import { normalizeEmail, signInAdmin, validEmail } from "../../lib/auth.js";
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
    const body = await readRequestBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    if (!validEmail(email) || !password) {
      fail(res, 400, "Enter your email and password.");
      return;
    }
    const result = await signInAdmin({ email, password });
    if (!result) {
      fail(res, 401, "That email or password is incorrect.");
      return;
    }
    res.status(200).json({ ok: true, token: result.token, admin: result.admin });
  } catch (error) {
    if (mongoMissing(res, error)) return;
    fail(res, 500, "The admin desk could not be opened.");
  }
}
