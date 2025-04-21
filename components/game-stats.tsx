"use client";

import { Badge } from "@/components/ui/badge";
import { Coins, Award, Hash } from "lucide-react";

interface GameStatsProps {
  balance: number;
  bet: number;
  handsPlayed: number;
  streak: number;
}

export function GameStats({
  balance,
  bet,
  handsPlayed,
  streak,
}: GameStatsProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className="bg-black/50 text-white border-yellow-500/50 flex items-center gap-1"
      >
        <Coins className="h-3 w-3 text-yellow-500" />
        <span>{balance}</span>
      </Badge>

      {streak > 0 && (
        <Badge
          variant="outline"
          className="bg-black/50 text-white border-green-500/50 flex items-center gap-1"
        >
          <Award className="h-3 w-3 text-green-500" />
          <span>Streak: {streak}</span>
        </Badge>
      )}

      <Badge
        variant="outline"
        className="bg-black/50 text-white border-blue-500/50 flex items-center gap-1"
      >
        <Hash className="h-3 w-3 text-blue-500" />
        <span>Hands: {handsPlayed}</span>
      </Badge>
    </div>
  );
}
