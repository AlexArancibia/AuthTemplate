import FormRegister from "@/components/form-register";
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Registro de usuario | CLEFAST",
  description: "Registro de usuarios CLEFAST para acceder a la plataforma.",
  robots: {
    index: false,
    follow: false,
  },
}

const RegisterPage = () => {
  return <FormRegister />;
};
export default RegisterPage;
