import { BackgroundImage } from "@/components/ui/background-image"
import { Card } from "@/components/ui/card"

export default function Loading() {
  return (
    <main className="min-h-screen relative">
      <BackgroundImage />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="bg-black/70 border-yellow-500/30 p-8 max-w-md w-full">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">Connecting to Server</h2>
            <p className="text-gray-300 text-center">Please wait while we connect you to the multiplayer server...</p>
          </div>
        </Card>
      </div>
    </main>
  )
}
