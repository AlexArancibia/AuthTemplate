-- Listar usuarios del schema anj (AuthTemplate / NextAuth)
-- Uso: npx prisma db execute --file ./scripts/check-users.sql
SELECT id, email, "emailVerified", (password IS NOT NULL) AS "hasPassword", role, "createdAt"
FROM anj."User"
ORDER BY "createdAt" DESC;
