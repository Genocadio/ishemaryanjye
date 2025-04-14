import CardPreloader from "@/components/layout/CardPreloader";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CardPreloader />
      {children}
    </>
  )
} 