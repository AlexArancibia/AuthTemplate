"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/actions/reset-password-action";
import { Eye, EyeOff, Lock, CheckCircle, XCircle, Info } from "lucide-react";
import Link from "next/link";

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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Enlace No Válido
              </h1>
              <p className="text-gray-600">
                El enlace para resetear la contraseña no es válido o ha expirado.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link
                href="/forgot-password"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-center block"
              >
                Solicitar Nuevo Enlace
              </Link>
              <Link
                href="/login"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 text-center block"
              >
                Volver al Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Nueva Contraseña
            </h1>
            <p className="text-gray-600">
              Ingresa tu nueva contraseña para completar el reseteo
            </p>
          </div>

          {/* Top Message */}
          {topMessage && (
            <div className={`mb-6 p-4 rounded-xl flex items-start space-x-3 ${
              messageType === "success" 
                ? "bg-green-50 border border-green-200" 
                : messageType === "error"
                ? "bg-red-50 border border-red-200"
                : "bg-blue-50 border border-blue-200"
            }`}>
              {messageType === "success" && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />}
              {messageType === "error" && <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />}
              {messageType === "info" && <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />}
              <p className={`text-sm ${
                messageType === "success" 
                  ? "text-green-800" 
                  : messageType === "error"
                  ? "text-red-800"
                  : "text-blue-800"
              }`}>
                {topMessage}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nueva Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  disabled={isPending}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-sm  focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Repite tu contraseña"
                  required
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  disabled={isPending}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
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
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Reseteando...</span>
                </div>
              ) : (
                "Resetear Contraseña"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              href="/login"
              className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors duration-200"
            >
              ← Volver al Login
            </Link>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">Recomendaciones de seguridad:</p>
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
    </div>
  );
};

export default FormResetPassword;