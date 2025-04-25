"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Building, ChevronRight, Coins, DollarSign, Loader2, Plus, Wallet } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/protected-route"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [walletBalance, setWalletBalance] = useState(0)
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    totalReturns: 0,
    percentChange: 0,
    distribution: {
      government: 0,
      infrastructure: 0,
      equity: 0,
    },
  })
  const [investments, setInvestments] = useState([])
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    } else if (!user && !isLoading) {
      // If user is not loading and still null, show a message
      setError("Please log in to view your dashboard")
      setIsLoading(false)
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      console.log("Fetching dashboard data for user:", user?.id)

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

      // Fetch investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3)

      if (investmentsError) {
        console.error("Investments error:", investmentsError)
        throw investmentsError
      }

      console.log("Fetched investments:", investmentsData?.length || 0)
      setInvestments(investmentsData || [])

      // Calculate portfolio stats
      if (investmentsData && investmentsData.length > 0) {
        // Fetch all investments for portfolio stats
        const { data: allInvestments, error: allInvestmentsError } = await supabase
          .from("investments")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")

        if (allInvestmentsError) {
          console.error("All investments error:", allInvestmentsError)
          throw allInvestmentsError
        }

        console.log("Fetched all investments for stats:", allInvestments?.length || 0)

        let totalValue = 0
        let totalReturns = 0
        let governmentValue = 0
        let infrastructureValue = 0
        let equityValue = 0

        allInvestments.forEach((investment) => {
          const amount = Number(investment.amount)
          const interestRate = Number(investment.interest_rate)
          const returns = (amount * interestRate) / 100

          totalValue += amount
          totalReturns += returns

          if (investment.investment_type === "government") {
            governmentValue += amount
          } else if (investment.investment_type === "infrastructure") {
            infrastructureValue += amount
          } else if (investment.investment_type === "equity") {
            equityValue += amount
          }
        })

        setPortfolioStats({
          totalValue,
          totalReturns,
          percentChange: totalValue > 0 ? (totalReturns / totalValue) * 100 : 0,
          distribution: {
            government: totalValue > 0 ? (governmentValue / totalValue) * 100 : 0,
            infrastructure: totalValue > 0 ? (infrastructureValue / totalValue) * 100 : 0,
            equity: totalValue > 0 ? (equityValue / totalValue) * 100 : 0,
          },
        })
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (transactionsError) {
        console.error("Transactions error:", transactionsError)
        throw transactionsError
      }

      console.log("Fetched transactions:", transactionsData?.length || 0)
      setTransactions(transactionsData || [])

      setError(null)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Could not fetch your dashboard data. Please try again later.")
      toast({
        title: "Error",
        description: "Could not fetch your dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getInvestmentIcon = (type) => {
    switch (type) {
      case "government":
        return Building
      case "infrastructure":
        return BarChart3
      case "equity":
        return Coins
      default:
        return DollarSign
    }
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
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600">
            <Loader2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's an overview of your investments.</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/investments">
                  <Plus className="mr-2 h-4 w-4" />
                  New Investment
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/wallet/deposit">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Deposit Funds
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30">
                <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">KES {portfolioStats.totalValue.toLocaleString()}</div>
                <div className="flex items-center text-sm">
                  <span className={portfolioStats.percentChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {portfolioStats.percentChange >= 0 ? "+" : ""}
                    {portfolioStats.percentChange.toFixed(2)}%
                  </span>
                  <span className="text-muted-foreground ml-1">
                    (KES {portfolioStats.totalReturns.toLocaleString()}/year)
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
                <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                <Wallet className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">KES {walletBalance.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Available for investment or withdrawal</div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
                <CardTitle className="text-sm font-medium">Asset Allocation</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent className="pt-6 space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Government Securities</span>
                    <span>{portfolioStats.distribution.government.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={portfolioStats.distribution.government}
                    className="h-2 bg-muted"
                    indicatorClassName="bg-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Infrastructure Bonds</span>
                    <span>{portfolioStats.distribution.infrastructure.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={portfolioStats.distribution.infrastructure}
                    className="h-2 bg-muted"
                    indicatorClassName="bg-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Equities</span>
                    <span>{portfolioStats.distribution.equity.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={portfolioStats.distribution.equity}
                    className="h-2 bg-muted"
                    indicatorClassName="bg-purple-500"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Your Investments</h2>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/portfolio">
                        View All
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  {investments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {investments.map((investment, index) => {
                        const Icon = getInvestmentIcon(investment.investment_type)
                        return (
                          <motion.div
                            key={investment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="h-full hover:shadow-md transition-shadow duration-300 group">
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">{investment.investment_name}</CardTitle>
                                <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                  <Icon className="h-5 w-5 text-primary" />
                                </div>
                              </CardHeader>
                              <CardContent>
                                <CardDescription className="capitalize">{investment.investment_type}</CardDescription>
                                <div className="mt-2 space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Value:</span>
                                    <span className="font-medium">
                                      KES {Number(investment.amount).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Return:</span>
                                    <span className="font-medium text-green-500">
                                      +{Number(investment.interest_rate).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                  asChild
                                >
                                  <Link href={`/portfolio`}>View Details</Link>
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg">
                      <p className="text-muted-foreground mb-4">You don't have any investments yet.</p>
                      <Button asChild>
                        <Link href="/investments">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Browse Investments
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="transactions" className="space-y-6 mt-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Recent Transactions</h2>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/transactions">
                        View All
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  {transactions.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                Type
                              </th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                Amount
                              </th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                Date
                              </th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((transaction, index) => (
                              <motion.tr
                                key={transaction.id}
                                className="border-b transition-colors hover:bg-muted/50"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                              >
                                <td className="p-4 align-middle capitalize">{transaction.transaction_type}</td>
                                <td
                                  className={`p-4 align-middle ${Number(transaction.amount) >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {Number(transaction.amount) >= 0 ? "+" : ""}
                                  KES {Math.abs(Number(transaction.amount)).toLocaleString()}
                                </td>
                                <td className="p-4 align-middle">
                                  {new Date(transaction.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4 align-middle">
                                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    {transaction.status || "Completed"}
                                  </span>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg">
                      <p className="text-muted-foreground">No transactions yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}
