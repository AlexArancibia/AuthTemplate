import apiClient from "@/lib/axiosConfig";

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
    const providers = extractProviders(data);
    const culquiProvider = providers.find(
        (provider: any) => provider.name === "Culqui"
    );

    if (!culquiProvider) {
        throw new Error("Proveedor de pago 'Culqui' no encontrado.");
    }

    return culquiProvider;
};

export async function getPublicKey() {
    try {
        const culquiProvider = await fetchCulquiProvider();
        const publicKey = culquiProvider.credentials?.public_key;

        if (!publicKey) {
            throw new Error("La Public Key de Culqi no está disponible.");
        }

        return publicKey;
    } catch (error) {
        console.error("❌ Error al obtener la Public Key de Culqi:", error);
        throw new Error("No se pudo obtener la Public Key de Culqi");
    }
}

export async function getSecretKey() {
    try {
        const culquiProvider = await fetchCulquiProvider();
        const secretKey = culquiProvider.credentials?.secret_key;

        if (!secretKey) {
            throw new Error("La Public Key de Culqi no está disponible.");
        }

        return secretKey;
    } catch (error) {
        console.error("❌ Error al obtener la secretKey de Culqi:", error);
        throw new Error("No se pudo obtener la secretKey de Culqi");
    }
}