"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Volume2,
  VolumeX,
  Trophy,
  Coins,
  Zap,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import { PlayingCard } from "./playing-card";
import { useSound } from "@/lib/sounds";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
// GameStats now handled directly in this component
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

// Card types
type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";
type PlayingCardType = { suit: Suit; rank: Rank; hidden?: boolean };

// Game states
type GameState =
  | "betting"
  | "dealing"
  | "playerTurn"
  | "dealerTurn"
  | "evaluating"
  | "gameOver";
type GameResult =
  | "win"
  | "lose"
  | "push"
  | "blackjack"
  | "bust"
  | "charlie"
  | null;

// Chip values
const CHIP_VALUES = [5, 25, 100, 500];

// Achievement types
type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  target: number;
  unlocked: boolean;
};

// Chip type for the betting area
type ChipType = {
  id: number;
  value: number;
  x: number;
  y: number;
  zIndex: number;
};

export default function BlackjackGame() {
  const router = useRouter();
  const { user } = useAuth();

  // Game state
  const [deck, setDeck] = useState<PlayingCardType[]>([]);
  const [playerHand, setPlayerHand] = useState<PlayingCardType[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCardType[]>([]);
  const [splitHand, setSplitHand] = useState<PlayingCardType[]>([]);
  const [gameState, setGameState] = useState<GameState>("betting");
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(0);
  const [insurance, setInsurance] = useState(0);
  const [activeHand, setActiveHand] = useState<"main" | "split">("main");
  const [streak, setStreak] = useState(0);
  const [handsPlayed, setHandsPlayed] = useState(0);
  const [showInsurancePrompt, setShowInsurancePrompt] = useState(false);
  const [animatingDeal, setAnimatingDeal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [betChips, setBetChips] = useState<ChipType[]>([]);
  const [freshRound, setFreshRound] = useState(false); // Track if we're starting a fresh round
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "first_win",
      name: "Beginner's Luck",
      description: "Win your first hand",
      icon: <Trophy className="h-5 w-5 text-yellow-500" />,
      progress: 0,
      target: 1,
      unlocked: false,
    },
    {
      id: "high_roller",
      name: "High Roller",
      description: "Place a bet of 500 or more",
      icon: <Coins className="h-5 w-5 text-yellow-500" />,
      progress: 0,
      target: 1,
      unlocked: false,
    },
    {
      id: "winning_streak",
      name: "Hot Streak",
      description: "Win 3 hands in a row",
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      progress: 0,
      target: 3,
      unlocked: false,
    },
    {
      id: "blackjack_master",
      name: "Blackjack Master",
      description: "Get 5 blackjacks",
      icon: <Trophy className="h-5 w-5 text-yellow-500" />,
      progress: 0,
      target: 5,
      unlocked: false,
    },
  ]);

  // Animation refs
  const dealerCardRef = useRef<HTMLDivElement>(null);
  const playerCardRef = useRef<HTMLDivElement>(null);
  const chipStackRef = useRef<HTMLDivElement>(null);
  const betAreaRef = useRef<HTMLDivElement>(null);
  const nextChipId = useRef(0);

  // Sound effects
  const {
    playCardDeal,
    playCardFlip,
    playChipStack,
    playChipSingle,
    playWin,
    playLose,
    playPush,
    playButtonClick,
    isMusicMuted,
    toggleMusicMute,
  } = useSound();

  const { toast } = useToast();

  // Initialize deck
  useEffect(() => {
    resetDeck();
  }, []);

  // Create and shuffle a new deck
  const resetDeck = () => {
    // Create a completely new deck array
    const newDeck: PlayingCardType[] = [];
    const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
    const ranks: Rank[] = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
      "A",
    ];

    // Create a standard 52-card deck
    for (const suit of suits) {
      for (const rank of ranks) {
        newDeck.push({ suit, rank });
      }
    }

    // Shuffle the deck thoroughly using Fisher-Yates algorithm
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    // Second shuffle pass for extra randomness
    for (let i = 0; i < newDeck.length; i++) {
      const j = Math.floor(Math.random() * newDeck.length);
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    console.log("New deck created with", newDeck.length, "cards");
    setDeck(newDeck);
  };

  // Deal a card from the deck
  const dealCard = (hidden = false): PlayingCardType => {
    if (deck.length === 0) {
      resetDeck();
      return dealCard(hidden);
    }

    // Create a copy of the current deck
    const deckCopy = [...deck];

    // Take the top card
    const card = { ...deckCopy[0], hidden };

    // Remove the card from the deck copy
    deckCopy.shift();

    // Update the deck state with the modified copy
    setDeck(deckCopy);

    console.log(
      "Card dealt:",
      card.rank,
      "of",
      card.suit,
      "- Remaining cards:",
      deckCopy.length
    );
    return card;
  };

  // Calculate hand value
  const calculateHandValue = (hand: PlayingCardType[]) => {
    let value = 0;
    let aces = 0;

    for (const card of hand) {
      if (card.hidden) continue;

      if (card.rank === "A") {
        aces++;
        value += 11;
      } else if (["K", "Q", "J"].includes(card.rank)) {
        value += 10;
      } else {
        value += Number.parseInt(card.rank);
      }
    }

    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  };

  // Check if hand is a blackjack
  const isBlackjack = (hand: PlayingCardType[]) => {
    return hand.length === 2 && calculateHandValue(hand) === 21;
  };

  // Start a new game
  const startGame = async () => {
    if (bet === 0) {
      toast({
        title: "Place a bet first",
        description: "You need to place a bet to start the game",
        variant: "destructive",
      });
      return;
    }

    // Reset fresh round flag since we're starting a game
    setFreshRound(false);

    playButtonClick();
    setGameState("dealing");
    setGameResult(null);
    setPlayerHand([]);
    setDealerHand([]);
    setSplitHand([]);
    setActiveHand("main");
    setShowInsurancePrompt(false);
    setAnimatingDeal(true);

    // Create a local copy of the deck to track changes
    const currentDeck = [...deck];

    // Deal cards with animation delay
    // First card to player
    await new Promise((resolve) => setTimeout(resolve, 300));
    playCardDeal();
    const playerCard1 = { ...currentDeck[0], hidden: false };
    currentDeck.shift();
    setDeck(currentDeck);
    console.log(
      "Card dealt:",
      playerCard1.rank,
      "of",
      playerCard1.suit,
      "- Remaining cards:",
      currentDeck.length
    );
    setPlayerHand([playerCard1]);

    // First card to dealer
    await new Promise((resolve) => setTimeout(resolve, 600));
    playCardDeal();
    const dealerCard1 = { ...currentDeck[0], hidden: false };
    currentDeck.shift();
    setDeck(currentDeck);
    console.log(
      "Card dealt:",
      dealerCard1.rank,
      "of",
      dealerCard1.suit,
      "- Remaining cards:",
      currentDeck.length
    );
    setDealerHand([dealerCard1]);

    // Second card to player
    await new Promise((resolve) => setTimeout(resolve, 600));
    playCardDeal();
    const playerCard2 = { ...currentDeck[0], hidden: false };
    currentDeck.shift();
    setDeck(currentDeck);
    console.log(
      "Card dealt:",
      playerCard2.rank,
      "of",
      playerCard2.suit,
      "- Remaining cards:",
      currentDeck.length
    );
    setPlayerHand([playerCard1, playerCard2]);

    // Second card to dealer (face down)
    await new Promise((resolve) => setTimeout(resolve, 600));
    playCardDeal();
    const dealerCard2 = { ...currentDeck[0], hidden: true };
    currentDeck.shift();
    setDeck(currentDeck);
    console.log("Card dealt: [hidden] - Remaining cards:", currentDeck.length);
    setDealerHand([dealerCard1, dealerCard2]);

    setAnimatingDeal(false);

    // Check for dealer showing Ace (insurance)
    if (dealerCard1.rank === "A") {
      setShowInsurancePrompt(true);
      return;
    }

    // Check for player blackjack
    if (isBlackjack([playerCard1, playerCard2])) {
      handleBlackjack();
    } else {
      setGameState("playerTurn");
    }

    // Update hands played count
    setHandsPlayed((prev) => prev + 1);
  };

  // Handle player hitting
  const handleHit = () => {
    playButtonClick();
    playCardDeal();

    // Create a local copy of the deck
    const currentDeck = [...deck];

    if (activeHand === "main") {
      const newCard = { ...currentDeck[0], hidden: false };
      currentDeck.shift();
      setDeck(currentDeck);
      console.log(
        "Card dealt:",
        newCard.rank,
        "of",
        newCard.suit,
        "- Remaining cards:",
        currentDeck.length
      );

      const newHand = [...playerHand, newCard];
      setPlayerHand(newHand);

      const value = calculateHandValue(newHand);

      // Check for bust
      if (value > 21) {
        if (splitHand.length > 0) {
          setActiveHand("split");
        } else {
          handleBust();
        }
      }

      // Check for 5-card Charlie (automatic win with 5 cards without busting)
      if (newHand.length === 5 && value <= 21) {
        handleCharlie();
      }
    } else {
      const newCard = { ...currentDeck[0], hidden: false };
      currentDeck.shift();
      setDeck(currentDeck);
      console.log(
        "Card dealt:",
        newCard.rank,
        "of",
        newCard.suit,
        "- Remaining cards:",
        currentDeck.length
      );

      const newHand = [...splitHand, newCard];
      setSplitHand(newHand);

      const value = calculateHandValue(newHand);

      // Check for bust on split hand
      if (value > 21) {
        handleDealerTurn();
      }

      // Check for 5-card Charlie on split hand
      if (newHand.length === 5 && value <= 21) {
        handleDealerTurn();
      }
    }
  };

  // Handle player standing
  const handleStand = () => {
    playButtonClick();

    if (activeHand === "main" && splitHand.length > 0) {
      setActiveHand("split");
    } else {
      handleDealerTurn();
    }
  };

  // Handle player doubling down
  const handleDoubleDown = () => {
    if (balance < bet) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough chips to double down",
        variant: "destructive",
      });
      return;
    }

    playButtonClick();
    playChipStack();

    // Double the bet
    setBalance(balance - bet);
    setBet(bet * 2);

    // Add chips to the bet area
    addChipsToBetArea(bet);

    // Deal one more card and then stand
    playCardDeal();

    // Create a local copy of the deck
    const currentDeck = [...deck];

    if (activeHand === "main") {
      const newCard = { ...currentDeck[0], hidden: false };
      currentDeck.shift();
      setDeck(currentDeck);
      console.log(
        "Card dealt:",
        newCard.rank,
        "of",
        newCard.suit,
        "- Remaining cards:",
        currentDeck.length
      );

      const newHand = [...playerHand, newCard];
      setPlayerHand(newHand);

      if (splitHand.length > 0) {
        setActiveHand("split");
      } else {
        handleDealerTurn();
      }
    } else {
      const newCard = { ...currentDeck[0], hidden: false };
      currentDeck.shift();
      setDeck(currentDeck);
      console.log(
        "Card dealt:",
        newCard.rank,
        "of",
        newCard.suit,
        "- Remaining cards:",
        currentDeck.length
      );

      const newHand = [...splitHand, newCard];
      setSplitHand(newHand);
      handleDealerTurn();
    }
  };

  // Handle player splitting
  const handleSplit = () => {
    // Can only split if first two cards have the same value
    if (
      playerHand.length !== 2 ||
      calculateHandValue([playerHand[0]]) !==
        calculateHandValue([playerHand[1]]) ||
      balance < bet
    ) {
      return;
    }

    playButtonClick();
    playChipStack();

    // Take second card from player hand and create split hand
    const card = playerHand[1];
    setPlayerHand([playerHand[0]]);
    setSplitHand([card]);

    // Deduct additional bet
    setBalance(balance - bet);

    // Add chips to the bet area
    addChipsToBetArea(bet);

    // Deal one more card to the first hand
    playCardDeal();

    // Create a local copy of the deck
    const currentDeck = [...deck];
    const newCard = { ...currentDeck[0], hidden: false };
    currentDeck.shift();
    setDeck(currentDeck);
    console.log(
      "Card dealt:",
      newCard.rank,
      "of",
      newCard.suit,
      "- Remaining cards:",
      currentDeck.length
    );

    setPlayerHand((prev) => [...prev, newCard]);
  };

  // Handle insurance bet
  const handleInsurance = (takeInsurance: boolean) => {
    setShowInsurancePrompt(false);

    if (takeInsurance) {
      // Insurance costs half the original bet
      const insuranceAmount = Math.floor(bet / 2);
      setInsurance(insuranceAmount);
      setBalance(balance - insuranceAmount);
      playChipStack();
    }

    // Check for player blackjack
    if (isBlackjack(playerHand)) {
      handleBlackjack();
    } else {
      setGameState("playerTurn");
    }
  };

  // Handle dealer's turn
  const handleDealerTurn = async () => {
    setGameState("dealerTurn");

    // Reveal dealer's hole card
    const revealedHand = dealerHand.map((card) => ({ ...card, hidden: false }));
    setDealerHand(revealedHand);
    playCardFlip();

    await new Promise((resolve) => setTimeout(resolve, 800));

    // Dealer draws until 17 or higher
    let currentHand = [...revealedHand];
    let currentValue = calculateHandValue(currentHand);
    const currentDeck = [...deck];

    while (currentValue < 17) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      playCardDeal();

      const newCard = { ...currentDeck[0], hidden: false };
      currentDeck.shift();
      setDeck(currentDeck);
      console.log(
        "Card dealt:",
        newCard.rank,
        "of",
        newCard.suit,
        "- Remaining cards:",
        currentDeck.length
      );

      currentHand = [...currentHand, newCard];
      setDealerHand(currentHand);

      currentValue = calculateHandValue(currentHand);
    }

    // Evaluate results
    evaluateResults();
  };

  // Evaluate game results
  const evaluateResults = () => {
    setGameState("evaluating");

    const dealerValue = calculateHandValue(dealerHand);
    const playerValue = calculateHandValue(playerHand);
    const dealerHasBlackjack = isBlackjack(dealerHand);

    // Handle insurance first
    if (insurance > 0 && dealerHasBlackjack) {
      // Insurance pays 2:1
      const insurancePayout = insurance * 3;
      setBalance(balance + insurancePayout);
      toast({
        title: "Insurance paid",
        description: `You won ${insurancePayout} chips from insurance`,
      });
    }

    // Evaluate main hand
    if (gameResult === "blackjack") {
      // Already handled
    } else if (gameResult === "charlie") {
      // Already handled
    } else if (playerValue > 21) {
      handleLoss();
    } else if (dealerValue > 21) {
      handleWin();
    } else if (playerValue > dealerValue) {
      handleWin();
    } else if (playerValue < dealerValue) {
      handleLoss();
    } else {
      handlePush();
    }

    // Evaluate split hand if exists
    if (splitHand.length > 0) {
      const splitValue = calculateHandValue(splitHand);

      if (splitValue > 21) {
        // Split hand busts
        // No additional payout
      } else if (dealerValue > 21) {
        // Dealer busts, split hand wins
        setBalance(balance + bet * 2);
      } else if (splitValue > dealerValue) {
        // Split hand wins
        setBalance(balance + bet * 2);
      } else if (splitValue < dealerValue) {
        // Split hand loses
        // No additional payout
      } else {
        // Push on split hand
        setBalance(balance + bet);
      }
    }

    setGameState("gameOver");
  };

  // Handle player blackjack
  const handleBlackjack = () => {
    setGameState("evaluating");
    setGameResult("blackjack");

    // Blackjack pays 3:2
    const blackjackPayout = Math.floor(bet * 2.5);
    setBalance(balance + blackjackPayout);

    // Update achievements
    updateAchievement("blackjack_master", 1);

    // Show win animation
    setTimeout(() => {
      playWin();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, 500);

    // Update streak
    setStreak((prev) => prev + 1);
    updateAchievement("winning_streak", streak + 1);

    // Update first win achievement
    updateAchievement("first_win", 1);

    toast({
      title: "Blackjack!",
      description: `You won ${blackjackPayout} chips`,
      variant: "default",
    });

    setGameState("gameOver");
  };

  // Handle 5-card Charlie
  const handleCharlie = () => {
    setGameState("evaluating");
    setGameResult("charlie");

    // 5-card Charlie pays 2:1
    const charliePayout = bet * 3;
    setBalance(balance + charliePayout);

    // Show win animation
    setTimeout(() => {
      playWin();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, 500);

    // Update streak
    setStreak((prev) => prev + 1);
    updateAchievement("winning_streak", streak + 1);

    // Update first win achievement
    updateAchievement("first_win", 1);

    toast({
      title: "5-Card Charlie!",
      description: `You won ${charliePayout} chips`,
      variant: "default",
    });

    setGameState("gameOver");
  };

  // Handle player win
  const handleWin = () => {
    setGameResult("win");

    // Regular win pays 1:1
    const winnings = bet * 2;
    setBalance(balance + winnings);

    // Show win animation
    setTimeout(() => {
      playWin();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, 500);

    // Update streak
    setStreak((prev) => prev + 1);
    updateAchievement("winning_streak", streak + 1);

    // Update first win achievement
    updateAchievement("first_win", 1);

    toast({
      title: "You win!",
      description: `You won ${winnings} chips`,
      variant: "default",
    });
  };

  // Handle player loss
  const handleLoss = () => {
    setGameResult("lose");

    // Reset streak
    setStreak(0);

    setTimeout(() => {
      playLose();
    }, 500);

    toast({
      title: "You lose",
      description: `You lost ${bet} chips`,
      variant: "destructive",
    });
  };

  // Handle push (tie)
  const handlePush = () => {
    setGameResult("push");

    // Return bet on push
    setBalance(balance + bet);

    setTimeout(() => {
      playPush();
    }, 500);

    toast({
      title: "Push",
      description: "Your bet has been returned",
      variant: "default",
    });
  };

  // Handle player bust
  const handleBust = () => {
    setGameResult("bust");

    // Reset streak
    setStreak(0);

    setTimeout(() => {
      playLose();
    }, 500);

    toast({
      title: "Bust!",
      description: `You lost ${bet} chips`,
      variant: "destructive",
    });

    setGameState("gameOver");
  };

  // Start a new round after game over
  const startNewRound = () => {
    playButtonClick();
    // Reset game state for a new round
    setGameState("betting");
    setBet(0); // Reset bet to 0
    setBetChips([]); // Clear all chips
    setFreshRound(true); // Mark this as a fresh round
  };

  // Add chips to bet with animation
  const addToBet = (amount: number, event: React.MouseEvent) => {
    if (balance >= amount && gameState === "betting") {
      playChipSingle();

      // Update balance and bet
      setBalance(balance - amount);
      setBet(bet + amount);

      // Add chip to the bet area
      addChipToBetArea(amount, event);

      // Update high roller achievement
      if (bet + amount >= 500) {
        updateAchievement("high_roller", 1);
      }
    }
  };

  // Add a single chip to the bet area
  const addChipToBetArea = (value: number, event: React.MouseEvent) => {
    const chipId = nextChipId.current++;

    // Position chips on the left side near the bottom
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate position (left side, bottom area)
    const targetX = windowWidth * 0.15; // 15% from the left edge
    const targetY = windowHeight * 0.65; // 65% from the top (adjusted for better visibility)

    // Get chip position for animation start
    const chipRect = (event.target as HTMLElement).getBoundingClientRect();

    // Create new chip
    const newChip: ChipType = {
      id: chipId,
      value,
      x: chipRect.left + chipRect.width / 2,
      y: chipRect.top + chipRect.height / 2,
      zIndex: betChips.length + 10,
    };

    // Add to bet chips
    setBetChips((prev) => [...prev, newChip]);

    // Animate chip to target position with slight offset for stacking
    setTimeout(() => {
      setBetChips((prev) =>
        prev.map((chip) =>
          chip.id === chipId
            ? {
                ...chip,
                x: targetX,
                y: targetY - betChips.length * 3, // Stack chips with vertical offset
              }
            : chip
        )
      );
    }, 50);
  };

  // Add multiple chips to bet area (for doubling down or splitting)
  const addChipsToBetArea = (amount: number) => {
    // Determine how many of each chip to add
    let remaining = amount;
    const chipsToAdd: number[] = [];

    // Start with largest chips
    for (let i = CHIP_VALUES.length - 1; i >= 0; i--) {
      const chipValue = CHIP_VALUES[i];
      while (remaining >= chipValue) {
        chipsToAdd.push(chipValue);
        remaining -= chipValue;
      }
    }

    // Position chips on the left side near the bottom
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate position (left side, bottom area)
    const targetX = windowWidth * 0.15; // 15% from the left edge
    const targetY = windowHeight * 0.65; // 65% from the top (adjusted for better visibility)

    // Add chips with slight delay between them
    chipsToAdd.forEach((value, index) => {
      setTimeout(() => {
        const chipId = nextChipId.current++;

        // Create new chip starting from outside the screen
        const newChip: ChipType = {
          id: chipId,
          value,
          x: 0, // Start from left edge
          y: windowHeight + 50, // Start from below the screen
          zIndex: betChips.length + 10 + index,
        };

        // Add to bet chips
        setBetChips((prev) => [...prev, newChip]);

        // Animate chip to target position
        setTimeout(() => {
          setBetChips((prev) =>
            prev.map((chip) =>
              chip.id === chipId
                ? {
                    ...chip,
                    x: targetX,
                    y: targetY - (betChips.length + index) * 3, // Stack with offset
                  }
                : chip
            )
          );
        }, 50);
      }, index * 100);
    });
  };

  // Remove a chip from the bet area
  const removeChip = (chipId: number) => {
    if (gameState !== "betting") return;

    // Find the chip
    const chip = betChips.find((c) => c.id === chipId);
    if (!chip) return;

    playChipSingle();

    // Update balance and bet
    setBalance(balance + chip.value);
    setBet(bet - chip.value);

    // Animate chip off the screen
    setBetChips((prev) =>
      prev.map((c) =>
        c.id === chipId ? { ...c, y: window.innerHeight + 100 } : c
      )
    );

    // Remove chip after animation
    setTimeout(() => {
      setBetChips((prev) => prev.filter((c) => c.id !== chipId));
    }, 500);
  };

  // Reset bet
  const resetBet = () => {
    if (gameState === "betting" && bet > 0) {
      playButtonClick();

      // Only add the bet back to the balance if it's not a fresh round
      // (i.e., if the player manually reset the bet during normal betting)
      if (!freshRound) {
        setBalance(balance + bet);
      }

      setBet(0);

      // Animate all chips off the screen
      setBetChips((prev) =>
        prev.map((chip) => ({
          ...chip,
          y: window.innerHeight + 100,
        }))
      );

      // Clear chips after animation
      setTimeout(() => {
        setBetChips([]);
      }, 500);

      // Reset fresh round flag
      setFreshRound(false);
    }
  };

  // Update achievement progress
  const updateAchievement = (id: string, progress: number) => {
    setAchievements((prev) =>
      prev.map((achievement) => {
        if (achievement.id === id && !achievement.unlocked) {
          const newProgress = Math.min(
            achievement.target,
            achievement.progress + progress
          );
          const unlocked = newProgress >= achievement.target;

          if (unlocked) {
            // Show achievement notification
            toast({
              title: "Achievement Unlocked!",
              description: achievement.name,
              variant: "default",
            });
          }

          return {
            ...achievement,
            progress: newProgress,
            unlocked,
          };
        }
        return achievement;
      })
    );
  };

  // Render player's cards
  const renderPlayerCards = () => {
    const handValue = calculateHandValue(playerHand);

    return (
      <div className="relative">
        <div className="flex flex-wrap justify-center" ref={playerCardRef}>
          {playerHand.map((card, index) => (
            <div
              key={`player-${index}`}
              className={cn(
                "transform transition-all duration-300",
                index > 0 && "-ml-6 sm:-ml-8 md:-ml-10",
                activeHand === "split" && "opacity-50"
              )}
              style={{
                zIndex: index,
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <PlayingCard
                suit={card.suit}
                rank={card.rank}
                hidden={card.hidden}
              />
            </div>
          ))}
        </div>

        {playerHand.length > 0 && (
          <div className="absolute top-0 right-0 bg-black/70 text-white px-2 py-1 rounded-md text-sm font-bold">
            {handValue} pts
          </div>
        )}
      </div>
    );
  };

  // Render dealer's cards
  const renderDealerCards = () => {
    const handValue = dealerHand.some((card) => card.hidden)
      ? calculateHandValue([dealerHand[0]])
      : calculateHandValue(dealerHand);

    return (
      <div className="relative">
        <div className="flex flex-wrap justify-center" ref={dealerCardRef}>
          {dealerHand.map((card, index) => (
            <div
              key={`dealer-${index}`}
              className="transform transition-all duration-300"
              style={{
                zIndex: index,
                marginLeft: index > 0 ? "-24px" : "0",
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <PlayingCard
                suit={card.suit}
                rank={card.rank}
                hidden={card.hidden}
                className={card.hidden ? "h-[96px]" : ""}
              />
            </div>
          ))}
        </div>

        {dealerHand.length > 0 && (
          <div className="absolute top-0 right-0 bg-black/70 text-white px-2 py-1 rounded-md text-sm font-bold">
            {dealerHand.some((card) => card.hidden)
              ? `${handValue}+ pts`
              : `${handValue} pts`}
          </div>
        )}
      </div>
    );
  };

  // Render split hand cards
  const renderSplitCards = () => {
    if (splitHand.length === 0) return null;

    const handValue = calculateHandValue(splitHand);

    return (
      <div className="relative">
        <div className="flex flex-wrap justify-center">
          {splitHand.map((card, index) => (
            <div
              key={`split-${index}`}
              className={cn(
                "transform transition-all duration-300",
                index > 0 && "-ml-6 sm:-ml-8 md:-ml-10",
                activeHand === "main" && "opacity-50"
              )}
              style={{
                zIndex: index,
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <PlayingCard
                suit={card.suit}
                rank={card.rank}
                hidden={card.hidden}
              />
            </div>
          ))}
        </div>

        <div className="absolute top-0 right-0 bg-black/70 text-white px-2 py-1 rounded-md text-sm font-bold">
          {handValue} pts
        </div>
      </div>
    );
  };

  // Render betting chips
  const renderBettingChips = () => {
    return (
      <div className="flex justify-center gap-3 my-4" ref={chipStackRef}>
        {CHIP_VALUES.map((value) => (
          <div
            key={`chip-${value}`}
            onClick={(e) => addToBet(value, e)}
            className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-black font-bold cursor-pointer transform transition-all hover:scale-110",
              value === 5 && "bg-red-500 border-2 border-red-300",
              value === 25 && "bg-green-500 border-2 border-green-300",
              value === 100 && "bg-blue-500 border-2 border-blue-300",
              value === 500 && "bg-purple-500 border-2 border-purple-300",
              balance < value && "opacity-50 cursor-not-allowed"
            )}
          >
            {value}
          </div>
        ))}
      </div>
    );
  };

  // Render chip animations
  const renderBetChips = () => {
    return betChips.map((chip) => (
      <div
        key={chip.id}
        className="absolute"
        style={{
          left: `${chip.x}px`,
          top: `${chip.y}px`,
          zIndex: chip.zIndex,
          transform: "translate(-50%, -50%)",
          transition: "left 0.5s ease, top 0.5s ease",
        }}
        onClick={() => removeChip(chip.id)}
      >
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transform transition-all hover:scale-110",
            chip.value === 5 && "bg-red-500 border-2 border-red-300",
            chip.value === 25 && "bg-green-500 border-2 border-green-300",
            chip.value === 100 && "bg-blue-500 border-2 border-blue-300",
            chip.value === 500 && "bg-purple-500 border-2 border-purple-300"
          )}
        >
          {chip.value}
        </div>
      </div>
    ));
  };

  // Render game controls
  const renderGameControls = () => {
    if (gameState === "betting") {
      return (
        <div className="flex flex-col gap-3">
          {renderBettingChips()}

          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={resetBet}
              className="flex-1 bg-red-900/50 hover:bg-red-800/70 text-white border-red-700/50"
              disabled={bet === 0}
            >
              Reset Bet
            </Button>

            <Button
              variant="default"
              onClick={startGame}
              disabled={bet === 0}
              className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black font-bold disabled:opacity-50"
            >
              Deal
            </Button>
          </div>
        </div>
      );
    }

    if (gameState === "playerTurn") {
      const canSplit =
        playerHand.length === 2 &&
        calculateHandValue([playerHand[0]]) ===
          calculateHandValue([playerHand[1]]) &&
        balance >= bet &&
        splitHand.length === 0;

      const canDoubleDown =
        (activeHand === "main" ? playerHand.length : splitHand.length) === 2 &&
        balance >= bet;

      return (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button
            variant="default"
            onClick={handleHit}
            className="bg-green-600 hover:bg-green-500 text-white"
          >
            Hit
          </Button>

          <Button
            variant="default"
            onClick={handleStand}
            className="bg-red-600 hover:bg-red-500 text-white"
          >
            Stand
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  onClick={handleDoubleDown}
                  disabled={!canDoubleDown}
                  className="bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                >
                  Double Down
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Double your bet and receive exactly one more card</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  onClick={handleSplit}
                  disabled={!canSplit}
                  className="bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50"
                >
                  Split
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Split identical cards into two separate hands</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    }

    if (gameState === "gameOver") {
      return (
        <div className="flex justify-center mt-3">
          <Button
            variant="default"
            onClick={startNewRound}
            className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
          >
            New Hand
          </Button>
        </div>
      );
    }

    return null;
  };

  // Render insurance prompt
  const renderInsurancePrompt = () => {
    if (!showInsurancePrompt) return null;

    const insuranceAmount = Math.floor(bet / 2);

    return (
      <Dialog open={showInsurancePrompt} onOpenChange={setShowInsurancePrompt}>
        <DialogContent className="bg-black/90 border-yellow-500/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-yellow-500">
              Insurance?
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="mb-4">
              Dealer is showing an Ace. Would you like to take insurance?
            </p>
            <p className="mb-4">
              Insurance costs{" "}
              <span className="text-yellow-500">{insuranceAmount}</span> chips.
            </p>

            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => handleInsurance(false)}
                className="flex-1 bg-red-900/50 hover:bg-red-800/70 text-white border-red-700/50"
              >
                No Thanks
              </Button>

              <Button
                variant="default"
                onClick={() => handleInsurance(true)}
                disabled={balance < insuranceAmount}
                className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black font-bold disabled:opacity-50"
              >
                Take Insurance
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Render game result message
  const renderGameResult = () => {
    if (gameState !== "gameOver" && gameState !== "evaluating") return null;

    let resultText = "";
    let resultClass = "";

    switch (gameResult) {
      case "win":
        resultText = "You Win!";
        resultClass = "text-green-500";
        break;
      case "lose":
        resultText = "You Lose";
        resultClass = "text-red-500";
        break;
      case "push":
        resultText = "Push";
        resultClass = "text-blue-500";
        break;
      case "blackjack":
        resultText = "Blackjack!";
        resultClass = "text-yellow-500";
        break;
      case "bust":
        resultText = "Bust!";
        resultClass = "text-red-500";
        break;
      case "charlie":
        resultText = "5-Card Charlie!";
        resultClass = "text-green-500";
        break;
      default:
        return null;
    }

    return (
      <div
        className={`text-center font-bold text-2xl ${resultClass} animate-pulse mt-2`}
      >
        {resultText}
      </div>
    );
  };

  // Render confetti animation
  const renderConfetti = () => {
    if (!showConfetti) return null;

    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {/* Simplified confetti animation */}
        {Array.from({ length: 50 }).map((_, i) => {
          const size = Math.random() * 10 + 5;
          const left = Math.random() * 100;
          const animationDuration = Math.random() * 3 + 2;
          const delay = Math.random() * 0.5;

          return (
            <div
              key={i}
              className="absolute top-0 rounded-sm"
              style={{
                left: `${left}%`,
                width: size,
                height: size,
                backgroundColor: [
                  "#FFD700",
                  "#FFA500",
                  "#FF4500",
                  "#8A2BE2",
                  "#00FF00",
                ][Math.floor(Math.random() * 5)],
                animation: `fall ${animationDuration}s linear ${delay}s`,
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <TooltipProvider>
      {renderConfetti()}
      {renderBetChips()}

      <div
        className="h-full flex flex-col"
        style={{
          backgroundImage: "linear-gradient(to bottom, #1a472a, #0d5522)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <header className="flex justify-between items-center p-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-black/50 text-white border-yellow-500/50 hover:bg-black/70"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>

          <div className="flex items-center gap-2">
            <div className="bg-black/50 text-white border border-yellow-500/50 rounded-md px-2 py-1 flex items-center">
              <Coins className="h-4 w-4 text-yellow-500 mr-1" />
              <span>{balance}</span>
            </div>

            {streak > 0 && (
              <div className="bg-black/50 text-white border border-yellow-500/50 rounded-md px-2 py-1 flex items-center">
                <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                <span>{streak}</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="bg-black/50 text-white border-yellow-500/50 hover:bg-black/70"
              onClick={toggleMusicMute}
            >
              {isMusicMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/50 text-white border-yellow-500/50 hover:bg-black/70"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 border-yellow-500/50 text-white">
                <DialogHeader>
                  <DialogTitle className="text-center text-yellow-500">
                    How to Play Blackjack
                  </DialogTitle>
                </DialogHeader>
                <div className="p-4 text-sm">
                  <h2 className="text-lg font-bold mb-2">Objective</h2>
                  <p className="mb-4">
                    Beat the dealer's hand without going over 21.
                  </p>

                  <h2 className="text-lg font-bold mb-2">Card Values</h2>
                  <ul className="list-disc list-inside mb-4">
                    <li>Aces: 1 or 11</li>
                    <li>Face cards: 10</li>
                    <li>Number cards: Face value</li>
                  </ul>

                  <h2 className="text-lg font-bold mb-2">Actions</h2>
                  <ul className="list-disc list-inside mb-4">
                    <li>
                      <strong>Hit:</strong> Take another card
                    </li>
                    <li>
                      <strong>Stand:</strong> End your turn
                    </li>
                    <li>
                      <strong>Double Down:</strong> Double bet, take one card
                    </li>
                    <li>
                      <strong>Split:</strong> Split identical cards into two
                      hands
                    </li>
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-between p-3 pt-6">
          <div className="mb-3 mt-5">
            <h2 className="text-lg font-bold text-white mb-2">Dealer</h2>
            {renderDealerCards()}
          </div>

          {renderInsurancePrompt()}
          {renderGameResult()}

          <div className="mb-3">
            <h2 className="text-lg font-bold text-white mb-2">Player</h2>
            {renderPlayerCards()}
            {splitHand.length > 0 && (
              <div className="mt-3">
                <h3 className="text-lg font-bold text-white mb-2">
                  Split Hand
                </h3>
                {renderSplitCards()}
              </div>
            )}
          </div>

          <div className="flex-grow flex items-center justify-center">
            <div
              ref={betAreaRef}
              className="flex justify-start items-center h-16 relative w-full"
            >
              {bet > 0 && gameState === "betting" && (
                <div className="bg-green-900/30 border border-yellow-500/30 rounded-full px-6 py-3 absolute left-[15%] bottom-0 transform -translate-x-1/2 z-0">
                  <span className="text-yellow-500 font-bold text-xl">
                    {bet}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto">{renderGameControls()}</div>
        </main>

        <style jsx global>{`
          @keyframes fall {
            0% {
              transform: translateY(-100px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </TooltipProvider>
  );
}
