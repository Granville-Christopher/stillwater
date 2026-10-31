import { publicBuyer, requireBuyer, saveBuyerDesk } from "../../lib/buyers.js";
import { allow, fail, mongoMissing, readRequestBody } from "../../lib/http.js";

export default async function handler(req, res) {
  allow(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  const buyer = await requireBuyer(req, res);
  if (!buyer) return;
  try {
    if (req.method === "GET") {
      res.status(200).json({ ok: true, buyer: publicBuyer(buyer) });
      return;
    }
    if (req.method === "PUT") {
      const body = await readRequestBody(req);
      const next = await saveBuyerDesk(buyer, body);
      res.status(200).json({ ok: true, buyer: next });
      return;
    }
    fail(res, 405, "Use GET or PUT.");
  } catch (error) {
    if (mongoMissing(res, error)) return;
    fail(res, 500, "The buyer file could not be saved.");
  }
}
