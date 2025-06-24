import ResetPasswordForm from "@/components/reset-password-form";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

interface ResetPasswordPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const ResetPasswordPage = async ({ searchParams }: ResetPasswordPageProps) => {
  const token = searchParams.token as string | undefined;

  if (!token) {
    // Podríamos redirigir a una página de error o a forgot-password con un mensaje
    console.warn("Token no encontrado en los parámetros de búsqueda.");
    redirect("/forgot-password?error=invalid_token");
  }

  // Validar el token en el servidor
  const passwordResetToken = await db.passwordResetToken.findUnique({
    where: { token },
  });

  if (!passwordResetToken) {
    console.warn(`Token de reseteo no encontrado en DB: ${token}`);
    redirect("/forgot-password?error=invalid_token");
  }

  if (passwordResetToken.expires < new Date()) {
    console.warn(`Token de reseteo expirado: ${token}`);
    // Opcionalmente, eliminar el token expirado de la DB
    await db.passwordResetToken.delete({ where: { token } }).catch(console.error);
    redirect("/forgot-password?error=expired_token");
  }

  // Si el token es válido y no ha expirado, mostrar el formulario
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <ResetPasswordForm token={token} />
    </div>
  );
};

export default ResetPasswordPage;
