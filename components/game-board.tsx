"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import TutorialModal from "./tutorial-modal"
import { PlayingCard } from "./playing-card"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Info, ArrowDown, ArrowUp, Hand } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSound } from "@/lib/sounds"
import { SoundToggle } from "./sound-toggle"
import { useGameState } from "@/hooks/use-game-state"
import { toast } from "@/hooks/use-toast"
import confetti from "canvas-confetti"

// Card types and values
const CARD_VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
const CARD_SUITS = ["♠", "♣", "♥", "♦"]

// Game states
type GameState = "betting" | "playerTurn" | "dealerTurn" | "gameOver"
type BettingOption = "normal" | "double" | "split" | "insurance"

export default function GameBoard() {
  // Game state
  const {
    balance,
    setBalance,
    addWin,
    addLoss,
    addGamePlayed,
    gameState: globalGameState,
    setGameState: setGlobalGameState,
  } = useGameState()
  const [gameState, setGameState] = useState<GameState>("betting")
  const [bet, setBet] = useState(10)
  const [deck, setDeck] = useState<Array<{ value: string; suit: string; numericValue: number }>>([])
  const [playerHand, setPlayerHand] = useState<Array<{ value: string; suit: string; numericValue: number }>>([])
  const [dealerHand, setDealerHand] = useState<Array<{ value: string; suit: string; numericValue: number }>>([])
  const [splitHand, setSplitHand] = useState<Array<{ value: string; suit: string; numericValue: number }>>([])
  const [playerScore, setPlayerScore] = useState(0)
  const [dealerScore, setDealerScore] = useState(0)
  const [splitScore, setSplitScore] = useState(0)
  const [result, setResult] = useState("")
  const [showTutorial, setShowTutorial] = useState(false)
  const [dealerCardHidden, setDealerCardHidden] = useState(true)
  const [currentHand, setCurrentHand] = useState<"main" | "split">("main")
  const [canSplit, setCanSplit] = useState(false)
  const [canDouble, setCanDouble] = useState(false)
  const [canInsurance, setCanInsurance] = useState(false)
  const [insuranceBet, setInsuranceBet] = useState(0)
  const [showBettingOptions, setShowBettingOptions] = useState(false)
  const [selectedBettingOption, setSelectedBettingOption] = useState<BettingOption>("normal")
  const [showStats, setShowStats] = useState(false)
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false)
  const [showDoubleDialog, setShowDoubleDialog] = useState(false)
  const [showSplitDialog, setShowSplitDialog] = useState(false)
  const [animateWin, setAnimateWin] = useState(false)

  // Sound system
  const { playSound } = useSound()

  // Initialize and shuffle deck
  const initializeDeck = () => {
    const newDeck: Array<{ value: string; suit: string; numericValue: number }> = []

    for (const suit of CARD_SUITS) {
      for (let i = 0; i < CARD_VALUES.length; i++) {
        const value = CARD_VALUES[i]
        let numericValue: number

        if (value === "A") {
          numericValue = 11 // Ace is initially 11
        } else if (["J", "Q", "K"].includes(value)) {
          numericValue = 10 // Face cards are 10
        } else {
          numericValue = Number.parseInt(value) // Number cards are their value
        }

        newDeck.push({ value, suit, numericValue })
      }
    }

    // Shuffle the deck
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
    }

    return newDeck
  }

  // Deal a card from the deck
  const dealCard = () => {
    if (deck.length === 0) return null
    const newDeck = [...deck]
    const card = newDeck.pop()
    setDeck(newDeck)
    return card
  }

  // Calculate hand score
  const calculateScore = (hand: Array<{ value: string; suit: string; numericValue: number }>) => {
    let score = 0
    let aces = 0

    for (const card of hand) {
      score += card.numericValue
      if (card.value === "A") {
        aces++
      }
    }

    // Adjust for aces if needed
    while (score > 21 && aces > 0) {
      score -= 10 // Change Ace from 11 to 1
      aces--
    }

    return score
  }

  // Check if hand can be split
  const checkCanSplit = (hand: Array<{ value: string; suit: string; numericValue: number }>) => {
    return hand.length === 2 && hand[0].value === hand[1].value && balance >= bet
  }

  // Check if hand can be doubled down
  const checkCanDouble = (hand: Array<{ value: string; suit: string; numericValue: number }>) => {
    return hand.length === 2 && balance >= bet
  }

  // Check if insurance is available
  const checkCanInsurance = (dealerHand: Array<{ value: string; suit: string; numericValue: number }>) => {
    return dealerHand.length > 0 && dealerHand[0].value === "A" && balance >= bet / 2
  }

  // Start a new game
  const startGame = () => {
    if (balance < bet) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough chips for this bet.",
        variant: "destructive",
      })
      return
    }

    // Play chip sound when placing bet
    playSound("chipStack")

    const newDeck = initializeDeck()
    setDeck(newDeck)
    setPlayerHand([])
    setDealerHand([])
    setSplitHand([])
    setPlayerScore(0)
    setDealerScore(0)
    setSplitScore(0)
    setResult("")
    setDealerCardHidden(true)
    setCurrentHand("main")
    setCanSplit(false)
    setCanDouble(false)
    setCanInsurance(false)
    setInsuranceBet(0)
    setSelectedBettingOption("normal")
    setAnimateWin(false)

    // Add game to stats
    addGamePlayed()

    // Deal initial cards with sounds
    setTimeout(() => {
      playSound("cardDeal")
      const playerCard1 = newDeck.pop()
      setTimeout(() => {
        playSound("cardDeal")
        const dealerCard1 = newDeck.pop()
        setTimeout(() => {
          playSound("cardDeal")
          const playerCard2 = newDeck.pop()
          setTimeout(() => {
            playSound("cardDeal")
            const dealerCard2 = newDeck.pop()

            const pHand = [playerCard1!, playerCard2!]
            const dHand = [dealerCard1!, dealerCard2!]

            setPlayerHand(pHand)
            setDealerHand(dHand)
            setDeck(newDeck)

            const pScore = calculateScore(pHand)
            setPlayerScore(pScore)

            // Only calculate visible dealer card
            setDealerScore(dealerCard1!.numericValue)

            // Check for split, double down, and insurance options
            setCanSplit(checkCanSplit(pHand))
            setCanDouble(checkCanDouble(pHand))
            setCanInsurance(checkCanInsurance(dHand))

            // Show betting options if any are available
            if (checkCanSplit(pHand) || checkCanDouble(pHand) || checkCanInsurance(dHand)) {
              setShowBettingOptions(true)
            }

            setGameState("playerTurn")

            // Check for blackjack
            if (pScore === 21) {
              // Check if dealer also has blackjack
              const dScore = calculateScore(dHand)
              if (dScore === 21) {
                handlePush()
              } else {
                handleBlackjack()
              }
            }

            // Check if dealer has an Ace showing and offer insurance
            if (checkCanInsurance(dHand)) {
              setShowInsuranceDialog(true)
            }
          }, 300)
        }, 300)
      }, 300)
    }, 300)
  }

  // Player hits (takes another card)
  const handleHit = () => {
    playSound("buttonClick")

    const card = dealCard()
    if (!card) return

    // Play card deal sound
    playSound("cardDeal")

    if (currentHand === "main") {
      const newHand = [...playerHand, card]
      setPlayerHand(newHand)

      const newScore = calculateScore(newHand)
      setPlayerScore(newScore)

      // Can't double down after hitting
      setCanDouble(false)

      // Check if player busts or has 21
      if (newScore > 21) {
        if (splitHand.length > 0) {
          // If split hand exists, move to it
          setCurrentHand("split")
        } else {
          // Otherwise, end the game
          handleBust()
        }
      } else if (newScore === 21) {
        if (splitHand.length > 0) {
          // If split hand exists, move to it
          setCurrentHand("split")
        } else {
          // Otherwise, dealer's turn
          handleDealerTurn()
        }
      } else if (newHand.length === 7 && newScore <= 21) {
        // Charlie rule - 7 cards without busting
        handleCharlie()
      }
    } else {
      // Split hand
      const newHand = [...splitHand, card]
      setSplitHand(newHand)

      const newScore = calculateScore(newHand)
      setSplitScore(newScore)

      // Check if split hand busts or has 21
      if (newScore > 21) {
        handleDealerTurn()
      } else if (newScore === 21) {
        handleDealerTurn()
      } else if (newHand.length === 7 && newScore <= 21) {
        // Charlie rule for split hand
        handleCharlie()
      }
    }
  }

  // Player stands (ends turn)
  const handleStand = () => {
    playSound("buttonClick")

    if (currentHand === "main" && splitHand.length > 0) {
      // If we have a split hand and we're on the main hand, move to the split hand
      setCurrentHand("split")
    } else {
      // Otherwise, move to dealer's turn
      handleDealerTurn()
    }
  }

  // Player doubles down
  const handleDoubleDown = () => {
    setShowDoubleDialog(false)
    playSound("chipStack")

    // Double the bet
    setBet(bet * 2)

    // Take exactly one more card
    const card = dealCard()
    if (!card) return

    playSound("cardDeal")

    const newHand = [...playerHand, card]
    setPlayerHand(newHand)

    const newScore = calculateScore(newHand)
    setPlayerScore(newScore)

    // Move to dealer's turn regardless of the card
    setTimeout(() => {
      handleDealerTurn()
    }, 1000)
  }

  // Player splits their hand
  const handleSplit = () => {
    setShowSplitDialog(false)
    playSound("chipStack")

    // Create two hands from the pair
    const card1 = playerHand[0]
    const card2 = playerHand[1]

    // Deal a new card to each hand
    const newCard1 = dealCard()
    const newCard2 = dealCard()

    if (!newCard1 || !newCard2) return

    playSound("cardDeal")

    const newMainHand = [card1, newCard1]
    const newSplitHand = [card2, newCard2]

    setPlayerHand(newMainHand)
    setSplitHand(newSplitHand)

    setPlayerScore(calculateScore(newMainHand))
    setSplitScore(calculateScore(newSplitHand))

    // Continue with the main hand
    setCurrentHand("main")

    // Can't split again
    setCanSplit(false)
  }

  // Player takes insurance
  const handleInsurance = () => {
    setShowInsuranceDialog(false)
    playSound("chipStack")

    // Insurance bet is half the original bet
    const insuranceAmount = Math.floor(bet / 2)
    setInsuranceBet(insuranceAmount)

    // Check if dealer has blackjack
    const dealerHasBlackjack = calculateScore(dealerHand) === 21

    if (dealerHasBlackjack) {
      // Insurance pays 2:1
      const insuranceWin = insuranceAmount * 2
      setBalance(balance + insuranceWin)

      toast({
        title: "Insurance Win!",
        description: `You won ${insuranceWin} chips from your insurance bet.`,
      })
    }
  }

  // Dealer's turn
  const handleDealerTurn = () => {
    // Play card flip sound when revealing dealer's card
    playSound("cardFlip")

    setDealerCardHidden(false)
    setGameState("dealerTurn")

    let newDealerHand = [...dealerHand]
    const newDeck = [...deck]

    // Calculate full dealer score
    let dScore = calculateScore(newDealerHand)
    setDealerScore(dScore)

    // Dealer must hit until score is at least 17
    const dealerPlay = () => {
      if (dScore < 17) {
        playSound("cardDeal")

        const card = newDeck.pop()
        if (!card) return

        newDealerHand = [...newDealerHand, card]
        setDealerHand(newDealerHand)
        setDeck(newDeck)

        dScore = calculateScore(newDealerHand)
        setDealerScore(dScore)

        setTimeout(dealerPlay, 600)
      } else {
        // Determine winner
        const pScore = calculateScore(playerHand)
        const sScore = calculateScore(splitHand)

        // Handle main hand
        if (currentHand === "main" || splitHand.length === 0) {
          if (dScore > 21) {
            handleWin()
          } else if (pScore > dScore || dScore > 21) {
            handleWin()
          } else if (pScore < dScore) {
            handleLoss()
          } else {
            handlePush()
          }
        }

        // Handle split hand
        if (splitHand.length > 0) {
          if (dScore > 21) {
            handleSplitWin()
          } else if (sScore > dScore || dScore > 21) {
            handleSplitWin()
          } else if (sScore < dScore) {
            handleSplitLoss()
          } else {
            handleSplitPush()
          }
        }

        setGameState("gameOver")
      }
    }

    setTimeout(dealerPlay, 600)
  }

  // Handle Blackjack
  const handleBlackjack = () => {
    playSound("win")
    setDealerCardHidden(false)
    setDealerScore(calculateScore(dealerHand))
    setResult("Blackjack! You win!")
    setBalance(balance + bet * 1.5)
    addWin()
    setGameState("gameOver")

    // Trigger confetti
    confetti({
      particleCount: 200,
      spread: 160,
    })
  }

  // Handle Charlie
  const handleCharlie = () => {
    playSound("win")
    setDealerCardHidden(false)
    setDealerScore(calculateScore(dealerHand))
    setResult("Seven Card Charlie! You win!")
    setBalance(balance + bet)
    addWin()
    setGameState("gameOver")

    // Trigger confetti
    confetti({
      particleCount: 200,
      spread: 160,
    })
  }

  // Handle Bust
  const handleBust = () => {
    playSound("lose")
    setDealerCardHidden(false)
    setDealerScore(calculateScore(dealerHand))
    setResult("You bust! Dealer wins.")
    setBalance(balance - bet)
    addLoss()
    setGameState("gameOver")
  }

  // Handle Win
  const handleWin = () => {
    playSound("win")
    setDealerCardHidden(false)
    setDealerScore(calculateScore(dealerHand))
    setResult("You win!")
    setBalance(balance + bet)
    addWin()
    setAnimateWin(true)
    setGameState("gameOver")

    // Trigger confetti
    confetti({
      particleCount: 200,
      spread: 160,
    })
  }

  // Handle Loss
  const handleLoss = () => {
    playSound("lose")
    setDealerCardHidden(false)
    setDealerScore(calculateScore(dealerHand))
    setResult("Dealer wins!")
    setBalance(balance - bet)
    addLoss()
    setGameState("gameOver")
  }

  // Handle Push
  const handlePush = () => {
    playSound("push")
    setDealerCardHidden(false)
    setDealerScore(calculateScore(dealerHand))
    setResult("Push! It's a tie.")
    setGameState("gameOver")
  }

  // Handle Split Win
  const handleSplitWin = () => {
    playSound("win")
    setDealerCardHidden(false)
    setDealerScore(calculateScore(dealerHand))
    setResult("Split hand wins!")
    setBalance(balance + bet)
    addWin()
    setAnimateWin(true)
    setGameState("gameOver")

    // Trigger confetti
    confetti({
      particleCount: 200,
      spread: 160,
    })
  }

  // Handle Split Loss
  const handleSplitLoss = () => {
    playSound("lose")
    setDealerCardHidden(false)
    setDealerScore(calculateScore(dealerHand))
    setResult("Split hand loses!")
    setBalance(balance - bet)
    addLoss()
    setGameState("gameOver")
  }

  // Handle Split Push
  const handleSplitPush = () => {
    playSound("push")
    setDealerCardHidden(false)
    setDealerScore(calculateScore(dealerHand))
    setResult("Split hand push! It's a tie.")
    setGameState("gameOver")
  }

  // Increase bet
  const increaseBet = () => {
    if (bet + 5 <= balance) {
      playSound("chipSingle")
      setBet(bet + 5)
    }
  }

  // Decrease bet
  const decreaseBet = () => {
    if (bet - 5 >= 5) {
      playSound("chipSingle")
      setBet(bet - 5)
    }
  }

  // Play button click sound for tutorial button
  const handleTutorialOpen = () => {
    playSound("buttonClick")
    setShowTutorial(true)
  }

  // Toggle stats modal
  const toggleStats = () => {
    playSound("buttonClick")
    setShowStats(!showStats)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tutorial Modal */}
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />

      {/* Insurance Dialog */}
      <Dialog open={showInsuranceDialog} onOpenChange={setShowInsuranceDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insurance?</DialogTitle>
            <DialogDescription>The dealer has an Ace showing. Would you like to take insurance?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleInsurance} className="bg-green-600 hover:bg-green-500 text-white font-bold py-4">
                Take Insurance
              </Button>
              <Button
                onClick={() => setShowInsuranceDialog(false)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-4"
              >
                No Insurance
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Double Down Dialog */}
      <Dialog open={showDoubleDialog} onOpenChange={setShowDoubleDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Double Down?</DialogTitle>
            <DialogDescription>Would you like to double your bet and take one more card?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleDoubleDown} className="bg-green-600 hover:bg-green-500 text-white font-bold py-4">
                Double Down
              </Button>
              <Button
                onClick={() => setShowDoubleDialog(false)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-4"
              >
                No Double Down
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Split Dialog */}
      <Dialog open={showSplitDialog} onOpenChange={setShowSplitDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Split Hand?</DialogTitle>
            <DialogDescription>Would you like to split your hand into two separate hands?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleSplit} className="bg-green-600 hover:bg-green-500 text-white font-bold py-4">
                Split Hand
              </Button>
              <Button
                onClick={() => setShowSplitDialog(false)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-4"
              >
                No Split
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Modal */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Game Statistics</DialogTitle>
            <DialogDescription>Here's a summary of your game statistics.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="account" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="account">
                <Info className="mr-2 h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="game">
                <Hand className="mr-2 h-4 w-4" />
                Game
              </TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium leading-none">Balance</h4>
                  <p className="text-sm text-muted-foreground">Current balance of your account.</p>
                  <Badge variant="secondary">€{balance}</Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium leading-none">Adjust Balance</h4>
                  <p className="text-sm text-muted-foreground">Manually adjust your balance for testing purposes.</p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={() => setBalance(balance - 10)}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setBalance(balance + 10)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="game">
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium leading-none">Games Played</h4>
                  <p className="text-sm text-muted-foreground">Total number of games played.</p>
                  <Badge variant="secondary">{globalGameState.gamesPlayed}</Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium leading-none">Wins</h4>
                  <p className="text-sm text-muted-foreground">Number of games won.</p>
                  <Badge variant="secondary">{globalGameState.wins}</Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium leading-none">Losses</h4>
                  <p className="text-sm text-muted-foreground">Number of games lost.</p>
                  <Badge variant="secondary">{globalGameState.losses}</Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Game Header */}
      <div className="flex justify-between items-center mb-4">
        <Badge variant="outline" className="bg-black/50 text-white px-3 py-1 text-lg">
          Balance: €{balance}
        </Badge>
        <div className="flex gap-2">
          <SoundToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={handleTutorialOpen}
            className="bg-black/50 text-white border-white/20"
          >
            Rules
          </Button>
          <Button variant="outline" size="sm" onClick={toggleStats} className="bg-black/50 text-white border-white/20">
            Stats
          </Button>
        </div>
      </div>

      {/* Dealer's Hand */}
      <Card className="bg-green-800 border-2 border-yellow-500/50 p-4 mb-4 min-h-[180px] relative">
        <h2 className="text-white mb-2 font-bold">
          Dealer's Hand {dealerScore > 0 && !dealerCardHidden && `(${dealerScore})`}
        </h2>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {dealerHand.map((card, index) => (
              <motion.div
                key={`dealer-${index}`}
                initial={{ scale: 0, rotate: 20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <PlayingCard
                  value={index === 1 && dealerCardHidden ? "?" : card.value}
                  suit={index === 1 && dealerCardHidden ? "?" : card.suit}
                  hidden={index === 1 && dealerCardHidden}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>

      {/* Game Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-center p-3 mb-4 rounded-md font-bold text-lg",
            result.includes("win") ? "bg-green-600/80" : result.includes("tie") ? "bg-yellow-600/80" : "bg-red-600/80",
          )}
        >
          {result.includes("win") && <Sparkles className="inline mr-2" />}
          {result}
          {result.includes("win") && <Sparkles className="inline ml-2" />}
        </motion.div>
      )}

      {/* Player's Hand */}
      <Card className="bg-green-800 border-2 border-yellow-500/50 p-4 mb-4 min-h-[180px]">
        <h2 className="text-white mb-2 font-bold">Your Hand {playerScore > 0 && `(${playerScore})`}</h2>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {playerHand.map((card, index) => (
              <motion.div
                key={`player-${index}`}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <PlayingCard value={card.value} suit={card.suit} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>

      {/* Split Hand */}
      {splitHand.length > 0 && (
        <Card className="bg-green-800 border-2 border-yellow-500/50 p-4 mb-4 min-h-[180px]">
          <h2 className="text-white mb-2 font-bold">Split Hand {splitScore > 0 && `(${splitScore})`}</h2>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {splitHand.map((card, index) => (
                <motion.div
                  key={`split-${index}`}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <PlayingCard value={card.value} suit={card.suit} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>
      )}

      {/* Game Controls */}
      <div className="mt-auto">
        {gameState === "betting" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Button
                onClick={decreaseBet}
                variant="outline"
                className="bg-black/50 text-white border-white/20 text-xl px-6"
              >
                -
              </Button>
              <div className="text-white text-xl font-bold">Bet: €{bet}</div>
              <Button
                onClick={increaseBet}
                variant="outline"
                className="bg-black/50 text-white border-white/20 text-xl px-6"
              >
                +
              </Button>
            </div>
            <Button onClick={startGame} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-6">
              DEAL
            </Button>
          </div>
        )}

        {gameState === "playerTurn" && (
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleHit} className="bg-green-600 hover:bg-green-500 text-white font-bold py-6">
              HIT
            </Button>
            <Button onClick={handleStand} className="bg-red-600 hover:bg-red-500 text-white font-bold py-6">
              STAND
            </Button>
          </div>
        )}

        {(gameState === "dealerTurn" || gameState === "gameOver") && (
          <Button
            onClick={() => {
              playSound("buttonClick")
              setGameState("betting")
            }}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-6"
            disabled={gameState === "dealerTurn"}
          >
            {gameState === "dealerTurn" ? "Dealer is playing..." : "PLAY AGAIN"}
          </Button>
        )}
      </div>
    </div>
  )
}
