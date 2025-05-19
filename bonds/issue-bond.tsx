"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import { contractService } from "@/lib/contractService"

interface IssueBondFormProps {
  onSuccess: () => void
  isBlockchainEnabled: boolean
}

export function IssueBondForm({ onSuccess, isBlockchainEnabled }: IssueBondFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "government",
    description: "",
    interestRate: 10,
    termDays: 365,
    minInvestment: 100,
    availableAmount: 1000000,
    status: "active",
  })

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form
      if (!formData.name || !formData.description) {
        throw new Error("Please fill in all required fields")
      }

      if (formData.interestRate <= 0) {
        throw new Error("Interest rate must be greater than 0")
      }

      if (formData.minInvestment <= 0) {
        throw new Error("Minimum investment must be greater than 0")
      }

      // Calculate maturity date
      const maturityTimestamp = Date.now() + formData.termDays * 24 * 60 * 60 * 1000

      // Try to issue on blockchain first if enabled
      let blockchainAssetId = null
      let blockchainTxHash = null

      if (isBlockchainEnabled || contractService.isUsingSimulation()) {
        try {
          const assetType = formData.type === "equity" ? 1 : 0
          const result = await contractService.createAsset(
            formData.name,
            assetType,
            formData.availableAmount,
            formData.minInvestment,
            formData.minInvestment,
            maturityTimestamp,
            Math.floor(formData.interestRate * 100), // Convert to basis points
          )

          if (result.success) {
            blockchainAssetId = result.assetId
            blockchainTxHash = result.txHash
            console.log("Asset created on blockchain:", result)
          }
        } catch (blockchainError) {
          console.error("Error creating asset on blockchain:", blockchainError)
          // Continue with database creation even if blockchain fails
        }
      }

      // Create in database
      const { data, error } = await supabase
        .from("investment_options")
        .insert([
          {
            name: formData.name,
            type: formData.type,
            description: formData.description,
            interest_rate: formData.interestRate,
            term_days: formData.termDays,
            min_investment: formData.minInvestment,
            available_amount: formData.availableAmount,
            status: formData.status,
            blockchain_asset_id: blockchainAssetId,
            blockchain_tx_hash: blockchainTxHash,
            maturity_date: new Date(maturityTimestamp).toISOString(),
          },
        ])
        .select()

      if (error) throw error

      toast({
        title: "Bond issued successfully",
        description: blockchainAssetId
          ? `Bond has been issued on blockchain with ID: ${blockchainAssetId}`
          : "Bond has been added to the platform",
      })

      onSuccess()
    } catch (err) {
      console.error("Error issuing bond:", err)
      toast({
        variant: "destructive",
        title: "Error issuing bond",
        description: err.message || "Failed to issue bond",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Bond Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="e.g. Treasury Bond - 10 Year"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium">
          Bond Type <span className="text-red-500">*</span>
        </label>
        <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Select bond type" />
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
        <label htmlFor="description" className="text-sm font-medium">
          Description <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe the bond and its features"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="interestRate" className="text-sm font-medium">
            Interest Rate (%) <span className="text-red-500">*</span>
          </label>
          <Input
            id="interestRate"
            type="number"
            step="0.1"
            min="0"
            value={formData.interestRate}
            onChange={(e) => handleChange("interestRate", Number.parseFloat(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="termDays" className="text-sm font-medium">
            Term (days) <span className="text-red-500">*</span>
          </label>
          <Input
            id="termDays"
            type="number"
            min="1"
            value={formData.termDays}
            onChange={(e) => handleChange("termDays", Number.parseInt(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="minInvestment" className="text-sm font-medium">
            Min. Investment (KES) <span className="text-red-500">*</span>
          </label>
          <Input
            id="minInvestment"
            type="number"
            min="1"
            value={formData.minInvestment}
            onChange={(e) => handleChange("minInvestment", Number.parseInt(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="availableAmount" className="text-sm font-medium">
            Available Amount (KES) <span className="text-red-500">*</span>
          </label>
          <Input
            id="availableAmount"
            type="number"
            min="1"
            value={formData.availableAmount}
            onChange={(e) => handleChange("availableAmount", Number.parseInt(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="status" className="text-sm font-medium">
          Status <span className="text-red-500">*</span>
        </label>
        <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isBlockchainEnabled && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <p className="text-green-700 dark:text-green-400">
              {contractService.isUsingSimulation()
                ? "Using blockchain simulation"
                : "Bond will be issued on Hedera blockchain"}
            </p>
          </div>
          <p className="mt-1 text-xs text-green-600 dark:text-green-500">
            Contract ID: {contractService.getContractAddress()}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Issue Bond
        </Button>
      </div>
    </form>
  )
}
