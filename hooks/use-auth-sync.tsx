"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export function useAuthSync() {
  const { user, session, isLoading } = useAuth();
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    // This effect ensures the client-side auth state is synchronized with the server
    const syncAuth = async () => {
      try {
        const {
          data: { session: serverSession },
        } = await supabase.auth.getSession();

        // If there's a mismatch between client and server session, refresh the page
        // This ensures the middleware and client-side auth are in sync
        const clientHasSession = !!session;
        const serverHasSession = !!serverSession;

        if (clientHasSession !== serverHasSession && !isLoading) {
          console.log("Auth state mismatch detected, refreshing...");
          router.refresh();
        }
      } catch (error) {
        console.error("Error syncing auth state:", error);
      }
    };

    syncAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // When auth state changes, refresh the router to ensure middleware picks up the change
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, session, isLoading]);

  return { user, isLoading };
}
