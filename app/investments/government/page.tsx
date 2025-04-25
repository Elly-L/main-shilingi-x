"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Building } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function GovernmentSecuritiesPage() {
  // Mock data
  const securities = [
    {
      id: 1,
      name: "Treasury Bond - 10 Year",
      type: "Government Security",
      description: "10-year government bond with fixed interest rate",
      interestRate: 12.5,
      minInvestment: 50,
      maturityDate: "Mar 25, 2035",
    },
    {
      id: 2,
      name: "Treasury Bill - 91 Day",
      type: "Government Security",
      description: "Short-term government security with 91-day maturity",
      interestRate: 9.8,
      minInvestment: 50,
      maturityDate: "Jun 28, 2025",
    },
    {
      id: 7,
      name: "Treasury Bond - 5 Year",
      type: "Government Security",
      description: "5-year government bond with fixed interest rate",
      interestRate: 11.2,
      minInvestment: 50,
      maturityDate: "Mar 25, 2030",
    },
    {
      id: 8,
      name: "Treasury Bill - 182 Day",
      type: "Government Security",
      description: "Short-term government security with 182-day maturity",
      interestRate: 10.3,
      minInvestment: 50,
      maturityDate: "Sep 28, 2025",
    },
  ]

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

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/investments">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Investments
            </Link>
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Government Securities</h1>
          <p className="text-muted-foreground">
            Invest in tokenized treasury bills and bonds with competitive interest rates.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securities.map((security, index) => (
            <motion.div
              key={security.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{security.name}</CardTitle>
                  <Building className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription>{security.description}</CardDescription>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">{security.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Return</p>
                      <p className="font-medium text-green-600">{security.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min. Investment</p>
                      <p className="font-medium">KES {security.minInvestment}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Maturity</p>
                      <p className="font-medium">{security.maturityDate}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={`/investments/${security.id}`}>Invest Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
