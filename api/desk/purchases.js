import { randomUUID } from "node:crypto";
import { purchaseCollection } from "../../lib/db.js";
import { requireAdmin } from "../../lib/desk.js";
import { allow, fail, mongoMissing, readBody } from "../../lib/http.js";

export default async function handler(req, res) {
  allow(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  try {
    const collection = await purchaseCollection();
    if (req.method === "GET") {
      if (!requireAdmin(req, res)) return;
      const purchases = await collection.find({}).sort({ at: -1 }).limit(200).toArray();
      res.status(200).json({
        ok: true,
        source: "mongo",
        purchases: purchases.map(({ _id, ...purchase }) => purchase),
      });
      return;
    }
    if (req.method === "POST") {
      const body = readBody(req);
      const purchase = {
        id: body.id || randomUUID(),
        at: body.at || new Date().toISOString(),
        name: String(body.name || "Buyer"),
        email: String(body.email || ""),
        phone: String(body.phone || ""),
        coins: Array.isArray(body.coins) ? body.coins : [],
        usd: Number(body.usd) || 0,
        toDown: Number(body.toDown) || 0,
        toClosing: Number(body.toClosing) || 0,
        toPrincipal: Number(body.toPrincipal) || 0,
      };
      await collection.insertOne(purchase);
      res.status(201).json({ ok: true, source: "mongo", purchase });
      return;
    }
    fail(res, 405, "Use GET or POST.");
  } catch (error) {
    if (mongoMissing(res, error)) return;
    fail(res, 500, "Purchases could not be read from MongoDB.");
  }
}
