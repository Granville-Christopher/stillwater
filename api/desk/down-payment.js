import { deskCollection } from "../../lib/db.js";
import { cents, loadDeskDoc, PRICE, requireAdmin, saveDeskDoc, usd } from "../../lib/desk.js";
import { allow, fail, mongoMissing, readBody } from "../../lib/http.js";

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
  if (!requireAdmin(req, res)) return;
  try {
    const next = cents(Number(readBody(req).amount));
    if (!Number.isFinite(next) || next <= 0) {
      fail(res, 400, "Enter a down payment greater than zero.");
      return;
    }
    if (next > PRICE) {
      fail(res, 400, "The down payment cannot be more than the price.");
      return;
    }
    const collection = await deskCollection();
    const current = await loadDeskDoc(collection);
    if (next < current.deposited) {
      fail(res, 400, `The down payment cannot be less than the ${usd(current.deposited)} already deposited.`);
      return;
    }
    const desk = await saveDeskDoc(collection, { ...current, downPayment: next });
    res.status(200).json({ ok: true, source: "mongo", desk });
  } catch (error) {
    if (mongoMissing(res, error)) return;
    fail(res, 500, "The down payment could not be saved.");
  }
}
