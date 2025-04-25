"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/protected-route"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CorporateBondsPage() {
  const { toast } = useToast()
  const [bonds, setBonds] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBonds = async () => {
      try {
        setIsLoading(true)

        // Try to fetch from investment_options table
        const { data, error } = await supabase
          .from("investment_options")
          .select("*")
          .eq("type", "corporate")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching corporate bonds:", error)

          // If not found in database, use mock data
          if (error.code === "PGRST116" || error.code === "42P01") {
            console.log("Using mock data for corporate bonds")
            setBonds(getMockCorporateBonds())
          } else {
            throw error
          }
        } else if (data && data.length > 0) {
          console.log("Fetched corporate bonds:", data)
          setBonds(data)
        } else {
          console.log("No corporate bonds found, using mock data")
          setBonds(getMockCorporateBonds())
        }
      } catch (err) {
        console.error("Error in fetchBonds:", err)
        setError(err.message || "Failed to load corporate bonds")
        toast({
          title: "Error",
          description: "Could not load corporate bonds",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBonds()
  }, [toast])

  // Mock data for fallback
  const getMockCorporateBonds = () => {
    return [
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
      },
      {
        id: "c2",
        name: "KCB Group Bond",
        type: "corporate",
        description: "3-year corporate bond issued by KCB Group with fixed interest rate.",
        interest_rate: 12.8,
        min_investment: 100,
        available_amount: 750000,
        term_days: 1095,
        status: "active",
      },
      {
        id: "c3",
        name: "Equity Bank Bond",
        type: "corporate",
        description: "7-year corporate bond issued by Equity Bank with fixed interest rate.",
        interest_rate: 14.2,
        min_investment: 100,
        available_amount: 600000,
        term_days: 2555,
        status: "active",
      },
    ]
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
          <p className="text-sm text-muted-foreground">Loading corporate bonds...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold">Corporate Bonds</h1>
            <p className="text-muted-foreground">
              Invest in corporate bonds issued by leading companies with competitive returns
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bonds.length > 0 ? (
              bonds.map((bond) => (
                <Card key={bond.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div className="px-3 py-1 bg-primary/10 rounded-full text-primary font-medium text-sm">
                        {bond.interest_rate}% Return
                      </div>
                    </div>
                    <CardTitle className="mt-4">{bond.name}</CardTitle>
                    <CardDescription>{bond.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Minimum</p>
                        <p className="font-medium">KES {bond.min_investment.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Term</p>
                        <p className="font-medium">{bond.term_days} days</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/investments/${bond.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No corporate bonds available at the moment.</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/investments">View Other Investments</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}
