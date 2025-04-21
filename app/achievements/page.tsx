"use client"

import { useEffect } from "react"
import { BackgroundImage } from "@/components/ui/background-image"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Zap, Award, Target } from "lucide-react"
import { FallbackImage } from "@/components/fallback-image"
import { useSound } from "@/lib/sounds"
// Import the BackButton
import { BackButton } from "@/components/back-button"

export default function AchievementsPage() {
  const { playMusic, isMusicMuted, playSound } = useSound()

  useEffect(() => {
    // Start background music when the page loads
    if (!isMusicMuted) {
      playMusic("mainTheme")
    }
  }, [playMusic, isMusicMuted])

  // Sample achievements data
  const achievements = [
    {
      id: "first_win",
      name: "Beginner's Luck",
      description: "Win your first hand",
      icon: <Trophy className="h-6 w-6 text-yellow-500" />,
      image: "/images/first-win.png",
      progress: 1,
      target: 1,
      unlocked: true,
      category: "Basics",
    },
    {
      id: "high_roller",
      name: "High Roller",
      description: "Place a bet of 500 or more",
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      image: "/images/high-roller.png",
      progress: 1,
      target: 1,
      unlocked: true,
      category: "Betting",
    },
    {
      id: "winning_streak",
      name: "Hot Streak",
      description: "Win 3 hands in a row",
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      image: "/images/lucky-streak.png",
      progress: 2,
      target: 3,
      unlocked: false,
      category: "Winning",
    },
    {
      id: "blackjack_master",
      name: "Blackjack Master",
      description: "Get 5 blackjacks",
      icon: <Award className="h-6 w-6 text-yellow-500" />,
      image: "/images/blackjack-master.png",
      progress: 2,
      target: 5,
      unlocked: false,
      category: "Winning",
    },
    {
      id: "split_success",
      name: "Split Success",
      description: "Win both hands after splitting",
      icon: <Target className="h-6 w-6 text-yellow-500" />,
      image: "/images/split-success.png",
      progress: 0,
      target: 1,
      unlocked: false,
      category: "Advanced",
    },
    {
      id: "comeback_kid",
      name: "Comeback Kid",
      description: "Win after being down to less than 100 chips",
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      image: "/images/comeback-king.png",
      progress: 0,
      target: 1,
      unlocked: false,
      category: "Advanced",
    },
  ]

  // Group achievements by category
  const categories = achievements.reduce(
    (acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = []
      }
      acc[achievement.category].push(achievement)
      return acc
    },
    {} as Record<string, typeof achievements>,
  )

  return (
    <main className="min-h-screen relative">
      <BackgroundImage variant="achievements" />

      <div className="relative z-10 p-4">
        {/* Replace the existing Link+Button with BackButton */}
        <div className="flex justify-between items-center mb-6">
          <BackButton href="/" label="Back to Menu" />
          <h1 className="text-2xl font-bold text-white drop-shadow-glow">Achievements</h1>
          <div className="w-[72px]"></div> {/* Spacer for alignment */}
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {/* Achievement stats */}
          <Card className="bg-black/70 border-yellow-500/30 p-4 rounded-xl">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-yellow-500">
                  {achievements.filter((a) => a.unlocked).length}
                </div>
                <div className="text-sm text-gray-300">Unlocked</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{achievements.length}</div>
                <div className="text-sm text-gray-300">Total</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-500">
                  {Math.round((achievements.filter((a) => a.unlocked).length / achievements.length) * 100)}%
                </div>
                <div className="text-sm text-gray-300">Complete</div>
              </div>
            </div>
          </Card>

          {/* Achievement categories */}
          {Object.entries(categories).map(([category, categoryAchievements]) => (
            <div key={category} className="space-y-2">
              <h2 className="text-xl font-bold text-white">{category}</h2>

              <Card className="bg-black/70 border-yellow-500/30 p-4 space-y-4 rounded-xl">
                {categoryAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-4">
                    <div className={`p-1 rounded-full ${achievement.unlocked ? "bg-yellow-500/20" : "bg-gray-800"}`}>
                      <FallbackImage
                        src={achievement.image}
                        alt={achievement.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                        fallbackClassName="rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className={achievement.unlocked ? "text-yellow-500 font-bold" : "text-gray-300"}>
                          {achievement.name}
                        </h4>
                        <span className="text-sm text-gray-400">
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{achievement.description}</p>
                      <Progress value={(achievement.progress / achievement.target) * 100} className="h-1 mt-2" />
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
