"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, BarChart3 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function InfrastructureBondsPage() {
  // Mock data
  const bonds = [
    {
      id: 3,
      name: "Infrastructure Bond - Energy",
      type: "Infrastructure Bond",
      description: "Bond for financing renewable energy projects",
      interestRate: 14.2,
      minInvestment: 100,
      maturityDate: "Mar 25, 2030",
    },
    {
      id: 4,
      name: "Infrastructure Bond - Transport",
      type: "Infrastructure Bond",
      description: "Bond for financing transport infrastructure",
      interestRate: 13.5,
      minInvestment: 100,
      maturityDate: "Sep 15, 2032",
    },
    {
      id: 9,
      name: "Infrastructure Bond - Water",
      type: "Infrastructure Bond",
      description: "Bond for financing water and sanitation projects",
      interestRate: 13.8,
      minInvestment: 100,
      maturityDate: "Jun 10, 2031",
    },
    {
      id: 10,
      name: "Infrastructure Bond - Housing",
      type: "Infrastructure Bond",
      description: "Bond for financing affordable housing projects",
      interestRate: 14.0,
      minInvestment: 100,
      maturityDate: "Dec 05, 2033",
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
          <h1 className="text-3xl font-bold tracking-tight">Infrastructure Bonds</h1>
          <p className="text-muted-foreground">
            Support national development while earning returns on infrastructure projects.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bonds.map((bond, index) => (
            <motion.div
              key={bond.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{bond.name}</CardTitle>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription>{bond.description}</CardDescription>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">{bond.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Return</p>
                      <p className="font-medium text-green-600">{bond.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min. Investment</p>
                      <p className="font-medium">KES {bond.minInvestment}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Maturity</p>
                      <p className="font-medium">{bond.maturityDate}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={`/investments/${bond.id}`}>Invest Now</Link>
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
