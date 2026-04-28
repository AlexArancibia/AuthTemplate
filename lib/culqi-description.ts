export type CulqiDescriptionInput = {
  orderId?: string | null;
  total?: number | null;
  itemCount?: number | null;
  itemsPreview?: string | null;
};

const MIN_LEN = 50;
const MAX_LEN = 80;

function oneLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function formatCulqiDescription(input: CulqiDescriptionInput) {
  const orderId = input.orderId?.trim() ? input.orderId.trim() : "web";
  const itemCount = typeof input.itemCount === "number" && Number.isFinite(input.itemCount) && input.itemCount > 0
    ? Math.floor(input.itemCount)
    : undefined;
  const total = typeof input.total === "number" && Number.isFinite(input.total) && input.total >= 0
    ? input.total
    : undefined;

  const preview = input.itemsPreview ? oneLine(input.itemsPreview) : "";

  const parts = [
    "ANJ SPORTS",
    `Pedido ${orderId}`,
    itemCount ? `${itemCount} item(s)` : null,
    typeof total === "number" ? `S/${total.toFixed(2)}` : null,
    preview ? preview : null,
  ].filter(Boolean) as string[];

  let description = oneLine(parts.join(" - "));

  // Enforce provider constraints (observed in production errors).
  if (description.length > MAX_LEN) {
    description = description.slice(0, MAX_LEN).trimEnd();
  }
  if (description.length < MIN_LEN) {
    // Pad with meaningful suffixes; avoid space-padding that could be trimmed.
    const suffixes = [" - Compra online", " - Pago con tarjeta", " - ANJ SPORTS"];
    for (const s of suffixes) {
      if (description.length >= MIN_LEN) break;
      description = oneLine(description + s);
      if (description.length > MAX_LEN) {
        description = description.slice(0, MAX_LEN).trimEnd();
        break;
      }
    }
  }

  if (description.length < MIN_LEN) {
    description = "ANJ SPORTS - Compra online - Pago con tarjeta - Pedido web";
  }
  if (description.length > MAX_LEN) {
    description = description.slice(0, MAX_LEN).trimEnd();
  }
  return description;
}

