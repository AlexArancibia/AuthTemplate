// lib/culqi/culqiScript.ts
import { getPublicKey } from "@/lib/culqui-pk";

export async function loadCulqiScript(): Promise<void> {
    if (window.Culqi) return;

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.culqi.com/js/v4";
        script.async = true;

        script.onload = () => resolve();
        script.onerror = () => reject(new Error("No se pudo cargar el script de Culqi"));

        document.body.appendChild(script);
    });
}

export async function openCulqiCheckout(amount: number, description: string) {
    const publicKey = await getPublicKey();
    
    if (!publicKey) {
        throw new Error("La Public Key de Culqi no se pudo obtener.");
    }

    window.Culqi.publicKey = publicKey;

    window.Culqi.options({
        style: {
            logo: "https://pub-a15fad1bb05e4ecbb92c9d83b643a721.r2.dev/Clefast/Group%202%20(8).png",
        },
    });

    window.Culqi.settings({
        title: "Clefast",
        currency: "PEN",
        description,
        amount,
    });

    window.Culqi.open();
}

export function setCulqiCallback(
  onSuccess: (token: string) => void,
  onError: (error: any) => void
) {
  window.culqi = () => {
    if (window.Culqi.token) {
      const token = window.Culqi.token.id;

      window.Culqi.close();

      onSuccess(token);
    } else {
      console.error("❌ Error en Culqi:", window.Culqi.error);

      // 👇 Cierra el checkout en caso de error también
      window.Culqi.close();

      onError(window.Culqi.error);
    }
  };
}
