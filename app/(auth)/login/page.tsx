import FormLogin from "@/components/form-login";

interface LoginPageProps {
  searchParams: Promise<{
    verified?: string;
    error?: string;
    passwordReset?: string;
    tokenError?: "invalid_token" | "expired_token";
  }>;
}

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const resolvedSearchParams = await searchParams;
  const isVerified = resolvedSearchParams.verified === "true";
  const OAuthAccountNotLinked = resolvedSearchParams.error === "OAuthAccountNotLinked";
  const passwordResetSuccess = resolvedSearchParams.passwordReset === "true";
  const tokenError = resolvedSearchParams.tokenError;

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