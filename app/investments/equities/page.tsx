"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Coins } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function EquitiesPage() {
  // Mock data
  const equities = [
    {
      id: 5,
      name: "Safaricom Shares",
      type: "Equity",
      description: "Fractional shares in East Africa's leading telecom",
      interestRate: 8.7,
      minInvestment: 50,
      maturityDate: "N/A",
    },
    {
      id: 6,
      name: "KCB Group Shares",
      type: "Equity",
      description: "Fractional shares in Kenya's largest bank",
      interestRate: 7.9,
      minInvestment: 50,
      maturityDate: "N/A",
    },
    {
      id: 11,
      name: "Equity Group Shares",
      type: "Equity",
      description: "Fractional shares in a leading financial services provider",
      interestRate: 8.2,
      minInvestment: 50,
      maturityDate: "N/A",
    },
    {
      id: 12,
      name: "East African Breweries Shares",
      type: "Equity",
      description: "Fractional shares in East Africa's leading beverage company",
      interestRate: 7.5,
      minInvestment: 50,
      maturityDate: "N/A",
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
          <h1 className="text-3xl font-bold tracking-tight">Tokenized Equities</h1>
          <p className="text-muted-foreground">
            Invest in fractional shares of top-performing companies with low minimum investment.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equities.map((equity, index) => (
            <motion.div
              key={equity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{equity.name}</CardTitle>
                  <Coins className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription>{equity.description}</CardDescription>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">{equity.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expected Return</p>
                      <p className="font-medium text-green-600">{equity.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min. Investment</p>
                      <p className="font-medium">KES {equity.minInvestment}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Term</p>
                      <p className="font-medium">{equity.maturityDate}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={`/investments/${equity.id}`}>Invest Now</Link>
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
