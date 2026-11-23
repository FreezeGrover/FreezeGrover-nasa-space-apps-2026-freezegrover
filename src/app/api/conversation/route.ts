export const runtime = "nodejs";
// Do not import public OpenAI/prompt/tool code here. The private server owns it.
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  }
  const limit = 100_000;
  const size = Number(request.headers.get("content-length") ?? 0);
  if (size > limit) {
    return Response.json({ error: "Conversation context is too large." }, { status: 413 });
  }
  // Do not activate a paid model through a publicly accessible proxy.
  // A signed-in verified researcher, durable atomic question reservations, and
  // actual provider cost metering must be implemented before enabling requests.
  // This guard deliberately has no environment-variable bypass.
  return Response.json(
    { error: "AI interpretation access is not yet enabled. NASA evidence browsing remains available." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
