"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ButtonSocialProps {
  children: React.ReactNode;
  provider: string;
  /** URL a la que redirigir después del login/registro OAuth exitoso (solo en caso de éxito) */
  callbackUrl?: string;
}

const ButtonSocial = ({ children, provider, callbackUrl = "/" }: ButtonSocialProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    toast.loading("Conectando con Google...", { id: "oauth" });
    try {
      await signIn(provider, {
        callbackUrl: `${callbackUrl}${callbackUrl.includes("?") ? "&" : "?"}auth=success`,
        redirect: true,
      });
    } finally {
      setIsLoading(false);
      toast.dismiss("oauth");
    }
  };

  return (
    <Button
      type="button"
      className="w-full h-10 bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 cursor-pointer"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Conectando...
        </>
      ) : (
        children
      )}
    </Button>
  );
};
export default ButtonSocial;
