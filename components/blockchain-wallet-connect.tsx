"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, CheckCircle, Wallet } from "lucide-react"
import { contractService } from "@/lib/contractService"
import { hederaIdToAddress, addressToHederaId } from "@/lib/hederaUtils"
import { ethers } from "ethers"

interface BlockchainWalletConnectProps {
  onConnect?: (walletInfo: { accountId: string; address: string }) => void
}

export function BlockchainWalletConnect({ onConnect }: BlockchainWalletConnectProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("hashpack")
  const [accountId, setAccountId] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [walletInfo, setWalletInfo] = useState<{ accountId: string; address: string } | null>(null)

  const handleConnect = async () => {
    if (!accountId) {
      setError("Please enter your Hedera account ID")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // For HashPack, we'll just validate the account ID format
      if (activeTab === "hashpack") {
        // Validate Hedera account ID format (0.0.12345)
        const isValidFormat = /^0\.0\.\d+$/.test(accountId)
        if (!isValidFormat) {
          throw new Error("Invalid Hedera account ID format. Expected format: 0.0.12345")
        }

        // Convert to Ethereum address format for the contract
        const address = hederaIdToAddress(accountId)

        // Check if the contract is connected
        const isContractConnected = await contractService.isConnected()
        if (!isContractConnected) {
          throw new Error("Unable to connect to the blockchain contract")
        }

        // Set wallet info
        const walletData = { accountId, address }
        setWalletInfo(walletData)
        setIsConnected(true)

        toast({
          title: "Wallet Connected",
          description: `Successfully connected to Hedera account ${accountId}`,
        })

        if (onConnect) {
          onConnect(walletData)
        }
      }
      // For MetaMask or direct private key, we'd need additional logic
      else if (activeTab === "privatekey") {
        if (!privateKey) {
          throw new Error("Please enter your private key")
        }

        // Validate private key format
        if (!privateKey.match(/^[0-9a-fA-F]{64}$/)) {
          throw new Error("Invalid private key format")
        }

        // Create a wallet from the private key to get the address
        const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
        const wallet = new ethers.Wallet(privateKey, provider)
        const address = wallet.address

        // Convert Ethereum address to Hedera account ID
        const derivedAccountId = addressToHederaId(address)

        // Set wallet info
        const walletData = { accountId: derivedAccountId, address }
        setWalletInfo(walletData)
        setIsConnected(true)

        toast({
          title: "Wallet Connected",
          description: `Successfully connected with private key to account ${derivedAccountId}`,
        })

        if (onConnect) {
          onConnect(walletData)
        }
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err)
      setError(err.message || "Failed to connect wallet")
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: err.message || "Failed to connect wallet",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setWalletInfo(null)
    setAccountId("")
    setPrivateKey("")

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  if (isConnected && walletInfo) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Connected Wallet</CardTitle>
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">Connected</span>
            </div>
          </div>
          <CardDescription>Your blockchain wallet is connected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account ID:</span>
              <span className="text-sm font-medium">{walletInfo.accountId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Address:</span>
              <span className="text-xs font-mono truncate max-w-[200px]">{walletInfo.address}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={handleDisconnect}>
            Disconnect Wallet
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Blockchain Wallet</CardTitle>
        <CardDescription>Connect your Hedera wallet to enable blockchain transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hashpack">HashPack</TabsTrigger>
            <TabsTrigger value="privatekey">Private Key</TabsTrigger>
          </TabsList>

          <TabsContent value="hashpack" className="space-y-4 mt-4">
            <div className="flex justify-center mb-4">
              <img src="/images/hashpack-logo.svg" alt="HashPack Logo" className="h-12 w-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId">Hedera Account ID</Label>
              <Input
                id="accountId"
                placeholder="0.0.12345"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Enter your Hedera account ID (e.g., 0.0.12345)</p>
            </div>
          </TabsContent>

          <TabsContent value="privatekey" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="privateKey">Private Key</Label>
              <Input
                id="privateKey"
                type="password"
                placeholder="Enter your private key"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your Hedera private key. This is stored locally and never sent to our servers.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleConnect} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
