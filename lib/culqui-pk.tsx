import apiClient from "@/lib/axiosConfig";

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;

export async function getPublicKey() {
    try {
        const response = await apiClient.get(`/payment-providers/store/${STORE_ID}`);

        // Buscar el método "Culqui" en la lista
        const culquiProvider = response.data.find(
            (provider: any) => provider.name === "Culqui"
        );

        if (!culquiProvider) {
            throw new Error("Proveedor de pago 'Culqui' no encontrado.");
        }

        const publicKey = culquiProvider.credentials.public_key;

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
        const response = await apiClient.get(`/payment-providers/store/${STORE_ID}`);

        // Buscar el método "Culqui" en la lista
        const culquiProvider = response.data.find(
            (provider: any) => provider.name === "Culqui"
        );

        if (!culquiProvider) {
            throw new Error("Proveedor de pago 'Culqui' no encontrado.");
        }

        const secretKey = culquiProvider.credentials.secret_key;

        if (!secretKey) {
            throw new Error("La Public Key de Culqi no está disponible.");
        }

        return secretKey;
    } catch (error) {
        console.error("❌ Error al obtener la secretKey de Culqi:", error);
        throw new Error("No se pudo obtener la secretKey de Culqi");
    }
}