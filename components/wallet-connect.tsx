"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Loader2, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type WalletType = "hashpack" | "metamask" | null

export function WalletConnect({ onConnect }: { onConnect: (walletType: WalletType) => void }) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [activeTab, setActiveTab] = useState("hedera")
  const [showPasswordPrompt, setShowPasswordPrompt] = useState<WalletType>(null)
  const [password, setPassword] = useState("")
  const { toast } = useToast()

  const handleConnectClick = (type: WalletType) => {
    // Show password prompt instead of connecting immediately
    setShowPasswordPrompt(type)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!showPasswordPrompt) return

    setIsConnecting(true)

    try {
      // Simulate wallet connection with password
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Any password is accepted for demo purposes
      if (password.length > 0) {
        toast({
          variant: "success",
          title: `${showPasswordPrompt === "hashpack" ? "HashPack" : "MetaMask"} Connected`,
          description: "Your wallet has been connected successfully",
        })

        // Call the onConnect callback with the wallet type
        onConnect(showPasswordPrompt)
      } else {
        toast({
          variant: "error",
          title: "Invalid Password",
          description: "Please enter your wallet password",
        })
      }
    } catch (error) {
      console.error("Wallet connection error:", error)
      toast({
        variant: "error",
        title: "Connection Failed",
        description: "Failed to connect to wallet. Please try again.",
      })
    } finally {
      setIsConnecting(false)
      setPassword("")
    }
  }

  const cancelPasswordPrompt = () => {
    setShowPasswordPrompt(null)
    setPassword("")
  }

  // If showing password prompt
  if (showPasswordPrompt) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Enter Wallet Password</CardTitle>
          <CardDescription>
            Enter your {showPasswordPrompt === "hashpack" ? "HashPack" : "MetaMask"} wallet password to connect
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter wallet password"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Note: This is a simulation. Any password will work for demo purposes.
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="w-full" disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={cancelPasswordPrompt} disabled={isConnecting}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
        <CardDescription>Connect your blockchain wallet to interact with Shillingi X</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hedera" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hedera">Hedera</TabsTrigger>
            <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
          </TabsList>
          <TabsContent value="hedera" className="space-y-4 mt-4">
            <Button
              className="w-full justify-between"
              onClick={() => handleConnectClick("hashpack")}
              disabled={isConnecting}
            >
              <div className="flex items-center">
                {/* Replace with actual HashPack logo in production */}
                <div className="w-6 h-6 mr-2 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  HP
                </div>
                HashPack
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </TabsContent>
          <TabsContent value="ethereum" className="space-y-4 mt-4">
            <Button
              className="w-full justify-between"
              onClick={() => handleConnectClick("metamask")}
              disabled={isConnecting}
            >
              <div className="flex items-center">
                {/* Replace with actual MetaMask logo in production */}
                <div className="w-6 h-6 mr-2 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  MM
                </div>
                MetaMask
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy
        </div>
      </CardFooter>
    </Card>
  )
}
