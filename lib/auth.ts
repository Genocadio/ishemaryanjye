import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/user"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      username?: string
      phone?: string
    }
  }
  interface User {
    id: string
    name: string
    email: string
    username?: string
    phone?: string
  }
}

// Extend the built-in JWT types
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name: string
    email: string
    username?: string
    phone?: string
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required")
          }

          await connectDB()

          const user = await User.findOne({ email: credentials.email.toLowerCase() })
          if (!user) {
            throw new Error("Invalid email or password")
          }

          const isPasswordValid = await user.comparePassword(credentials.password)
          if (!isPasswordValid) {
            throw new Error("Invalid email or password")
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            username: user.username,
            phone: user.phone
          }
        } catch (error) {
          console.error('Authentication error:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        if (user.username) token.username = user.username
        if (user.phone) token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        if (token.username) session.user.username = token.username
        if (token.phone) session.user.phone = token.phone
      }
      return session
    }
  },
  debug: process.env.NODE_ENV === 'development'
} 