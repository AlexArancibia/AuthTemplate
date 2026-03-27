import apiClient from "@/lib/axiosConfig";
import { logger } from "@/lib/logger";
import { pickCulqiWebProvider } from "@/lib/culqi-web-provider";

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;

const storePath = (() => {
  if (!STORE_ID) {
    throw new Error("NEXT_PUBLIC_STORE_ID no está definido.");
  }
  return STORE_ID.replace(/^store\//, "");
})();

const extractProviders = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.providers)) return payload.providers;
  throw new Error("Formato inesperado al leer los payment providers.");
};

const fetchCulquiProvider = async () => {
  const { data } = await apiClient.get(`/payment-providers/${storePath}`);
  return pickCulqiWebProvider(extractProviders(data));
};

async function fetchCulquiProviderWithCredentials(): Promise<any> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
  const secret = process.env.SERVER_INTERNAL_KEY;
  if (!backendUrl || !secret) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_ENDPOINT y SERVER_INTERNAL_KEY deben estar definidos para obtener secret_key."
    );
  }
  const res = await fetch(
    `${backendUrl}/payment-providers/${storePath}?status=all`,
    {
      headers: { "X-Server-Secret": secret },
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Backend payment-providers: ${res.status} ${text?.slice(0, 200) || ""}`
    );
  }
  const data = await res.json();
  return pickCulqiWebProvider(extractProviders(data));
}

export async function getPublicKey() {
  try {
    const culquiProvider = await fetchCulquiProvider();
    const publicKey = culquiProvider.credentials?.public_key;

    if (!publicKey) {
      throw new Error("La Public Key de Culqi no está disponible.");
    }

    return publicKey;
  } catch (error) {
    logger.error({ err: error }, "Error al obtener la Public Key de Culqi");
    throw new Error("No se pudo obtener la Public Key de Culqi");
  }
}

export async function getSecretKey() {
  try {
    const culquiProvider = await fetchCulquiProviderWithCredentials();
    const secretKey = culquiProvider.credentials?.secret_key;

    if (!secretKey) {
      throw new Error("La Secret Key de Culqi no está disponible.");
    }

    return secretKey;
  } catch (error) {
    logger.error({ err: error }, "Error al obtener la secretKey de Culqi");
    throw new Error("No se pudo obtener la secretKey de Culqi");
  }
}
