import { mongoConfigured } from "../lib/db.js";
import { adminConfigured } from "../lib/desk.js";
import { allow } from "../lib/http.js";

export default function handler(req, res) {
  allow(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  res.status(200).json({
    ok: true,
    mongo: mongoConfigured(),
    admin: adminConfigured(),
  });
}
