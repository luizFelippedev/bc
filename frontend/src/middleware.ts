import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas protegidas da interface
const protectedRoutes = ["/admin"];

// Rotas públicas (ex: login)
const authRoutes = ["/login"];

// Rotas de API protegidas
const protectedApiRoutes = ["/api/admin"];

// Verifica se o usuário está autenticado
function isUserAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get("portfolio_token");
  const authHeader = request.headers.get("Authorization");
  const hasToken =
    !!authCookie?.value || (authHeader && authHeader.startsWith("Bearer "));

  const isDev = process.env.NODE_ENV === "development";

  return hasToken || isDev;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = isUserAuthenticated(request);

  // 🔒 Rotas protegidas da interface
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);

      if (process.env.NODE_ENV !== "production") {
        console.log(
          `[Middleware] Acesso negado a ${pathname}, redirecionando para login`,
        );
      }

      return NextResponse.redirect(loginUrl);
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Middleware] Acesso permitido a ${pathname}`);
    }
  }

  // 🔁 Rotas públicas (ex: login) redireciona se já autenticado
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      const callbackUrl =
        request.nextUrl.searchParams.get("callbackUrl") || "/admin";

      if (process.env.NODE_ENV !== "production") {
        console.log(`[Middleware] Usuário autenticado, redirecionando para ${callbackUrl}`);
      }

      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
  }

  // 🛡️ Rotas de API protegidas
  if (
    protectedApiRoutes.some((route) => pathname.startsWith(route)) &&
    request.method !== "OPTIONS"
  ) {
    if (!isAuthenticated) {
      if (process.env.NODE_ENV !== "production") {
        console.log(`[Middleware] Acesso negado à API: ${pathname}`);
      }

      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Autenticação necessária",
          code: "auth_required",
        }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        },
      );
    }
  }

  // ✅ Resposta padrão com headers de segurança
  const response = NextResponse.next();

  // Headers de segurança
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Headers CORS para API
  if (pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
  }

  return response;
}

// Define quais caminhos o middleware deve interceptar
export const config = {
  matcher: [
    /**
     * Executa em todos os caminhos exceto:
     * - _next/static
     * - _next/image
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
