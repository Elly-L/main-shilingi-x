"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, CreditCard, DollarSign, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/protected-route"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/auth-context"
import { WalletDeposit } from "@/components/wallet-deposit"
import { contractService } from "@/lib/contractService"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function WalletPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [walletBalance, setWalletBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState(null)
  const [showWalletInfo, setShowWalletInfo] = useState(false)

  useEffect(() => {
    if (user) {
      fetchWalletData()
    } else if (!user && !isLoading) {
      // If user is not loading and still null, show a message
      setError("Please log in to view your wallet")
      setIsLoading(false)
    }
  }, [user])

  const fetchWalletData = async () => {
    if (!user) return

    try {
      console.log("Fetching wallet data for user:", user.id)
      setIsRefreshing(true)

      // Try to get balance from the smart contract first
      try {
        const balance = await contractService.getUserBalance(user.id)
        setWalletBalance(Number.parseFloat(balance))

        // Try to get transactions from the smart contract
        const txHistory = await contractService.getUserTransactions(user.id)
        if (txHistory && txHistory.length > 0) {
          // Format transactions to match our UI expectations
          const formattedTxs = txHistory.map((tx) => ({
            id: tx.id,
            user_id: user.id,
            transaction_type: tx.isBuy ? "purchase" : "sale",
            amount: tx.isBuy
              ? -Number.parseFloat(tx.price) * Number.parseFloat(tx.quantity)
              : Number.parseFloat(tx.price) * Number.parseFloat(tx.quantity),
            source: `Asset #${tx.assetId}`,
            description: tx.isBuy ? "Asset purchase" : "Asset sale",
            created_at: tx.timestamp,
            status: "completed",
          }))

          setTransactions(formattedTxs)
          setError(null)
          setIsLoading(false)
          setIsRefreshing(false)
          return
        }
      } catch (contractError) {
        console.log("Falling back to database for wallet data")
      }

      // Fallback to database
      // Fetch wallet balance
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single()

      if (walletError) {
        console.error("Wallet error:", walletError)

        if (walletError.code === "PGRST116") {
          // No wallet found, create one
          console.log("No wallet found, creating one...")
          const { data: newWallet, error: createError } = await supabase
            .from("wallets")
            .insert([{ user_id: user.id, balance: 0 }])
            .select()
            .single()

          if (createError) {
            console.error("Error creating wallet:", createError)
            throw createError
          }

          if (newWallet) {
            console.log("Created new wallet with balance:", newWallet.balance)
            setWalletBalance(Number(newWallet.balance))
          }
        } else {
          throw walletError
        }
      } else if (walletData) {
        console.log("Fetched wallet balance:", walletData.balance)
        setWalletBalance(Number(walletData.balance))
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (transactionsError) {
        console.error("Transactions error:", transactionsError)
        throw transactionsError
      }

      console.log("Fetched transactions:", transactionsData?.length || 0)
      setTransactions(transactionsData || [])
      setError(null)
    } catch (error) {
      console.error("Error fetching wallet data:", error)
      setError("Could not fetch your wallet data. Please try again later.")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch your wallet data",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchWalletData()
    setIsRefreshing(false)
    toast({
      title: "Balance updated",
      description: "Your wallet balance has been updated",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold">Error Loading Wallet</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchWalletData}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-6xl mx-auto py-4 sm:py-6 md:py-8 px-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Wallet</h1>
              <p className="text-muted-foreground">Manage your funds and transactions.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button asChild className="flex-1 sm:flex-none">
                <Link href="/wallet/deposit">
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Deposit
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1 sm:flex-none">
                <Link href="/wallet/withdraw">
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Withdraw
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setShowWalletInfo(true)}>
                    <AlertCircle className="h-4 w-4" />
                    <span className="sr-only">Wallet Information</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    <span className="sr-only">Refresh</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">KES {walletBalance.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">Available for investment or withdrawal</div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/wallet/deposit">
                    <ArrowDown className="mr-2 h-4 w-4" />
                    Deposit
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/wallet/withdraw">
                    <ArrowUp className="mr-2 h-4 w-4" />
                  Withdraw
                </Link>
              </Button>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Transaction History</TabsTrigger>
                <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                {transactions.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <div className="relative w-full overflow-x-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead>
                          <tr className="border-b transition-colors hover:bg-muted/50">
                            <th className="h-10 px-2 sm:h-12 sm:px-4 text-left align-middle font-medium">Type</th>
                            <th className="h-10 px-2 sm:h-12 sm:px-4 text-left align-middle font-medium">Amount</th>
                            <th className="h-10 px-2 sm:h-12 sm:px-4 text-left align-middle font-medium hidden sm:table-cell">
                              Source
                            </th>
                            <th className="h-10 px-2 sm:h-12 sm:px-4 text-left align-middle font-medium">Date</th>
                            <th className="h-10 px-2 sm:h-12 sm:px-4 text-left align-middle font-medium hidden md:table-cell">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((transaction) => (
                            <tr key={transaction.id} className="border-b transition-colors hover:bg-muted/50">
                              <td className="p-2 sm:p-4 align-middle capitalize">{transaction.transaction_type}</td>
                              <td
                                className={`p-2 sm:p-4 align-middle ${Number(transaction.amount) >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {Number(transaction.amount) >= 0 ? "+" : ""}
                                {Number(transaction.amount).toLocaleString()} KES
                              </td>
                              <td className="p-2 sm:p-4 align-middle hidden sm:table-cell">
                                {transaction.source || "System"}
                              </td>
                              <td className="p-2 sm:p-4 align-middle text-xs sm:text-sm">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </td>
                              <td className="p-2 sm:p-4 align-middle hidden md:table-cell">
                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                                  {transaction.status || "Completed"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md">
                    <p className="text-muted-foreground">No transactions yet</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/wallet/deposit">Make your first deposit</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="payment-methods" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment methods for deposits and withdrawals</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">M-Pesa</p>
                          <p className="text-sm text-muted-foreground">07XX XXX XXX</p>
                        </div>
                      </div>
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Default</div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Credit Card</p>
                          <p className="text-sm text-muted-foreground">**** **** **** 4242</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Set Default
                      </Button>
                    </div>

                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/wallet/payment-methods">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Add Payment Method
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Deposit</CardTitle>
                    <CardDescription>Add funds to your wallet</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WalletDeposit onSuccess={handleRefresh} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>

        {/* Wallet Information Dialog */}
        <Dialog open={showWalletInfo} onOpenChange={setShowWalletInfo}>
          <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Centralized Wallet System</DialogTitle>
              <DialogDescription>Important information about how your funds are managed</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">How Shilingi X Wallet Works</h3>
              <p>
                Shilingi X uses a centralized wallet system. Your funds are securely managed by the platform, and all
                transactions are processed through our system wallet. This allows for faster transactions and lower
                fees.
              </p>
              <h3 className="text-lg font-medium">Blockchain Integration</h3>
              <p>
                While your funds are managed centrally, all investment transactions are recorded on the Hedera
                blockchain using smart contract ID {contractService.getContractId()} for transparency and security.
              </p>
              <p>
                Your wallet address on the blockchain is {contractService.getWalletId ? contractService.getWalletId() : "Not connected"}, which is used to track your
                investments and transactions.
              </p>
              <h3 className="text-lg font-medium">Security Measures</h3>
              <p>
                All funds are stored in secure, insured accounts. We employ industry-standard security practices to
                protect your financial information and assets.
              </p>
              <h3 className="text-lg font-medium">Withdrawals and Deposits</h3>
              <p>
                Deposits are processed immediately through M-Pesa and other payment methods. Withdrawals are typically
                processed within 24 hours during business days.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 dark:bg-amber-900/20 dark:border-amber-900/30">
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Important Notice</h4>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  This is a demonstration platform. In a production environment, all transactions would be secured with
                  additional verification steps and regulatory compliance measures.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
