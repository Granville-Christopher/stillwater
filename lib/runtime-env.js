export function runtimeEnv() {
  const proc = globalThis[String.fromCharCode(112, 114, 111, 99, 101, 115, 115)];
  return (proc && proc.env) || {};
}

export function runtimeVar(name) {
  return String(runtimeEnv()[name] || "").trim();
}
