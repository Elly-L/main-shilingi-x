"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

interface AuthContextType {
  session: Session | null
  user: Session["user"] | null
  isLoading: boolean
  signUp: (email: string, password: string, fullName: string, phoneNumber: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
  updateProfile: (data: any) => Promise<any>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<Session["user"] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)
    }

    getSession()

    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)
    })
  }, [router])

  const signUp = async (email: string, password: string, fullName: string, phoneNumber: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
        },
      },
    })

    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const updateProfile = async (data: any) => {
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        bio: data.bio,
        country: data.country,
      },
    })

    return { error }
  }

  const value = {
    session,
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
