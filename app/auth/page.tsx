"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Coins, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { WalletConnect } from "@/components/wallet-connect"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AuthPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [activeTab, setActiveTab] = useState("wallet")
  const router = useRouter()
  const { toast } = useToast()

  const handleConnect = (type: string) => {
    setIsConnecting(true)
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false)
      toast({
        variant: "success",
        title: "Wallet Connected",
        description: `Your ${type} wallet has been connected successfully`,
      })
      router.push("/dashboard")
    }, 2000)
  }

  const handleWalletConnect = (walletType: "hashpack" | "metamask" | null) => {
    if (walletType) {
      handleConnect(walletType === "hashpack" ? "HashPack" : "MetaMask")
    }
  }

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Coins className="h-8 w-8 text-primary" />
          <span className="font-bold text-2xl">Shillingi X</span>
        </Link>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Shillingi X</CardTitle>
            <CardDescription>Connect your wallet or sign in to start investing</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="wallet" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="wallet">Wallet</TabsTrigger>
                <TabsTrigger value="social">Social Login</TabsTrigger>
              </TabsList>
              <TabsContent value="wallet" className="mt-4">
                <WalletConnect onConnect={handleWalletConnect} />
              </TabsContent>
              <TabsContent value="social" className="space-y-4 mt-4">
                <Button
                  className="w-full justify-between"
                  onClick={() => handleConnect("google")}
                  disabled={isConnecting}
                >
                  <div className="flex items-center">
                    <Image
                      src="/placeholder.svg?height=24&width=24"
                      alt="Google"
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                    Continue with Google
                  </div>
                  {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </Button>

                <Button
                  className="w-full justify-between"
                  onClick={() => handleConnect("twitter")}
                  disabled={isConnecting}
                >
                  <div className="flex items-center">
                    <Image
                      src="/placeholder.svg?height=24&width=24"
                      alt="Twitter"
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                    Continue with Twitter
                  </div>
                  {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or use email</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              By connecting, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
