import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(req: NextRequest) {
  // For now, we'll let the client-side handle authentication
  // The HPO authentication context will handle redirects
  return NextResponse.next()
}

export const config = {
  matcher: [ // This will protect all game routes
    "/profile",
    "/dashboard",
    // Add other protected routes here
  ],
} 