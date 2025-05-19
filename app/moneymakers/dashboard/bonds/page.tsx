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
  Plus,
  Filter,
  MoreHorizontal,
  Briefcase,
  Calendar,
  Percent,
  DollarSign,
  Clock,
  Users,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { contractService } from "@/lib/contractService"
import { IssueBondForm } from "@/components/IssueBondForm"

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
  const [isBlockchainEnabled, setIsBlockchainEnabled] = useState(false)
  const [editedBond, setEditedBond] = useState({
    name: "",
    description: "",
    interest_rate: 0,
    term_days: 0,
    min_investment: 0,
    available_amount: 0,
    status: "active",
  })

  // Check if blockchain is connected
  useEffect(() => {
    const checkBlockchainConnection = async () => {
      try {
        const connected = await contractService.isConnected()
        setIsBlockchainEnabled(connected)
        console.log("Blockchain connection:", connected ? "Connected" : "Not connected")
      } catch (error) {
        console.error("Error checking blockchain connection:", error)
        setIsBlockchainEnabled(false)
      }
    }

    checkBlockchainConnection()
  }, [])

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
        toast({
          variant: "destructive",
          title: "Error loading bonds",
          description: "Failed to load bond data",
        })
        return
      }

      if (data && data.length > 0) {
        setBonds(data)
      } else {
        // If no bonds found, use mock data
        setBonds(getMockBonds())
      }
    } catch (err: any) {
      console.error("Error in fetchBonds:", err)
      toast({
        variant: "destructive",
        title: "Error loading bonds",
        description: err.message || "Failed to load bond data",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Call fetchBonds on component mount
  useEffect(() => {
    fetchBonds()
  }, [])

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

  const handleViewBond = (bond) => {
    setSelectedBond(bond)
    setIsViewModalOpen(true)
  }

  const handleEditBond = (bond) => {
    setSelectedBond(bond)
    setEditedBond({
      name: bond.name || "",
      description: bond.description || "",
      interest_rate: bond.interest_rate || 0,
      term_days: bond.term_days || 0,
      min_investment: bond.min_investment || 0,
      available_amount: bond.available_amount || 0,
      status: bond.status || "active",
    })
    setIsEditModalOpen(true)
  }

  const handleSaveBond = async () => {
    try {
      setIsLoading(true)

      // Try blockchain update first if the bond is from blockchain
      if (isBlockchainEnabled && selectedBond.blockchain_asset_id) {
        try {
          // Blockchain update logic would go here
          // This is a placeholder as the contract doesn't have an update function in our example
          console.log("Blockchain update not implemented yet")
        } catch (blockchainError) {
          console.error("Blockchain update failed, falling back to database:", blockchainError)
        }
      }

      // Update in database
      const { error } = await supabase
        .from("investment_options")
        .update({
          name: editedBond.name,
          description: editedBond.description,
          interest_rate: editedBond.interest_rate,
          term_days: editedBond.term_days,
          min_investment: editedBond.min_investment,
          available_amount: editedBond.available_amount,
          status: editedBond.status,
        })
        .eq("id", selectedBond.id)

      if (error) throw error

      // Update local state
      setBonds(
        bonds.map((bond) =>
          bond.id === selectedBond.id
            ? {
                ...bond,
                name: editedBond.name,
                description: editedBond.description,
                interest_rate: editedBond.interest_rate,
                term_days: editedBond.term_days,
                min_investment: editedBond.min_investment,
                available_amount: editedBond.available_amount,
                status: editedBond.status,
              }
            : bond,
        ),
      )

      setIsEditModalOpen(false)
      toast({
        title: "Bond updated",
        description: "Bond information has been updated successfully",
      })
    } catch (err) {
      console.error("Error updating bond:", err)
      toast({
        variant: "destructive",
        title: "Error updating bond",
        description: err.message || "Failed to update bond information",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleIssueBondSuccess = () => {
    setIsIssueBondModalOpen(false)
    // Refresh the bonds list
    fetchBonds()
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
          <h1 className="text-3xl font-bold tracking-tight">Bonds</h1>
          <p className="text-muted-foreground">Manage all bond offerings on the platform</p>
          {isBlockchainEnabled && (
            <div className="mt-1 text-xs text-green-600 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-600 mr-1"></div>
              Blockchain enabled (Contract ID: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS})
            </div>
          )}
        </div>
        <Button onClick={() => setIsIssueBondModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {isBlockchainEnabled ? "Issue New Bond on Blockchain" : "Add New Bond"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bond Management</CardTitle>
          <CardDescription>View and manage all bonds on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bonds..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={bondType} onValueChange={setBondType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Bond type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="equity">Equity</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  {filteredBonds.length > 0 ? (
                    filteredBonds.map((bond) => (
                      <tr key={bond.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-medium">
                          {bond.name}
                          {bond.is_blockchain && (
                            <div className="text-xs text-green-600 flex items-center mt-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1"></div>
                              Blockchain
                            </div>
                          )}
                        </td>
                        <td className="p-4 align-middle capitalize">{bond.type}</td>
                        <td className="p-4 align-middle">{bond.interest_rate}%</td>
                        <td className="p-4 align-middle">{bond.term_days} days</td>
                        <td className="p-4 align-middle">KES {bond.min_investment.toLocaleString()}</td>
                        <td className="p-4 align-middle">{getStatusBadge(bond.status)}</td>
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
                              <DropdownMenuItem onClick={() => handleViewBond(bond)}>View Details</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditBond(bond)}>Edit Bond</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
                        No bonds found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Bond Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bond Details</DialogTitle>
            <DialogDescription>View detailed information about this bond.</DialogDescription>
          </DialogHeader>
          {selectedBond && (
            <div className="space-y-4 py-2">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{selectedBond.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{selectedBond.type} Bond</p>
                {selectedBond.is_blockchain && (
                  <div className="text-xs text-green-600 flex items-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1"></div>
                    Blockchain Asset ID: {selectedBond.blockchain_asset_id}
                  </div>
                )}
              </div>

              <div className="border rounded-md p-3">
                <p className="text-sm">{selectedBond.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Interest Rate</p>
                  </div>
                  <p className="text-lg font-semibold">{selectedBond.interest_rate}%</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Term</p>
                  </div>
                  <p className="text-lg font-semibold">{selectedBond.term_days} days</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Min. Investment</p>
                  </div>
                  <p className="text-lg font-semibold">KES {selectedBond.min_investment.toLocaleString()}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Listed On</p>
                  </div>
                  <p className="text-lg font-semibold">{formatDate(selectedBond.created_at)}</p>
                </div>
              </div>

              {selectedBond.total_invested && selectedBond.available_amount && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Funding Progress</p>
                    </div>
                    <p className="text-sm font-medium">
                      {Math.round((selectedBond.total_invested / selectedBond.available_amount) * 100)}%
                    </p>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${Math.min(
                          Math.round((selectedBond.total_invested / selectedBond.available_amount) * 100),
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <p>KES {selectedBond.total_invested.toLocaleString()} raised</p>
                    <p>{selectedBond.investors_count} investors</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Bond Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bond</DialogTitle>
            <DialogDescription>Update the bond information.</DialogDescription>
          </DialogHeader>
          {selectedBond && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Bond Name
                </label>
                <Input
                  id="name"
                  value={editedBond.name}
                  onChange={(e) => setEditedBond({ ...editedBond, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Input
                  id="description"
                  value={editedBond.description}
                  onChange={(e) => setEditedBond({ ...editedBond, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="interest_rate" className="text-sm font-medium">
                    Interest Rate (%)
                  </label>
                  <Input
                    id="interest_rate"
                    type="number"
                    value={editedBond.interest_rate}
                    onChange={(e) =>
                      setEditedBond({ ...editedBond, interest_rate: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="term_days" className="text-sm font-medium">
                    Term (days)
                  </label>
                  <Input
                    id="term_days"
                    type="number"
                    value={editedBond.term_days}
                    onChange={(e) => setEditedBond({ ...editedBond, term_days: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="min_investment" className="text-sm font-medium">
                    Min. Investment (KES)
                  </label>
                  <Input
                    id="min_investment"
                    type="number"
                    value={editedBond.min_investment}
                    onChange={(e) =>
                      setEditedBond({ ...editedBond, min_investment: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="available_amount" className="text-sm font-medium">
                    Available Amount (KES)
                  </label>
                  <Input
                    id="available_amount"
                    type="number"
                    value={editedBond.available_amount}
                    onChange={(e) =>
                      setEditedBond({ ...editedBond, available_amount: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <Select
                  value={editedBond.status}
                  onValueChange={(value) => setEditedBond({ ...editedBond, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveBond} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Issue Bond Modal */}
      <Dialog open={isIssueBondModalOpen} onOpenChange={setIsIssueBondModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Issue New Bond</DialogTitle>
            <DialogDescription>Create a new bond offering on the platform.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {isIssueBondModalOpen && (
              <div className="py-2">
                <div className="text-center mb-4">
                  {isBlockchainEnabled ? (
                    <p className="text-sm text-green-600">This bond will be issued on the blockchain</p>
                  ) : (
                    <p className="text-sm text-amber-600">
                      Blockchain is not connected. Bond will be stored in the database only.
                    </p>
                  )}
                </div>
                <IssueBondForm onSuccess={handleIssueBondSuccess} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
