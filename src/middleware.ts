import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth(async function middleware(request) {
  // 1. Run next-intl middleware first (locale detection & URL rewrites)
  const intlResponse = intlMiddleware(request);

  // 2. If next-intl triggered a redirect, return immediately
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  const { pathname } = request.nextUrl;

  // Clean pathname without locale prefix for route guarding
  const cleanPath = pathname.replace(/^\/(pl|en)/, "") || "/";
  const localeMatch = pathname.match(/^\/(pl|en)/);
  const currentLocale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  const protectedPaths = ["/konto", "/lista-zyczen", "/zamowienie"];
  const adminPaths = ["/admin"];
  const authPaths = ["/konto/logowanie", "/konto/rejestracja"];

  const isProtected = protectedPaths.some(
    (p) => cleanPath === p || cleanPath.startsWith(p + "/")
  );
  const isAdmin = adminPaths.some(
    (p) => cleanPath === p || cleanPath.startsWith(p + "/")
  );
  const isAuthPage = authPaths.some((p) => cleanPath === p);

  // 3. Inspect user session from request.auth
  const session = request.auth;
  const isLoggedIn = !!session?.user;
  const userRole = (session?.user as any)?.role;

  // Admin route protection: must be logged in and role === 'admin'
  if (isAdmin) {
    if (!isLoggedIn || userRole !== "admin") {
      const loginUrl = new URL(
        currentLocale === "pl" ? "/konto/logowanie" : `/${currentLocale}/konto/logowanie`,
        request.url
      );
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Customer protected routes: must be logged in
  if (isProtected && !isAuthPage && !isLoggedIn) {
    const loginUrl = new URL(
      currentLocale === "pl" ? "/konto/logowanie" : `/${currentLocale}/konto/logowanie`,
      request.url
    );
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect away from login/register if already logged in
  if (isAuthPage && isLoggedIn) {
    const accountUrl = new URL(
      currentLocale === "pl" ? "/konto" : `/${currentLocale}/konto`,
      request.url
    );
    return NextResponse.redirect(accountUrl);
  }

  return intlResponse;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
