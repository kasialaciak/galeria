import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/konto/logowanie",
  },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Remove locale prefix (e.g. /pl or /en) for route matching
      const cleanPath = pathname.replace(/^\/(pl|en)/, "") || "/";

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

      // Admin routes: must be logged in AND role === 'admin'
      if (isAdmin) {
        if (!isLoggedIn) return false;
        const role = (auth?.user as any)?.role;
        if (role !== "admin") {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // Protected customer routes: must be logged in
      if (isProtected && !isAuthPage) {
        return isLoggedIn;
      }

      // Auth pages: redirect already logged-in users to /konto
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/konto", nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "user";
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
