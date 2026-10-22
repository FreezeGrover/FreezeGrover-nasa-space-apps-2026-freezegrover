import { NextResponse } from "next/server";

function healthUrl(reasoningUrl: string): string {
  const url = new URL(reasoningUrl);
  url.pathname = url.pathname.replace(/\/reason\/?$/, "/health");
  url.search = "";
  return url.toString();
}

export async function GET() {
  const configured = process.env.CLARITY_REASONING_URL?.trim();

  if (!configured) {
    return NextResponse.json(
      { connected: false, status: "not-configured" },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(healthUrl(configured), {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { connected: false, status: "unavailable" },
        { status: 503 },
      );
    }

    const health = await response.json().catch(() => ({}));

    return NextResponse.json({
      connected: true,
      status: "connected",
      service:
        typeof health?.service === "string"
          ? health.service
          : "private-reasoning-service",
    });
  } catch {
    return NextResponse.json(
      { connected: false, status: "unavailable" },
      { status: 503 },
    );
  }
}
