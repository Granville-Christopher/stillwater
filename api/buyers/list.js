import { listBuyers } from "../../lib/buyers.js";
import { requireAdmin } from "../../lib/desk.js";
import { allow, fail, mongoMissing } from "../../lib/http.js";

export default async function handler(req, res) {
  allow(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "GET") {
    fail(res, 405, "Use GET.");
    return;
  }
  if (!(await requireAdmin(req, res))) return;
  try {
    const buyers = await listBuyers();
    res.status(200).json({ ok: true, buyers });
  } catch (error) {
    if (mongoMissing(res, error)) return;
    fail(res, 500, "Buyers could not be read.");
  }
}
