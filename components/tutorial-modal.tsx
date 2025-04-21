"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSound } from "@/lib/sounds"

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const { playSound } = useSound()

  const handleClose = () => {
    playSound("buttonClick")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Welcome to Blackjack!</DialogTitle>
          <DialogDescription>Learn how to play the game and win big!</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="rules">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="rules" onClick={() => playSound("buttonClick")}>
              Rules
            </TabsTrigger>
            <TabsTrigger value="values" onClick={() => playSound("buttonClick")}>
              Card Values
            </TabsTrigger>
            <TabsTrigger value="special" onClick={() => playSound("buttonClick")}>
              Special Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <h3 className="font-bold">Game Objective</h3>
            <p>
              The goal is to have a hand value as close to 21 as possible without exceeding it. If your hand exceeds 21,
              you "bust" and lose the round.
            </p>

            <h3 className="font-bold">How to Play</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>You and the dealer each receive 2 cards. One of the dealer's cards is hidden.</li>
              <li>You can choose to "Hit" (take another card) or "Stand" (keep your current hand).</li>
              <li>After you stand, the dealer reveals their hidden card and must hit until they have at least 17.</li>
              <li>The hand closest to 21 without busting wins.</li>
            </ul>
          </TabsContent>

          <TabsContent value="values" className="space-y-4">
            <h3 className="font-bold">Card Values</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Number cards (2-10): Worth their face value</li>
              <li>Face cards (J, Q, K): Worth 10 points each</li>
              <li>Ace (A): Worth 1 or 11 points, whichever is more favorable</li>
            </ul>

            <h3 className="font-bold">Ace Handling</h3>
            <p>
              An Ace is initially counted as 11. If that would cause you to bust, it automatically counts as 1 instead.
            </p>
          </TabsContent>

          <TabsContent value="special" className="space-y-4">
            <h3 className="font-bold">Charlie Rule</h3>
            <p>
              If you collect 7 cards without busting (going over 21), you automatically win! This is called a "Seven
              Card Charlie".
            </p>

            <h3 className="font-bold">Betting</h3>
            <p>
              Before each round, you place a bet. If you win, you receive your bet amount. If you lose, your bet is
              taken. If it's a tie ("push"), you keep your bet.
            </p>

            <h3 className="font-bold">Game End</h3>
            <p>The game ends when your balance reaches 0. Manage your bets wisely!</p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full">
            Let's Play!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
