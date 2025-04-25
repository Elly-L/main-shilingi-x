"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, ArrowUpRight, Plus, Minus } from "lucide-react"
import { contractService } from "@/lib/contractService"
import { BlockchainWalletConnect } from "./blockchain-wallet-connect"

interface BlockchainBondPurchaseProps {
  bondId: string
  bondName: string
  bondType: string
  price: number
  interestRate: number
  maturityDate?: string
  onPurchaseComplete?: () => void
}

export function BlockchainBondPurchase({
  bondId,
  bondName,
  bondType,
  price,
  interestRate,
  maturityDate,
  onPurchaseComplete,
}: BlockchainBondPurchaseProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<string>("1")
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletInfo, setWalletInfo] = useState<{ accountId: string; address: string } | null>(null)
  const [transactionDetails, setTransactionDetails] = useState<{
    txId: string
    blockchainTxHash: string
  } | null>(null)

  const handleWalletConnect = (info: { accountId: string; address: string }) => {
    setWalletInfo(info)
    setWalletConnected(true)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*$/.test(value)) {
      setQuantity(value)
    }
    setError(null)
  }

  const handleIncrement = () => {
    setQuantity((prev) => {
      const currentQty = Number(prev)
      if (isNaN(currentQty)) return "1"
      return (currentQty + 1).toString()
    })
    setError(null)
  }

  const handleDecrement = () => {
    setQuantity((prev) => {
      const currentQty = Number(prev)
      if (isNaN(currentQty) || currentQty <= 1) return "1"
      return (currentQty - 1).toString()
    })
    setError(null)
  }

  const handlePurchase = async () => {
    if (!walletConnected || !walletInfo) {
      setError("Please connect your wallet first")
      return
    }

    const qtyNum = Number(quantity)
    if (isNaN(qtyNum) || qtyNum < 1) {
      setError("Please enter a valid quantity")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Call the contract service to purchase the bond
      const result = await contractService.buyAsset(walletInfo.accountId, bondId, qtyNum, price * qtyNum)

      if (result.success) {
        console.log("Blockchain bond purchase successful:", result)

        // Store transaction details for display
        setTransactionDetails({
          txId: result.transactionId,
          blockchainTxHash: result.blockchainTxHash,
        })

        toast({
          title: "Purchase Successful",
          description: `You have successfully purchased ${qtyNum} ${bondName} bond(s) via blockchain`,
          variant: "default",
        })
      } else {
        throw new Error("Transaction failed")
      }
    } catch (err: any) {
      console.error("Bond purchase error:", err)
      setError(err.message || "Failed to purchase bond")
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: err.message || "Failed to purchase bond",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {!walletConnected ? (
        <BlockchainWalletConnect onConnect={handleWalletConnect} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Purchase {bondName}</CardTitle>
            <CardDescription>Buy this bond directly using your blockchain wallet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bond Type:</span>
                <span className="font-medium capitalize">{bondType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per Unit:</span>
                <span className="font-medium">KES {price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Interest Rate:</span>
                <span className="font-medium text-green-600">{interestRate}%</span>
              </div>
              {maturityDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Maturity Date:</span>
                  <span className="font-medium">{new Date(maturityDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDecrement}
                  disabled={Number(quantity) <= 1 || isLoading}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="text"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="text-center"
                />
                <Button variant="outline" size="icon" onClick={handleIncrement} disabled={isLoading}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span>Total Cost:</span>
                <span className="font-medium">KES {(price * Number(quantity)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Expected Return:</span>
                <span className="font-medium text-green-600">
                  KES {((price * Number(quantity) * interestRate) / 100).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handlePurchase} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Purchase via Blockchain"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {transactionDetails && (
        <div className="mt-4 p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900 rounded-md">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">Transaction Successful!</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-mono">{transactionDetails.txId.substring(0, 10)}...</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Blockchain Hash:</span>
              <span className="font-mono truncate max-w-[150px]">
                {transactionDetails.blockchainTxHash.substring(0, 10)}...
              </span>
            </div>
            <a
              href={`https://hashscan.io/testnet/transaction/${transactionDetails.blockchainTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Button variant="outline" size="sm" className="w-full">
                View on Hashscan
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </a>
            <Button
              variant="default"
              size="sm"
              className="w-full mt-2"
              onClick={() => {
                setTransactionDetails(null)
                if (onPurchaseComplete) {
                  onPurchaseComplete()
                }
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
