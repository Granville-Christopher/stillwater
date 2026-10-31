import nodeProcess from "node:process";

export function runtimeEnv() {
  return nodeProcess?.env || {};
}

export function runtimeVar(...names) {
  const env = runtimeEnv();
  for (const name of names) {
    const value = String(env[name] || "").trim().replace(/^['"]|['"]$/g, "");
    if (value) return value;
  }
  return "";
}

export function adminSecret() {
  return runtimeVar("ADMIN_CODE");
}

export function adminCodeMatches(code) {
  const expected = adminSecret();
  const next = String(code || "").trim().replace(/^['"]|['"]$/g, "");
  return Boolean(expected) && Boolean(next) && expected === next;
}
