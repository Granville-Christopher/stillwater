import { cents, DEFAULT_DOWN_PAYMENT, PREQUAL_CAP, PRICE, usd } from "./data.js";

const KEY = "stillwater-admin-v1";
const SESSION = "stillwater-admin-session";
const SESSION_TOKEN = "stillwater-admin-token";
const ACCOUNT_KEY = "stillwater-admin-account";

export const RAIL_IDS = ["usdc", "btc", "eth"];

function empty() {
  return {
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
    purchases: [],
  };
}

function mergeDesk(saved) {
  const base = empty();
  if (!saved) return base;
  return {
    rails: {
      usdc: { ...base.rails.usdc, ...saved.rails?.usdc },
      btc: { ...base.rails.btc, ...saved.rails?.btc },
      eth: { ...base.rails.eth, ...saved.rails?.eth },
    },
    wire: { ...base.wire, ...saved.wire },
    cash: { ...base.cash, ...saved.cash },
    downPayment: Number.isFinite(Number(saved.downPayment)) ? cents(Number(saved.downPayment)) : DEFAULT_DOWN_PAYMENT,
    deposited: Number.isFinite(Number(saved.deposited)) ? cents(Math.min(PREQUAL_CAP, Math.max(0, Number(saved.deposited)))) : 0,
    deposits: Array.isArray(saved.deposits) ? saved.deposits : [],
    purchases: Array.isArray(saved.purchases) ? saved.purchases : [],
  };
}

function cacheDesk(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("stillwater-admin"));
}

export function loadAdmin() {
  try {
    return mergeDesk(JSON.parse(localStorage.getItem(KEY) || "null"));
  } catch {
    return empty();
  }
}

export function adminSessionOn() {
  return sessionStorage.getItem(SESSION) === "1";
}

export function hasLocalAccount() {
  try {
    return Boolean(JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null")?.email);
  } catch {
    return false;
  }
}

function sessionToken() {
  return sessionStorage.getItem(SESSION_TOKEN) || "";
}

function isLocalSession() {
  return sessionToken().startsWith("local.");
}

function openSession(token) {
  sessionStorage.setItem(SESSION, "1");
  if (token) sessionStorage.setItem(SESSION_TOKEN, token);
}

function adminHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = sessionToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateAccount({ email, password, confirm, registering }) {
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

function readLocalAccount() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");
  } catch {
    return null;
  }
}

async function registerLocal({ name, email, password }) {
  if (readLocalAccount()) {
    return { ok: false, error: "An admin account already exists on this browser. Sign in instead." };
  }
  const salt = crypto.randomUUID();
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify({
    email,
    name: String(name || "").trim(),
    salt,
    passwordHash: await hashLocalPassword(password, salt),
  }));
  openSession(`local.${crypto.randomUUID()}`);
  return { ok: true };
}

async function loginLocal({ email, password }) {
  const account = readLocalAccount();
  if (!account) {
    return { ok: false, error: "Create an admin account first." };
  }
  const passwordHash = await hashLocalPassword(password, account.salt);
  if (account.email !== email || passwordHash !== account.passwordHash) {
    return { ok: false, error: "That email or password is incorrect." };
  }
  openSession(`local.${crypto.randomUUID()}`);
  return { ok: true };
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { ...adminHeaders(), ...options.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.ok === false) {
    const error = new Error(body.error || "The request failed.");
    error.status = response.status;
    throw error;
  }
  return body;
}

export async function checkAdminService() {
  try {
    return await request("/api/health");
  } catch {
    return { ok: false, mongo: false, registered: hasLocalAccount() };
  }
}

export async function registerAdmin({ name, email, password, confirm }) {
  const check = validateAccount({ email, password, confirm, registering: true });
  if (!check.ok) return check;
  try {
    const result = await request("/api/admin/register", {
      method: "POST",
      body: JSON.stringify({ name, email: check.email, password }),
    });
    openSession(result.token);
    return { ok: true };
  } catch (error) {
    if (error.status === 400 || error.status === 409) {
      return { ok: false, error: error.message };
    }
    return registerLocal({ name, email: check.email, password });
  }
}

export async function enterAdmin({ email, password }) {
  const check = validateAccount({ email, password, registering: false });
  if (!check.ok) return check;
  try {
    const result = await request("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email: check.email, password }),
    });
    openSession(result.token);
    return { ok: true };
  } catch (error) {
    if (error.status === 400 || error.status === 401) {
      return { ok: false, error: error.message || "That email or password is incorrect." };
    }
    return loginLocal({ email: check.email, password });
  }
}

export function leaveAdmin() {
  sessionStorage.removeItem(SESSION);
  sessionStorage.removeItem(SESSION_TOKEN);
}

export function loadTerms() {
  const data = loadAdmin();
  return {
    downPayment: data.downPayment,
    deposited: data.deposited,
    deposits: data.deposits,
  };
}

export async function refreshDesk() {
  try {
    const [deskRes, purchaseRes] = await Promise.all([
      request("/api/desk"),
      adminSessionOn() && !isLocalSession()
        ? request("/api/desk/purchases").catch(() => ({ purchases: loadAdmin().purchases }))
        : Promise.resolve({ purchases: loadAdmin().purchases }),
    ]);
    const next = mergeDesk({ ...deskRes.desk, purchases: purchaseRes.purchases || [] });
    cacheDesk(next);
    return next;
  } catch {
    return loadAdmin();
  }
}

export async function saveDownPayment(amount) {
  const next = cents(Number(amount));
  if (!Number.isFinite(next) || next <= 0) return { ok: false, error: "Enter a down payment greater than zero." };
  if (next > PRICE) return { ok: false, error: "The down payment cannot be more than the price." };
  if (!isLocalSession()) {
    try {
      const result = await request("/api/desk/down-payment", {
        method: "POST",
        body: JSON.stringify({ amount: next }),
      });
      cacheDesk(mergeDesk({ ...loadAdmin(), ...result.desk }));
      return { ok: true };
    } catch (error) {
      if (error.status && error.status !== 503) return { ok: false, error: error.message };
    }
  }
  {
    const data = loadAdmin();
    if (next < data.deposited) return { ok: false, error: `The down payment cannot be less than the ${usd(data.deposited)} already deposited.` };
    data.downPayment = next;
    cacheDesk(data);
    return { ok: true };
  }
}

export async function addDeposit(amount) {
  const usdAmount = cents(Number(amount));
  if (!Number.isFinite(usdAmount) || usdAmount <= 0) return { ok: false, error: "Enter an amount greater than zero." };
  if (!isLocalSession()) {
    try {
      const result = await request("/api/desk/deposit", {
        method: "POST",
        body: JSON.stringify({ amount: usdAmount }),
      });
      cacheDesk(mergeDesk({ ...loadAdmin(), ...result.desk }));
      return { ok: true, deposited: result.deposited };
    } catch (error) {
      if (error.status && error.status !== 503) return { ok: false, error: error.message };
    }
  }
  {
    const data = loadAdmin();
    const ceiling = Math.min(PREQUAL_CAP, data.downPayment);
    const room = cents(ceiling - data.deposited);
    if (usdAmount > room + 0.001) {
      return {
        ok: false,
        error: room <= 0
          ? `Pre-qualified funds are already at ${usd(ceiling)}.`
          : `That would pass ${usd(ceiling)}. ${usd(room)} can still be added.`,
      };
    }
    data.deposited = cents(data.deposited + usdAmount);
    data.deposits = [{ id: crypto.randomUUID(), at: new Date().toISOString(), amount: usdAmount }, ...data.deposits];
    cacheDesk(data);
    return { ok: true, deposited: data.deposited };
  }
}

export async function savePaymentDetails({ rails, wire, cash }) {
  if (!isLocalSession()) {
    try {
      const result = await request("/api/desk", {
        method: "PUT",
        body: JSON.stringify({ rails, wire, cash }),
      });
      cacheDesk(mergeDesk({ ...loadAdmin(), ...result.desk }));
      return { ok: true };
    } catch (error) {
      if (error.status && error.status !== 503) return { ok: false, error: error.message };
    }
  }
  {
    const data = loadAdmin();
    data.rails = rails;
    data.wire = wire;
    data.cash = cash;
    cacheDesk(data);
    return { ok: true };
  }
}

export async function recordPurchase(purchase) {
  if (!isLocalSession()) {
    try {
      await request("/api/desk/purchases", {
        method: "POST",
        body: JSON.stringify(purchase),
      });
    } catch {
      // Buyer receipts still stay on this browser if the server is unavailable.
    }
  }
  const data = loadAdmin();
  data.purchases = [purchase, ...data.purchases];
  cacheDesk(data);
}
