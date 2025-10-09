"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

interface ButtonSocialProps {
  children: React.ReactNode;
  provider: string;
  className?: string;
}

const ButtonSocial = ({ children, provider, className }: ButtonSocialProps) => {
  const handleClick = async () => {
    await signIn(provider);
  };

  return (
    <Button 
      className={cn(
        "w-full h-10 bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 cursor-pointer",
        className
      )} 
      onClick={handleClick}
    >
      {children}
    </Button>
  );
};
export default ButtonSocial;
