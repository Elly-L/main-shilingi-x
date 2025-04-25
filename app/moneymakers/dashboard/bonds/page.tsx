"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { Search, Plus, Filter, MoreHorizontal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function BondsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [bonds, setBonds] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [bondType, setBondType] = useState("all")
  const [selectedBond, setSelectedBond] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isIssueBondModalOpen, setIsIssueBondModalOpen] = useState(false)

  useEffect(() => {
    const fetchBonds = async () => {
      try {
        setIsLoading(true)

        // Try to fetch from investment_options table
        const { data, error } = await supabase
          .from("investment_options")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching bonds:", error)
          // If not found in database, use mock data
          setBonds(getMockBonds())
        } else if (data && data.length > 0) {
          setBonds(data)
        } else {
          setBonds(getMockBonds())
        }
      } catch (err) {
        console.error("Error in fetchBonds:", err)
        toast({
          title: "Error loading bonds",
          description: err.message || "Failed to load bond data",
          variant: "destructive",
        })
        setBonds(getMockBonds())
      } finally {
        setIsLoading(false)
      }
    }

    fetchBonds()
  }, [toast])

  // Mock data for fallback
  const getMockBonds = () => {
    return [
      {
        id: "g1",
        name: "Treasury Bond - 10 Year",
        type: "government",
        description: "10-year government bond with fixed interest rate.",
        interest_rate: 12.5,
        min_investment: 100,
        available_amount: 1000000,
        term_days: 3650,
        status: "active",
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        investors_count: 156,
        total_invested: 780000,
      },
      {
        id: "g2",
        name: "Treasury Bill - 91 Day",
        type: "government",
        description: "91-day government treasury bill.",
        interest_rate: 9.8,
        min_investment: 100,
        available_amount: 500000,
        term_days: 91,
        status: "active",
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        investors_count: 89,
        total_invested: 320000,
      },
      {
        id: "i1",
        name: "Infrastructure Bond - Energy",
        type: "infrastructure",
        description: "5-year infrastructure bond for energy projects.",
        interest_rate: 13.2,
        min_investment: 100,
        available_amount: 750000,
        term_days: 1825,
        status: "active",
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        investors_count: 112,
        total_invested: 560000,
      },
      {
        id: "c1",
        name: "Safaricom Corporate Bond",
        type: "corporate",
        description: "5-year corporate bond issued by Safaricom PLC with fixed interest rate.",
        interest_rate: 13.5,
        min_investment: 100,
        available_amount: 500000,
        term_days: 1825,
        status: "active",
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        investors_count: 78,
        total_invested: 390000,
      },
    ]
  }

  // Filter bonds based on search query and filters
  const filteredBonds = bonds.filter((bond) => {
    const matchesSearch =
      (bond.name && bond.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (bond.description && bond.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = bondType === "all" || bond.type === bondType

    return matchesSearch && matchesType
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">Active</Badge>
      case "closed":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">Closed</Badge>
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">Pending</Badge>
        )
      default:
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">Active</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bonds</h1>
          <p className="text-muted-foreground">Manage all bond offerings on the platform</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Bond
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bond Management</CardTitle>
          <CardDescription>View and manage all bonds on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search bonds..." className="pl-8" />
            </div>
            <Button className="ml-2">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Interest Rate
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Term</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Min. Investment
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 align-middle font-medium">Treasury Bond - 10 Year</td>
                    <td className="p-4 align-middle">Government</td>
                    <td className="p-4 align-middle">12.5%</td>
                    <td className="p-4 align-middle">3650 days</td>
                    <td className="p-4 align-middle">KES 100</td>
                    <td className="p-4 align-middle">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                        Active
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Bond</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
