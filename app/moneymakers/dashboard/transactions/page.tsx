"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"
import {
  Loader2,
  Search,
  Download,
  Filter,
  Calendar,
  ArrowDownUp,
  MoreHorizontal,
  Receipt,
  User,
  Clock,
  DollarSign,
  CreditCard,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function TransactionsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("all-time")
  const [transactionType, setTransactionType] = useState("all")
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editedTransaction, setEditedTransaction] = useState({
    status: "",
    description: "",
  })

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Use a direct query instead of relying on foreign key relationships
        const { data, error } = await supabase
          .from("transactions")
          .select(`
            *,
            profiles:user_id (
              full_name,
              email
            )
          `)
          .order("created_at", { ascending: false })

        if (error) {
          // If the join fails, try a simpler query
          console.warn("Error with join query:", error)

          const { data: simpleData, error: simpleError } = await supabase
            .from("transactions")
            .select("*")
            .order("created_at", { ascending: false })

          if (simpleError) throw simpleError

          setTransactions(simpleData || [])
        } else {
          setTransactions(data || [])
        }
      } catch (err) {
        console.error("Error fetching transactions:", err)
        toast({
          title: "Error loading transactions",
          description: err.message || "Failed to load transaction data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [toast])

  // Filter transactions based on search query and filters
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      (transaction.description && transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.source && transaction.source.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.profiles?.full_name &&
        transaction.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = transactionType === "all" || transaction.type === transactionType

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

    return matchesSearch && matchesType && matchesDate
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
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
      case "voided":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500"
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
    }
  }

  const handleExport = () => {
    // Create CSV content
    const headers = ["ID", "User", "Type", "Amount", "Date", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((t) =>
        [
          t.id,
          t.profiles?.full_name || "Unknown",
          t.type,
          t.amount,
          formatDate(t.created_at),
          t.status || "completed",
        ].join(","),
      ),
    ].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `transactions-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction)
    setIsViewModalOpen(true)
  }

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction)
    setEditedTransaction({
      status: transaction.status || "completed",
      description: transaction.description || "",
    })
    setIsEditModalOpen(true)
  }

  const handleSaveTransaction = async () => {
    try {
      setIsLoading(true)

      const { error } = await supabase
        .from("transactions")
        .update({
          status: editedTransaction.status,
          description: editedTransaction.description,
        })
        .eq("id", selectedTransaction.id)

      if (error) throw error

      // Update local state
      setTransactions(
        transactions.map((tx) =>
          tx.id === selectedTransaction.id
            ? { ...tx, status: editedTransaction.status, description: editedTransaction.description }
            : tx,
        ),
      )

      setIsEditModalOpen(false)
      toast({
        title: "Transaction updated",
        description: "Transaction has been updated successfully",
      })
    } catch (err) {
      console.error("Error updating transaction:", err)
      toast({
        variant: "destructive",
        title: "Error updating transaction",
        description: err.message || "Failed to update transaction",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoidTransaction = async (transactionId) => {
    try {
      setIsLoading(true)

      const { error } = await supabase.from("transactions").update({ status: "voided" }).eq("id", transactionId)

      if (error) throw error

      // Update local state
      setTransactions(transactions.map((tx) => (tx.id === transactionId ? { ...tx, status: "voided" } : tx)))

      toast({
        title: "Transaction voided",
        description: "Transaction has been voided successfully",
      })
    } catch (err) {
      console.error("Error voiding transaction:", err)
      toast({
        variant: "destructive",
        title: "Error voiding transaction",
        description: err.message || "Failed to void transaction",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and manage all platform transactions</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Management</CardTitle>
          <CardDescription>View and manage all transactions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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

          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-mono text-sm">{transaction.id.substring(0, 8)}</td>
                        <td className="p-4 align-middle">{transaction.profiles?.full_name || "Unknown"}</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <ArrowDownUp
                              className={`h-4 w-4 ${
                                Number(transaction.amount) >= 0 ? "text-green-600 rotate-180" : "text-red-600"
                              }`}
                            />
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </td>
                        <td
                          className={`p-4 align-middle font-medium ${
                            Number(transaction.amount) >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {Number(transaction.amount) >= 0 ? "+" : ""}
                          {Math.abs(Number(transaction.amount)).toLocaleString()} KES
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">{formatDate(transaction.created_at)}</td>
                        <td className="p-4 align-middle">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                              transaction.status || "completed",
                            )}`}
                          >
                            {(transaction.status || "completed").charAt(0).toUpperCase() +
                              (transaction.status || "completed").slice(1)}
                          </span>
                        </td>
                        <td className="p-4 align-middle">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewTransaction(transaction)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                                Edit Transaction
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleVoidTransaction(transaction.id)}
                              >
                                Void Transaction
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Transaction Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>View detailed information about this transaction.</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-2">
              <div className="flex justify-center mb-4">
                <div
                  className={`p-3 rounded-full ${
                    Number(selectedTransaction.amount) >= 0 ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <CreditCard
                    className={`h-6 w-6 ${Number(selectedTransaction.amount) >= 0 ? "text-green-600" : "text-red-600"}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-[24px_1fr] items-start gap-4">
                <Receipt className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedTransaction.id}</p>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                </div>
              </div>

              <div className="grid grid-cols-[24px_1fr] items-start gap-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedTransaction.profiles?.full_name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">User</p>
                </div>
              </div>

              <div className="grid grid-cols-[24px_1fr] items-start gap-4">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p
                    className={`font-medium ${
                      Number(selectedTransaction.amount) >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {Number(selectedTransaction.amount) >= 0 ? "+" : ""}
                    {Math.abs(Number(selectedTransaction.amount)).toLocaleString()} KES
                  </p>
                  <p className="text-sm text-muted-foreground">Amount</p>
                </div>
              </div>

              <div className="grid grid-cols-[24px_1fr] items-start gap-4">
                <ArrowDownUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium capitalize">{selectedTransaction.type || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">Transaction Type</p>
                </div>
              </div>

              <div className="grid grid-cols-[24px_1fr] items-start gap-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatDate(selectedTransaction.created_at)}</p>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                </div>
              </div>

              <div className="grid grid-cols-[24px_1fr] items-start gap-4">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Badge className={getStatusColor(selectedTransaction.status || "completed")}>
                    {(selectedTransaction.status || "completed").charAt(0).toUpperCase() +
                      (selectedTransaction.status || "completed").slice(1)}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">Status</p>
                </div>
              </div>

              {selectedTransaction.description && (
                <div className="border rounded-md p-3 mt-2">
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm">{selectedTransaction.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="sm:justify-start">
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewModalOpen(false)
                handleEditTransaction(selectedTransaction)
              }}
            >
              Edit Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update transaction details.</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editedTransaction.status}
                  onValueChange={(value) => setEditedTransaction({ ...editedTransaction, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="voided">Voided</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedTransaction.description}
                  onChange={(e) => setEditedTransaction({ ...editedTransaction, description: e.target.value })}
                  placeholder="Add a description or notes about this transaction"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTransaction}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
