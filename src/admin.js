import { cents, DEFAULT_DOWN_PAYMENT, PREQUAL_CAP, PRICE, usd } from "./data.js";

const KEY = "stillwater-admin-v1";
const SESSION = "stillwater-admin-ok";

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

export function loadAdmin() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!saved) return empty();
    const base = empty();
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
  } catch {
    return empty();
  }
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("stillwater-admin"));
}

function expectedAdminCode() {
  return String(import.meta.env.VITE_ADMIN_CODE || "").trim();
}

export function adminCodeConfigured() {
  return expectedAdminCode().length > 0;
}

export function adminSessionOn() {
  return sessionStorage.getItem(SESSION) === "1";
}

export function enterAdmin(code) {
  const expected = expectedAdminCode();
  if (!expected) return { ok: false, error: "Set VITE_ADMIN_CODE in .env, then restart the site." };
  if (code.trim() !== expected) return { ok: false, error: "That code does not match." };
  sessionStorage.setItem(SESSION, "1");
  return { ok: true };
}

export function leaveAdmin() {
  sessionStorage.removeItem(SESSION);
}

export function loadTerms() {
  const data = loadAdmin();
  return {
    downPayment: data.downPayment,
    deposited: data.deposited,
    deposits: data.deposits,
  };
}

export function saveDownPayment(amount) {
  const next = cents(Number(amount));
  const data = loadAdmin();
  if (!Number.isFinite(next) || next <= 0) return { ok: false, error: "Enter a down payment greater than zero." };
  if (next > PRICE) return { ok: false, error: "The down payment cannot be more than the price." };
  if (next < data.deposited) return { ok: false, error: `The down payment cannot be less than the ${usd(data.deposited)} already deposited.` };
  data.downPayment = next;
  save(data);
  return { ok: true };
}

export function addDeposit(amount) {
  const usdAmount = cents(Number(amount));
  const data = loadAdmin();
  if (!Number.isFinite(usdAmount) || usdAmount <= 0) return { ok: false, error: "Enter an amount greater than zero." };
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
  const deposited = cents(data.deposited + usdAmount);
  data.deposited = deposited;
  data.deposits = [{ id: crypto.randomUUID(), at: new Date().toISOString(), amount: usdAmount }, ...data.deposits];
  save(data);
  return { ok: true, deposited };
}

export function savePaymentDetails({ rails, wire, cash }) {
  const data = loadAdmin();
  data.rails = rails;
  data.wire = wire;
  data.cash = cash;
  save(data);
}

export function recordPurchase(purchase) {
  const data = loadAdmin();
  data.purchases = [purchase, ...data.purchases];
  save(data);
}
