import { cents, freshAccount, PREQUAL_CAP, usd } from "./data.js";

const BUYERS_KEY = "stillwater-buyers-v1";
const SESSION = "stillwater-buyer-ok";
const SESSION_TOKEN = "stillwater-buyer-token";
const SESSION_EMAIL = "stillwater-buyer-email";

function emptyBuyer(overrides = {}) {
  return {
    id: overrides.id || overrides.email || "",
    ...freshAccount(),
    deposited: 0,
    deposits: [],
    ...overrides,
    balances: { ...freshAccount().balances, ...(overrides.balances || {}) },
    docs: { ...freshAccount().docs, ...(overrides.docs || {}) },
    payments: Array.isArray(overrides.payments) ? overrides.payments : [],
    deposits: Array.isArray(overrides.deposits) ? overrides.deposits : [],
  };
}

function readMap() {
  try {
    const raw = JSON.parse(localStorage.getItem(BUYERS_KEY) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function writeMap(map) {
  localStorage.setItem(BUYERS_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("stillwater-buyer"));
}

function sessionToken() {
  return sessionStorage.getItem(SESSION_TOKEN) || "";
}

function sessionEmail() {
  return sessionStorage.getItem(SESSION_EMAIL) || "";
}

function isLocalSession() {
  return sessionToken().startsWith("local.");
}

function openSession(token, email) {
  sessionStorage.setItem(SESSION, "1");
  if (token) sessionStorage.setItem(SESSION_TOKEN, token);
  if (email) sessionStorage.setItem(SESSION_EMAIL, email);
}

function buyerHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = sessionToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateAccount({ email, password, confirm, registering, name }) {
  if (registering && String(name || "").trim().length < 2) {
    return { ok: false, error: "Add the name that should sit on this file." };
  }
  const nextEmail = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (String(password || "").length < 8) {
    return { ok: false, error: "Use a password with at least 8 characters." };
  }
  if (registering && password !== confirm) {
    return { ok: false, error: "The passwords do not match." };
  }
  return { ok: true, email: nextEmail };
}

async function hashLocalPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { ...buyerHeaders(), ...options.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.ok === false) {
    const error = new Error(body.error || "The request failed.");
    error.status = response.status;
    throw error;
  }
  return body;
}

function storeLocalBuyer(buyer, extras = {}) {
  const map = readMap();
  const email = normalizeEmail(buyer.email);
  map[email] = {
    ...(map[email] || {}),
    ...emptyBuyer(buyer),
    email,
    ...extras,
  };
  writeMap(map);
  return emptyBuyer(map[email]);
}

export function buyerSessionOn() {
  return sessionStorage.getItem(SESSION) === "1" && Boolean(sessionEmail() || sessionToken());
}

export function loadBuyerAccount() {
  if (!buyerSessionOn()) return null;
  const email = sessionEmail();
  const saved = email ? readMap()[email] : null;
  return saved ? emptyBuyer(saved) : null;
}

export function buyerFunding(account = loadBuyerAccount()) {
  return {
    deposited: account?.deposited || 0,
    deposits: account?.deposits || [],
  };
}

export function leaveBuyer() {
  sessionStorage.removeItem(SESSION);
  sessionStorage.removeItem(SESSION_TOKEN);
  sessionStorage.removeItem(SESSION_EMAIL);
  window.dispatchEvent(new Event("stillwater-buyer"));
}

async function registerLocal({ name, email, password, phone }) {
  const map = readMap();
  if (map[email]) {
    return { ok: false, error: "That email already has an account. Sign in instead." };
  }
  const salt = crypto.randomUUID();
  const buyer = storeLocalBuyer({
    id: email,
    email,
    name: String(name || "").trim(),
    phone: String(phone || "").trim(),
    prequalified: true,
  }, {
    salt,
    passwordHash: await hashLocalPassword(password, salt),
  });
  openSession(`local.${crypto.randomUUID()}`, email);
  return { ok: true, buyer };
}

async function loginLocal({ email, password }) {
  const saved = readMap()[email];
  if (!saved) {
    return { ok: false, error: "Create an account first." };
  }
  const passwordHash = await hashLocalPassword(password, saved.salt);
  if (passwordHash !== saved.passwordHash) {
    return { ok: false, error: "That email or password is incorrect." };
  }
  openSession(`local.${crypto.randomUUID()}`, email);
  return { ok: true, buyer: emptyBuyer(saved) };
}

export async function registerBuyer({ name, email, password, confirm, phone }) {
  const check = validateAccount({ name, email, password, confirm, registering: true });
  if (!check.ok) return check;
  try {
    const result = await request("/api/buyers/register", {
      method: "POST",
      body: JSON.stringify({ name, email: check.email, password, phone }),
    });
    openSession(result.token, result.buyer.email);
    storeLocalBuyer(result.buyer);
    return { ok: true, buyer: emptyBuyer(result.buyer) };
  } catch (error) {
    if (error.status === 400 || error.status === 409) {
      return { ok: false, error: error.message };
    }
    return registerLocal({ name, email: check.email, password, phone });
  }
}

export async function enterBuyer({ email, password }) {
  const check = validateAccount({ email, password, registering: false });
  if (!check.ok) return check;
  try {
    const result = await request("/api/buyers/login", {
      method: "POST",
      body: JSON.stringify({ email: check.email, password }),
    });
    openSession(result.token, result.buyer.email);
    storeLocalBuyer(result.buyer);
    return { ok: true, buyer: emptyBuyer(result.buyer) };
  } catch (error) {
    if (error.status === 400 || error.status === 401) {
      return { ok: false, error: error.message || "That email or password is incorrect." };
    }
    return loginLocal({ email: check.email, password });
  }
}

export async function refreshBuyer() {
  if (!buyerSessionOn()) return null;
  if (!isLocalSession()) {
    try {
      const result = await request("/api/buyers/me");
      const buyer = storeLocalBuyer(result.buyer);
      return buyer;
    } catch (error) {
      if (error.status === 401) {
        leaveBuyer();
        return null;
      }
    }
  }
  return loadBuyerAccount();
}

export async function saveBuyerDesk(state) {
  if (!buyerSessionOn()) return state;
  const email = sessionEmail() || state.email;
  const current = loadBuyerAccount() || emptyBuyer({ email });
  const next = emptyBuyer({
    ...current,
    ...state,
    email,
    deposited: current.deposited,
    deposits: current.deposits,
  });
  storeLocalBuyer(next);
  if (!isLocalSession()) {
    try {
      const result = await request("/api/buyers/me", {
        method: "PUT",
        body: JSON.stringify(next),
      });
      return storeLocalBuyer({ ...next, ...result.buyer, deposited: result.buyer.deposited, deposits: result.buyer.deposits });
    } catch {
      return next;
    }
  }
  return next;
}

export function listLocalBuyers() {
  return Object.values(readMap()).map((buyer) => emptyBuyer(buyer));
}

export function applyLocalDeposit(buyerId, amount) {
  const usdAmount = cents(Number(amount));
  if (!buyerId) return { ok: false, error: "Select the buyer this money belongs to." };
  if (!Number.isFinite(usdAmount) || usdAmount <= 0) {
    return { ok: false, error: "Enter an amount greater than zero." };
  }
  const map = readMap();
  const match = Object.values(map).find((buyer) => (
    buyer.id === buyerId
    || buyer.email === buyerId
    || normalizeEmail(buyer.email) === normalizeEmail(buyerId)
  ));
  if (!match) return { ok: false, error: "Select a buyer who has created an account." };
  const room = cents(PREQUAL_CAP - (match.deposited || 0));
  if (usdAmount > room + 0.001) {
    return {
      ok: false,
      error: room <= 0
        ? `Pre-qualified funds for this buyer are already at ${usd(PREQUAL_CAP)}.`
        : `That would pass ${usd(PREQUAL_CAP)}. ${usd(room)} can still be added.`,
    };
  }
  const buyer = storeLocalBuyer({
    ...match,
    deposited: cents((match.deposited || 0) + usdAmount),
    deposits: [{ id: crypto.randomUUID(), at: new Date().toISOString(), amount: usdAmount }, ...(match.deposits || [])],
  });
  return { ok: true, buyer, deposited: buyer.deposited };
}

export function cacheBuyerRecord(buyer) {
  if (!buyer?.email) return;
  storeLocalBuyer(buyer);
}
