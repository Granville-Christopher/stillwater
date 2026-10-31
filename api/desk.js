import { deskCollection } from "../lib/db.js";
import { loadDeskDoc, requireAdmin, saveDeskDoc } from "../lib/desk.js";
import { allow, fail, mongoMissing, readBody } from "../lib/http.js";

export default async function handler(req, res) {
  allow(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  try {
    const collection = await deskCollection();
    if (req.method === "GET") {
      const desk = await loadDeskDoc(collection);
      res.status(200).json({ ok: true, source: "mongo", desk });
      return;
    }
    if (req.method === "PUT") {
      if (!(await requireAdmin(req, res))) return;
      const body = readBody(req);
      const current = await loadDeskDoc(collection);
      const desk = await saveDeskDoc(collection, {
        ...current,
        rails: body.rails || current.rails,
        wire: body.wire || current.wire,
        cash: body.cash || current.cash,
      });
      res.status(200).json({ ok: true, source: "mongo", desk });
      return;
    }
    fail(res, 405, "Use GET or PUT.");
  } catch (error) {
    if (mongoMissing(res, error)) return;
    fail(res, 500, "The desk could not be read from MongoDB.");
  }
}
