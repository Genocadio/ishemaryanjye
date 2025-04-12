"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function DecorativeCards() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Top right card */}
      <div className="absolute top-0 right-0 w-48 h-64 -translate-y-1/2 translate-x-1/2 rotate-12 animate-float">
        <div className="relative w-full h-full">
          <Image
            src="/cards/hearts/Q.webp"
            alt="Decorative card"
            fill
            className="object-cover rounded-lg shadow-xl"
          />
        </div>
      </div>

      {/* Bottom left card */}
      <div className="absolute bottom-0 left-0 w-48 h-64 translate-y-1/2 -translate-x-1/2 -rotate-12 animate-float-delayed">
        <div className="relative w-full h-full">
          <Image
            src="/cards/spades/K.webp"
            alt="Decorative card"
            fill
            className="object-cover rounded-lg shadow-xl"
          />
        </div>
      </div>
    </>
  )
} 