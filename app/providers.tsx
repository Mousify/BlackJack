"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider-fixed"
import { SoundProvider } from "@/lib/sounds"
import { MusicProvider } from "@/contexts/music-context"
import { AuthProvider } from "@/contexts/auth-context"
import { GameProvider } from "@/contexts/game-context"
import { MultiplayerProvider } from "@/contexts/multiplayer-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { BrowserFeatureCheck } from "@/components/browser-feature-check"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
        <MusicProvider>
          <SoundProvider>
            <AuthProvider>
              <GameProvider>
                <MultiplayerProvider>
                  {children}
                  <BrowserFeatureCheck />
                </MultiplayerProvider>
              </GameProvider>
            </AuthProvider>
          </SoundProvider>
        </MusicProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
