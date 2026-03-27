"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  fallbackHref: string;
  className?: string;
  children?: ReactNode;
}

export default function BackButton({ fallbackHref, className, children }: BackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`appearance-none p-0 m-0 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
