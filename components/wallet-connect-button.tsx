"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Coins } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function WalletConnectButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleClick = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    toast({
      variant: "success",
      title: "Information",
      description: "Shilingi X uses a centralized wallet system for all transactions.",
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={handleClick}
        className="backdrop-blur-sm bg-background/80 border-primary/20 relative"
      >
        <div className="relative w-5 h-5">
          <Coins className="w-5 h-5" />
        </div>
        <span className="sr-only">Wallet Information</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Centralized Wallet System</DialogTitle>
            <DialogDescription>Information about Shilingi X's wallet system</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Centralized Wallet Model</AlertTitle>
              <AlertDescription>
                Shilingi X uses a centralized wallet system. All transactions are processed through our platform's
                system wallet, which means:
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">How it works:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>You don't need to connect an external blockchain wallet</li>
                <li>Your funds are securely managed by the Shilingi X platform</li>
                <li>All transactions are recorded on the blockchain for transparency</li>
                <li>Lower transaction fees and faster processing times</li>
                <li>Simplified user experience with no need for wallet management</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Benefits:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>No need to manage private keys or seed phrases</li>
                <li>Seamless integration with M-Pesa for deposits and withdrawals</li>
                <li>Reduced gas fees for blockchain transactions</li>
                <li>Simplified investment process for non-technical users</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleClose}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
