import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "@/auth.config";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    // Add this new signIn callback
    async signIn({ user, account, profile }) {
      // Only proceed for OAuth providers (not credentials)
      if (!account || account.provider === "credentials") {
        return true;
      }
      
      // If we have a user with an email
      if (user && user.email) {
        try {
          // Check if this email already exists in the database
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
          });
          
          // If user exists but doesn't have this OAuth account linked
          if (existingUser) {
            // Check if this provider is already linked
            const existingAccount = await db.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: account.provider,
              },
            });
            
            // If not linked yet, create the link
            if (!existingAccount) {
              await db.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  // Fix the type issues by converting to string
                  refresh_token: account.refresh_token ? String(account.refresh_token) : null,
                  access_token: account.access_token ? String(account.access_token) : null,
                  expires_at: account.expires_at,
                  token_type: account.token_type ? String(account.token_type) : null,
                  scope: account.scope ? String(account.scope) : null,
                  id_token: account.id_token ? String(account.id_token) : null,
                  session_state: account.session_state ? String(account.session_state) : null,
                },
              });
            }
            
            // Use the existing user's ID
            user.id = existingUser.id;
          }
          
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return true; // Still allow sign in even if our linking logic fails
        }
      }
      
      return true; // Default: allow sign in
    },
    
    // Your existing callbacks remain unchanged
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  events: {
    // Your existing event handler remains unchanged
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Add this line to handle errors properly
  },
});