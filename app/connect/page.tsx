"use client"

import { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { Loader2 } from "lucide-react"
import { SupportChat } from "@/components/support-chat"
import { Header } from "@/components/layout/header"
import { Input } from "@/components/ui/input"

function ConnectContent() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [matchType, setMatchType] = useState<"join" | null>(null)
  const [joinCode, setJoinCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resumeInviteCode, setResumeInviteCode] = useState<string | null>(null)

  // Function to check for resume data
  const checkForResumeData = () => {
    if (typeof window !== 'undefined') {
      // Check for regular player resume data
      const code = localStorage.getItem('incompleteInviteCode')
      const matchId = localStorage.getItem('incompleteMatchId')
      if (code && matchId) {
        setResumeInviteCode(code)
        return
      }
      
      // Check for match creator resume data
      const matchCreatorData = localStorage.getItem('matchCreatorData')
      if (matchCreatorData) {
        try {
          const parsed = JSON.parse(matchCreatorData)
          // For single player games (teamSize = 1), use team2InviteCode, otherwise use team1InviteCode
          const inviteCode = parsed.teamSize === 1 ? parsed.team2InviteCode : parsed.team1InviteCode
          if (inviteCode && parsed.matchId) {
            setResumeInviteCode(inviteCode)
          }
        } catch (error) {
          console.error("Error parsing match creator data:", error)
          localStorage.removeItem('matchCreatorData')
        }
      } else {
        // No match creator data found, clear resume code
        setResumeInviteCode(null)
      }
    }
  }

  useEffect(() => {
    checkForResumeData()
  }, [])

  // Listen for storage changes and page visibility to detect when localStorage is cleared
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'matchCreatorData' || e.key === 'incompleteInviteCode' || e.key === 'incompleteMatchId') {
        console.log('Storage changed, rechecking resume data:', e.key, e.newValue)
        checkForResumeData()
      }
    }

    // Check when page becomes visible (user navigates back to this tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, rechecking resume data')
        checkForResumeData()
      }
    }

    // Check on focus (when user comes back to tab)
    const handleFocus = () => {
      console.log('Window focused, rechecking resume data')
      checkForResumeData()
    }

    window.addEventListener('storage', handleStorageChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const handleCreateMatch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const players = Number.parseInt(searchParams.get("players") || "2")
      const teamSize = players / 2

      const response = await fetch(`${process.env.NEXT_PUBLIC_WS_URL}/create-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamSize }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to create match: ${errorData}`)
      }

      const data = await response.json()
      const params = new URLSearchParams({
        matchId: data.matchId,
        team1InviteCode: data.team1.inviteCode,
        team2InviteCode: data.team2.inviteCode,
        teamSize: teamSize.toString(),
      })
      router.push(`/multiplayer?${params.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.")
      setIsLoading(false)
    }
  }

  const handleJoinWithCode = () => {
    if (!joinCode.trim()) return

    const params = new URLSearchParams({
      inviteCode: joinCode.trim(),
    })
    router.push(`/multiplayer?${params.toString()}`)
  }

  if (matchType === "join") {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gradient-to-b from-green-50 to-white">
          <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t("connect.joinMatch")}</CardTitle>
              <CardDescription>{t("connect.enterCode")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder={t("connect.connectionCode")}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
              <Button onClick={handleJoinWithCode} className="w-full">
                {t("connect.join")}
              </Button>
              <Button variant="outline" onClick={() => setMatchType(null)} className="w-full mt-2">
                {t("common.back")}
              </Button>
            </CardContent>
          </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("connect.title")}</CardTitle>
            <CardDescription>{t("connect.description")}</CardDescription>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {resumeInviteCode && (
              <div className="mt-4">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    setError(null)
                    
                    // Check if this is a match creator resume
                    const matchCreatorData = localStorage.getItem('matchCreatorData')
                    if (matchCreatorData) {
                      try {
                        const parsed = JSON.parse(matchCreatorData)
                        if (parsed.matchId && parsed.team1InviteCode && parsed.team2InviteCode) {
                          // This is a match creator - redirect with full parameters
                          const params = new URLSearchParams({
                            matchId: parsed.matchId,
                            team1InviteCode: parsed.team1InviteCode,
                            team2InviteCode: parsed.team2InviteCode,
                            teamSize: parsed.teamSize.toString(),
                          })
                          router.push(`/multiplayer?${params.toString()}`)
                          return
                        }
                      } catch (error) {
                        console.error("Error parsing match creator data for resume:", error)
                      }
                    }
                    
                    // Regular player resume
                    router.push(`/multiplayer?inviteCode=${resumeInviteCode}`)
                  }}
                >
                  Resume Game
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button onClick={handleCreateMatch} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Creating..." : t("connect.createMatch")}
            </Button>
            <Button onClick={() => setMatchType("join")} variant="outline" disabled={isLoading}>
              {t("connect.joinMatch")}
            </Button>
          </CardContent>
        </Card>
        </div>
      </main>
      <SupportChat />
    </div>
  )
}

export default function ConnectPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConnectContent />
    </Suspense>
  )
}
