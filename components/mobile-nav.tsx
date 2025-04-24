"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Trophy, Coins, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/sounds";

export function MobileNav() {
  const pathname = usePathname();
  const { playSound } = useSound();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/achievements", icon: Trophy, label: "Achievements" },
    { href: "/shop", icon: Coins, label: "Shop" },
    { href: "/multiplayer", icon: Users, label: "Multiplayer" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const handleNavClick = () => {
    playSound("buttonClick");
  };

  return (
    <nav className="flex justify-around items-center h-16">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleNavClick}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              isActive ? "text-yellow-500" : "text-gray-400"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
