'use client'

import { SessionProvider } from "next-auth/react"
import { LanguageProvider } from "@/contexts/language-context"
import { Toaster } from 'sonner'
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Session } from "next-auth"
import { useSession } from "next-auth/react"

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
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      try {
        localStorage.setItem('id', session.user.id)
        if (session.user.name) localStorage.setItem('username', session.user.username || session.user.name)
      } catch (_err) {
        // Ignore storage errors (e.g., in private mode)
      }
    } else if (status === "unauthenticated") {
      try {
        localStorage.removeItem('id')
        localStorage.removeItem('username')
      } catch (_err) {
        // Ignore
      }
    }
  }, [status, session])

  return null
}

export function Providers({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  return (
    <SessionProvider session={session ?? undefined} refetchOnWindowFocus={false}>
      <LanguageProvider>
        <NotificationSoundProvider>
          <Toaster position="top-center" richColors />
          <SessionMonitor />
          {children}
        </NotificationSoundProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}