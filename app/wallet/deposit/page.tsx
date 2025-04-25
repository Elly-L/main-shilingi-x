"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { WalletDeposit } from "@/components/wallet-deposit"
import { ProtectedRoute } from "@/components/protected-route"

export default function DepositPage() {
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
            <CardTitle>Deposit Funds</CardTitle>
            <CardDescription>Add funds to your Shillingi X wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <WalletDeposit />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
