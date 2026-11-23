import { callPrivateEngine } from "@/lib/private-engine/proxy";

export const runtime = "nodejs";
export function GET() {
  // A configuration presence check only; not confirmation of live provider access.
  return Response.json(
    {
      configured: Boolean(
        process.env.PRIVATE_ENGINE_ORIGIN &&
        process.env.PRIVATE_ENGINE_SERVICE_TOKEN,
      ),
      provider: "Private research service",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  }
  const size = Number(request.headers.get("content-length") ?? 0);
  if (size > 10_000) {
    return Response.json({ error: "Question too large." }, { status: 413 });
  }
  return callPrivateEngine(request, "research");
}
