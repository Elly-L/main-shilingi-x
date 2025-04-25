"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Users, CreditCard, Settings, LogOut, Home, FileText, Landmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function AdminSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/moneymakers/dashboard",
      icon: Home,
      title: "Dashboard",
    },
    {
      href: "/moneymakers/dashboard/users",
      icon: Users,
      title: "Users",
    },
    {
      href: "/moneymakers/dashboard/transactions",
      icon: CreditCard,
      title: "Transactions",
    },
    {
      href: "/moneymakers/dashboard/bonds",
      icon: Landmark,
      title: "Bonds",
    },
    {
      href: "/moneymakers/dashboard/reports",
      icon: FileText,
      title: "Reports",
    },
    {
      href: "/moneymakers/dashboard/settings",
      icon: Settings,
      title: "Settings",
    },
  ]

  return (
    <div className="flex h-full w-[70px] flex-col border-r bg-background p-2 md:w-[240px]">
      <div className="flex h-14 items-center justify-center border-b px-4">
        <Link href="/moneymakers/dashboard" className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="hidden font-bold md:inline-block">Admin Panel</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex h-10 items-center rounded-md px-3 text-sm font-medium",
                pathname === route.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <route.icon className="mr-2 h-5 w-5" />
              <span className="hidden md:inline-block">{route.title}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-2">
        <Link href="/auth/logout">
          <Button variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 h-5 w-5" />
            <span className="hidden md:inline-block">Logout</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
