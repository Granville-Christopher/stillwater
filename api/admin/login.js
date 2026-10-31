export const config = { runtime: "edge" };

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
  }
  if (request.method !== "POST") {
    return Response.json({ ok: false, error: "Use POST." }, { status: 405, headers: cors() });
  }
  const expected = String((process.env || {})["ADMIN_CODE"] || "").trim().replace(/^['"]|['"]$/g, "");
  if (!expected) {
    return Response.json({ ok: false, error: "ADMIN_CODE is not available to this function." }, { status: 503, headers: cors() });
  }
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const code = String(body.code || "").trim().replace(/^['"]|['"]$/g, "");
  if (!code || code !== expected) {
    return Response.json({ ok: false, error: "That code does not match." }, { status: 401, headers: cors() });
  }
  return Response.json({ ok: true }, { headers: cors() });
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-code",
    "Cache-Control": "no-store",
  };
}
