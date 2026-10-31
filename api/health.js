import { adminExists } from "../lib/auth.js";
import { mongoConfigured } from "../lib/db.js";
import { allow } from "../lib/http.js";

export default async function handler(req, res) {
  allow(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  let registered = false;
  const mongo = mongoConfigured();
  if (mongo) {
    try {
      registered = await adminExists();
    } catch {
      registered = false;
    }
  }
  res.status(200).json({ ok: true, mongo, registered });
}
