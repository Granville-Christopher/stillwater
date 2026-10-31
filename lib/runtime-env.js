import nodeProcess from "node:process";

export function runtimeEnv() {
  return nodeProcess?.env || {};
}

export function runtimeVar(...names) {
  const env = runtimeEnv();
  for (const name of names) {
    const value = String(env[name] || "").trim();
    if (value) return value;
  }
  return "";
}

export function adminSecret() {
  return runtimeVar("ADMIN_CODE", "VITE_ADMIN_CODE");
}
