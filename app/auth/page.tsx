"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { ArrowLeft, Mail, Lock, User, Shield, AtSign, Phone } from "lucide-react"
import { Header } from "@/components/layout/header"
import { toast } from 'sonner'
import { signIn, useSession } from "next-auth/react"

export default function AuthPage() {
  const { t } = useLanguage()
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/game-selection"
  const players = searchParams.get("players") || ""
  const defaultTab = searchParams.get("tab") || "signin"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab as string)

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      if (players) {
        router.push(`/game?players=${players}`)
      } else {
        router.push(redirectTo)
      }
    }
  }, [status, router, players, redirectTo])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // Store username in localStorage
      localStorage.setItem('username', name)
      
      toast.success('Login successful!')
      
      if (players) {
        router.push(`/game?players=${players}`)
      } else {
        router.push(redirectTo)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          username,
          phone
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Store username in localStorage
      localStorage.setItem('username', name)

      // Auto-login after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      toast.success('Registration successful!')
      
      if (players) {
        router.push(`/game?players=${players}`)
      } else {
        router.push(redirectTo)
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="home" />
      <main className="flex-1 container max-w-5xl mx-auto px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t("auth.title")}</h1>
              <p className="text-gray-500 mt-2 text-lg">{t("auth.subtitle")}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border border-green-100">
              <h2 className="font-semibold text-lg flex items-center mb-3">
                <Shield className="mr-2 h-5 w-5 text-green-600" />
                {t("auth.privacyNotice")}
              </h2>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                    1
                  </span>
                  <span>{t("features.purpose.description")}</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                    2
                  </span>
                  <span>{t("features.experts.description")}</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t("auth.title")}</CardTitle>
                <CardDescription>{players ? t("auth.subtitle") : t("nav.getStarted")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin">{t("auth.signin")}</TabsTrigger>
                    <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("auth.email")}</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder={t("auth.emailPlaceholder")}
                            className="pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="password">{t("auth.password")}</Label>
                          <Link href="#" className="text-xs text-green-600 hover:underline">
                            {t("auth.forgotPassword")}
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type="password"
                            placeholder={t("auth.passwordPlaceholder")}
                            className="pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                        {isLoading ? "Loading..." : t("auth.signInButton")}
                      </Button>

                      <div className="text-center text-sm">
                        <span className="text-gray-500">{t("auth.noAccount")}</span>{" "}
                        <Link
                          href="#register"
                          className="text-green-600 hover:underline"
                          onClick={(e) => {
                            e.preventDefault()
                            setActiveTab("register")
                          }}
                        >
                          {t("auth.register")}
                        </Link>
                      </div>
                    </form>
                  </TabsContent>
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("auth.name")}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="name"
                            type="text"
                            placeholder={t("auth.namePlaceholder")}
                            className="pl-10"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">{t("auth.username")}</Label>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="username"
                            type="text"
                            placeholder={t("auth.usernamePlaceholder")}
                            className="pl-10"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t("auth.phone")}</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder={t("auth.phonePlaceholder")}
                            className="pl-10"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">{t("auth.email")}</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder={t("auth.emailPlaceholder")}
                            className="pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">{t("auth.password")}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-password"
                            type="password"
                            placeholder={t("auth.passwordPlaceholder")}
                            className="pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">{t("auth.confirmPassword")}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder={t("auth.passwordPlaceholder")}
                            className="pl-10"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isLoading || password !== confirmPassword}
                      >
                        {isLoading ? "Loading..." : t("auth.registerButton")}
                      </Button>

                      <div className="text-center text-sm">
                        <span className="text-gray-500">{t("auth.haveAccount")}</span>{" "}
                        <Link
                          href="#signin"
                          className="text-green-600 hover:underline"
                          onClick={(e) => {
                            e.preventDefault()
                            setActiveTab("signin")
                          }}
                        >
                          {t("auth.signin")}
                        </Link>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="text-xs text-center text-gray-500 flex justify-center">
                {t("auth.privacyNotice")}
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <footer className="py-6 border-t">
        <div className="container flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">{t("footer.copyright")}</p>
        </div>
      </footer>
    </div>
  )
}
