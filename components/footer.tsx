"use client"

import { Coins } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8 backdrop-blur-sm bg-background/80">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4 md:flex-row md:gap-6"
        >
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <Coins className="h-6 w-6 text-primary" />
            <span>Shillingi X</span>
          </Link>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            A product of{" "}
            <a
              href="https://eltek.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
            >
              Eltek
            </a>
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-4"
        >
          <Link
            href="/about"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4"
          >
            About
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4"
          >
            Privacy
          </Link>
        </motion.div>
      </div>
    </footer>
  )
}
