'use client'

import { SessionProvider } from "next-auth/react"
import { LanguageProvider } from "@/contexts/language-context"
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
        <Toaster richColors position="top-right" />
      </LanguageProvider>
    </SessionProvider>
  )
} 