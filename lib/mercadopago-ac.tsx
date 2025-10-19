
import apiClient from "@/lib/axiosConfig";

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;
let mpCache: { accessToken?: string; publicKey?: string } | null = null;

async function fetchMpCredentials() {
    if (mpCache) return mpCache;
    try {
        const response = await apiClient.get(`/payment-providers/store/${STORE_ID}`);
        const mpProvider = Array.isArray(response.data?.data)
            ? response.data.data.find((provider: any) => (provider.name || '').toLowerCase() === "mercadopago")
            : undefined;
        mpCache = {
            accessToken: mpProvider?.credentials?.accessToken,
            publicKey: mpProvider?.credentials?.publicKey,
        };

    } catch (error) {
        console.warn("⚠️ No se pudo obtener credenciales de MercadoPago desde el CMS (se intentará fallback a .env):", error);
        mpCache = {};
    }
    return mpCache;
}

export async function getAccessToken() {
    const creds = await fetchMpCredentials();
    let accessToken = creds.accessToken;
    if (!accessToken) {
        accessToken = process.env.MP_ACCESS_TOKEN;
    }
    if (accessToken) return accessToken;
    throw new Error("No se pudo obtener la accessToken de MercadoPago ni existe MP_ACCESS_TOKEN en las variables de entorno.");
}

export async function getPublicKey() {
    const creds = await fetchMpCredentials();
    let publicKey = creds.publicKey;
    if (!publicKey) {
        publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    }
    if (publicKey) return publicKey;
    throw new Error("No se pudo obtener la publicKey de MercadoPago ni existe NEXT_PUBLIC_MP_PUBLIC_KEY en las variables de entorno.");
}
