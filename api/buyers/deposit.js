import { addBuyerDeposit, findBuyerById } from "../../lib/buyers.js";
import { requireAdmin } from "../../lib/desk.js";
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
  if (!(await requireAdmin(req, res))) return;
  try {
    const body = await readRequestBody(req);
    const buyer = await findBuyerById(body.buyerId || body.email);
    if (!buyer) {
      fail(res, 404, "Select a buyer who has created an account.");
      return;
    }
    const next = await addBuyerDeposit(buyer, body.amount);
    res.status(200).json({ ok: true, buyer: next, deposited: next.deposited });
  } catch (error) {
    if (error.status) {
      fail(res, error.status, error.message);
      return;
    }
    if (mongoMissing(res, error)) return;
    fail(res, 500, "The deposit could not be saved.");
  }
}
