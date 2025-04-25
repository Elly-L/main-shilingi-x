"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, CreditCard, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface WalletWithdrawProps {
  onSuccess?: () => void
}

export function WalletWithdraw({ onSuccess }: WalletWithdrawProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [isProcessing, setIsProcessing] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("+254")
  const [availableBalance, setAvailableBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()

        if (error) throw error

        setAvailableBalance(Number(data.balance))
      } catch (error) {
        console.error("Error fetching wallet balance:", error)
        toast({
          title: "Error",
          description: "Could not fetch your wallet balance",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletBalance()
  }, [user, toast])

  const validateAmount = (value: string) => {
    setAmount(value)
    setError("")

    const withdrawAmount = Number(value)

    if (withdrawAmount <= 0) {
      setError("Please enter a valid amount to withdraw")
    } else if (withdrawAmount > availableBalance) {
      setError(`Insufficient funds. Your available balance is KES ${availableBalance}`)
    }
  }

  const validatePhoneNumber = (value: string) => {
    setPhoneNumber(value)
    setError("")

    if (paymentMethod === "mpesa" && (!value || value.length < 10)) {
      setError("Please enter a valid M-Pesa phone number")
    }
  }

  const handleWithdraw = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to make a withdrawal",
        variant: "destructive",
      })
      return
    }

    const withdrawAmount = Number(amount)

    if (!withdrawAmount || withdrawAmount <= 0) {
      setError("Please enter a valid amount to withdraw")
      return
    }

    if (withdrawAmount > availableBalance) {
      setError(`Insufficient funds. Your available balance is KES ${availableBalance}`)
      return
    }

    if (paymentMethod === "mpesa" && (!phoneNumber || phoneNumber.length < 10)) {
      setError("Please enter a valid M-Pesa phone number")
      return
    }

    setIsProcessing(true)

    try {
      // Update the balance
      const newBalance = availableBalance - withdrawAmount

      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", user.id)

      if (updateError) throw updateError

      // Record the transaction
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "withdrawal",
        amount: -withdrawAmount, // Negative amount for withdrawal
        source: paymentMethod === "mpesa" ? "M-Pesa" : "Bank Transfer",
        description: paymentMethod === "mpesa" ? `Withdrawal to M-Pesa (${phoneNumber})` : "Withdrawal to Bank Account",
      })

      if (transactionError) throw transactionError

      toast({
        title: "Withdrawal successful!",
        description:
          paymentMethod === "mpesa"
            ? `KES ${withdrawAmount} has been sent to your M-Pesa account (${phoneNumber})`
            : `KES ${withdrawAmount} has been sent to your bank account`,
      })

      if (onSuccess) {
        onSuccess()
      } else {
        // Redirect to wallet page
        router.push("/wallet")
      }
    } catch (error) {
      console.error("Withdrawal error:", error)
      toast({
        title: "Withdrawal failed",
        description: "There was an error processing your withdrawal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="p-3 bg-muted rounded-md mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Available Balance</span>
          <span className="font-bold">KES {availableBalance.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-medium">
          Amount (KES)
        </label>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => validateAmount(e.target.value)}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Withdrawal Method</label>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          <div className="flex items-center space-x-2 border rounded-md p-3">
            <RadioGroupItem value="mpesa" id="mpesa-withdraw" />
            <label htmlFor="mpesa-withdraw" className="flex items-center gap-2 cursor-pointer flex-1">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>M-Pesa</span>
            </label>
          </div>
          <div className="flex items-center space-x-2 border rounded-md p-3">
            <RadioGroupItem value="bank" id="bank-withdraw" />
            <label htmlFor="bank-withdraw" className="flex items-center gap-2 cursor-pointer flex-1">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>Bank Transfer</span>
            </label>
          </div>
        </RadioGroup>
      </div>

      {paymentMethod === "mpesa" && (
        <div className="space-y-2">
          <label htmlFor="phone-withdraw" className="text-sm font-medium">
            M-Pesa Phone Number
          </label>
          <Input
            id="phone-withdraw"
            type="tel"
            placeholder="+254 7XX XXX XXX"
            value={phoneNumber}
            onChange={(e) => validatePhoneNumber(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Funds will be sent to this M-Pesa number</p>
        </div>
      )}

      {paymentMethod === "bank" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="accountName" className="text-sm font-medium">
              Account Name
            </label>
            <Input id="accountName" placeholder="Your account name" />
          </div>
          <div className="space-y-2">
            <label htmlFor="accountNumber" className="text-sm font-medium">
              Account Number
            </label>
            <Input id="accountNumber" placeholder="Your account number" />
          </div>
          <div className="space-y-2">
            <label htmlFor="bankName" className="text-sm font-medium">
              Bank Name
            </label>
            <Input id="bankName" placeholder="Your bank name" />
          </div>
          <p className="text-xs text-muted-foreground">For demo purposes, any bank details will work</p>
        </div>
      )}

      <Button
        className="w-full"
        onClick={handleWithdraw}
        disabled={!amount || Number(amount) <= 0 || Number(amount) > availableBalance || isProcessing || error !== ""}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Withdraw Funds"
        )}
      </Button>
    </div>
  )
}
