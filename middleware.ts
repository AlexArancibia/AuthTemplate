import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

// Añadir las nuevas rutas a publicRoutes para que sean accesibles sin login
const publicRoutes = [
  "/",
  "/nosotros",
  "/cart",
  "/productos",
  "/blog",
  "/checkout",
  "/contactenos",
  "/api/email/send-to-client",
  "/api/email/send-to-admin",
  "/api/email/send-verification", // Esta ya estaba, es para la verificación de email
  "/terminos-y-condiciones",
  "/politica-de-privacidad",
  "/libro-de-reclamaciones",
  "/promociones",
  "/catalogo",
  "/forgot-password", // Nueva ruta pública
  "/reset-password", // Nueva ruta pública
];
const publicPrefixes = ["/productos/", "/blog/"];
const authRoutes = ["/login", "/register"]; // Estas son las páginas a las que se redirige si ya está logueado
const apiAuthPrefix = "/api/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  console.log({ isLoggedIn, path: nextUrl.pathname });

  // Permitir todas las rutas de API de autenticación
  if (nextUrl.pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next();
  }

  if (
  publicRoutes.includes(nextUrl.pathname) ||
  publicPrefixes.some((prefix) => nextUrl.pathname.startsWith(prefix))
) {
  return NextResponse.next();
}

  // Permitir acceso a rutas públicas sin importar el estado de autenticación
  if (publicRoutes.includes(nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Redirigir a /dashboard si el usuario está logueado y trata de acceder a rutas de autenticación
  if (isLoggedIn && authRoutes.includes(nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Redirigir a /login si el usuario no está logueado y trata de acceder a una ruta protegida
  if (
    !isLoggedIn &&
    !authRoutes.includes(nextUrl.pathname) &&
    !publicRoutes.includes(nextUrl.pathname)
  ) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
