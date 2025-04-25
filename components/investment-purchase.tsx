"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Minus, AlertCircle, ArrowUpRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { contractService } from "@/lib/contractService"
import { supabase } from "@/lib/supabaseClient"

interface InvestmentPurchaseProps {
  investmentId?: string
  investmentName: string
  investmentType: string
  minAmount?: number
  maxAmount?: number
  interestRate: number
  duration?: string
  risk?: string
  maturityDate?: string
  onPurchaseComplete?: () => void
}

export function InvestmentPurchase({
  investmentId,
  investmentName,
  investmentType,
  minAmount = 50,
  maxAmount = 1000000,
  interestRate,
  duration,
  risk,
  maturityDate,
  onPurchaseComplete,
}: InvestmentPurchaseProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [amount, setAmount] = useState<string>(minAmount.toString())
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingBalance, setIsFetchingBalance] = useState(true)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [transactionDetails, setTransactionDetails] = useState<{
    txId: string
    blockchainTxHash: string
  } | null>(null)

  // Fetch wallet balance when component mounts
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!user) return

      try {
        setIsFetchingBalance(true)
        console.log("Fetching wallet balance for user:", user.id)

        const blockchainBalance = await contractService.getUserBalance(user.id)
        const balanceNumber = Number(blockchainBalance)
        console.log("Blockchain wallet balance:", balanceNumber)
        setWalletBalance(balanceNumber)
      } catch (blockchainError) {
        console.error("Error fetching blockchain balance:", blockchainError)
        setError("Could not fetch blockchain wallet balance.")
        toast({
          title: "Error",
          description: "Could not fetch blockchain wallet balance",
          variant: "destructive",
        })
      } finally {
        setIsFetchingBalance(false)
      }
    }

    fetchWalletBalance()
  }, [user, toast])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)
    setError(null)
  }

  const validateAmount = (): boolean => {
    const numAmount = Number(amount)

    if (isNaN(numAmount)) {
      setError("Please enter a valid number")
      return false
    }

    if (numAmount < minAmount) {
      setError(`Minimum investment amount is KES ${minAmount.toLocaleString()}`)
      return false
    }

    if (numAmount > walletBalance) {
      setError(`Insufficient funds. Your wallet balance is KES ${walletBalance.toLocaleString()}`)
      return false
    }

    return true
  }

  const handleIncrement = () => {
    setAmount((prev) => {
      const currentAmount = Number(prev)
      if (isNaN(currentAmount)) return minAmount.toString()
      return (currentAmount + 50).toString()
    })
    setError(null)
  }

  const handleDecrement = () => {
    setAmount((prev) => {
      const currentAmount = Number(prev)
      if (isNaN(currentAmount) || currentAmount <= minAmount) return minAmount.toString()
      return (currentAmount - 50).toString()
    })
    setError(null)
  }

  const handleInvest = async () => {
    if (!validateAmount()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        throw new Error("You must be logged in to invest")
      }

      const numAmount = Number(amount)

      // Attempt blockchain transaction
      console.log("Attempting blockchain investment purchase")
      const result = await contractService.buyAsset(
        currentUser.id,
        investmentId,
        1, // Quantity - assuming 1 unit per purchase for simplicity
        numAmount,
      )

      if (result.success) {
        console.log("Blockchain investment successful:", result)

        // Store transaction details for display
        setTransactionDetails({
          txId: result.transactionId,
          blockchainTxHash: result.blockchainTxHash,
        })

        // Record the transaction in the database for reference
        const { error: transactionError } = await supabase.from("transactions").insert([
          {
            user_id: currentUser.id,
            amount: -numAmount,
            transaction_type: "investment",
            description: `Investment in ${investmentName} (Blockchain TX: ${result.blockchainTxHash})`,
            source: investmentName,
            status: "completed",
            blockchain_tx_hash: result.blockchainTxHash,
          },
        ])

        if (transactionError) {
          console.error("Error recording blockchain transaction:", transactionError)
        }

        toast({
          title: "Investment Successful",
          description: `You have successfully invested KES ${numAmount.toLocaleString()} in ${investmentName} via blockchain`,
          variant: "default",
        })

        // Call onPurchaseComplete if provided
        if (onPurchaseComplete) {
          onPurchaseComplete()
        }
      } else {
        throw new Error(`Blockchain transaction failed: ${result.error}`)
      }
    } catch (error: any) {
      console.error("Investment error:", error)
      toast({
        title: "Investment Failed",
        description: error.message || "Failed to complete investment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted rounded-md mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Your Wallet Balance:</span>
          {isFetchingBalance ? (
            <span className="font-bold flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...
            </span>
          ) : (
            <span className="font-bold">KES {walletBalance.toLocaleString()}</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-medium">
          Investment Amount (KES {minAmount.toLocaleString()} minimum)
        </label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            disabled={Number(amount) <= minAmount || isLoading}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="amount"
            type="text"
            placeholder="Enter amount"
            value={amount}
            onChange={handleAmountChange}
            className="text-center"
          />
          <Button variant="outline" size="icon" onClick={handleIncrement} disabled={isLoading}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Enter the amount you wish to invest</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Expected Return:</span>
          <span className="font-medium">
            KES {((Number(amount) * interestRate) / 100).toLocaleString()} ({interestRate}%)
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Total Value at Maturity:</span>
          <span className="font-medium">
            KES {(Number(amount) + (Number(amount) * interestRate) / 100).toLocaleString()}
          </span>
        </div>
      </div>

      <Button className="w-full" onClick={handleInvest} disabled={isLoading || isFetchingBalance}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Invest Now`
        )}
      </Button>
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
