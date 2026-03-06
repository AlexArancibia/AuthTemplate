/**
 * Lista usuarios de la BD (schema anj) para revisar login.
 * Usa DATABASE_URL del .env (producción o local).
 *
 * Para ver la BD de PRODUCCIÓN: pon en .env la DATABASE_URL de prod
 * (ej. la que usa Vercel/hosting) y ejecuta desde una red que pueda
 * alcanzar ese servidor (VPN, misma VPC, o desde el propio servidor).
 *
 * Ejecutar desde la raíz del proyecto:
 *   pnpm run db:users
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Cargar .env si existe y DATABASE_URL no está definido (Node < 20 sin --env-file)
if (!process.env.DATABASE_URL && existsSync(resolve(process.cwd(), '.env'))) {
  const env = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
  env.split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      emailVerified: true,
      role: true,
      createdAt: true,
      password: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('\n--- Usuarios (schema anj) ---\n');
  if (users.length === 0) {
    console.log('No hay usuarios.');
    return;
  }
  for (const u of users) {
    console.log({
      email: u.email,
      emailVerified: u.emailVerified ? u.emailVerified.toISOString() : null,
      hasPassword: !!u.password,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    });
  }
  console.log('\nTotal:', users.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
