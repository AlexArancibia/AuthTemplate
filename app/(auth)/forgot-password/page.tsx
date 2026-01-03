import ForgotPasswordForm from "@/components/forgot-password-form";
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Recuperar contraseña | CLEFAST",
  description: "Restablece el acceso a tu cuenta CLEFAST de forma segura.",
  robots: {
    index: false,
    follow: false,
  },
}

const ForgotPasswordPage = () => {
  return (
    <div className="w-full">
      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPasswordPage;
