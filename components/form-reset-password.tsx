"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/actions/reset-password-action";
import { Eye, EyeOff, Lock, CheckCircle, XCircle, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface FormResetPasswordProps {
  token?: string;
  topMessage?: string | null;
  messageType?: "success" | "error" | "info";
}

const FormResetPassword = ({ 
  token, 
  topMessage, 
  messageType = "info" 
}: FormResetPasswordProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validaciones del lado cliente
    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!token) {
      setError("Token de reseteo no válido.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await resetPassword(token, password);
        
        if (result.error) {
          setError(result.error);
        } else if (result.success) {
          setSuccess(result.success);
          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            router.push("/login?passwordReset=true");
          }, 2000);
        }
      } catch (err) {
        setError("Error inesperado. Por favor, intenta de nuevo.");
      }
    });
  };

  // Si no hay token válido, mostrar mensaje de error
  if (!token) {
    return (
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image src="/logos/logo.png" alt="Scentra" width={120} height={20} className="h-5 w-auto" priority />
        </div>
        <div className="bg-background border border-border p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-600" />
            </div>
            <h1 className="font-display text-2xl text-foreground mb-2">
              Enlace no válido
            </h1>
            <p className="text-muted-foreground text-sm">
              El enlace para resetear la contraseña no es válido o ha expirado.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/forgot-password"
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium py-3 px-4 transition-colors text-center block"
            >
              Solicitar nuevo enlace
            </Link>
            <Link
              href="/login"
              className="w-full bg-secondary hover:bg-muted text-foreground font-medium py-3 px-4 transition-colors text-center block"
            >
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-center mb-8">
        <Image src="/logos/logo.png" alt="Scentra" width={120} height={20} className="h-5 w-auto" priority />
      </div>
      <div className="bg-background border border-border p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-brand flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-brand-foreground" />
          </div>
          <h1 className="font-display text-2xl text-foreground mb-2">
            Nueva contraseña
          </h1>
          <p className="text-muted-foreground text-sm">
            Ingresa tu nueva contraseña para completar el reseteo
          </p>
        </div>

        {/* Top Message */}
        {topMessage && (
          <div className={`mb-6 p-4 flex items-start space-x-3 ${
            messageType === "success"
              ? "bg-green-50 border border-green-200"
              : messageType === "error"
              ? "bg-red-50 border border-red-200"
              : "bg-muted border border-border"
          }`}>
            {messageType === "success" && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />}
            {messageType === "error" && <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />}
            {messageType === "info" && <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />}
            <p className={`text-sm ${
              messageType === "success"
                ? "text-green-800"
                : messageType === "error"
                ? "text-red-800"
                : "text-foreground"
            }`}>
              {topMessage}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nueva Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-brand transition-colors bg-background"
                placeholder="Mínimo 6 caracteres"
                required
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isPending}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-brand transition-colors bg-background"
                placeholder="Repite tu contraseña"
                required
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isPending}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 p-4 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-800 font-medium">{success}</p>
                <p className="text-xs text-green-700 mt-1">Redirigiendo al login...</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending || !password || !confirmPassword}
            className="w-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed font-medium py-3 px-4 transition-colors"
          >
            {isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                <span>Reseteando...</span>
              </div>
            ) : (
              "Resetear contraseña"
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-brand hover:text-brand-dark font-medium text-sm transition-colors"
          >
            ← Volver al login
          </Link>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-secondary">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Recomendaciones de seguridad:</p>
              <ul className="space-y-1">
                <li>• Usa al menos 8 caracteres</li>
                <li>• Combina letras, números y símbolos</li>
                <li>• No uses información personal</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormResetPassword;