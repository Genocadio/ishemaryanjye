'use client'

import { LanguageProvider } from "@/contexts/language-context"
import { HPOAuthProvider } from "@/contexts/hpo-auth-context"
import { Toaster } from 'sonner'
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

// Notification sound types
export type NotificationType = "connect" | "disconnect" | "play";

const soundMap: Record<NotificationType, string> = {
  connect: "/sounds/connect.wav",
  disconnect: "/sounds/disconnect.wav",
  play: "/sounds/play.mp3",
};

interface NotificationSoundContextProps {
  play: (type: NotificationType) => void;
  muted: boolean;
  toggleMute: () => void;
}

const NotificationSoundContext = createContext<NotificationSoundContextProps | undefined>(undefined);

export const NotificationSoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = (type: NotificationType) => {
    if (muted) return;
    const src = soundMap[type];
    if (src) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current = new Audio(src);
      audioRef.current.play();
    }
  };

  const toggleMute = () => setMuted((m) => !m);

  return (
    <NotificationSoundContext.Provider value={{ play, muted, toggleMute }}>
      {children}
    </NotificationSoundContext.Provider>
  );
};

export const useNotificationSound = () => {
  const ctx = useContext(NotificationSoundContext);
  if (!ctx) throw new Error("useNotificationSound must be used within NotificationSoundProvider");
  return ctx;
};

function SessionMonitor() {
  // This component is no longer needed with HPO auth
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HPOAuthProvider>
      <LanguageProvider>
        <NotificationSoundProvider>
          <Toaster position="top-center" richColors />
          <SessionMonitor />
          {children}
        </NotificationSoundProvider>
      </LanguageProvider>
    </HPOAuthProvider>
  )
}