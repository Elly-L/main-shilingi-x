"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import WalletDeposit from "@/components/wallet-deposit"
import MpesaDeposit from "@/components/mpesa-deposit"
import { ProtectedRoute } from "@/components/protected-route"

export default function DepositPage() {
  const [activeTab, setActiveTab] = useState("bank")

  return (
    <ProtectedRoute>
      <div className="container max-w-md mx-auto py-8 px-4">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/wallet">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Wallet
          </Link>
        </Button>

        <Tabs defaultValue="bank" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bank">Bank</TabsTrigger>
            <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
            <TabsTrigger value="card">Card</TabsTrigger>
          </TabsList>

          <TabsContent value="bank" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Bank Deposit</CardTitle>
                <CardDescription>Add funds to your Shillingi X wallet</CardDescription>
              </CardHeader>
              <CardContent>
                <WalletDeposit />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mpesa" className="mt-4">
            <MpesaDeposit />
          </TabsContent>

          <TabsContent value="card" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Card Deposit</CardTitle>
                <CardDescription>Deposit funds using your debit or credit card</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8">Card payment integration coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
