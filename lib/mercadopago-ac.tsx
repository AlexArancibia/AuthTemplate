import { useMainStore } from "@/stores/mainStore";
import type { PaymentProvider } from "@/types/payments";

interface MercadoPagoCredentials {
  accessToken?: string;
  publicKey?: string;
}

interface MercadoPagoCache {
  accessToken?: string;
  publicKey?: string;
}

let mpCache: MercadoPagoCache | null = null;

async function fetchMpCredentials(): Promise<MercadoPagoCache> {
  if (mpCache) return mpCache;

  try {
    // Usar el mainStore para obtener los payment providers
    const { fetchPaymentProviders } = useMainStore.getState();
    const providers: PaymentProvider[] = await fetchPaymentProviders();

    // Buscar el proveedor de MercadoPago
    const mpProvider = providers.find(
      (provider: PaymentProvider) =>
        provider.name.toLowerCase() === "mercadopago"
    );

    if (mpProvider?.credentials) {
      const credentials = mpProvider.credentials as MercadoPagoCredentials;
      mpCache = {
        accessToken: credentials.accessToken,
        publicKey: credentials.publicKey,
      };
    } else {
      mpCache = {};
    }
  } catch (error) {
    console.warn(
      "⚠️ No se pudo obtener credenciales de MercadoPago desde el CMS (se intentará fallback a .env):",
      error
    );
    mpCache = {};
  }

  return mpCache;
}

export async function getAccessToken(): Promise<string> {
  const creds = await fetchMpCredentials();
  let accessToken = creds.accessToken;

  if (!accessToken) {
    accessToken = process.env.MP_ACCESS_TOKEN;
  }

  if (accessToken) return accessToken;

  throw new Error(
    "No se pudo obtener la accessToken de MercadoPago ni existe MP_ACCESS_TOKEN en las variables de entorno."
  );
}

export async function getPublicKey(): Promise<string> {
  const creds = await fetchMpCredentials();
  let publicKey = creds.publicKey;

  if (!publicKey) {
    publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
  }

  if (publicKey) return publicKey;

  throw new Error(
    "No se pudo obtener la publicKey de MercadoPago ni existe NEXT_PUBLIC_MP_PUBLIC_KEY en las variables de entorno."
  );
}
