import { normalizeEmail } from "../../lib/auth.js";
import { createBuyer } from "../../lib/buyers.js";
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
    const result = await createBuyer({
      name: body.name,
      email: normalizeEmail(body.email),
      password: body.password,
      phone: body.phone,
    });
    res.status(201).json({ ok: true, token: result.token, buyer: result.buyer });
  } catch (error) {
    if (error.status) {
      fail(res, error.status, error.message);
      return;
    }
    if (mongoMissing(res, error)) return;
    fail(res, 500, "The account could not be created.");
  }
}
