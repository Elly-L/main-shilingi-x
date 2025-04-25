"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

export default function LogoutPage() {
  const { signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    async function handleLogout() {
      try {
        const { error } = await signOut()
        if (error) {
          setError(error.message)
          toast({
            title: "Logout failed",
            description: error.message,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Logged out successfully",
            description: "You have been logged out of your account.",
          })
        }
      } catch (err) {
        console.error(err)
        setError("An unexpected error occurred")
        toast({
          title: "Logout failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoggingOut(false)
      }
    }

    handleLogout()
  }, [signOut, toast])

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <div className="flex flex-col items-center justify-center">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Coins className="h-8 w-8 text-primary" />
          <span className="font-bold text-2xl">Shillingi X</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Logging Out</CardTitle>
              <CardDescription className="text-center">
                {isLoggingOut ? "Please wait while we log you out..." : "You have been successfully logged out"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              {isLoggingOut ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <div className="p-4 bg-green-100 rounded-full">
                    <Coins className="h-12 w-12 text-primary" />
                  </div>
                </motion.div>
              )}

              {error && <div className="text-sm text-red-500 text-center mt-4">{error}</div>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button className="w-full" asChild disabled={isLoggingOut}>
                <Link href="/">Return to Home</Link>
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                <Link href="/auth/login" className="text-primary hover:underline">
                  Sign in to another account
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
