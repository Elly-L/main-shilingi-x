"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, Check, ExternalLink } from "lucide-react"
import { contractService } from "@/lib/contractService"

interface WalletConnectButtonProps {
  walletType: "metamask" | "hashpack"
  className?: string
}

export function WalletConnectButton({ walletType, className = "" }: WalletConnectButtonProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  useEffect(() => {
    // Always show as connected in deployed environment
    const checkConnection = async () => {
      try {
        // Always set to connected
        setIsConnected(true)

        // Set a mock wallet address
        if (walletType === "metamask") {
          setWalletAddress("0x1234...5678")
        } else {
          setWalletAddress(contractService.getWalletId())
        }
      } catch (error) {
        console.error(`Error checking ${walletType} connection:`, error)
        // Still set to connected for demo purposes
        setIsConnected(true)
      }
    }

    checkConnection()
  }, [walletType])

  const handleConnect = async () => {
    setIsConnecting(true)

    try {
      // Simulate connection
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Always set to connected
      setIsConnected(true)

      // Set a mock wallet address
      if (walletType === "metamask") {
        setWalletAddress("0x1234...5678")
      } else {
        setWalletAddress(contractService.getWalletId())
      }
    } catch (error) {
      console.error(`Error connecting to ${walletType}:`, error)
      // Still set to connected for demo purposes
      setIsConnected(true)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {isConnected ? (
        <>
          <Button variant="outline" className="w-full justify-between" disabled>
            <span className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-500" />
              {walletType === "metamask" ? "MetaMask" : "HashPack"} Connected
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">{walletAddress}</span>
          </Button>
          {walletType === "hashpack" && (
            <a
              href={`https://hashscan.io/testnet/account/${contractService.getWalletId()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-center text-primary flex items-center justify-center hover:underline"
            >
              View on Hashscan
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          )}
        </>
      ) : (
        <Button variant="outline" className="w-full" onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? (
            "Connecting..."
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Connect {walletType === "metamask" ? "MetaMask" : "HashPack"}
            </>
          )}
        </Button>
      )}
    </div>
  )
}

export default WalletConnectButton
