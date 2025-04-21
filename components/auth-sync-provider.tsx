"use client";

import type React from "react";
import { useAuthSync } from "@/hooks/use-auth-sync";

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  // This component doesn't render anything, it just uses the hook
  // to ensure auth state is synchronized
  useAuthSync();

  return <>{children}</>;
}
