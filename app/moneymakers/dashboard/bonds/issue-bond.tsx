"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { contractService } from "@/lib/contractService"
import { supabase } from "@/lib/supabaseClient"

export function IssueBondForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isBlockchainEnabled, setIsBlockchainEnabled] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "government", // Default type
    interestRate: "",
    termDays: "",
    minInvestment: "",
    availableAmount: "",
    status: "active",
  })

  // Check if blockchain is connected
  useEffect(() => {
    const checkBlockchainConnection = async () => {
      try {
        const connected = await contractService.isConnected()
        setIsBlockchainEnabled(connected)
        console.log("Blockchain connection:", connected ? "Connected" : "Not connected")
      } catch (error) {
        console.error("Error checking blockchain connection:", error)
        setIsBlockchainEnabled(false)
      }
    }

    checkBlockchainConnection()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const validateForm = () => {
    if (!formData.name) return "Bond name is required"
    if (!formData.description) return "Description is required"
    if (!formData.interestRate || isNaN(Number(formData.interestRate))) return "Valid interest rate is required"
    if (!formData.termDays || isNaN(Number(formData.termDays))) return "Valid term days is required"
    if (!formData.minInvestment || isNaN(Number(formData.minInvestment))) return "Valid minimum investment is required"
    if (!formData.availableAmount || isNaN(Number(formData.availableAmount)))
      return "Valid available amount is required"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Calculate maturity date based on term days
      const maturityDate = new Date()
      maturityDate.setDate(maturityDate.getDate() + Number(formData.termDays))

      // Try blockchain issuance first if enabled
      if (isBlockchainEnabled) {
        try {
          console.log("Attempting to issue bond on blockchain")

          const result = await contractService.issueAsset(
            formData.name,
            formData.description,
            formData.type === "equity" ? "equity" : "bond", // Convert to contract enum
            Number(formData.minInvestment),
            Number(formData.availableAmount),
            Number(formData.interestRate),
            maturityDate.toISOString(),
            JSON.stringify({
              type: formData.type,
              risk: formData.type === "government" ? "Low" : formData.type === "corporate" ? "Medium" : "High",
              duration: `${formData.termDays} days`,
            }),
          )

          if (result.success) {
            console.log("Blockchain bond issuance successful:", result)

            // Also record in database for UI display
            const { error: dbError } = await supabase.from("investment_options").insert({
              id: result.assetId, // Use blockchain asset ID
              name: formData.name,
              description: formData.description,
              type: formData.type,
              interest_rate: Number(formData.interestRate),
              term_days: Number(formData.termDays),
              min_investment: Number(formData.minInvestment),
              available_amount: Number(formData.availableAmount),
              status: formData.status,
              blockchain_asset_id: result.assetId,
              blockchain_tx_hash: result.blockchainTxHash,
            })

            if (dbError) {
              console.error("Error recording bond in database:", dbError)
            }

            toast({
              title: "Bond Issued Successfully",
              description: `Bond "${formData.name}" has been issued on the blockchain`,
            })

            if (onSuccess) onSuccess()
            return
          }
        } catch (blockchainError) {
          console.error("Blockchain bond issuance failed, falling back to database:", blockchainError)
        }
      }

      // Fallback to database only
      console.log("Using database for bond issuance")

      const { data, error } = await supabase
        .from("investment_options")
        .insert({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          interest_rate: Number(formData.interestRate),
          term_days: Number(formData.termDays),
          min_investment: Number(formData.minInvestment),
          available_amount: Number(formData.availableAmount),
          status: formData.status,
          maturity_date: maturityDate.toISOString(),
        })
        .select()

      if (error) throw error

      toast({
        title: "Bond Created Successfully",
        description: `Bond "${formData.name}" has been created`,
      })

      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error("Error creating bond:", err)
      setError(err.message || "Failed to create bond")
      toast({
        variant: "destructive",
        title: "Error Creating Bond",
        description: err.message || "Failed to create bond",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Bond Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Treasury Bond - 10 Year"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the bond details"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Bond Type</Label>
          <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
              <SelectItem value="infrastructure">Infrastructure</SelectItem>
              <SelectItem value="equity">Equity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interestRate">Interest Rate (%)</Label>
          <Input
            id="interestRate"
            name="interestRate"
            type="number"
            step="0.1"
            value={formData.interestRate}
            onChange={handleChange}
            placeholder="e.g. 12.5"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="termDays">Term (days)</Label>
          <Input
            id="termDays"
            name="termDays"
            type="number"
            value={formData.termDays}
            onChange={handleChange}
            placeholder="e.g. 3650 (10 years)"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minInvestment">Min. Investment (KES)</Label>
          <Input
            id="minInvestment"
            name="minInvestment"
            type="number"
            value={formData.minInvestment}
            onChange={handleChange}
            placeholder="e.g. 100"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="availableAmount">Available Amount (KES)</Label>
          <Input
            id="availableAmount"
            name="availableAmount"
            type="number"
            value={formData.availableAmount}
            onChange={handleChange}
            placeholder="e.g. 1000000"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Issue Bond"
        )}
      </Button>
    </form>
  )
}
