"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, CreditCard, Loader2, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"

export default function PaymentMethodsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [paymentType, setPaymentType] = useState("mpesa")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock data
  const paymentMethods = [
    {
      id: 1,
      type: "mpesa",
      name: "M-Pesa",
      details: "+254 712 345 678",
      isDefault: true,
    },
  ]

  const handleAddPaymentMethod = () => {
    if (paymentType === "mpesa" && (!phoneNumber || phoneNumber.length < 10)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid M-Pesa phone number",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsAdding(false)
      toast({
        title: "Payment method added",
        description: "Your payment method has been added successfully",
      })
    }, 1500)
  }

  const handleRemovePaymentMethod = (id: number) => {
    toast({
      title: "Payment method removed",
      description: "Your payment method has been removed successfully",
    })
  }

  const handleSetDefault = (id: number) => {
    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been updated successfully",
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/wallet">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Wallet
            </Link>
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods for deposits and withdrawals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.details}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.isDefault ? (
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Default</div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleSetDefault(method.id)}>
                        Set Default
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleRemovePaymentMethod(method.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}

              {isAdding ? (
                <div className="border rounded-md p-4 space-y-4">
                  <h3 className="font-medium">Add Payment Method</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Type</label>
                    <RadioGroup value={paymentType} onValueChange={setPaymentType}>
                      <div className="flex items-center space-x-2 border rounded-md p-3">
                        <RadioGroupItem value="mpesa" id="mpesa-add" />
                        <label htmlFor="mpesa-add" className="flex items-center gap-2 cursor-pointer flex-1">
                          <CreditCard className="h-4 w-4 text-primary" />
                          <span>M-Pesa</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  {paymentType === "mpesa" && (
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        M-Pesa Phone Number
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+254 7XX XXX XXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleAddPaymentMethod} disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Payment Method"
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAdding(false)} disabled={isProcessing}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
