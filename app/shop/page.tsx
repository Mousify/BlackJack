"use client"

import { useEffect } from "react"
import { BackgroundImage } from "@/components/ui/background-image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, ShoppingCart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FallbackImage } from "@/components/fallback-image"
import { useSound } from "@/lib/sounds"
// Import the BackButton
import { BackButton } from "@/components/back-button"

export default function ShopPage() {
  const { playMusic, isMusicMuted, playSound } = useSound()
  const balance = 1250

  useEffect(() => {
    // Start background music when the page loads
    if (!isMusicMuted) {
      playMusic("mainTheme")
    }
  }, [playMusic, isMusicMuted])

  // Sample shop items
  const cardDecks = [
    {
      id: "standard",
      name: "Standard Deck",
      description: "The classic playing card design",
      price: 0,
      owned: true,
      image: "/images/card-standard.png",
    },
    {
      id: "vintage",
      name: "Vintage Deck",
      description: "An elegant, old-fashioned card design",
      price: 1000,
      owned: false,
      image: "/images/card-vintage.png",
    },
    {
      id: "luxury",
      name: "Luxury Gold Deck",
      description: "Premium cards with gold accents",
      price: 2500,
      owned: false,
      image: "/images/card-luxury.png",
    },
    {
      id: "neon",
      name: "Neon Deck",
      description: "Modern cards with vibrant neon colors",
      price: 3000,
      owned: false,
      image: "/images/card-neon.png",
    },
  ]

  const tableThemes = [
    {
      id: "classic",
      name: "Classic Green",
      description: "Traditional casino felt table",
      price: 0,
      owned: true,
      image: "/images/table-classic.png",
    },
    {
      id: "royal",
      name: "Royal Blue",
      description: "Elegant blue felt with gold trim",
      price: 1500,
      owned: false,
      image: "/images/table-royal.png",
    },
    {
      id: "vegas",
      name: "Vegas Gold",
      description: "Luxurious gold felt with black accents",
      price: 2000,
      owned: false,
      image: "/images/table-vegas.png",
    },
    {
      id: "night",
      name: "Night Black",
      description: "Sleek black felt with subtle patterns",
      price: 2500,
      owned: false,
      image: "/images/table-night.png",
    },
  ]

  const chipSets = [
    {
      id: "standard",
      name: "Standard Chips",
      description: "Classic casino chip design",
      price: 0,
      owned: true,
      image: "/images/chip-5.png",
    },
    {
      id: "premium",
      name: "Premium Chips",
      description: "High-quality chips with metallic inlays",
      price: 2000,
      owned: false,
      image: "/images/chip-25.png",
    },
    {
      id: "diamond",
      name: "Diamond Chips",
      description: "Exclusive chips with diamond patterns",
      price: 5000,
      owned: false,
      image: "/images/chip-100.png",
    },
  ]

  return (
    <main className="min-h-screen relative">
      <BackgroundImage variant="shop" />

      <div className="relative z-10 p-4">
        {/* Replace the existing Link+Button with BackButton */}
        <div className="flex justify-between items-center mb-6">
          <BackButton href="/" label="Back to Menu" />
          <h1 className="text-2xl font-bold text-white drop-shadow-glow">Shop</h1>
          <Badge variant="outline" className="bg-black/50 text-white border-yellow-500/50">
            <Coins className="h-4 w-4 mr-1 text-yellow-500" />
            {balance}
          </Badge>
        </div>

        <div className="max-w-md mx-auto">
          <Tabs defaultValue="decks" className="w-full">
            <TabsList className="grid grid-cols-3 bg-black/50 border border-yellow-500/30 rounded-xl">
              <TabsTrigger
                value="decks"
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black rounded-l-xl"
                onClick={() => playSound("buttonClick")}
              >
                Card Decks
              </TabsTrigger>
              <TabsTrigger
                value="themes"
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black"
                onClick={() => playSound("buttonClick")}
              >
                Table Themes
              </TabsTrigger>
              <TabsTrigger
                value="chips"
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black rounded-r-xl"
                onClick={() => playSound("buttonClick")}
              >
                Chip Sets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="decks" className="mt-4 space-y-4">
              {cardDecks.map((item) => (
                <Card key={item.id} className="bg-black/70 border-yellow-500/30 overflow-hidden rounded-xl">
                  <div className="flex">
                    <div className="w-1/3 h-32 bg-gray-800 flex items-center justify-center rounded-l-xl">
                      <FallbackImage
                        src={item.image}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="object-contain"
                      />
                    </div>
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-white">{item.name}</h3>
                        <p className="text-sm text-gray-300">{item.description}</p>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        {item.owned ? (
                          <Badge variant="outline" className="bg-green-900/50 text-green-400 border-green-500/50">
                            Owned
                          </Badge>
                        ) : (
                          <div className="flex items-center text-yellow-500">
                            <Coins className="h-4 w-4 mr-1" />
                            {item.price}
                          </div>
                        )}

                        {!item.owned && (
                          <Button
                            variant="default"
                            size="sm"
                            disabled={balance < item.price}
                            className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold disabled:opacity-50 rounded-xl"
                            onClick={() => playSound("chipStack")}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Buy
                          </Button>
                        )}

                        {item.owned && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-500/50 text-green-400 hover:bg-green-900/50 rounded-xl"
                            onClick={() => playSound("buttonClick")}
                          >
                            Select
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="themes" className="mt-4 space-y-4">
              {tableThemes.map((item) => (
                <Card key={item.id} className="bg-black/70 border-yellow-500/30 overflow-hidden rounded-xl">
                  <div className="flex">
                    <div className="w-1/3 h-32 bg-gray-800 flex items-center justify-center rounded-l-xl">
                      <FallbackImage src={item.image} alt={item.name} />
                    </div>
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-white">{item.name}</h3>
                        <p className="text-sm text-gray-300">{item.description}</p>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        {item.owned ? (
                          <Badge variant="outline" className="bg-green-900/50 text-green-400 border-green-500/50">
                            Owned
                          </Badge>
                        ) : (
                          <div className="flex items-center text-yellow-500">
                            <Coins className="h-4 w-4 mr-1" />
                            {item.price}
                          </div>
                        )}

                        {!item.owned && (
                          <Button
                            variant="default"
                            size="sm"
                            disabled={balance < item.price}
                            className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold disabled:opacity-50 rounded-xl"
                            onClick={() => playSound("chipStack")}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Buy
                          </Button>
                        )}

                        {item.owned && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-500/50 text-green-400 hover:bg-green-900/50 rounded-xl"
                            onClick={() => playSound("buttonClick")}
                          >
                            Select
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="themes" className="mt-4 space-y-4">
              {tableThemes.map((item) => (
                <Card key={item.id} className="bg-black/70 border-yellow-500/30 overflow-hidden rounded-xl">
                  <div className="flex">
                    <div className="w-1/3 h-32 bg-gray-800 flex items-center justify-center rounded-l-xl">
                      <FallbackImage src={item.image} alt={item.name} />
                    </div>
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-white">{item.name}</h3>
                        <p className="text-sm text-gray-300">{item.description}</p>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        {item.owned ? (
                          <Badge variant="outline" className="bg-green-900/50 text-green-400 border-green-500/50">
                            Owned
                          </Badge>
                        ) : (
                          <div className="flex items-center text-yellow-500">
                            <Coins className="h-4 w-4 mr-1" />
                            {item.price}
                          </div>
                        )}

                        {!item.owned && (
                          <Button
                            variant="default"
                            size="sm"
                            disabled={balance < item.price}
                            className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold disabled:opacity-50 rounded-xl"
                            onClick={() => playSound("chipStack")}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Buy
                          </Button>
                        )}

                        {item.owned && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-500/50 text-green-400 hover:bg-green-900/50 rounded-xl"
                            onClick={() => playSound("buttonClick")}
                          >
                            Select
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="chips" className="mt-4 space-y-4">
              {chipSets.map((item) => (
                <Card key={item.id} className="bg-black/70 border-yellow-500/30 overflow-hidden rounded-xl">
                  <div className="flex">
                    <div className="w-1/3 h-32 bg-gray-800 flex items-center justify-center rounded-l-xl">
                      <FallbackImage
                        src={item.image}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="object-contain"
                      />
                    </div>
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-white">{item.name}</h3>
                        <p className="text-sm text-gray-300">{item.description}</p>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        {item.owned ? (
                          <Badge variant="outline" className="bg-green-900/50 text-green-400 border-green-500/50">
                            Owned
                          </Badge>
                        ) : (
                          <div className="flex items-center text-yellow-500">
                            <Coins className="h-4 w-4 mr-1" />
                            {item.price}
                          </div>
                        )}

                        {!item.owned && (
                          <Button
                            variant="default"
                            size="sm"
                            disabled={balance < item.price}
                            className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold disabled:opacity-50 rounded-xl"
                            onClick={() => playSound("chipStack")}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Buy
                          </Button>
                        )}

                        {item.owned && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-500/50 text-green-400 hover:bg-green-900/50 rounded-xl"
                            onClick={() => playSound("buttonClick")}
                          >
                            Select
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
