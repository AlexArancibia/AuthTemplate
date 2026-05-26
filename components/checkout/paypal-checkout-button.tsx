"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type PayPalCheckoutButtonProps = {
  amount: number;
  currency: string;
  description: string;
  email?: string;
  temporalOrderId?: string | null;
  disabled?: boolean;
  onSuccess: (details: PayPalPaymentResult) => Promise<void> | void;
};

export type PayPalPaymentResult = {
  orderID: string;
  status?: string;
  captureId?: string;
  captureStatus?: string;
  payerEmail?: string;
  amount?: {
    currency_code?: string;
    value?: string;
  };
  paypal?: unknown;
};

type PayPalActions = {
  order: {
    create: (order: unknown) => Promise<string>;
  };
};

type PayPalButtonsConfig = {
  style?: {
    layout?: "vertical" | "horizontal";
    color?: "gold" | "blue" | "silver" | "white" | "black";
    shape?: "rect" | "pill";
    label?: "paypal" | "checkout" | "buynow" | "pay";
  };
  createOrder: (_data: unknown, actions: PayPalActions) => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onError?: (error: unknown) => void;
  onCancel?: () => void;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: PayPalButtonsConfig) => {
        render: (container: HTMLElement) => Promise<void> | void;
      };
    };
  }
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim();
const PAYPAL_MODE_LABEL =
  process.env.NEXT_PUBLIC_PAYPAL_ENV === "sandbox" ? "PayPal Sandbox" : "PayPal";
const PAYPAL_BADGE_LABEL =
  process.env.NEXT_PUBLIC_PAYPAL_ENV === "sandbox" ? "Sandbox" : "Pago seguro";
const PAYPAL_CURRENCY = "USD";
const PAYPAL_SUPPORTED_CURRENCIES = new Set([PAYPAL_CURRENCY]);
const SCRIPT_TIMEOUT = 8000;

let loadedScriptUrl: string | null = null;
let isScriptLoading = false;

const waitForPayPal = (
  onReady: () => void,
  onTimeout: () => void
): (() => void) => {
  let attempts = 0;
  const maxAttempts = SCRIPT_TIMEOUT / 100;

  const interval = setInterval(() => {
    attempts += 1;
    if (window.paypal?.Buttons) {
      clearInterval(interval);
      onReady();
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);
      onTimeout();
    }
  }, 100);

  return () => clearInterval(interval);
};

const getCurrencyLabel = (currencyCode: string, value: number | string) => {
  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(value);

  if (!Number.isFinite(numericValue)) {
    return `${currencyCode} 0.00`;
  }

  if (currencyCode === "PEN") {
    return `S/ ${numericValue.toFixed(2)}`;
  }

  if (currencyCode === "USD") {
    return `US$ ${numericValue.toFixed(2)}`;
  }

  return `${currencyCode} ${numericValue.toFixed(2)}`;
};

export function PayPalCheckoutButton({
  amount,
  currency,
  description,
  email,
  temporalOrderId,
  disabled = false,
  onSuccess,
}: PayPalCheckoutButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceCurrency = currency?.toUpperCase() || "PEN";
  const paypalCurrency = PAYPAL_CURRENCY;
  const amountNumber = Number.isFinite(Number(amount))
    ? Math.max(Number(amount), 0)
    : 0;
  const hasSupportedCurrencyFlow = PAYPAL_SUPPORTED_CURRENCIES.has(sourceCurrency);
  const statusBadgeClassName = hasSupportedCurrencyFlow
    ? "bg-blue-100 text-blue-700"
    : "bg-amber-100 text-amber-700";
  const statusBadgeLabel = hasSupportedCurrencyFlow
    ? PAYPAL_BADGE_LABEL
    : `${sourceCurrency} no disponible`;
  const safeAmount = Number.isFinite(amountNumber)
    ? Math.max(amountNumber, 0).toFixed(2)
    : "0.00";
  const sourceAmountLabel = getCurrencyLabel(sourceCurrency, amountNumber);

  useEffect(() => {
    if (!PAYPAL_CLIENT_ID) {
      setError("PayPal Client ID no configurado.");
      return;
    }

    const scriptUrl = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      PAYPAL_CLIENT_ID
    )}&currency=${encodeURIComponent(
      paypalCurrency
    )}&intent=capture&components=buttons`;

    const paypalScripts = Array.from(
      document.querySelectorAll<HTMLScriptElement>('script[src*="paypal.com/sdk/js"]')
    );
    const hasDifferentPayPalScript = paypalScripts.some(
      (script) => script.src !== scriptUrl
    );

    if ((loadedScriptUrl && loadedScriptUrl !== scriptUrl) || hasDifferentPayPalScript) {
      window.paypal = undefined;
      paypalScripts.forEach((script) => script.remove());
      loadedScriptUrl = null;
      isScriptLoading = false;
      setIsLoaded(false);
    }

    if (window.paypal?.Buttons && loadedScriptUrl === scriptUrl) {
      setIsLoaded(true);
      setError(null);
      return;
    }

    if (isScriptLoading) {
      return waitForPayPal(
        () => {
          loadedScriptUrl = scriptUrl;
          setIsLoaded(true);
          setError(null);
        },
        () => setError(`No se pudo cargar ${PAYPAL_MODE_LABEL}.`)
      );
    }

    const existingScript = document.querySelector(
      `script[src="${scriptUrl}"]`
    );

    if (existingScript) {
      return waitForPayPal(
        () => {
          loadedScriptUrl = scriptUrl;
          setIsLoaded(true);
          setError(null);
        },
        () => setError(`No se pudo cargar ${PAYPAL_MODE_LABEL}.`)
      );
    }

    isScriptLoading = true;
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.onerror = () => {
      isScriptLoading = false;
      script.remove();
      setError(`No se pudo cargar ${PAYPAL_MODE_LABEL}.`);
    };

    const cleanup = waitForPayPal(
      () => {
        isScriptLoading = false;
        loadedScriptUrl = scriptUrl;
        setIsLoaded(true);
        setError(null);
      },
      () => {
        isScriptLoading = false;
        setError(`No se pudo cargar ${PAYPAL_MODE_LABEL}.`);
      }
    );

    document.body.appendChild(script);
    return cleanup;
  }, [paypalCurrency]);

  useEffect(() => {
    renderedRef.current = false;
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
  }, [
    safeAmount,
    paypalCurrency,
    sourceCurrency,
    hasSupportedCurrencyFlow,
    email,
    disabled,
    description,
    temporalOrderId,
  ]);

  useEffect(() => {
    if (
      !isLoaded ||
      !containerRef.current ||
      !window.paypal?.Buttons ||
      renderedRef.current ||
      disabled
    ) {
      return;
    }

    if (!hasSupportedCurrencyFlow) {
      return;
    }

    const container = containerRef.current;
    container.innerHTML = "";

    try {
      const buttons = window.paypal.Buttons({
        style: {
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "paypal",
        },
        createOrder: async (_data, actions) => {
          if (!email) {
            toast.error("Ingresa un correo electrónico antes de pagar.");
            throw new Error("Email is required.");
          }

          if (Number(safeAmount) <= 0) {
            toast.error("El monto de pago no es válido.");
            throw new Error("Invalid PayPal amount.");
          }

          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  value: safeAmount,
                  currency_code: paypalCurrency,
                },
                description: description || "Compra Sportt",
                custom_id: JSON.stringify({
                  email,
                  temporalOrderId,
                  sourceAmount: amountNumber.toFixed(2),
                  sourceCurrency,
                  paypalAmount: safeAmount,
                  paypalCurrency,
                }),
              },
            ],
          });
        },
        onApprove: async (data) => {
          setIsProcessing(true);
          setError(null);

          try {
            const response = await fetch("/api/payments/paypal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderID: data.orderID,
                amount: safeAmount,
                currency: paypalCurrency,
                sourceAmount: amountNumber.toFixed(2),
                sourceCurrency,
                email,
                temporalOrderId,
              }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
              throw new Error(
                result.error || "No se pudo confirmar el pago de PayPal."
              );
            }

            toast.success(`${PAYPAL_MODE_LABEL} confirmado.`);
            await onSuccess({
              orderID: data.orderID,
              status: result.status || "COMPLETED",
              captureId: result.captureId,
              captureStatus: result.captureStatus,
              payerEmail: result.payerEmail,
              amount: result.amount,
              paypal: result.paypal,
            });
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : `Error procesando ${PAYPAL_MODE_LABEL}.`;
            setError(message);
            toast.error(message);
          } finally {
            setIsProcessing(false);
          }
        },
        onError: (error) => {
          console.error("[PayPal] Button error:", error);
          setError(`Error al renderizar o procesar ${PAYPAL_MODE_LABEL}.`);
          toast.error(`Error al procesar ${PAYPAL_MODE_LABEL}.`);
        },
        onCancel: () => {
          setIsProcessing(false);
          toast.info("Pago PayPal cancelado.");
        },
      });

      buttons.render(container);
      renderedRef.current = true;
    } catch (error) {
      console.error("[PayPal] Render error:", error);
      setError(`No se pudo renderizar el botón ${PAYPAL_MODE_LABEL}.`);
    }
  }, [
    isLoaded,
    disabled,
    email,
    amountNumber,
    safeAmount,
    sourceCurrency,
    paypalCurrency,
    hasSupportedCurrencyFlow,
    description,
    temporalOrderId,
    onSuccess,
  ]);

  return (
    <Card className="w-full overflow-hidden border-blue-100 bg-white shadow-sm">
      <div className="border-b border-blue-50 bg-gradient-to-r from-blue-50 via-white to-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck
                className={`h-4 w-4 ${
                  hasSupportedCurrencyFlow ? "text-blue-600" : "text-amber-600"
                }`}
              />
              {hasSupportedCurrencyFlow
                ? "Confirmar pago con PayPal"
                : "PayPal no disponible para esta moneda"}
            </p>
            <p className="text-xs text-slate-500">
              {hasSupportedCurrencyFlow
                ? "Pago protegido por PayPal. Puedes pagar con tu cuenta o tarjeta habilitada por PayPal."
                : "PayPal solo puede procesar pagos en USD para esta integración."}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClassName}`}>
            {statusBadgeLabel}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total del pedido
            </p>
            <p className="text-xl font-semibold text-slate-950">
              {sourceAmountLabel}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {hasSupportedCurrencyFlow
                ? `${PAYPAL_MODE_LABEL} procesará el cargo en ${paypalCurrency}.`
                : "Para pagar con PayPal, cambia la moneda del checkout a USD."}
            </p>
          </div>
        </div>

        {hasSupportedCurrencyFlow ? (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Después de aprobar el pago, validaremos la transacción con PayPal
              y marcaremos tu orden como pago exitoso automáticamente.
            </p>
          </div>
        ) : (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">Cambia a USD para usar PayPal</p>
            <p className="mt-1 text-xs leading-relaxed">
              Puedes seleccionar USD en el selector de moneda de la tienda. Si
              prefieres mantener el pedido en {sourceCurrency}, elige otro
              método de pago disponible.
            </p>
          </div>
        )}

      {error && hasSupportedCurrencyFlow && (
        <div className="mb-3 rounded-md border border-amber-200 bg-white p-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {isProcessing && (
        <div className="mb-3 flex items-center rounded-md border border-blue-200 bg-white p-3 text-sm text-blue-700">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Confirmando pago con PayPal...
        </div>
      )}

      {!error && hasSupportedCurrencyFlow && !isLoaded && (
        <div className="flex items-center rounded-md border bg-white p-3 text-sm text-slate-600">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando {PAYPAL_MODE_LABEL}...
        </div>
      )}

      {disabled && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Completa tus datos de contacto, envío y método de envío para activar
          los botones de PayPal.
        </div>
      )}

      <div ref={containerRef} className="w-full" />
      </div>
    </Card>
  );
}
