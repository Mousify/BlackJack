import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./providers"
import { AudioInitializer } from "@/components/audio-initializer"
import { ResourcePreloader } from "@/components/resource-preloader"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Blackjack Royal",
  description: "A premium mobile blackjack game with stunning visuals and animations",
  applicationName: "Blackjack Royal",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Blackjack Royal",
  },
  formatDetection: {
    telephone: false,
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/images/logo.png" as="image" />
        <link rel="preload" href="/images/casino-background.jpg" as="image" />
        <link rel="preload" href="/sounds/button-click.mp3" as="audio" />
        <link rel="preload" href="/sounds/main-theme.mp3" as="audio" />
      </head>
      <body className={`${inter.className} overscroll-none`}>
        <Providers>
          <ResourcePreloader />
          <AudioInitializer />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
