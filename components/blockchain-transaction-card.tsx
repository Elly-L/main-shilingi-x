"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface BlockchainTransactionCardProps {
  transactionId: string
  blockchainTxHash: string
  amount: number
  description: string
  timestamp: string
  assetName: string
}

export function BlockchainTransactionCard({
  transactionId,
  blockchainTxHash,
  amount,
  description,
  timestamp,
  assetName,
}: BlockchainTransactionCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/30">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">Blockchain Transaction</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
        <CardDescription>{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 pb-2">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Asset:</span>
            <span className="text-sm font-medium">{assetName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="text-sm font-medium">KES {Math.abs(amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Transaction ID:</span>
            <span className="text-xs font-mono">{transactionId.substring(0, 10)}...</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Blockchain Hash:</span>
            <span className="text-xs font-mono truncate max-w-[120px]">{blockchainTxHash.substring(0, 10)}...</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => window.open(`https://hashscan.io/testnet/transaction/${blockchainTxHash}`, "_blank")}
        >
          Verify on Hashscan
          <ArrowUpRight className="ml-1 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  )
}
