"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CreditCard, Home, LogOut, Settings, Landmark, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function AdminSidebar() {
  const pathname = usePathname()
  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    { name: "Dashboard", href: "/moneymakers/dashboard", icon: Home },
    { name: "Users", href: "/moneymakers/dashboard/users", icon: Users },
    { name: "Transactions", href: "/moneymakers/dashboard/transactions", icon: CreditCard },
    { name: "Bonds", href: "/moneymakers/dashboard/bonds", icon: Landmark },
    { name: "Reports", href: "/moneymakers/dashboard/reports", icon: BarChart3 },
    { name: "Settings", href: "/moneymakers/dashboard/settings", icon: Settings },
  ]

  return (
    <div className="flex h-full w-[70px] flex-col border-r bg-background p-2 md:w-[240px]">
      <div className="flex h-14 items-center justify-center border-b px-4">
        <Link href="/moneymakers/dashboard" className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className={cn("font-bold text-xl transition-opacity", "opacity-0 hidden md:inline-block")}>
            Admin Panel
          </span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive(item.href) ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="transition-opacity opacity-0 hidden md:inline-block">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto border-t p-2">
        <Link href="/auth/logout">
          <Button variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 h-5 w-5" />
            <span className="transition-opacity opacity-0 hidden md:inline-block">Logout</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
