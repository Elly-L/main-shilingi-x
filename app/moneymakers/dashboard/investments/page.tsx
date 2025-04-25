"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"
import { Loader2, Search, Filter, MoreHorizontal, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function InvestmentsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [investments, setInvestments] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const { data, error } = await supabase
          .from("investments")
          .select("*, profiles(full_name, email)")
          .order("created_at", { ascending: false })

        if (error) throw error

        setInvestments(data || [])
      } catch (err) {
        console.error("Error fetching investments:", err)
        toast({
          variant: "destructive",
          title: "Error loading investments",
          description: err.message || "Failed to load investment data",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvestments()
  }, [toast])

  const filteredInvestments = investments.filter((investment) => {
    const matchesSearch =
      (investment.id && investment.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (investment.profiles?.full_name &&
        investment.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (investment.profiles?.email && investment.profiles.email.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || investment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleApproveInvestment = async (id) => {
    try {
      const { error } = await supabase.from("investments").update({ status: "active" }).eq("id", id)

      if (error) throw error

      setInvestments(
        investments.map((investment) => {
          if (investment.id === id) {
            return { ...investment, status: "active" }
          }
          return investment
        }),
      )

      toast({
        title: "Investment approved",
        description: "The investment has been approved successfully",
      })
    } catch (err) {
      console.error("Error approving investment:", err)
      toast({
        variant: "destructive",
        title: "Error approving investment",
        description: err.message || "Failed to approve investment",
      })
    }
  }

  const handleRejectInvestment = async (id) => {
    try {
      const { error } = await supabase.from("investments").update({ status: "rejected" }).eq("id", id)

      if (error) throw error

      setInvestments(
        investments.map((investment) => {
          if (investment.id === id) {
            return { ...investment, status: "rejected" }
          }
          return investment
        }),
      )

      toast({
        title: "Investment rejected",
        description: "The investment has been rejected",
      })
    } catch (err) {
      console.error("Error rejecting investment:", err)
      toast({
        variant: "destructive",
        title: "Error rejecting investment",
        description: err.message || "Failed to reject investment",
      })
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investments</h1>
          <p className="text-muted-foreground">Manage user investments and approvals</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investment Management</CardTitle>
          <CardDescription>View and manage all investments on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search investments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Investments</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvestments.length > 0 ? (
                        filteredInvestments.map((investment) => (
                          <tr key={investment.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle font-mono text-sm">{investment.id.substring(0, 8)}</td>
                            <td className="p-4 align-middle">
                              <div>
                                <div>{investment.profiles?.full_name || "Unknown"}</div>
                                <div className="text-xs text-muted-foreground">{investment.profiles?.email}</div>
                              </div>
                            </td>
                            <td className="p-4 align-middle font-medium">
                              KES {Number(investment.amount).toLocaleString()}
                            </td>
                            <td className="p-4 align-middle capitalize">{investment.investment_type || "Bond"}</td>
                            <td className="p-4 align-middle text-muted-foreground">
                              {formatDate(investment.created_at)}
                            </td>
                            <td className="p-4 align-middle">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  investment.status === "active"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                                    : investment.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"
                                      : investment.status === "completed"
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500"
                                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
                                }`}
                              >
                                {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
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
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  {investment.status === "pending" && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleApproveInvestment(investment.id)}>
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleRejectInvestment(investment.id)}>
                                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-muted-foreground">
                            No investments found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvestments.filter((i) => i.status === "pending").length > 0 ? (
                        filteredInvestments
                          .filter((i) => i.status === "pending")
                          .map((investment) => (
                            <tr key={investment.id} className="border-b transition-colors hover:bg-muted/50">
                              <td className="p-4 align-middle font-mono text-sm">{investment.id.substring(0, 8)}</td>
                              <td className="p-4 align-middle">
                                <div>
                                  <div>{investment.profiles?.full_name || "Unknown"}</div>
                                  <div className="text-xs text-muted-foreground">{investment.profiles?.email}</div>
                                </div>
                              </td>
                              <td className="p-4 align-middle font-medium">
                                KES {Number(investment.amount).toLocaleString()}
                              </td>
                              <td className="p-4 align-middle capitalize">{investment.investment_type || "Bond"}</td>
                              <td className="p-4 align-middle text-muted-foreground">
                                {formatDate(investment.created_at)}
                              </td>
                              <td className="p-4 align-middle">
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-green-600"
                                    onClick={() => handleApproveInvestment(investment.id)}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-red-600"
                                    onClick={() => handleRejectInvestment(investment.id)}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-muted-foreground">
                            No pending investments found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="active" className="mt-6">
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvestments.filter((i) => i.status === "active").length > 0 ? (
                        filteredInvestments
                          .filter((i) => i.status === "active")
                          .map((investment) => (
                            <tr key={investment.id} className="border-b transition-colors hover:bg-muted/50">
                              <td className="p-4 align-middle font-mono text-sm">{investment.id.substring(0, 8)}</td>
                              <td className="p-4 align-middle">
                                <div>
                                  <div>{investment.profiles?.full_name || "Unknown"}</div>
                                  <div className="text-xs text-muted-foreground">{investment.profiles?.email}</div>
                                </div>
                              </td>
                              <td className="p-4 align-middle font-medium">
                                KES {Number(investment.amount).toLocaleString()}
                              </td>
                              <td className="p-4 align-middle capitalize">{investment.investment_type || "Bond"}</td>
                              <td className="p-4 align-middle text-muted-foreground">
                                {formatDate(investment.created_at)}
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
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-muted-foreground">
                            No active investments found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvestments.filter((i) => i.status === "completed").length > 0 ? (
                        filteredInvestments
                          .filter((i) => i.status === "completed")
                          .map((investment) => (
                            <tr key={investment.id} className="border-b transition-colors hover:bg-muted/50">
                              <td className="p-4 align-middle font-mono text-sm">{investment.id.substring(0, 8)}</td>
                              <td className="p-4 align-middle">
                                <div>
                                  <div>{investment.profiles?.full_name || "Unknown"}</div>
                                  <div className="text-xs text-muted-foreground">{investment.profiles?.email}</div>
                                </div>
                              </td>
                              <td className="p-4 align-middle font-medium">
                                KES {Number(investment.amount).toLocaleString()}
                              </td>
                              <td className="p-4 align-middle capitalize">{investment.investment_type || "Bond"}</td>
                              <td className="p-4 align-middle text-muted-foreground">
                                {formatDate(investment.created_at)}
                              </td>
                              <td className="p-4 align-middle text-green-600">
                                +KES {(Number(investment.amount) * 0.12).toLocaleString()}
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-muted-foreground">
                            No completed investments found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
