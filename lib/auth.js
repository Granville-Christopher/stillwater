import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { adminCollection } from "./db.js";

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(String(password), salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password, hash, salt) {
  try {
    const next = scryptSync(String(password), salt, 64);
    return timingSafeEqual(Buffer.from(hash, "hex"), next);
  } catch {
    return false;
  }
}

export function newToken() {
  return randomBytes(32).toString("hex");
}

export function publicAdmin(doc = {}) {
  return {
    email: doc.email || "",
    name: doc.name || "",
  };
}

export function readAdminToken(req) {
  const header = String(req.headers["x-admin-token"] || "").trim();
  if (header) return header;
  const auth = String(req.headers.authorization || "");
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return "";
}

export async function findAdminByEmail(email) {
  const collection = await adminCollection();
  return collection.findOne({ email: normalizeEmail(email) });
}

export async function adminExists() {
  const collection = await adminCollection();
  return Boolean(await collection.findOne({}));
}

export async function createAdmin({ name, email, password }) {
  const collection = await adminCollection();
  const token = newToken();
  const { hash, salt } = hashPassword(password);
  const doc = {
    email,
    name: String(name || "").trim().slice(0, 80),
    passwordHash: hash,
    salt,
    token,
    createdAt: new Date().toISOString(),
  };
  await collection.insertOne(doc);
  return { token, admin: publicAdmin(doc) };
}

export async function signInAdmin({ email, password }) {
  const collection = await adminCollection();
  const doc = await collection.findOne({ email });
  if (!doc || !verifyPassword(password, doc.passwordHash, doc.salt)) return null;
  const token = newToken();
  await collection.updateOne({ _id: doc._id }, { $set: { token, lastLoginAt: new Date().toISOString() } });
  return { token, admin: publicAdmin(doc) };
}

export async function sessionAdmin(token) {
  if (!token) return null;
  const collection = await adminCollection();
  return collection.findOne({ token });
}
