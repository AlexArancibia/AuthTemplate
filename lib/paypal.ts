type PayPalMode = "sandbox" | "live";

type PayPalCredentials = {
  clientId: string;
  clientSecret: string;
  mode: PayPalMode;
};

type PaymentProviderResponse = {
  data?: PaymentProviderRecord[];
};

type PaymentProviderRecord = {
  id: string;
  name: string;
  type?: string;
  isActive?: boolean;
  testMode?: boolean | null;
  credentials?: {
    clientId?: string;
    clientSecret?: string;
    client_id?: string;
    client_secret?: string;
    mode?: string;
  } | null;
};

const normalizeProviderList = (
  payload: PaymentProviderRecord[] | PaymentProviderResponse
): PaymentProviderRecord[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload.data) ? payload.data : [];
};

async function getPayPalProviderCredentials() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const storeId = process.env.NEXT_PUBLIC_STORE_ID;

  if (!backendUrl || !apiKey || !storeId) {
    return null;
  }

  try {
    const response = await fetch(
      `${backendUrl.replace(/\/$/, "")}/payment-providers/${storeId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const providers = normalizeProviderList(await response.json());
    const paypalProvider = providers.find((provider) => {
      const providerName = provider.name.toLowerCase();
      return (
        provider.isActive !== false &&
        (provider.type === "PAYPAL" || providerName.includes("paypal"))
      );
    });

    return paypalProvider?.credentials ?? null;
  } catch (error) {
    console.warn("[PayPal] Could not fetch provider credentials:", error);
    return null;
  }
}

export async function getPayPalCredentials(): Promise<PayPalCredentials> {
  const providerCredentials = await getPayPalProviderCredentials();

  const clientId =
    process.env.PAYPAL_CLIENT_ID ??
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ??
    providerCredentials?.clientId ??
    providerCredentials?.client_id;

  const clientSecret =
    process.env.PAYPAL_CLIENT_SECRET ??
    providerCredentials?.clientSecret ??
    providerCredentials?.client_secret;

  const rawMode =
    process.env.PAYPAL_ENV ?? providerCredentials?.mode ?? "sandbox";
  const mode: PayPalMode = rawMode === "live" ? "live" : "sandbox";

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not configured.");
  }

  return {
    clientId,
    clientSecret,
    mode,
  };
}

export function getPayPalApiBase(mode: PayPalMode) {
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}
