import { callPrivateEngine } from "@/lib/private-engine/proxy";
export const runtime = "nodejs";

/** Staging only: must be protected by verified user sessions before activation. */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({error:"Cross-origin requests are not allowed."},{status:403});
  }
  if (Number(request.headers.get("content-length") || 0) > 12_000) {
    return Response.json({error:"Request too large"},{status:413});
  }
  return callPrivateEngine(request,"analysis");
}
