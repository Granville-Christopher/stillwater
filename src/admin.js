import { cents, DEFAULT_DOWN_PAYMENT, PREQUAL_CAP, PRICE, usd } from "./data.js";

const KEY = "stillwater-admin-v1";
const SESSION = "stillwater-admin-ok";
const SESSION_CODE = "stillwater-admin-code";

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

function sessionCode() {
  return sessionStorage.getItem(SESSION_CODE) || "";
}

function adminHeaders() {
  const headers = { "Content-Type": "application/json" };
  const code = sessionCode();
  if (code) headers["x-admin-code"] = code;
  return headers;
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
    return { ok: false, mongo: false, admin: false };
  }
}

export async function enterAdmin(code) {
  const next = code.trim();
  try {
    await request("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ code: next }),
    });
    sessionStorage.setItem(SESSION, "1");
    sessionStorage.setItem(SESSION_CODE, next);
    return { ok: true };
  } catch (error) {
    if (error.status === 401) return { ok: false, error: "That code does not match." };
    if (error.status === 503) return { ok: false, error: "The server could not read an admin code." };
    return { ok: false, error: error.message || "The admin desk could not be opened." };
  }
}

export function leaveAdmin() {
  sessionStorage.removeItem(SESSION);
  sessionStorage.removeItem(SESSION_CODE);
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
      adminSessionOn()
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
  try {
    const result = await request("/api/desk/down-payment", {
      method: "POST",
      body: JSON.stringify({ amount: next }),
    });
    cacheDesk(mergeDesk({ ...loadAdmin(), ...result.desk }));
    return { ok: true };
  } catch (error) {
    if (error.status) return { ok: false, error: error.message };
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
  try {
    const result = await request("/api/desk/deposit", {
      method: "POST",
      body: JSON.stringify({ amount: usdAmount }),
    });
    cacheDesk(mergeDesk({ ...loadAdmin(), ...result.desk }));
    return { ok: true, deposited: result.deposited };
  } catch (error) {
    if (error.status) return { ok: false, error: error.message };
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
  try {
    const result = await request("/api/desk", {
      method: "PUT",
      body: JSON.stringify({ rails, wire, cash }),
    });
    cacheDesk(mergeDesk({ ...loadAdmin(), ...result.desk }));
    return { ok: true };
  } catch (error) {
    if (error.status) return { ok: false, error: error.message };
    const data = loadAdmin();
    data.rails = rails;
    data.wire = wire;
    data.cash = cash;
    cacheDesk(data);
    return { ok: true };
  }
}

export async function recordPurchase(purchase) {
  try {
    await request("/api/desk/purchases", {
      method: "POST",
      body: JSON.stringify(purchase),
    });
    const data = loadAdmin();
    data.purchases = [purchase, ...data.purchases];
    cacheDesk(data);
  } catch {
    const data = loadAdmin();
    data.purchases = [purchase, ...data.purchases];
    cacheDesk(data);
  }
}
