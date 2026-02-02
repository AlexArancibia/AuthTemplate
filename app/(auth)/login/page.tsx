import FormLogin from "@/components/form-login";

/** Mensajes amigables para cada tipo de error de NextAuth */
const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: "Esta cuenta ya existe con otro método. Inicia sesión con el mismo método que usaste originalmente (email o Google).",
  OAuthCreateAccount: "No se pudo crear la cuenta. Intenta de nuevo o regístrate con email.",
  OAuthCallback: "Error al conectar con el proveedor. Intenta de nuevo.",
  OAuthCallbackError: "Error en el proceso de autenticación. Verifica tu conexión e intenta de nuevo.",
  OAuthGetAccessTokenError: "Error al obtener acceso. Revisa la configuración de Google.",
  OAuthGetProfileError: "No se pudo obtener tu información. Intenta de nuevo.",
  CallbackRouteError: "Error al iniciar sesión. Verifica tus credenciales e intenta de nuevo.",
  CredentialsSignin: "Correo o contraseña incorrectos. Verifica tus datos.",
  AccessDenied: "Acceso denegado. Contacta al administrador si el problema persiste.",
  SessionRequired: "Tu sesión ha expirado. Inicia sesión de nuevo.",
  Configuration: "Error de configuración. Si estás en local, verifica que NEXTAUTH_URL sea http://localhost:3000. En producción, debe coincidir con tu dominio.",
  Default: "Ha ocurrido un error al iniciar sesión. Intenta de nuevo.",
};

function getErrorMessage(errorCode: string | undefined): string | null {
  if (!errorCode) return null;
  return ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default;
}

interface LoginPageProps {
  searchParams: Promise<{
    verified?: string;
    error?: string;
    passwordReset?: string;
    tokenError?: "invalid_token" | "expired_token";
    message?: string;
  }>;
}

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const resolvedSearchParams = await searchParams;
  const isVerified = resolvedSearchParams.verified === "true";
  const passwordResetSuccess = resolvedSearchParams.passwordReset === "true";
  const tokenError = resolvedSearchParams.tokenError;
  const authError = resolvedSearchParams.error;
  const customMessage = resolvedSearchParams.message;

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
  } else if (authError) {
    bottomMessage = customMessage ?? getErrorMessage(authError);
    messageType = "error";
  }

  return (
    <FormLogin
      isVerified={isVerified}
      bottomMessage={bottomMessage}
      messageType={messageType}
    />
  );
};

export default LoginPage;