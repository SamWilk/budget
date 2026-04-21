import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/logout",
];

function getSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || "budget-tracker-dev-secret-change-in-prod",
  );
}

export async function middleware(request) {
  try {
    const { pathname } = request.nextUrl;

    if (
      PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon")
    ) {
      return NextResponse.next();
    }

    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      await jwtVerify(token, getSecret());
      return NextResponse.next();
    } catch (_e) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (_err) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
