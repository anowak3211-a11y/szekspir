import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/privacy") return NextResponse.next();
  // Preserve the existing Basic Auth mechanism. Cron has a separate credential.
  const header = req.headers.get("authorization") || "";
  if (["/api/jobs/worker", "/api/editors/sync"].includes(req.nextUrl.pathname)) {
    const secret = process.env.CRON_SECRET;
    if (secret && header === `Bearer ${secret}`) return NextResponse.next();
    return new NextResponse("Auth required", { status: 401 });
  }
  if (req.nextUrl.pathname === "/api/editors/quality" && process.env.CRON_SECRET && header === `Bearer ${process.env.CRON_SECRET}`) return NextResponse.next();
  const pass = process.env.APP_PASSWORD;
  if (!pass) {
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    return new NextResponse("Application access is not configured", { status: 503 });
  }
  if (header.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(header.slice(6), "base64").toString();
      const idx = decoded.indexOf(":");
      if (idx >= 0 && decoded.slice(idx + 1) === pass) return NextResponse.next();
    } catch { /* malformed credentials are rejected */ }
  }
  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="SZEKSPIR"' },
  });
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
