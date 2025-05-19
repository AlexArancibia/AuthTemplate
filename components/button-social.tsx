"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

interface ButtonSocialProps {
  children: React.ReactNode;
  provider: string;
}

const ButtonSocial = ({ children, provider }: ButtonSocialProps) => {
  const handleClick = async () => {
    await signIn(provider);
  };

  return <Button className="w-full h-10 bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 cursor-pointer" onClick={handleClick}>{children}</Button>;
};
export default ButtonSocial;
