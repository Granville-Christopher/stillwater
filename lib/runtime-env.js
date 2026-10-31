import nodeProcess from "node:process";

export function runtimeEnv() {
  return nodeProcess?.env || {};
}

export function runtimeVar(...names) {
  const env = runtimeEnv();
  for (const name of names) {
    const value = cleanSecret(env[name]);
    if (value) return value;
  }
  return "";
}

export function cleanSecret(value) {
  return String(value || "").trim().replace(/^['"]|['"]$/g, "");
}

export function adminSecrets() {
  const env = runtimeEnv();
  return [...new Set(["ADMIN_CODE", "VITE_ADMIN_CODE"].map((name) => cleanSecret(env[name])).filter(Boolean))];
}

export function adminSecret() {
  return adminSecrets()[0] || "";
}

export function adminCodeMatches(code) {
  const next = cleanSecret(code);
  return next.length > 0 && adminSecrets().includes(next);
}
