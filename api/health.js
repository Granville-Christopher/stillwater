export const config = { runtime: "edge" };

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
  }
  const env = process.env;
  const admin = String(env["ADMIN_CODE"] || "").trim();
  const mongo = String(env["MONGODB_URI"] || "").trim();
  return Response.json(
    { ok: true, admin: admin.length > 0, mongo: mongo.length > 0 },
    { headers: cors() },
  );
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-code",
    "Cache-Control": "no-store",
  };
}
