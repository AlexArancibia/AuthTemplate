"use client";

import { WhatsAppButton } from "@/components/WhatsappButton";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="min-h-screen w-full">{children}</main>
      <WhatsAppButton />
    </>
  );
}
