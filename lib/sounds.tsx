"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { useMusic } from "@/contexts/music-context";

// Sound types
type SoundType =
  | "cardDeal"
  | "cardFlip"
  | "chipStack"
  | "chipSingle"
  | "win"
  | "lose"
  | "push"
  | "buttonClick";

// Sound files mapping
const SOUND_FILES: Record<SoundType, string> = {
  cardDeal: "/sounds/card-deal.mp3",
  cardFlip: "/sounds/card-flip.mp3",
  chipStack: "/sounds/chip-stack.mp3",
  chipSingle: "/sounds/chip-single.mp3",
  win: "/sounds/win.mp3",
  lose: "/sounds/lose.mp3",
  push: "/sounds/push.mp3",
  buttonClick: "/sounds/button-click.mp3",
};

// Context for sound system
type SoundContextType = {
  playCardDeal: () => void;
  playCardFlip: () => void;
  playChipStack: () => void;
  playChipSingle: () => void;
  playWin: () => void;
  playLose: () => void;
  playPush: () => void;
  playButtonClick: () => void;
  isSoundMuted: boolean;
  toggleSoundMute: () => void;
  setSoundVolume: (volume: number) => void;
  soundVolume: number;
  playSound: (sound: SoundType) => void;
  playMusic: (music: string) => void;
  stopMusic: () => void;
  isMusicMuted: boolean;
  toggleMusicMute: () => void;
  setMusicVolume: (volume: number) => void;
  musicVolume: number;
  userInteracted: boolean;
  initializeAudio: () => void;
  isAudioReady: () => boolean;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Sound provider component
export function SoundProvider({ children }: { children: ReactNode }) {
  const music = useMusic();
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [soundVolume, setSoundVolumeState] = useState(0.7);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    cardDeal: null,
    cardFlip: null,
    chipStack: null,
    chipSingle: null,
    win: null,
    lose: null,
    push: null,
    buttonClick: null,
  });

  // Initialize audio on user interaction
  const initializeAudio = () => {
    if (userInteracted) return;

    setUserInteracted(true);

    // Create audio elements
    Object.entries(SOUND_FILES).forEach(([key, src]) => {
      const soundKey = key as SoundType;
      const audio = new Audio();
      audio.src = src;
      audio.volume = soundVolume;
      audio.preload = "auto";
      audioRefs.current[soundKey] = audio;

      // Try to play and immediately pause to enable audio
      audio
        .play()
        .catch(() => {})
        .finally(() => {
          audio.pause();
          audio.currentTime = 0;
        });
    });

    setIsLoaded(true);
  };

  // Check if audio is ready
  const isAudioReady = () => {
    return userInteracted && isLoaded;
  };

  // Add click listener to initialize audio
  useEffect(() => {
    const handleInteraction = () => {
      initializeAudio();
    };

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
    };
  }, []);

  // Play sound function
  const playSound = (sound: SoundType) => {
    if (isSoundMuted || !userInteracted) return;

    const audio = audioRefs.current[sound];
    if (audio) {
      try {
        // Create a clone for overlapping sounds
        const clone = audio.cloneNode() as HTMLAudioElement;
        clone.volume = soundVolume;
        clone.play().catch((e) => {
          console.error("Error playing sound:", e);
        });
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    }
  };

  // Toggle sound mute function
  const toggleSoundMute = () => {
    setIsSoundMuted((prev) => !prev);
  };

  // Set sound volume function
  const setSoundVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setSoundVolumeState(clampedVolume);

    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) {
        audio.volume = clampedVolume;
      }
    });
  };

  // Delegate music functions to the music context
  const playMusic = music.playMusic;
  const stopMusic = music.stopMusic;
  const isMusicMuted = music.isMuted;
  const toggleMusicMute = music.toggleMute;
  const setMusicVolume = music.setVolume;
  const musicVolume = music.volume;

  return (
    <SoundContext.Provider
      value={{
        playCardDeal: () => playSound("cardDeal"),
        playCardFlip: () => playSound("cardFlip"),
        playChipStack: () => playSound("chipStack"),
        playChipSingle: () => playSound("chipSingle"),
        playWin: () => playSound("win"),
        playLose: () => playSound("lose"),
        playPush: () => playSound("push"),
        playButtonClick: () => playSound("buttonClick"),
        isSoundMuted,
        toggleSoundMute,
        setSoundVolume,
        soundVolume,
        playSound,
        playMusic,
        stopMusic,
        isMusicMuted,
        toggleMusicMute,
        setMusicVolume,
        musicVolume,
        userInteracted,
        initializeAudio,
        isAudioReady,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

// Hook to use sound system - named export for useSounds
export function useSounds() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSounds must be used within a SoundProvider");
  }
  return context;
}

// Hook to use sound system - named export for useSound (alias for compatibility)
export function useSound() {
  return useSounds();
}
