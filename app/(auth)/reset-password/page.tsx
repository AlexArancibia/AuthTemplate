import FormResetPassword from "@/components/form-reset-password";

interface ResetPasswordPageProps {
  searchParams: {
    token?: string;
    // Errores específicos del reset de contraseña
    error?: "invalid_token" | "expired_token" | "password_too_short" | "server_error";
    // Mensaje de éxito
    success?: string;
  };
}

const ResetPasswordPage = ({ searchParams }: ResetPasswordPageProps) => {
  const token = searchParams.token;
  const error = searchParams.error;
  const success = searchParams.success;

  let topMessage: string | null = null;
  let messageType: "success" | "error" | "info" = "info";

  // Manejo de errores
  if (error === "invalid_token") {
    topMessage = "El enlace para resetear la contraseña es inválido o ya ha sido utilizado.";
    messageType = "error";
  } else if (error === "expired_token") {
    topMessage = "El enlace para resetear la contraseña ha expirado. Por favor, solicita uno nuevo.";
    messageType = "error";
  } else if (error === "password_too_short") {
    topMessage = "La contraseña debe tener al menos 6 caracteres.";
    messageType = "error";
  } else if (error === "server_error") {
    topMessage = "Ocurrió un error interno. Por favor, intenta de nuevo más tarde.";
    messageType = "error";
  }

  // Manejo de éxito
  if (success) {
    topMessage = success;
    messageType = "success";
  }

  // Si no hay token, mostrar mensaje informativo
  if (!token && !error) {
    topMessage = "Enlace de reseteo de contraseña no válido. Por favor, solicita uno nuevo.";
    messageType = "error";
  }

  return (
    <FormResetPassword
      token={token}
      topMessage={topMessage}
      messageType={messageType}
    />
  );
};

export default ResetPasswordPage;