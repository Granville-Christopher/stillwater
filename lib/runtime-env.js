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
