"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BarChart3, Building, Coins, DollarSign, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/protected-route"
import { InvestmentPurchase } from "@/components/investment-purchase"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function InvestmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [investment, setInvestment] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInvestmentDetails = async () => {
      if (!params.id) return

      try {
        setIsLoading(true)
        console.log("Fetching investment details for ID:", params.id)

        // Check if the ID is a category name
        const categoryNames = ["government", "infrastructure", "equity", "corporate"]
        const paramId = typeof params.id === "string" ? params.id : params.id.toString()

        if (categoryNames.includes(paramId)) {
          console.log("Category name detected instead of ID:", paramId)
          // Use mock data for the category
          const mockInvestment = getMockInvestmentByCategory(paramId)
          if (mockInvestment) {
            setInvestment(mockInvestment)
            return
          } else {
            throw new Error(`No investments found for category: ${paramId}`)
          }
        }

        // Try to fetch from investment_options table
        try {
          const { data, error } = await supabase.from("investment_options").select("*").eq("id", params.id).single()

          if (error) {
            console.error("Error fetching investment option:", error)
            throw error
          }

          if (data) {
            console.log("Fetched investment option:", data)

            // Format the data to match our expected structure
            setInvestment({
              id: data.id,
              name: data.name,
              type: data.type,
              typeName: getTypeName(data.type),
              description: data.description,
              interestRate: data.interest_rate,
              minInvestment: data.min_investment,
              maxInvestment: data.available_amount,
              maturityDate: data.term_days ? getMaturityDate(data.term_days) : "N/A",
              termDays: data.term_days || 365,
              risk: getRiskLevel(data.type, data.interest_rate),
              icon: getIconForType(data.type),
            })
          } else {
            throw new Error("Investment option not found")
          }
        } catch (dbError) {
          console.log("Database fetch failed, using mock data")
          // If not found in database, use mock data
          const mockInvestment = getMockInvestment(params.id)
          if (mockInvestment) {
            setInvestment(mockInvestment)
          } else {
            throw new Error("Investment not found")
          }
        }
      } catch (err) {
        console.error("Error in fetchInvestmentDetails:", err)
        setError(err.message || "Failed to load investment details")
        toast({
          title: "Error",
          description: "Could not load investment details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvestmentDetails()
  }, [params.id, toast])

  // Helper function to get type name
  const getTypeName = (type) => {
    switch (type) {
      case "government":
        return "Government Security"
      case "infrastructure":
        return "Infrastructure Bond"
      case "equity":
        return "Equity"
      case "corporate":
        return "Corporate Bond"
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
      case "equity":
        return Coins
      case "corporate":
        return Building
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

  // Helper function to determine risk level
  const getRiskLevel = (type, interestRate) => {
    if (type === "government") return "Low"
    if (type === "corporate") return "Medium"
    if (type === "infrastructure") return "Medium"
    if (type === "equity") return "High"

    // Fallback based on interest rate
    if (interestRate < 10) return "Low"
    if (interestRate < 15) return "Medium"
    return "High"
  }

  // Get mock investment by category
  const getMockInvestmentByCategory = (category) => {
    const mockInvestments = getMockInvestments()
    return mockInvestments.find((inv) => inv.type === category) || null
  }

  // Get all mock investments
  const getMockInvestments = () => {
    return [
      {
        id: "1",
        name: "Treasury Bond - 10 Year",
        type: "government",
        typeName: "Government Security",
        description:
          "10-year government bond with fixed interest rate. Government bonds are considered the safest investment option as they are backed by the full faith and credit of the government.",
        interestRate: 12.5,
        minInvestment: 50,
        maxInvestment: 1000000,
        maturityDate: "Mar 25, 2035",
        termDays: 3650,
        risk: "Low",
        icon: Building,
      },
      {
        id: "2",
        name: "Treasury Bill - 91 Day",
        type: "government",
        typeName: "Government Security",
        description:
          "Short-term government security with 91-day maturity. T-bills are sold at a discount and redeemed at face value, with the difference representing the interest earned.",
        interestRate: 9.8,
        minInvestment: 50,
        maxInvestment: 1000000,
        maturityDate: "Jun 28, 2025",
        termDays: 91,
        risk: "Low",
        icon: Building,
      },
      {
        id: "3",
        name: "Infrastructure Bond - Energy",
        type: "infrastructure",
        typeName: "Infrastructure Bond",
        description:
          "Bond for financing renewable energy projects. These bonds fund critical infrastructure development while providing investors with competitive returns and tax benefits.",
        interestRate: 14.2,
        minInvestment: 100,
        maxInvestment: 1000000,
        maturityDate: "Mar 25, 2030",
        termDays: 1825,
        risk: "Medium",
        icon: BarChart3,
      },
      {
        id: "4",
        name: "Infrastructure Bond - Transport",
        type: "infrastructure",
        typeName: "Infrastructure Bond",
        description:
          "Bond for financing transport infrastructure. These bonds support the development of roads, railways, and other transportation networks essential for economic growth.",
        interestRate: 13.5,
        minInvestment: 100,
        maxInvestment: 1000000,
        maturityDate: "Sep 15, 2032",
        termDays: 2555,
        risk: "Medium",
        icon: BarChart3,
      },
      {
        id: "5",
        name: "Safaricom Shares",
        type: "equity",
        typeName: "Equity",
        description:
          "Fractional shares in East Africa's leading telecom. Investing in Safaricom gives you ownership in Kenya's most profitable company with exposure to telecommunications and mobile money sectors.",
        interestRate: 8.7,
        minInvestment: 50,
        maxInvestment: 1000000,
        maturityDate: "N/A",
        termDays: null,
        risk: "High",
        icon: Coins,
      },
      {
        id: "6",
        name: "KCB Group Shares",
        type: "equity",
        typeName: "Equity",
        description:
          "Fractional shares in Kenya's largest bank. KCB Group is a leading financial institution in East Africa, offering exposure to the region's growing banking and financial services sector.",
        interestRate: 7.9,
        minInvestment: 50,
        maxInvestment: 1000000,
        maturityDate: "N/A",
        termDays: null,
        risk: "High",
        icon: Coins,
      },
    ]
  }

  // Mock data for fallback
  const getMockInvestment = (id) => {
    const mockInvestments = getMockInvestments()
    return mockInvestments.find((inv) => inv.id === id || inv.id === String(id))
  }

  const handleInvestmentComplete = () => {
    toast({
      title: "Investment Complete",
      description: "Your investment has been processed successfully",
    })
    router.push("/portfolio")
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
          <p className="text-sm text-muted-foreground">Loading investment details...</p>
        </div>
      </div>
    )
  }

  if (error || !investment) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/investments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Investments
            </Link>
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Investment not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const Icon = investment.icon

  return (
    <ProtectedRoute>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/investments">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Investments
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-2xl font-bold">{investment.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Icon className="h-4 w-4 mr-1 text-primary" />
                      <span>{investment.typeName}</span>
                    </CardDescription>
                  </div>
                  <div className="px-3 py-1 bg-primary/10 rounded-full text-primary font-medium text-sm">
                    {investment.interestRate}% Return
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="mb-6">{investment.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Minimum</p>
                      <p className="font-medium">KES {investment.minInvestment.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Term</p>
                      <p className="font-medium">
                        {investment.termDays ? `${investment.termDays} days` : "N/A (Equity)"}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Risk Level</p>
                      <p className="font-medium">{investment.risk}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Maturity Date</p>
                      <p className="font-medium">{investment.maturityDate}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Interest Rate</p>
                      <p className="font-medium text-green-600">{investment.interestRate}%</p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{investment.type}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Investment Details</CardTitle>
                  <CardDescription>Learn more about this investment opportunity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="returns">Returns</TabsTrigger>
                      <TabsTrigger value="risks">Risks</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="pt-4 space-y-4">
                      <h3 className="text-lg font-medium">About {investment.name}</h3>
                      <p>
                        {investment.description} This investment offers a {investment.interestRate}% return rate with a
                        minimum investment of KES {investment.minInvestment.toLocaleString()}.
                      </p>
                      <p>
                        {investment.type === "government"
                          ? "Government securities are backed by the full faith and credit of the government, making them one of the safest investment options available."
                          : investment.type === "infrastructure"
                            ? "Infrastructure bonds finance essential public projects while offering investors competitive returns and potential tax benefits."
                            : "Equity investments offer ownership in companies and the potential for both dividend income and capital appreciation."}
                      </p>
                    </TabsContent>
                    <TabsContent value="returns" className="pt-4 space-y-4">
                      <h3 className="text-lg font-medium">Expected Returns</h3>
                      <p>
                        This investment offers a {investment.interestRate}% annual return rate. On a minimum investment
                        of KES {investment.minInvestment.toLocaleString()}, you can expect to earn approximately KES{" "}
                        {((investment.minInvestment * investment.interestRate) / 100).toLocaleString()} per year.
                      </p>
                      <div className="p-4 bg-muted rounded-md">
                        <h4 className="font-medium mb-2">Return Calculation Example</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Investment Amount</span>
                            <span>KES 10,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Annual Return Rate</span>
                            <span>{investment.interestRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Annual Return Amount</span>
                            <span>KES {((10000 * investment.interestRate) / 100).toLocaleString()}</span>
                          </div>
                          {investment.termDays && (
                            <div className="flex justify-between">
                              <span>Total Return at Maturity</span>
                              <span>
                                KES{" "}
                                {(
                                  10000 *
                                  (1 + (investment.interestRate / 100) * (investment.termDays / 365))
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="risks" className="pt-4 space-y-4">
                      <h3 className="text-lg font-medium">Risk Considerations</h3>
                      <p>
                        This investment is categorized as {investment.risk.toLowerCase()} risk.{" "}
                        {investment.risk === "Low"
                          ? "Low-risk investments generally offer more stable but potentially lower returns."
                          : investment.risk === "Medium"
                            ? "Medium-risk investments balance the potential for returns with a moderate level of risk."
                            : "High-risk investments offer the potential for greater returns but come with increased volatility and risk of loss."}
                      </p>
                      <div className="p-4 bg-muted rounded-md">
                        <h4 className="font-medium mb-2">Risk Factors</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {investment.type === "government" ? (
                            <>
                              <li>Interest rate risk - bond values may fluctuate with changing interest rates</li>
                              <li>Inflation risk - returns may not keep pace with inflation</li>
                              <li>Liquidity risk - early redemption may result in penalties</li>
                            </>
                          ) : investment.type === "infrastructure" ? (
                            <>
                              <li>Project completion risk - delays or issues with infrastructure projects</li>
                              <li>Interest rate risk - bond values may fluctuate with changing interest rates</li>
                              <li>Regulatory risk - changes in government policies may affect returns</li>
                            </>
                          ) : (
                            <>
                              <li>Market risk - stock prices may fluctuate based on market conditions</li>
                              <li>Company risk - performance depends on company success</li>
                              <li>Liquidity risk - selling shares may be difficult in certain market conditions</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Invest Now</CardTitle>
                  <CardDescription>Purchase this investment</CardDescription>
                </CardHeader>
                <CardContent>
                  <InvestmentPurchase
                    investmentId={investment.id}
                    investmentName={investment.name}
                    investmentType={investment.type}
                    minAmount={investment.minInvestment}
                    maxAmount={investment.maxInvestment}
                    interestRate={investment.interestRate}
                    duration={investment.termDays ? `${investment.termDays} days` : "N/A"}
                    risk={investment.risk}
                    maturityDate={investment.maturityDate !== "N/A" ? investment.maturityDate : null}
                    onPurchaseComplete={handleInvestmentComplete}
                  />
                </CardContent>
              </Card>

              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">
                      If you have questions about this investment or need assistance, our team is here to help.
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/support">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Contact Support
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}
