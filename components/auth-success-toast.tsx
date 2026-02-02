"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Muestra un toast de bienvenida cuando el usuario regresa de OAuth exitoso (?auth=success).
 * Limpia el parámetro de la URL para que no aparezca en recargas.
 */
export function AuthSuccessToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const authSuccess = searchParams.get("auth") === "success";
    if (authSuccess) {
      toast.success("¡Bienvenido!", {
        description: "Has iniciado sesión correctamente.",
      });
      // Limpiar el parámetro de la URL sin recargar
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState({}, "", url.pathname + (url.search || ""));
    }
  }, [searchParams]);

  return null;
}
