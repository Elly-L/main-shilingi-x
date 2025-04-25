"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { AdminSidebar } from "../components/admin-sidebar"
import { AdminHeader } from "../components/admin-header"
import { supabase } from "@/lib/supabase"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        if (!isLoading) {
          router.push("/moneymakers/login")
        }
        return
      }

      try {
        const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (error) {
          console.error("Error checking admin status:", error)
          router.push("/moneymakers/login")
          return
        }

        if (data?.role !== "admin") {
          router.push("/dashboard")
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error("Error:", error)
        router.push("/moneymakers/login")
      } finally {
        setCheckingAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user, isLoading, router])

  if (isLoading || checkingAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
