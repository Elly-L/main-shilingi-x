"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabaseClient"
import { Loader2, Users, CreditCard, TrendingUp, DollarSign, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function AdminDashboardPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalInvestments: 0,
    totalValue: 0,
    recentUsers: [],
    recentTransactions: [],
    investmentsByType: [],
    transactionsByDay: [],
  })

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Get total users
        const { count: userCount, error: userError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })

        if (userError) throw userError

        // Get total transactions
        const { count: transactionCount, error: transactionError } = await supabase
          .from("transactions")
          .select("*", { count: "exact", head: true })

        if (transactionError) throw transactionError

        // Get total investments
        const { count: investmentCount, error: investmentError } = await supabase
          .from("investments")
          .select("*", { count: "exact", head: true })

        if (investmentError) throw investmentError

        // Get total investment value
        const { data: investments, error: investmentsError } = await supabase
          .from("investments")
          .select("amount")
          .eq("status", "active")

        if (investmentsError) throw investmentsError

        const totalValue = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0

        // Get recent users
        const { data: recentUsers, error: recentUsersError } = await supabase
          .from("profiles")
          .select("id, role, created_at")
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentUsersError) throw recentUsersError

        // Get recent transactions
        const { data: recentTransactions, error: recentTransactionsError } = await supabase
          .from("transactions")
          .select("id, amount, transaction_type, created_at")
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentTransactionsError) throw recentTransactionsError

        // Generate mock data for charts (replace with real data in production)
        const investmentsByType = [
          { name: "Government", value: 45 },
          { name: "Corporate", value: 30 },
          { name: "Infrastructure", value: 15 },
          { name: "Green", value: 10 },
        ]

        const transactionsByDay = [
          { name: "Mon", value: 4000 },
          { name: "Tue", value: 3000 },
          { name: "Wed", value: 2000 },
          { name: "Thu", value: 2780 },
          { name: "Fri", value: 1890 },
          { name: "Sat", value: 2390 },
          { name: "Sun", value: 3490 },
        ]

        setStats({
          totalUsers: userCount || 0,
          totalTransactions: transactionCount || 0,
          totalInvestments: investmentCount || 0,
          totalValue,
          recentUsers: recentUsers || [],
          recentTransactions: recentTransactions || [],
          investmentsByType,
          transactionsByDay,
        })
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err)
        toast({
          variant: "destructive",
          title: "Error loading dashboard",
          description: err.message || "Failed to load dashboard statistics",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardStats()
  }, [toast])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform statistics and activities</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users on the platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Processed transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvestments}</div>
            <p className="text-xs text-muted-foreground">Active and completed investments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total investment value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Transactions</CardTitle>
                <CardDescription>Transaction volume over the past week</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.transactionsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#10b981" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Distribution</CardTitle>
                <CardDescription>Breakdown by investment type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.investmentsByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>Detailed metrics and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-2">User Growth</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { month: "Jan", users: 400 },
                          { month: "Feb", users: 600 },
                          { month: "Mar", users: 800 },
                          { month: "Apr", users: 1000 },
                          { month: "May", users: 1200 },
                          { month: "Jun", users: 1500 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="users" stroke="#10b981" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Revenue Breakdown</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { category: "Fees", value: 4000 },
                          { category: "Interest", value: 3000 },
                          { category: "Commissions", value: 2000 },
                          { category: "Other", value: 1000 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentUsers.length > 0 ? (
                    stats.recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.id.substring(0, 8)}...</p>
                          <p className="text-sm text-muted-foreground">Role: {user.role || "user"}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No recent users</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentTransactions.length > 0 ? (
                    stats.recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {transaction.transaction_type.charAt(0).toUpperCase() +
                              transaction.transaction_type.slice(1)}
                          </p>
                          <p
                            className={`text-sm ${Number(transaction.amount) >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {Number(transaction.amount) >= 0 ? "+" : ""}
                            {Number(transaction.amount).toLocaleString()} KES
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No recent transactions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
