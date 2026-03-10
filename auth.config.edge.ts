/**
 * Config mínima para el middleware (Edge Runtime).
 * NO importa Credentials, Google, GitHub para evitar el error:
 * "The edge runtime does not support Node.js 'stream' module"
 *
 * El middleware solo necesita decodificar la JWT de sesión, no ejecutar providers.
 * La config completa está en auth.config.ts (API route, Node.js runtime).
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
