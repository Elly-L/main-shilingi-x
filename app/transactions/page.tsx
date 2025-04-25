"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownUp, Calendar, ChevronDown, Download, Filter, Loader2, Search, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/protected-route"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

export default function TransactionsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("all-time")
  const [transactionType, setTransactionType] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [user])

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setTransactions(data || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "Error",
        description: "Could not fetch your transactions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter transactions based on active tab, search query, and filters
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesTab = activeTab === "all" || transaction.transaction_type === activeTab
    const matchesSearch =
      (transaction.description && transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.source && transaction.source.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = transactionType === "all" || transaction.transaction_type === transactionType

    // Date filtering logic
    let matchesDate = true
    if (dateRange !== "all-time") {
      const transactionDate = new Date(transaction.created_at)
      const now = new Date()

      if (dateRange === "today") {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        matchesDate = transactionDate >= today
      } else if (dateRange === "this-week") {
        const startOfWeek = new Date()
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        matchesDate = transactionDate >= startOfWeek
      } else if (dateRange === "this-month") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        matchesDate = transactionDate >= startOfMonth
      } else if (dateRange === "last-3-months") {
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(now.getMonth() - 3)
        matchesDate = transactionDate >= threeMonthsAgo
      }
    }

    return matchesTab && matchesSearch && matchesType && matchesDate
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "deposit":
        return <ArrowDownUp className="h-4 w-4 text-green-600 rotate-180" />
      case "withdrawal":
        return <ArrowDownUp className="h-4 w-4 text-red-600" />
      case "investment":
        return <ArrowDownUp className="h-4 w-4 text-blue-600" />
      case "interest":
        return <ArrowDownUp className="h-4 w-4 text-purple-600 rotate-180" />
      case "transfer":
        return <ArrowDownUp className="h-4 w-4 text-orange-600" />
      case "dividend":
        return <ArrowDownUp className="h-4 w-4 text-teal-600 rotate-180" />
      case "sale":
        return <ArrowDownUp className="h-4 w-4 text-green-600 rotate-180" />
      default:
        return <ArrowDownUp className="h-4 w-4" />
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
          <p className="text-sm text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
              <p className="text-muted-foreground">View and manage your transaction history.</p>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle>Filters</CardTitle>
                <CardDescription>Narrow down your transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="this-week">This Week</SelectItem>
                        <SelectItem value="this-month">This Month</SelectItem>
                        <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                        <SelectItem value="all-time">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={transactionType} onValueChange={setTransactionType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Transaction type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="deposit">Deposits</SelectItem>
                        <SelectItem value="withdrawal">Withdrawals</SelectItem>
                        <SelectItem value="investment">Investments</SelectItem>
                        <SelectItem value="interest">Interest</SelectItem>
                        <SelectItem value="transfer">Transfers</SelectItem>
                        <SelectItem value="dividend">Dividends</SelectItem>
                        <SelectItem value="sale">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="deposit">Deposits</TabsTrigger>
                <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
                <TabsTrigger value="investment">Investments</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="mt-6">
                {filteredTransactions.length > 0 ? (
                  <div className="rounded-lg border overflow-hidden bg-card">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              <div className="flex items-center gap-1">
                                ID <ChevronDown className="h-4 w-4" />
                              </div>
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              <div className="flex items-center gap-1">
                                Type <ChevronDown className="h-4 w-4" />
                              </div>
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              <div className="flex items-center gap-1">
                                Amount <ChevronDown className="h-4 w-4" />
                              </div>
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              <div className="flex items-center gap-1">
                                Date <ChevronDown className="h-4 w-4" />
                              </div>
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              <div className="flex items-center gap-1">
                                Status <ChevronDown className="h-4 w-4" />
                              </div>
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              <div className="flex items-center gap-1">
                                Description <ChevronDown className="h-4 w-4" />
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.map((transaction, index) => (
                            <motion.tr
                              key={transaction.id}
                              className="border-b transition-colors hover:bg-muted/50 group cursor-pointer"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.05 * index }}
                            >
                              <td className="p-4 align-middle font-mono text-sm">{transaction.id.substring(0, 8)}</td>
                              <td className="p-4 align-middle">
                                <div className="flex items-center gap-2">
                                  {getTypeIcon(transaction.transaction_type)}
                                  <span className="capitalize">{transaction.transaction_type}</span>
                                </div>
                              </td>
                              <td
                                className={`p-4 align-middle font-medium ${Number(transaction.amount) >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {Number(transaction.amount) >= 0 ? "+" : ""}
                                {Math.abs(Number(transaction.amount)).toLocaleString()} KES
                              </td>
                              <td className="p-4 align-middle text-muted-foreground">
                                {formatDate(transaction.created_at)}
                              </td>
                              <td className="p-4 align-middle">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(transaction.status || "completed")}`}
                                >
                                  {(transaction.status || "completed").charAt(0).toUpperCase() +
                                    (transaction.status || "completed").slice(1)}
                                </span>
                                {transaction.blockchain_tx_hash && (
                                  <div className="mt-1">
                                    <a
                                      href={`https://hashscan.io/testnet/transaction/${transaction.blockchain_tx_hash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-xs text-primary hover:text-primary/80"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Verified on blockchain
                                    </a>
                                  </div>
                                )}
                              </td>
                              <td className="p-4 align-middle">
                                <div>
                                  <div>{transaction.description || "Transaction"}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Via {transaction.source || "System"}
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <p className="text-muted-foreground">No transactions found matching your criteria.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}
