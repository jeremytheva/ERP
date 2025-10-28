import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ROLE_ROUTE_MATCHER = /^\/app\/role\/([^/]+)(?:\/(.*))?$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = ROLE_ROUTE_MATCHER.exec(pathname);

  if (!match) {
    return NextResponse.next();
  }

  const [, role, remainder] = match;
  const cookies = request.cookies;
  const activeRole = cookies.get("activeRole")?.value;
  const permittedComponents = cookies
    .get("permittedComponents")?.value
    ?.split(",")
    .map((component) => component.trim())
    .filter(Boolean) ?? [];
  const defaultComponent = cookies.get("roleDefaultComponent")?.value ?? "dashboard";

  if (!activeRole) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (activeRole !== role) {
    const redirectUrl = new URL(`/app/role/${activeRole}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  const firstSegment = (remainder ?? "").split("/").filter(Boolean)[0];

  if (!firstSegment) {
    const destination = new URL(`/app/role/${role}/${defaultComponent}`, request.url);
    return NextResponse.redirect(destination);
  }

  if (permittedComponents.length > 0 && !permittedComponents.includes(firstSegment)) {
    const destination = new URL(`/app/role/${role}/${defaultComponent}`, request.url);
    return NextResponse.redirect(destination);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/role/:path*"],
};
