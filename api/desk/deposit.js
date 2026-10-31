import { randomUUID } from "node:crypto";
import { deskCollection } from "../../lib/db.js";
import { cents, loadDeskDoc, PREQUAL_CAP, requireAdmin, saveDeskDoc, usd } from "../../lib/desk.js";
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
  if (!(await requireAdmin(req, res))) return;
  try {
    const usdAmount = cents(Number(readBody(req).amount));
    if (!Number.isFinite(usdAmount) || usdAmount <= 0) {
      fail(res, 400, "Enter an amount greater than zero.");
      return;
    }
    const collection = await deskCollection();
    const current = await loadDeskDoc(collection);
    const ceiling = Math.min(PREQUAL_CAP, current.downPayment);
    const room = cents(ceiling - current.deposited);
    if (usdAmount > room + 0.001) {
      fail(
        res,
        400,
        room <= 0
          ? `Pre-qualified funds are already at ${usd(ceiling)}.`
          : `That would pass ${usd(ceiling)}. ${usd(room)} can still be added.`,
      );
      return;
    }
    const desk = await saveDeskDoc(collection, {
      ...current,
      deposited: cents(current.deposited + usdAmount),
      deposits: [{ id: randomUUID(), at: new Date().toISOString(), amount: usdAmount }, ...current.deposits],
    });
    res.status(200).json({ ok: true, source: "mongo", desk, deposited: desk.deposited });
  } catch (error) {
    if (mongoMissing(res, error)) return;
    fail(res, 500, "The deposit could not be saved.");
  }
}
