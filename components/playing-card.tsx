"use client";

import { cn } from "@/lib/utils";

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

interface PlayingCardProps {
  suit: Suit;
  rank: Rank;
  hidden?: boolean;
  className?: string;
}

export function PlayingCard({
  suit,
  rank,
  hidden = false,
  className,
}: PlayingCardProps) {
  // Determine card color based on suit
  const isRed = suit === "hearts" || suit === "diamonds";

  // Get suit symbol
  const getSuitSymbol = (suit: Suit) => {
    switch (suit) {
      case "hearts":
        return "♥";
      case "diamonds":
        return "♦";
      case "clubs":
        return "♣";
      case "spades":
        return "♠";
      default:
        return suit;
    }
  };

  const suitSymbol = getSuitSymbol(suit);

  return (
    <div
      className={cn(
        "w-16 h-24 rounded-md flex flex-col justify-between p-2 select-none shadow-md transform transition-transform duration-300 hover:scale-105",
        hidden
          ? "bg-gradient-to-br from-blue-800 to-blue-900 border-2 border-white/20"
          : "bg-white border border-gray-300",
        className
      )}
    >
      {hidden ? (
        <div className="flex items-center justify-center h-full text-white text-2xl font-bold">
          ?
        </div>
      ) : (
        <>
          <div
            className={cn(
              "text-lg font-bold",
              isRed ? "text-red-600" : "text-black"
            )}
          >
            {rank}
          </div>
          <div
            className={cn(
              "text-center text-2xl",
              isRed ? "text-red-600" : "text-black"
            )}
          >
            {suitSymbol}
          </div>
          <div
            className={cn(
              "text-lg font-bold self-end",
              isRed ? "text-red-600" : "text-black"
            )}
          >
            {rank}
          </div>
        </>
      )}
    </div>
  );
}
