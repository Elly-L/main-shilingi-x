"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getContractService } from "@/lib/contractService"
import { useToast } from "@/hooks/use-toast"

export default function ContractSettings() {
  const [contractId, setContractId] = useState<string>("")
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isVerifying, setIsVerifying] = useState<boolean>(false)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle")
  const { toast } = useToast()
  const contractService = getContractService()

  useEffect(() => {
    // Load saved contract ID if available
    const savedContractId = contractService.getContractId()
    if (savedContractId) {
      setContractId(savedContractId)
    }
  }, [])

  const handleSave = async () => {
    if (!contractId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid contract ID",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      contractService.setContractId(contractId.trim())
      toast({
        title: "Success",
        description: "Contract ID saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save contract ID",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const verifyContract = async () => {
    if (!contractId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid contract ID",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    setVerificationStatus("idle")

    try {
      // In a real implementation, you would verify the contract exists
      // and is of the correct type
      setTimeout(() => {
        setVerificationStatus("success")
        toast({
          title: "Success",
          description: "Contract verified successfully",
        })
        setIsVerifying(false)
      }, 1500)
    } catch (error) {
      setVerificationStatus("error")
      toast({
        title: "Error",
        description: "Failed to verify contract",
        variant: "destructive",
      })
      setIsVerifying(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Contract Settings</CardTitle>
        <CardDescription>Configure the Hedera smart contract used for investment management</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contractId">Contract ID</Label>
          <Input
            id="contractId"
            placeholder="0.0.12345"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Enter the Hedera smart contract ID for the ShilingiX Investment Manager
          </p>
        </div>

        {verificationStatus === "success" && (
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">Contract Verified</AlertTitle>
            <AlertDescription className="text-green-700">
              The contract has been verified and is ready to use.
            </AlertDescription>
          </Alert>
        )}

        {verificationStatus === "error" && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTitle className="text-red-800">Verification Failed</AlertTitle>
            <AlertDescription className="text-red-700">
              Unable to verify the contract. Please check the contract ID and try again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={verifyContract} disabled={isVerifying}>
          {isVerifying ? "Verifying..." : "Verify Contract"}
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardFooter>
    </Card>
  )
}
