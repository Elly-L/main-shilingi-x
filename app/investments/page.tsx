"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Building, Coins, Filter, Search, Loader2, AlertCircle, Briefcase } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/protected-route"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function InvestmentsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [investments, setInvestments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching investment options...")

        const { data, error } = await supabase
          .from("investment_options")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching investment options:", error)

          // If the table doesn't exist, use mock data
          if (error.code === "42P01") {
            console.log("Using mock data since investment_options table doesn't exist")
            setInvestments(getMockInvestments())
          } else {
            throw error
          }
        } else if (data && data.length > 0) {
          console.log("Fetched investment options:", data.length)

          // Map the data to match our expected format
          const formattedData = data.map((item) => ({
            id: item.id,
            name: item.name,
            type: item.type,
            typeName: getTypeName(item.type),
            description: item.description,
            interestRate: item.interest_rate,
            minInvestment: item.min_investment,
            maturityDate: item.term_days ? getMaturityDate(item.term_days) : "N/A",
            icon: getIconForType(item.type),
          }))

          setInvestments(formattedData)
        } else {
          console.log("No investment options found, using mock data")
          setInvestments(getMockInvestments())
        }
      } catch (err) {
        console.error("Error in fetchInvestments:", err)
        setError(err.message || "Failed to load investment options")
        toast({
          title: "Error",
          description: "Could not load investment options",
          variant: "destructive",
        })
        // Fall back to mock data
        setInvestments(getMockInvestments())
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvestments()
  }, [toast])

  // Helper function to get type name
  const getTypeName = (type) => {
    switch (type) {
      case "government":
        return "Government Security"
      case "infrastructure":
        return "Infrastructure Bond"
      case "corporate":
        return "Corporate Bond"
      case "equity":
        return "Equity"
      default:
        return "Investment"
    }
  }

  // Helper function to get icon for type
  const getIconForType = (type) => {
    switch (type) {
      case "government":
        return Building
      case "infrastructure":
        return BarChart3
      case "corporate":
        return Briefcase
      case "equity":
        return Coins
      default:
        return Building
    }
  }

  // Helper function to calculate maturity date
  const getMaturityDate = (termDays) => {
    const date = new Date()
    date.setDate(date.getDate() + termDays)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // Mock data for fallback
  const getMockInvestments = () => [
    {
      id: 1,
      name: "Treasury Bond - 10 Year",
      type: "government",
      typeName: "Government Security",
      description: "10-year government bond with fixed interest rate",
      interestRate: 12.5,
      minInvestment: 50,
      maturityDate: "Mar 25, 2035",
      icon: Building,
    },
    {
      id: 2,
      name: "Treasury Bill - 91 Day",
      type: "government",
      typeName: "Government Security",
      description: "Short-term government security with 91-day maturity",
      interestRate: 9.8,
      minInvestment: 50,
      maturityDate: "Jun 28, 2025",
      icon: Building,
    },
    {
      id: 3,
      name: "Infrastructure Bond - Energy",
      type: "infrastructure",
      typeName: "Infrastructure Bond",
      description: "Bond for financing renewable energy projects",
      interestRate: 14.2,
      minInvestment: 100,
      maturityDate: "Mar 25, 2030",
      icon: BarChart3,
    },
    {
      id: 4,
      name: "Infrastructure Bond - Transport",
      type: "infrastructure",
      typeName: "Infrastructure Bond",
      description: "Bond for financing transport infrastructure",
      interestRate: 13.5,
      minInvestment: 100,
      maturityDate: "Sep 15, 2032",
      icon: BarChart3,
    },
    {
      id: 5,
      name: "Corporate Bond - Safaricom",
      type: "corporate",
      typeName: "Corporate Bond",
      description: "Corporate bond issued by Safaricom",
      interestRate: 11.2,
      minInvestment: 75,
      maturityDate: "Jun 15, 2028",
      icon: Briefcase,
    },
    {
      id: 6,
      name: "Safaricom Shares",
      type: "equity",
      typeName: "Equity",
      description: "Fractional shares in East Africa's leading telecom",
      interestRate: 8.7,
      minInvestment: 50,
      maturityDate: "N/A",
      icon: Coins,
    },
  ]

  // Filter investments based on active tab and search query
  const filteredInvestments = investments.filter((investment) => {
    const matchesTab = activeTab === "all" || investment.type === activeTab
    const matchesSearch =
      investment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investment.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Sort investments
  const sortedInvestments = [...filteredInvestments].sort((a, b) => {
    if (sortBy === "highest-return") {
      return b.interestRate - a.interestRate
    } else if (sortBy === "lowest-min") {
      return a.minInvestment - b.minInvestment
    }
    // Default: newest
    return b.id - a.id
  })

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
          <p className="text-sm text-muted-foreground">Loading investments...</p>
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
              <h1 className="text-3xl font-bold tracking-tight">Investments</h1>
              <p className="text-muted-foreground">Explore available investment opportunities.</p>
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

          <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 mb-6">
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
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="highest-return">Highest Return</SelectItem>
                  <SelectItem value="lowest-min">Lowest Minimum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="government">Government</TabsTrigger>
                <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
                <TabsTrigger value="corporate">Corporate</TabsTrigger>
                <TabsTrigger value="equity">Equity</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="mt-6">
                {sortedInvestments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedInvestments.map((investment, index) => (
                      <motion.div
                        key={investment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">{investment.name}</CardTitle>
                            <investment.icon className="h-5 w-5 text-primary" />
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <CardDescription>{investment.description}</CardDescription>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-muted-foreground">Type</p>
                                <p className="font-medium">{investment.typeName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Return</p>
                                <p className="font-medium text-green-600">{investment.interestRate}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Min. Investment</p>
                                <p className="font-medium">KES {investment.minInvestment}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Maturity</p>
                                <p className="font-medium">{investment.maturityDate}</p>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button className="w-full" asChild>
                              <Link href={`/investments/${investment.id}`}>Invest Now</Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No investments found matching your criteria.</p>
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
