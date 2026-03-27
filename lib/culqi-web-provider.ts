const ERR_CONFIGURE =
  "Proveedor Culqi Web no encontrado. Define NEXT_PUBLIC_CULQI_WEB_PROVIDER_ID.";

export type CulqiProviderFromApi = {
  id: string;
  credentials?: { public_key?: string; secret_key?: string } | null;
};

/** ID del proveedor Culqi Web en la API (mismo que en el panel). */
export function getCulqiWebProviderId(): string {
  return (process.env.NEXT_PUBLIC_CULQI_WEB_PROVIDER_ID ?? "").trim();
}

/** Checkout: ¿el método elegido es el Culqi Web configurado? */
export function isCulqiWebProvider(
  provider: { id: string } | null | undefined
): boolean {
  const id = getCulqiWebProviderId();
  return Boolean(id && provider?.id === id);
}

/** Resuelve credenciales Culqi desde la lista de proveedores del backend. */
export function pickCulqiWebProvider(
  providers: CulqiProviderFromApi[]
): CulqiProviderFromApi {
  const configured = getCulqiWebProviderId();
  const found = configured
    ? providers.find((p) => p.id === configured)
    : undefined;
  if (!found) {
    throw new Error(ERR_CONFIGURE);
  }
  return found;
}
