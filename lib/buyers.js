import { randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";
import { hashPassword, newToken, normalizeEmail, readToken, validEmail, verifyPassword } from "./auth.js";
import { buyerCollection } from "./db.js";
import { cents, PREQUAL_CAP, usd } from "./desk.js";

export function emptyBuyerDesk() {
  return {
    phone: "",
    timeline: "60–90 days",
    prequalified: true,
    downPercent: 0.2,
    paidDown: 0,
    paidClosing: 0,
    paidPrincipal: 0,
    balances: { usdc: 180000, btc: 0.55, eth: 12 },
    payments: [],
    docs: { contract: false, insurance: false, appraisal: false },
    deposited: 0,
    deposits: [],
  };
}

export function publicBuyer(doc = {}) {
  const base = emptyBuyerDesk();
  return {
    id: String(doc._id || doc.id || doc.email || ""),
    email: doc.email || "",
    name: doc.name || "",
    phone: doc.phone ?? base.phone,
    timeline: doc.timeline || base.timeline,
    prequalified: Boolean(doc.prequalified),
    downPercent: Number.isFinite(Number(doc.downPercent)) ? Number(doc.downPercent) : base.downPercent,
    paidDown: Number.isFinite(Number(doc.paidDown)) ? cents(Number(doc.paidDown)) : 0,
    paidClosing: Number.isFinite(Number(doc.paidClosing)) ? cents(Number(doc.paidClosing)) : 0,
    paidPrincipal: Number.isFinite(Number(doc.paidPrincipal)) ? cents(Number(doc.paidPrincipal)) : 0,
    balances: { ...base.balances, ...(doc.balances || {}) },
    payments: Array.isArray(doc.payments) ? doc.payments : [],
    docs: { ...base.docs, ...(doc.docs || {}) },
    deposited: Number.isFinite(Number(doc.deposited)) ? cents(Math.min(PREQUAL_CAP, Math.max(0, Number(doc.deposited)))) : 0,
    deposits: Array.isArray(doc.deposits) ? doc.deposits : [],
    createdAt: doc.createdAt || "",
  };
}

export function buyerSummary(doc) {
  const buyer = publicBuyer(doc);
  return {
    id: buyer.id,
    email: buyer.email,
    name: buyer.name,
    phone: buyer.phone,
    prequalified: buyer.prequalified,
    deposited: buyer.deposited,
    deposits: buyer.deposits,
    payments: buyer.payments,
    createdAt: buyer.createdAt,
  };
}

function deskFields(input = {}) {
  const current = publicBuyer(input);
  return {
    name: String(input.name ?? current.name).trim().slice(0, 80),
    phone: String(input.phone ?? current.phone).trim().slice(0, 40),
    timeline: String(input.timeline ?? current.timeline),
    prequalified: Boolean(input.prequalified ?? current.prequalified),
    downPercent: current.downPercent,
    paidDown: current.paidDown,
    paidClosing: current.paidClosing,
    paidPrincipal: current.paidPrincipal,
    balances: current.balances,
    payments: current.payments,
    docs: current.docs,
  };
}

export async function findBuyerByEmail(email) {
  const collection = await buyerCollection();
  return collection.findOne({ email: normalizeEmail(email) });
}

export async function findBuyerById(id) {
  const collection = await buyerCollection();
  const raw = String(id || "").trim();
  if (ObjectId.isValid(raw)) {
    try {
      const objectId = new ObjectId(raw);
      if (String(objectId) === raw) {
        const found = await collection.findOne({ _id: objectId });
        if (found) return found;
      }
    } catch {
      // Fall through to email lookup.
    }
  }
  return collection.findOne({ email: normalizeEmail(raw) });
}

export async function sessionBuyer(token) {
  if (!token) return null;
  const collection = await buyerCollection();
  return collection.findOne({ token });
}

export async function requireBuyer(req, res) {
  const token = readToken(req);
  if (!token) {
    res.status(401).json({ ok: false, error: "Sign in to continue." });
    return null;
  }
  try {
    const buyer = await sessionBuyer(token);
    if (!buyer) {
      res.status(401).json({ ok: false, error: "Sign in to continue." });
      return null;
    }
    return buyer;
  } catch (error) {
    if (error?.code === "NO_MONGO") {
      res.status(503).json({ ok: false, error: "MongoDB is not connected." });
      return null;
    }
    res.status(500).json({ ok: false, error: "The buyer session could not be checked." });
    return null;
  }
}

export async function createBuyer({ name, email, password, phone }) {
  if (!validEmail(email)) {
    const error = new Error("Enter a valid email address.");
    error.status = 400;
    throw error;
  }
  if (String(password || "").length < 8) {
    const error = new Error("Use a password with at least 8 characters.");
    error.status = 400;
    throw error;
  }
  const collection = await buyerCollection();
  const existing = await collection.findOne({ email });
  if (existing) {
    const error = new Error("That email already has an account. Sign in instead.");
    error.status = 409;
    throw error;
  }
  const token = newToken();
  const { hash, salt } = hashPassword(password);
  const desk = emptyBuyerDesk();
  const doc = {
    email,
    name: String(name || "").trim().slice(0, 80),
    passwordHash: hash,
    salt,
    token,
    createdAt: new Date().toISOString(),
    ...desk,
    phone: String(phone || "").trim().slice(0, 40),
    prequalified: true,
  };
  const result = await collection.insertOne(doc);
  return { token, buyer: publicBuyer({ ...doc, _id: result.insertedId }) };
}

export async function signInBuyer({ email, password }) {
  const collection = await buyerCollection();
  const doc = await collection.findOne({ email });
  if (!doc || !verifyPassword(password, doc.passwordHash, doc.salt)) return null;
  const token = newToken();
  await collection.updateOne({ _id: doc._id }, { $set: { token, lastLoginAt: new Date().toISOString() } });
  return { token, buyer: publicBuyer({ ...doc, token }) };
}

export async function listBuyers() {
  const collection = await buyerCollection();
  const docs = await collection.find({}).sort({ createdAt: -1 }).limit(200).toArray();
  return docs.map(buyerSummary);
}

export async function saveBuyerDesk(buyer, input) {
  const collection = await buyerCollection();
  const next = deskFields({ ...buyer, ...input });
  await collection.updateOne(
    { _id: buyer._id },
    { $set: { ...next, updatedAt: new Date().toISOString() } },
  );
  return publicBuyer({ ...buyer, ...next });
}

export async function addBuyerDeposit(buyer, amount) {
  const usdAmount = cents(Number(amount));
  if (!Number.isFinite(usdAmount) || usdAmount <= 0) {
    const error = new Error("Enter an amount greater than zero.");
    error.status = 400;
    throw error;
  }
  const current = publicBuyer(buyer);
  const ceiling = PREQUAL_CAP;
  const room = cents(ceiling - current.deposited);
  if (usdAmount > room + 0.001) {
    const error = new Error(
      room <= 0
        ? `Pre-qualified funds for this buyer are already at ${usd(ceiling)}.`
        : `That would pass ${usd(ceiling)}. ${usd(room)} can still be added.`,
    );
    error.status = 400;
    throw error;
  }
  const deposited = cents(current.deposited + usdAmount);
  const deposits = [{ id: randomUUID(), at: new Date().toISOString(), amount: usdAmount }, ...current.deposits];
  const collection = await buyerCollection();
  await collection.updateOne(
    { _id: buyer._id },
    { $set: { deposited, deposits, updatedAt: new Date().toISOString() } },
  );
  return publicBuyer({ ...buyer, deposited, deposits });
}
