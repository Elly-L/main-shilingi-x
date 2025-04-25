"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Building, Coins, DollarSign, Loader2, PieChart, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/protected-route"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PortfolioPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [investments, setInvestments] = useState([])
  const [error, setError] = useState(null)
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

  useEffect(() => {
    if (user) {
      fetchPortfolioData()
    }
  }, [user])

  const fetchPortfolioData = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      console.log("Fetching portfolio data for user:", user.id)

      // Fetch investments
      const { data, error } = await supabase
        .from("investments")
        .select("*, transactions(blockchain_tx_hash)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching investments:", error)
        throw error
      }

      console.log("Fetched investments:", data?.length || 0)
      setInvestments(data || [])

      // Calculate portfolio stats
      if (data && data.length > 0) {
        let totalValue = 0
        let totalReturns = 0
        let governmentValue = 0
        let infrastructureValue = 0
        let equityValue = 0

        data.forEach((investment) => {
          const amount = Number(investment.amount || 0)
          const interestRate = Number(investment.interest_rate || 0)
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
    } catch (err) {
      console.error("Error fetching portfolio data:", err)
      setError(err.message || "Could not fetch your portfolio data")
      toast({
        title: "Error",
        description: "Could not fetch your portfolio data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSellInvestment = async (investmentId) => {
    if (!user) return

    try {
      // Find the investment
      const investment = investments.find((inv) => inv.id === investmentId)
      if (!investment) return

      // Update investment status
      const { error: updateError } = await supabase
        .from("investments")
        .update({ status: "sold" })
        .eq("id", investmentId)

      if (updateError) throw updateError

      // Add transaction
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "sale",
        amount: Number(investment.amount || 0),
        source: investment.investment_name || "Investment",
        description: `Sale of ${investment.investment_name || "Investment"}`,
      })

      if (transactionError) throw transactionError

      // Update wallet balance
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single()

      if (walletError) throw walletError

      const newBalance = Number(walletData.balance || 0) + Number(investment.amount || 0)

      const { error: updateWalletError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", user.id)

      if (updateWalletError) throw updateWalletError

      toast({
        title: "Investment sold",
        description: `Your investment in ${investment.investment_name || "Investment"} has been sold and the funds have been added to your wallet.`,
      })

      // Refresh data
      fetchPortfolioData()
    } catch (error) {
      console.error("Error selling investment:", error)
      toast({
        title: "Error",
        description: "Could not sell your investment",
        variant: "destructive",
      })
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
          <p className="text-sm text-muted-foreground">Loading portfolio...</p>
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
              <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
              <p className="text-muted-foreground">Manage your investments and track performance.</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/investments">
                  <DollarSign className="mr-2 h-4 w-4" />
                  New Investment
                </Link>
              </Button>
            </div>
          </motion.div>

          {error && (
            <motion.div variants={itemVariants}>
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

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
                <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
                <PieChart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{investments.length}</div>
                <div className="text-xs text-muted-foreground">Active investments in your portfolio</div>
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
                <TabsTrigger value="overview">All Investments</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
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
                              <CardTitle className="text-base font-medium">
                                {investment.investment_name || "Investment"}
                              </CardTitle>
                              <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                            </CardHeader>
                            <CardContent>
                              <CardDescription className="capitalize">
                                {investment.investment_type || "Other"}
                              </CardDescription>

                              <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Value:</span>
                                  <span className="font-medium">
                                    KES {Number(investment.amount || 0).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Return:</span>
                                  <span className="font-medium text-green-500">
                                    +{Number(investment.interest_rate || 0).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Purchased:</span>
                                  <span className="font-medium">
                                    {new Date(investment.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                {investment.transactions && investment.transactions[0]?.blockchain_tx_hash && (
                                  <div className="flex items-center justify-center mt-1">
                                    <a
                                      href={`https://hashscan.io/testnet/transaction/${investment.transactions[0].blockchain_tx_hash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-xs text-primary hover:text-primary/80"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Verified on blockchain
                                    </a>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleSellInvestment(investment.id)}
                              >
                                Sell Investment
                              </Button>
                              <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link href={`/investments/${investment.investment_type}`}>View Details</Link>
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
              </TabsContent>

              <TabsContent value="performance" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Performance</CardTitle>
                    <CardDescription>Track the performance of your investments over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {investments.length > 0 ? (
                      <div className="space-y-4">
                        {investments.map((investment) => {
                          const returnAmount =
                            (Number(investment.amount || 0) * Number(investment.interest_rate || 0)) / 100
                          return (
                            <div key={investment.id} className="p-4 border rounded-md">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded-full bg-primary/10">
                                    {React.createElement(getInvestmentIcon(investment.investment_type), {
                                      className: "h-4 w-4 text-primary",
                                    })}
                                  </div>
                                  <span className="font-medium">{investment.investment_name || "Investment"}</span>
                                </div>
                                <span className="text-sm text-green-600">
                                  +{Number(investment.interest_rate || 0).toFixed(1)}%
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Principal:</span>
                                  <span>KES {Number(investment.amount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Annual Return:</span>
                                  <span className="text-green-600">KES {returnAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Maturity Date:</span>
                                  <span>
                                    {investment.maturity_date
                                      ? new Date(investment.maturity_date).toLocaleDateString()
                                      : "N/A (Equity)"}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <div className="w-full bg-muted rounded-full h-2.5">
                                  <div
                                    className="bg-primary h-2.5 rounded-full"
                                    style={{ width: `${Number(investment.interest_rate || 0)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No investment data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}
