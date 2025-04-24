"use client";

import { useState, useEffect } from "react";
import BlackjackGame from "@/components/enhanced-game-board";
import { MobileNav } from "@/components/mobile-nav";
import { OrientationHandler } from "@/components/orientation-handler";
import { useSound } from "@/lib/sounds";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

export default function PlayPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { playMusic, stopMusic, isMusicMuted } = useSound();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Start game music when the page loads
    if (!isMusicMuted) {
      playMusic("gameTheme");
    }

    // Simple loading timeout
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Stop music when navigating away
    return () => {
      stopMusic();
      clearTimeout(timer);
    };
  }, [playMusic, stopMusic, isMusicMuted]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  return (
    <div className="flex flex-col h-[100vh] bg-green-900">
      <OrientationHandler />

      {/* Main content area - will take all available space except for the nav height */}
      <main className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white">Loading game...</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex-1">
            <BlackjackGame />
          </div>
        )}
      </main>

      {/* Footer navigation - fixed height */}
      <footer className="bg-black border-t border-yellow-500/30">
        <MobileNav />
      </footer>
    </div>
  );
}
