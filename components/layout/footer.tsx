import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col sm:flex-row justify-between items-center px-4 md:px-8 h-16">
        <p className="text-xs text-gray-500">{t("footer.copyright")}</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            {t("footer.terms")}
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            {t("footer.privacy")}
          </Link>
        </nav>
      </div>
    </footer>
  )
} 