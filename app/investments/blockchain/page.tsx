"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, Building, BarChart3, Coins, ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/protected-route"
import { contractService } from "@/lib/contractService"
import { BlockchainBondPurchase } from "@/components/blockchain-bond-purchase"
import { BlockchainWalletConnect } from "@/components/blockchain-wallet-connect"

export default function BlockchainInvestmentsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bonds, setBonds] = useState([])
  const [selectedBond, setSelectedBond] = useState(null)
  const [activeTab, setActiveTab] = useState("government")
  const [isBlockchainConnected, setIsBlockchainConnected] = useState(false)

  useEffect(() => {
    checkBlockchainConnection()
    fetchBonds()
  }, [])

  const checkBlockchainConnection = async () => {
    try {
      const connected = await contractService.isConnected()
      setIsBlockchainConnected(connected)
      console.log("Blockchain connection:", connected ? "Connected" : "Not connected")
    } catch (error) {
      console.error("Error checking blockchain connection:", error)
      setIsBlockchainConnected(false)
    }
  }

  const fetchBonds = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Try to fetch bonds from blockchain
      if (isBlockchainConnected) {
        try {
          const blockchainAssets = await contractService.getAssets()
          if (blockchainAssets && blockchainAssets.length > 0) {
            console.log("Fetched assets from blockchain:", blockchainAssets)
            setBonds(blockchainAssets)
            return
          }
        } catch (blockchainError) {
          console.error("Error fetching blockchain assets:", blockchainError)
          setError("Could not fetch blockchain assets. Using sample data instead.")
        }
      }

      // Fallback to sample data
      setBonds(getSampleBonds())
    } catch (err) {
      console.error("Error fetching bonds:", err)
      setError("Failed to load bond data")
      setBonds(getSampleBonds())
    } finally {
      setIsLoading(false)
    }
  }

  const getSampleBonds = () => {
    return [
      {
        id: "1",
        name: "Treasury Bond - 10 Year",
        description: "10-year government bond with fixed interest rate.",
        assetType: "bond",
        type: "government",
        price: "10000",
        interestRate: 12.5,
        maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 10).toISOString(),
        metadata: JSON.stringify({ risk: "Low", duration: "10 years" }),
      },
      {
        id: "2",
        name: "Infrastructure Bond - Energy",
        description: "5-year infrastructure bond for energy projects.",
        assetType: "bond",
        type: "infrastructure",
        price: "5000",
        interestRate: 13.2,
        maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 5).toISOString(),
        metadata: JSON.stringify({ risk: "Medium", duration: "5 years" }),
      },
      {
        id: "3",
        name: "Safaricom Corporate Bond",
        description: "3-year corporate bond issued by Safaricom PLC with fixed interest rate.",
        assetType: "bond",
        type: "corporate",
        price: "1000",
        interestRate: 13.5,
        maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3).toISOString(),
        metadata: JSON.stringify({ risk: "Medium", duration: "3 years" }),
      },
      {
        id: "4",
        name: "Safaricom Equity",
        description: "Equity shares in Safaricom PLC.",
        assetType: "equity",
        type: "equity",
        price: "500",
        interestRate: 8.0,
        metadata: JSON.stringify({ risk: "High", dividendYield: "4.5%" }),
      },
    ]
  }

  const getBondIcon = (type) => {
    switch (type) {
      case "government":
        return <Building className="h-5 w-5" />
      case "infrastructure":
        return <BarChart3 className="h-5 w-5" />
      case "corporate":
        return <Building className="h-5 w-5" />
      case "equity":
        return <Coins className="h-5 w-5" />
      default:
        return <Building className="h-5 w-5" />
    }
  }

  const handleBondSelect = (bond) => {
    setSelectedBond(bond)
  }

  const handlePurchaseComplete = () => {
    setSelectedBond(null)
    fetchBonds()
  }

  const filteredBonds = bonds.filter((bond) => {
    if (activeTab === "all") return true
    return bond.type === activeTab
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading blockchain investments...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Blockchain Investments</h1>
              <p className="text-muted-foreground">Invest directly using the Hedera blockchain</p>
              {isBlockchainConnected ? (
                <div className="mt-1 text-xs text-green-600 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-600 mr-1"></div>
                  Blockchain connected (Contract ID: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS})
                </div>
              ) : (
                <div className="mt-1 text-xs text-amber-600 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-600 mr-1"></div>
                  Blockchain not connected
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => window.open("https://hashscan.io/testnet", "_blank")}
              className="flex items-center gap-2"
            >
              View Hedera Explorer
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Connect Wallet</CardTitle>
                  <CardDescription>Connect your Hedera wallet to enable blockchain transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <BlockchainWalletConnect />
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Available Investments</CardTitle>
                  <CardDescription>Browse and purchase bonds directly on the blockchain</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="government">Government</TabsTrigger>
                      <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
                      <TabsTrigger value="corporate">Corporate</TabsTrigger>
                      <TabsTrigger value="equity">Equity</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-6">
                      {filteredBonds.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredBonds.map((bond, index) => (
                            <motion.div
                              key={bond.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Card
                                className={`cursor-pointer hover:shadow-md transition-shadow ${
                                  selectedBond?.id === bond.id ? "border-primary" : ""
                                }`}
                                onClick={() => handleBondSelect(bond)}
                              >
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{bond.name}</CardTitle>
                                    <div className="p-2 rounded-full bg-primary/10">{getBondIcon(bond.type)}</div>
                                  </div>
                                  <CardDescription>{bond.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Price:</span>
                                      <span className="font-medium">KES {Number(bond.price).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Interest Rate:</span>
                                      <span className="font-medium text-green-600">{bond.interestRate}%</span>
                                    </div>
                                    {bond.maturityDate && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Maturity:</span>
                                        <span className="font-medium">
                                          {new Date(bond.maturityDate).toLocaleDateString()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                                <CardFooter>
                                  <Button
                                    variant={selectedBond?.id === bond.id ? "default" : "outline"}
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleBondSelect(bond)}
                                  >
                                    {selectedBond?.id === bond.id ? "Selected" : "Select"}
                                  </Button>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 border rounded-lg">
                          <p className="text-muted-foreground">No {activeTab} bonds available</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>

          {selectedBond && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Purchase {selectedBond.name}</CardTitle>
                <CardDescription>Complete your blockchain investment</CardDescription>
              </CardHeader>
              <CardContent>
                <BlockchainBondPurchase
                  bondId={selectedBond.id}
                  bondName={selectedBond.name}
                  bondType={selectedBond.type}
                  price={Number(selectedBond.price)}
                  interestRate={selectedBond.interestRate}
                  maturityDate={selectedBond.maturityDate}
                  onPurchaseComplete={handlePurchaseComplete}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
