import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ACTIVE_ROLE_COOKIE } from "@/lib/firebase/constants";
import { isRoleSlug } from "@/lib/firebase/firestore-schema";

const ROLE_ROUTE_PREFIX = "/app/role";

const extractRequestedRole = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const roleIndex = segments.findIndex((segment) => segment === "role");

  if (roleIndex === -1) {
    return null;
  }

  return segments[roleIndex + 1] ?? null;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith(ROLE_ROUTE_PREFIX)) {
    return NextResponse.next();
  }

  const activeRole = request.cookies.get(ACTIVE_ROLE_COOKIE)?.value ?? null;
  const requestedRole = extractRequestedRole(pathname);

  if (!activeRole || !isRoleSlug(activeRole)) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (requestedRole && requestedRole !== activeRole) {
    const targetUrl = new URL(`${ROLE_ROUTE_PREFIX}/${activeRole}`, request.url);
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/role/:path*"],
};
