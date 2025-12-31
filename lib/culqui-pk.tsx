import { useMainStore } from "@/stores/mainStore";
import type { PaymentProvider } from "@/types/payments";

interface CulquiCredentials {
  public_key?: string;
  secret_key?: string;
}

async function fetchCulquiProvider(): Promise<PaymentProvider | null> {
  try {
    // Usar el mainStore para obtener los payment providers
    const { fetchPaymentProviders } = useMainStore.getState();
    const providers: PaymentProvider[] = await fetchPaymentProviders();

    // Buscar el proveedor de Culqui
    const culquiProvider = providers.find(
      (provider: PaymentProvider) => provider.name === "Culqui"
    );

    return culquiProvider || null;
  } catch (error) {
    console.error("❌ Error al obtener el proveedor de Culqui:", error);
    return null;
  }
}

export async function getPublicKey(): Promise<string> {
  try {
    const culquiProvider = await fetchCulquiProvider();

    if (!culquiProvider) {
      throw new Error("Proveedor de pago 'Culqui' no encontrado.");
    }

    if (!culquiProvider.credentials) {
      throw new Error("Las credenciales de Culqui no están disponibles.");
    }

    const credentials = culquiProvider.credentials as CulquiCredentials;
    const publicKey = credentials.public_key;

    if (!publicKey) {
      throw new Error("La Public Key de Culqi no está disponible.");
    }

    return publicKey;
  } catch (error) {
    console.error("❌ Error al obtener la Public Key de Culqi:", error);
    throw new Error("No se pudo obtener la Public Key de Culqi");
  }
}

export async function getSecretKey(): Promise<string> {
  try {
    const culquiProvider = await fetchCulquiProvider();

    if (!culquiProvider) {
      throw new Error("Proveedor de pago 'Culqui' no encontrado.");
    }

    if (!culquiProvider.credentials) {
      throw new Error("Las credenciales de Culqui no están disponibles.");
    }

    const credentials = culquiProvider.credentials as CulquiCredentials;
    const secretKey = credentials.secret_key;

    if (!secretKey) {
      throw new Error("La Secret Key de Culqi no está disponible.");
    }

    return secretKey;
  } catch (error) {
    console.error("❌ Error al obtener la secretKey de Culqi:", error);
    throw new Error("No se pudo obtener la secretKey de Culqi");
  }
}