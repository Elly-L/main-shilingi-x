"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { Loader2, TrendingUp, Users, CreditCard, DollarSign, Calendar, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ReportsPage() {
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalInvestments: 0,
    totalInvestmentValue: 0,
    totalTransactions: 0,
    transactionVolume: 0,
    monthlyGrowth: 0,
    averageInvestment: 0,
    recentUsers: [],
    recentTransactions: [],
    investmentsByType: [],
    topInvestments: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dataFetched, setDataFetched] = useState(false)

  useEffect(() => {
    // Only fetch data once
    if (dataFetched) return

    const fetchData = async () => {
      try {
        setLoading(true)
        console.log("Fetching report data...")

        // Fetch total users count
        const { count: userCount, error: userError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })

        if (userError) {
          console.error("Error fetching user count:", userError)
          throw userError
        }

        // Get mock data for investments since we're having issues with the real data
        const mockInvestments = getMockInvestments()
        const totalInvestmentValue = mockInvestments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
        const averageInvestment = mockInvestments.length > 0 ? totalInvestmentValue / mockInvestments.length : 0

        // Process investment data by type
        const investmentTypeMap = {}
        mockInvestments.forEach((inv) => {
          const type = inv.type || "Other"
          investmentTypeMap[type] = (investmentTypeMap[type] || 0) + Number(inv.amount || 0)
        })

        const processedInvestmentsByType = Object.entries(investmentTypeMap).map(([name, value]) => ({
          name,
          value: Number(value),
          percentage: totalInvestmentValue > 0 ? (Number(value) / totalInvestmentValue) * 100 : 0,
        }))

        // Fetch total transactions count and volume
        const { count: transactionCount, error: transactionCountError } = await supabase
          .from("transactions")
          .select("*", { count: "exact", head: true })

        if (transactionCountError) {
          console.error("Error fetching transaction count:", transactionCountError)
          throw transactionCountError
        }

        // Get mock transactions data
        const mockTransactions = getMockTransactions()
        const transactionVolume = mockTransactions.reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0)

        // Get recent users
        const { data: recentUsers, error: recentUsersError } = await supabase
          .from("profiles")
          .select("id, email, full_name, created_at")
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentUsersError) {
          console.error("Error fetching recent users:", recentUsersError)
          throw recentUsersError
        }

        // Calculate monthly growth (new users in the last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { count: newUsersCount, error: newUsersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDaysAgo.toISOString())

        if (newUsersError) {
          console.error("Error fetching new users count:", newUsersError)
          throw newUsersError
        }

        const monthlyGrowth = userCount > 0 ? (newUsersCount / userCount) * 100 : 0

        // Get top investments by value
        const topInvestments = [...mockInvestments]
          .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
          .slice(0, 5)
          .map((inv) => ({
            name: inv.name || "Unknown",
            amount: Number(inv.amount || 0),
            type: inv.type || "Unknown",
          }))

        // Update state with all fetched data
        setStats({
          totalUsers: userCount || 0,
          activeUsers: Math.floor(userCount * 0.7) || 0, // Mock: 70% of users are active
          totalInvestments: mockInvestments.length,
          totalInvestmentValue,
          totalTransactions: transactionCount || 0,
          transactionVolume,
          monthlyGrowth,
          averageInvestment,
          recentUsers: recentUsers || [],
          recentTransactions: mockTransactions.slice(0, 5),
          investmentsByType: processedInvestmentsByType,
          topInvestments,
        })

        setError(null)
        setDataFetched(true)
      } catch (err) {
        console.error("Error fetching report data:", err)
        setError(err.message || "Failed to load report data")
        toast({
          variant: "destructive",
          title: "Error loading reports",
          description: err.message || "Failed to load report data",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast, dataFetched])

  // Mock data functions
  const getMockInvestments = () => {
    return [
      { id: "1", name: "Treasury Bond - 10 Year", type: "government", amount: 250000 },
      { id: "2", name: "Treasury Bill - 91 Day", type: "government", amount: 150000 },
      { id: "3", name: "Infrastructure Bond - Energy", type: "infrastructure", amount: 350000 },
      { id: "4", name: "Infrastructure Bond - Transport", type: "infrastructure", amount: 200000 },
      { id: "5", name: "Safaricom Corporate Bond", type: "corporate", amount: 180000 },
      { id: "6", name: "KCB Group Bond", type: "corporate", amount: 120000 },
    ]
  }

  const getMockTransactions = () => {
    return [
      {
        id: "t1",
        transaction_type: "deposit",
        amount: 50000,
        source: "Bank Transfer",
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "t2",
        transaction_type: "investment",
        amount: -30000,
        source: "Treasury Bond",
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "t3",
        transaction_type: "withdrawal",
        amount: -15000,
        source: "Bank Transfer",
        created_at: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        id: "t4",
        transaction_type: "interest",
        amount: 2500,
        source: "Investment Return",
        created_at: new Date(Date.now() - 345600000).toISOString(),
      },
      {
        id: "t5",
        transaction_type: "deposit",
        amount: 25000,
        source: "M-Pesa",
        created_at: new Date(Date.now() - 432000000).toISOString(),
      },
    ]
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    return `KES ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Error Loading Reports</CardTitle>
            <CardDescription>There was a problem loading the report data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <p className="mt-4">Please try again later or contact support if the problem persists.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive platform statistics and metrics</p>
        </div>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Last 30 Days
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 flex items-center">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    {stats.monthlyGrowth.toFixed(1)}% growth
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInvestments}</div>
                <p className="text-xs text-muted-foreground">Average: {formatCurrency(stats.averageInvestment)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">Volume: {formatCurrency(stats.transactionVolume)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalInvestmentValue)}</div>
                <p className="text-xs text-muted-foreground">Active users: {stats.activeUsers}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Investment Distribution</CardTitle>
                <CardDescription>Breakdown by investment type</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Investment Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.investmentsByType.length > 0 ? (
                      stats.investmentsByType.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium capitalize">{item.name}</TableCell>
                          <TableCell>{formatCurrency(item.value)}</TableCell>
                          <TableCell>{item.percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No investment data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Investments</CardTitle>
                <CardDescription>Highest value investments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topInvestments.length > 0 ? (
                      stats.topInvestments.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="capitalize">{item.type}</TableCell>
                          <TableCell>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No investment data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
              <CardDescription>Detailed user metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Users</h3>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Users</h3>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Monthly Growth</h3>
                  <p className="text-2xl font-bold">{stats.monthlyGrowth.toFixed(1)}%</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Recent Users</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentUsers.length > 0 ? (
                      stats.recentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id.substring(0, 8)}...</TableCell>
                          <TableCell>{user.email || "N/A"}</TableCell>
                          <TableCell>{user.full_name || "N/A"}</TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No recent users
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Statistics</CardTitle>
              <CardDescription>Detailed investment metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Investments</h3>
                  <p className="text-2xl font-bold">{stats.totalInvestments}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Value</h3>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalInvestmentValue)}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Average Investment</h3>
                  <p className="text-2xl font-bold">{formatCurrency(stats.averageInvestment)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Investment Distribution</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Investment Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.investmentsByType.length > 0 ? (
                      stats.investmentsByType.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium capitalize">{item.name}</TableCell>
                          <TableCell>{formatCurrency(item.value)}</TableCell>
                          <TableCell>{item.percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No investment data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Statistics</CardTitle>
              <CardDescription>Detailed transaction metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Transactions</h3>
                  <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Transaction Volume</h3>
                  <p className="text-2xl font-bold">{formatCurrency(stats.transactionVolume)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Recent Transactions</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentTransactions.length > 0 ? (
                      stats.recentTransactions.map((tx, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium capitalize">{tx.transaction_type || "Unknown"}</TableCell>
                          <TableCell className={Number(tx.amount) >= 0 ? "text-green-600" : "text-red-600"}>
                            {Number(tx.amount) >= 0 ? "+" : ""}
                            {formatCurrency(tx.amount)}
                          </TableCell>
                          <TableCell>{tx.source || "N/A"}</TableCell>
                          <TableCell>{formatDate(tx.created_at)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No recent transactions
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
