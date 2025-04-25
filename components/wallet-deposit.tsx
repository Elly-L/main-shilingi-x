"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, CreditCard, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface WalletDepositProps {
  onSuccess?: () => void
}

export function WalletDeposit({ onSuccess }: WalletDepositProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [isProcessing, setIsProcessing] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("+254")
  const [error, setError] = useState("")

  const validateAmount = (value: string) => {
    setAmount(value)
    setError("")

    const depositAmount = Number(value)

    if (depositAmount <= 0) {
      setError("Please enter a valid amount to deposit")
    }
  }

  const validatePhoneNumber = (value: string) => {
    setPhoneNumber(value)
    setError("")

    if (paymentMethod === "mpesa" && (!value || value.length < 10)) {
      setError("Please enter a valid M-Pesa phone number")
    }
  }

  const handleDeposit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to make a deposit",
        variant: "destructive",
      })
      return
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount to deposit")
      return
    }

    if (paymentMethod === "mpesa" && (!phoneNumber || phoneNumber.length < 10)) {
      setError("Please enter a valid M-Pesa phone number")
      return
    }

    setIsProcessing(true)

    try {
      const depositAmount = Number(amount)

      // First, get current balance
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single()

      if (walletError) {
        // If wallet doesn't exist, create one
        if (walletError.code === "PGRST116") {
          await supabase.from("wallets").insert({
            user_id: user.id,
            balance: depositAmount,
          })
        } else {
          throw walletError
        }
      } else {
        // Update the balance
        const newBalance = Number(walletData.balance) + depositAmount

        const { error: updateError } = await supabase
          .from("wallets")
          .update({ balance: newBalance })
          .eq("user_id", user.id)

        if (updateError) throw updateError
      }

      // Record the transaction
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "deposit",
        amount: depositAmount,
        source: paymentMethod === "mpesa" ? "M-Pesa" : paymentMethod === "card" ? "Credit Card" : "Bank Transfer",
        description:
          paymentMethod === "mpesa"
            ? `Deposit via M-Pesa (${phoneNumber})`
            : paymentMethod === "card"
              ? "Deposit via Credit Card"
              : "Deposit via Bank Transfer",
      })

      if (transactionError) throw transactionError

      toast({
        title: "Deposit successful!",
        description: `KES ${depositAmount} has been added to your wallet`,
      })

      if (onSuccess) {
        onSuccess()
      } else {
        // Redirect to wallet page
        router.push("/wallet")
      }
    } catch (error) {
      console.error("Deposit error:", error)
      toast({
        title: "Deposit failed",
        description: "There was an error processing your deposit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
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
        <label className="text-sm font-medium">Payment Method</label>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          <div className="flex items-center space-x-2 border rounded-md p-3">
            <RadioGroupItem value="mpesa" id="mpesa" />
            <label htmlFor="mpesa" className="flex items-center gap-2 cursor-pointer flex-1">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>M-Pesa</span>
            </label>
          </div>
          <div className="flex items-center space-x-2 border rounded-md p-3">
            <RadioGroupItem value="card" id="card" />
            <label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>Credit/Debit Card</span>
            </label>
          </div>
          <div className="flex items-center space-x-2 border rounded-md p-3">
            <RadioGroupItem value="bank" id="bank" />
            <label htmlFor="bank" className="flex items-center gap-2 cursor-pointer flex-1">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>Bank Transfer</span>
            </label>
          </div>
        </RadioGroup>
      </div>

      {paymentMethod === "mpesa" && (
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            M-Pesa Phone Number
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="+254 7XX XXX XXX"
            value={phoneNumber}
            onChange={(e) => validatePhoneNumber(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">For demo purposes, any phone number will work</p>
        </div>
      )}

      {paymentMethod === "card" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="cardNumber" className="text-sm font-medium">
              Card Number
            </label>
            <Input id="cardNumber" placeholder="1234 5678 9012 3456" defaultValue="4242 4242 4242 4242" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="expiry" className="text-sm font-medium">
                Expiry Date
              </label>
              <Input id="expiry" placeholder="MM/YY" defaultValue="12/25" />
            </div>
            <div className="space-y-2">
              <label htmlFor="cvc" className="text-sm font-medium">
                CVC
              </label>
              <Input id="cvc" placeholder="123" defaultValue="123" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">For demo purposes, any card details will work</p>
        </div>
      )}

      {paymentMethod === "bank" && (
        <div className="space-y-2">
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">Bank Transfer Details</p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Name:</span>
                <span>Shillingi X Ltd</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number:</span>
                <span>1234567890</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank:</span>
                <span>KCB Bank</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Branch:</span>
                <span>Nairobi</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            For demo purposes, you can proceed without making an actual transfer
          </p>
        </div>
      )}

      <Button
        className="w-full"
        onClick={handleDeposit}
        disabled={!amount || Number(amount) <= 0 || isProcessing || error !== ""}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Deposit Funds"
        )}
      </Button>
    </div>
  )
}
