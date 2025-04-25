"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Banknote, BarChart3, Building, ChevronDown, ChevronRight, Coins, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export default function Home() {
  // Add scroll effect for parallax
  React.useEffect(() => {
    const handleScroll = () => {
      document.documentElement.style.setProperty("--scroll", `${window.scrollY / 2000}`)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 h-[130%] w-full"
            style={{ transform: "translateY(calc(var(--scroll) * -0.1))" }}
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-X8h5QnGBQzzGvjftbLuQVgPyQIxSoJ.png"
              alt="Diverse group of young people celebrating together"
              fill
              className="object-cover brightness-[0.7]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 mix-blend-multiply" />
          </div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">Micro-Investments for Everyone</h1>
              <p className="text-lg md:text-xl opacity-90">
                Invest in tokenized government securities, infrastructure bonds, and equities with as little as KES 50.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
                  <Link href="/dashboard">
                    Start Investing <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:flex justify-center items-center">
              <div className="text-center">
                <div className="inline-block p-4 bg-white rounded-full mb-4">
                  <Coins className="h-24 w-24 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-bold">ShillingiX</h2>
                <p className="text-white/80">Web3 Micro-Investment Platform</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white/80" />
        </div>

        {/* Add this right before the closing </section> tag */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-background parallax-section">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose Shillingi X?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform leverages blockchain technology to make investments accessible, transparent, and efficient.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Card>
                <CardHeader>
                  <Coins className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Micro-Investments</CardTitle>
                  <CardDescription>Start with as little as KES 50 and build your portfolio gradually.</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Secure & Transparent</CardTitle>
                  <CardDescription>
                    Blockchain-powered smart contracts ensure transparency and security.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Card>
                <CardHeader>
                  <Banknote className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>M-Pesa Integration</CardTitle>
                  <CardDescription>Seamlessly deposit and withdraw funds using M-Pesa.</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Investment Options */}
      <section className="py-16 px-4 bg-muted/50 parallax-section">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Investment Options</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Diversify your portfolio with a range of tokenized assets.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Card>
                <CardHeader>
                  <Building className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Government Securities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Tokenized treasury bills and bonds with competitive interest rates.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/investments/government">
                      Explore <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Card>
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Infrastructure Bonds</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Support national development while earning returns on infrastructure projects.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/investments/infrastructure">
                      Explore <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Card>
                <CardHeader>
                  <Coins className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Tokenized Equities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Fractional ownership in top-performing companies and assets.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/investments/equities">
                      Explore <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/10 parallax-section">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Investment Journey?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of investors who are growing their wealth with Shillingi X.
            </p>
            <Button asChild size="lg">
              <Link href="/auth">
                Create Account <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
