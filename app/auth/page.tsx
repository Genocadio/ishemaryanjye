"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
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
import { useHPOAuth } from "@/contexts/hpo-auth-context"

function AuthContent() {
  const { t } = useLanguage()
  const { player, isAuthenticated, isLoading: authLoading, login, register } = useHPOAuth()
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
  const [ageGroup, setAgeGroup] = useState("")
  const [gender, setGender] = useState("")
  const [province, setProvince] = useState("")
  const [district, setDistrict] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab as string)

  // Redirect if already authenticated
  useEffect(() => {
    if (authLoading) return // Don't redirect while checking auth status
    
    if (isAuthenticated && player) {
      if (players) {
        router.push(`/game?players=${players}`)
      } else {
        router.push(redirectTo)
      }
    }
  }, [authLoading, isAuthenticated, player, router, players, redirectTo])

  // Reset district when province changes
  useEffect(() => {
    setDistrict("")
  }, [province])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await login({
        username,
        password
      })
      
      toast.success('Login successful!')
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await register({
        player_name: name,
        username,
        email: email || undefined, // Only send if provided
        phone,
        password,
        password_confirm: confirmPassword,
        age_group: ageGroup || undefined,
        gender: gender || undefined,
        province: province || undefined,
        district: district || undefined
      })

      toast.success('Registration successful!')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header variant="home" />
        <main className="flex-1 bg-gradient-to-b from-green-50 to-white">
          <div className="container max-w-5xl mx-auto px-4 md:px-8 py-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Checking authentication...</p>
            </div>
          </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="home" />
      <main className="flex-1 bg-gradient-to-b from-green-50 to-white">
        <div className="container max-w-5xl mx-auto px-4 md:px-8 py-12">
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
                        <Label htmlFor="username">{t("auth.username")}</Label>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            className="pl-10"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                        {isSubmitting ? "Loading..." : t("auth.signInButton")}
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
                      <div className="text-sm text-gray-600 mb-4">
                        <span className="text-red-500">*</span> Required fields
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("auth.name")} <span className="text-red-500">*</span></Label>
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
                        <Label htmlFor="username">{t("auth.username")} <span className="text-red-500">*</span></Label>
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
                        <Label htmlFor="phone">{t("auth.phone")} <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder={t("auth.phonePlaceholder")}
                            className="pl-10"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      {/* Optional Fields */}
                      <div className="space-y-2">
                        <Label htmlFor="age-group">Age Group (Optional)</Label>
                        <select
                          id="age-group"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={ageGroup}
                          onChange={(e) => setAgeGroup(e.target.value)}
                        >
                          <option value="">Select Age Group</option>
                          <option value="10-14">10-14</option>
                          <option value="15-19">15-19</option>
                          <option value="20-24">20-24</option>
                          <option value="25+">25+</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender (Optional)</Label>
                        <select
                          id="gender"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="province">Province (Optional)</Label>
                        <select
                          id="province"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                        >
                          <option value="">Select Province</option>
                          <option value="Kigali City">Kigali City</option>
                          <option value="Northern Province">Northern Province</option>
                          <option value="Southern Province">Southern Province</option>
                          <option value="Eastern Province">Eastern Province</option>
                          <option value="Western Province">Western Province</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="district">District (Optional)</Label>
                        <select
                          id="district"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          disabled={!province}
                        >
                          <option value="">Select District</option>
                          {province === "Kigali City" && (
                            <>
                              <option value="Gasabo">Gasabo</option>
                              <option value="Kicukiro">Kicukiro</option>
                              <option value="Nyarugenge">Nyarugenge</option>
                            </>
                          )}
                          {province === "Northern Province" && (
                            <>
                              <option value="Burera">Burera</option>
                              <option value="Gakenke">Gakenke</option>
                              <option value="Gicumbi">Gicumbi</option>
                              <option value="Musanze">Musanze</option>
                              <option value="Rulindo">Rulindo</option>
                            </>
                          )}
                          {province === "Southern Province" && (
                            <>
                              <option value="Gisagara">Gisagara</option>
                              <option value="Huye">Huye</option>
                              <option value="Kamonyi">Kamonyi</option>
                              <option value="Muhanga">Muhanga</option>
                              <option value="Nyamagabe">Nyamagabe</option>
                              <option value="Nyanza">Nyanza</option>
                              <option value="Nyaruguru">Nyaruguru</option>
                              <option value="Ruhango">Ruhango</option>
                            </>
                          )}
                          {province === "Eastern Province" && (
                            <>
                              <option value="Bugesera">Bugesera</option>
                              <option value="Gatsibo">Gatsibo</option>
                              <option value="Kayonza">Kayonza</option>
                              <option value="Kirehe">Kirehe</option>
                              <option value="Ngoma">Ngoma</option>
                              <option value="Nyagatare">Nyagatare</option>
                              <option value="Rwamagana">Rwamagana</option>
                            </>
                          )}
                          {province === "Western Province" && (
                            <>
                              <option value="Karongi">Karongi</option>
                              <option value="Ngororero">Ngororero</option>
                              <option value="Nyabihu">Nyabihu</option>
                              <option value="Nyamasheke">Nyamasheke</option>
                              <option value="Rubavu">Rubavu</option>
                              <option value="Rusizi">Rusizi</option>
                              <option value="Rutsiro">Rutsiro</option>
                            </>
                          )}
                        </select>
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
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">{t("auth.password")} <span className="text-red-500">*</span></Label>
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
                        <Label htmlFor="confirm-password">{t("auth.confirmPassword")} <span className="text-red-500">*</span></Label>
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
                        disabled={isSubmitting || password !== confirmPassword}
                      >
                        {isSubmitting ? "Loading..." : t("auth.registerButton")}
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

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
}
