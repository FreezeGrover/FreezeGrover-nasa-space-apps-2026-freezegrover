import "server-only";

/**
 * The public Next.js server is the only client of this endpoint.
 * Never send PRIVATE_ENGINE_SERVICE_TOKEN to a browser or NEXT_PUBLIC_* variable.
 *
 * The private Vercel deployment also requires a hosting access exemption for
 * trusted service-to-service requests (configured server-side only); a project
 * name or ordinary SSO session is not sufficient.
 */
export async function callPrivateEngine(
  request: Request,
  path: "conversation" | "research",
): Promise<Response> {
  const origin = process.env.PRIVATE_ENGINE_ORIGIN;
  const token = process.env.PRIVATE_ENGINE_SERVICE_TOKEN;
  if (!origin || !token || token.length < 32) {
    return Response.json(
      { error: "Private research service is not yet available." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  let target: URL;
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
      throw new Error("Invalid private service origin");
    }
    target = new URL("/api/private/" + path, url.origin);
    if (target.origin !== url.origin) throw new Error("Private service origin mismatch");
  } catch {
    return Response.json(
      { error: "Private research service configuration is invalid." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Do not forward client Authorization, Cookie, x-private-engine-token,
  // Origin, or other untrusted headers to the private application.
  const headers = new Headers({
    "Content-Type": "application/json",
    "x-private-engine-token": token,
    Accept: path === "conversation"
      ? "application/x-ndjson"
      : "application/json",
  });
  // Vercel's deployment protection is a distinct access boundary from
  // application authorization. This ID is NOT the service token itself.
  const vercelProtection = process.env.PRIVATE_ENGINE_VERCEL_BYPASS;
  if (vercelProtection) {
    headers.set("x-vercel-protection-bypass", vercelProtection);
  }

  try {
    const response = await fetch(target, {
      method: "POST",
      headers,
      body: await request.text(),
      signal: request.signal,
      cache: "no-store",
      redirect: "manual",
    });
    // Never forward hosted login redirects or error HTML into a research UI.
    if (response.status >= 300 && response.status < 400) {
      return Response.json(
        { error: "Private research service requires deployment authorization." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (response.status >= 500) {
      return Response.json(
        { error: "Private research service is temporarily unavailable." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    const contentType = response.headers.get("content-type") ?? "";
    const expectedType = path === "conversation"
      ? "application/x-ndjson"
      : "application/json";
    if (!contentType.toLowerCase().includes(expectedType)) {
      return Response.json(
        { error: "Private research service returned an unexpected response." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, no-transform",
      },
    });
  } catch {
    return Response.json(
      { error: "Private research service could not be reached." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
