/**
 * Config mínima para el middleware (Edge Runtime).
 * NO importa Credentials ni Google para evitar el error:
 * "The edge runtime does not support Node.js 'stream' module"
 *
 * El middleware solo necesita decodificar la JWT de sesión, no ejecutar providers.
 * La config completa con providers está en auth.config.ts y se usa en auth.ts (API route).
 */
import type { NextAuthConfig } from "next-auth";

export default {
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [],
  cookies: {
    sessionToken: {
      options: {
        sameSite: "lax",
      },
    },
  },
} satisfies NextAuthConfig;
