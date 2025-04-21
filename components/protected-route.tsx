"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function ProtectedRoute({
  children,
  redirectTo = "/auth/signin",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  // This ensures we only run the redirect on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only check auth after initial loading is complete and we're on the client
    if (!isLoading && !user && isClient) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this page.",
        variant: "destructive",
      });

      // Store the current path to redirect back after login
      const currentPath = window.location.pathname;
      router.push(
        `${redirectTo}?redirectedFrom=${encodeURIComponent(currentPath)}`
      );
    }
  }, [user, isLoading, router, redirectTo, toast, isClient]);

  // Show loading state while checking auth
  if (isLoading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  // Only render children if user is authenticated
  return user ? <>{children}</> : null;
}
