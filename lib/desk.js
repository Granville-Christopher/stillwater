import { adminSecret } from "./runtime-env.js";

export const PRICE = 974900;
export const PREQUAL_CAP = 250000;
export const DEFAULT_DOWN_PAYMENT = 700000;

export function cents(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function usd(n, digits = 0) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function emptyDesk() {
  return {
    _id: "main",
    rails: {
      usdc: { network: "Ethereum", address: "", note: "" },
      btc: { network: "Bitcoin", address: "", note: "" },
      eth: { network: "Ethereum", address: "", note: "" },
    },
    wire: { bank: "", name: "", routing: "", account: "", reference: "" },
    cash: { name: "", address: "", note: "" },
    downPayment: DEFAULT_DOWN_PAYMENT,
    deposited: 0,
    deposits: [],
  };
}

export function publicDesk(doc = {}) {
  const base = emptyDesk();
  return {
    rails: {
      usdc: { ...base.rails.usdc, ...doc.rails?.usdc },
      btc: { ...base.rails.btc, ...doc.rails?.btc },
      eth: { ...base.rails.eth, ...doc.rails?.eth },
    },
    wire: { ...base.wire, ...doc.wire },
    cash: { ...base.cash, ...doc.cash },
    downPayment: Number.isFinite(Number(doc.downPayment)) ? cents(Number(doc.downPayment)) : DEFAULT_DOWN_PAYMENT,
    deposited: Number.isFinite(Number(doc.deposited)) ? cents(Math.min(PREQUAL_CAP, Math.max(0, Number(doc.deposited)))) : 0,
    deposits: Array.isArray(doc.deposits) ? doc.deposits : [],
  };
}

export function adminCode() {
  return adminSecret();
}

export function adminConfigured() {
  return adminCode().length > 0;
}

export function readAdminCode(req) {
  const header = String(req.headers["x-admin-code"] || "").trim();
  if (header) return header;
  const auth = String(req.headers.authorization || "");
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return "";
}

export function requireAdmin(req, res) {
  const expected = adminSecret();
  if (!expected) {
    res.status(503).json({ ok: false, error: "The server could not read an admin code." });
    return false;
  }
  if (readAdminCode(req) !== expected) {
    res.status(401).json({ ok: false, error: "That code does not match." });
    return false;
  }
  return true;
}

export async function loadDeskDoc(collection) {
  const saved = await collection.findOne({ _id: "main" });
  return publicDesk(saved || {});
}

export async function saveDeskDoc(collection, desk) {
  const next = publicDesk(desk);
  await collection.updateOne(
    { _id: "main" },
    { $set: { ...next, updatedAt: new Date().toISOString() } },
    { upsert: true },
  );
  return next;
}
