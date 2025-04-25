"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { WalletWithdraw } from "@/components/wallet-withdraw"
import { ProtectedRoute } from "@/components/protected-route"

export default function WithdrawPage() {
  return (
    <ProtectedRoute>
      <div className="container max-w-md mx-auto py-8 px-4">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/wallet">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Wallet
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Withdraw Funds</CardTitle>
            <CardDescription>Withdraw funds from your Shillingi X wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <WalletWithdraw />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
