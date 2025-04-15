import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { User, LogOut, LayoutDashboard } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
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
  const { data: session, status } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-8">
        <Link href={status === "authenticated" ? "/dashboard" : "/"}>
          <div className="mr-4 font-bold text-xl">Ishema Ryanjye</div>
        </Link>
        {variant === "home" && (
          <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
            {/* Navigation links can be added here */}
          </nav>
        )}
        <div className="ml-auto flex items-center space-x-4">
          {variant === "home" && (
            <Link href="/auth">
              <Button>{t("nav.getStarted")}</Button>
            </Link>
          )}
          {variant === "default" && (
            <>
              {status === "authenticated" ? (
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
                        <span className="hidden sm:inline">{session.user?.name}</span>
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
                      <div className="px-2 py-1.5">
                        <LanguageSelector />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => signOut()}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <LanguageSelector />
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