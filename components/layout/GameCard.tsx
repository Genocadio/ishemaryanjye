import * as React from "react"
import { cn } from "@/lib/utils"

interface CompactCardProps extends React.ComponentProps<"div"> {
  title?: string
}

function CompactCard({ className, title, children, ...props }: CompactCardProps) {
  return (
    <div
      data-slot="compact-card "
      className={cn(
        "bg-green-800 text-card-foreground flex flex-col rounded-xl border shadow-sm",
        className
      )}
      {...props}
    >

      <div className="px-0 py-2 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

export { CompactCard } 