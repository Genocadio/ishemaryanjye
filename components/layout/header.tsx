"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { User, LogOut, LayoutDashboard } from "lucide-react"
import { useHPOAuth } from "@/contexts/hpo-auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  variant?: "home" | "default"
}

export function Header({ variant = "default" }: HeaderProps) {
  const { t } = useLanguage()
  const { player, isAuthenticated, isLoading, logout } = useHPOAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center px-4 md:px-8">
        <Link href={isAuthenticated ? "/dashboard" : "/"}>
          <img src="/HPO.svg" alt="Ishema Ryanjye" className="mr-4 h-8 w-auto" />
        </Link>
        {variant === "home" && (
          <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
            {/* Navigation links can be added here */}
          </nav>
        )}
        <div className="ml-auto flex items-center space-x-4">
          {/* Language selector is always available */}
          <LanguageSelector />
          
          {variant === "home" && (
            <Link href="/auth">
              <Button>{t("nav.getStarted")}</Button>
            </Link>
          )}
          {variant === "default" && (
            <>
              {isLoading ? (
                // Show loading state to prevent flash
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
              ) : isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">{player?.player_name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => logout()}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="outline" size="sm" className="h-8">
                      {t("auth.signin")}
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
} 