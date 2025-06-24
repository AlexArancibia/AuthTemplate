import FormLogin from "@/components/form-login";

interface LoginPageProps {
  searchParams: {
    verified?: string;
    error?: string;
    passwordReset?: string; // Para mensaje de contraseña reseteada
    // Errores de las páginas de forgot-password y reset-password
    tokenError?: "invalid_token" | "expired_token";
  };
}

// No es necesario que sea async si accedemos a searchParams directamente
const LoginPage = ({ searchParams }: LoginPageProps) => {
  const isVerified = searchParams.verified === "true";
  const OAuthAccountNotLinked = searchParams.error === "OAuthAccountNotLinked";
  const passwordResetSuccess = searchParams.passwordReset === "true";
  const tokenError = searchParams.tokenError; // Puede ser 'invalid_token' o 'expired_token'

  let bottomMessage: string | null = null;
  let messageType: "success" | "error" = "success";

  if (passwordResetSuccess) {
    bottomMessage = "¡Tu contraseña ha sido reseteada exitosamente! Ya puedes iniciar sesión.";
    messageType = "success";
  } else if (tokenError === "invalid_token") {
    bottomMessage = "El enlace para resetear la contraseña es inválido o ya ha sido utilizado. Por favor, solicita uno nuevo.";
    messageType = "error";
  } else if (tokenError === "expired_token") {
    bottomMessage = "El enlace para resetear la contraseña ha expirado. Por favor, solicita uno nuevo.";
    messageType = "error";
  }


  return (
    <FormLogin
      isVerified={isVerified}
      OAuthAccountNotLinked={OAuthAccountNotLinked}
      bottomMessage={bottomMessage}
      messageType={messageType}
    />
  );
};

export default LoginPage;
