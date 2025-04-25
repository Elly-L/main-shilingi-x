"use client"

import { useSidebar } from "@/components/sidebar-provider"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Building,
  Coins,
  CreditCard,
  Home,
  LogOut,
  Menu,
  PanelLeft,
  PieChart,
  Settings,
  User,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, openMobile, setOpenMobile, state, toggleSidebar } = useSidebar()
  const { user, signOut } = useAuth()

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Portfolio", href: "/portfolio", icon: PieChart },
    { name: "Investments", href: "/investments", icon: Coins },
    { name: "Government Securities", href: "/investments/government", icon: Building, indent: true },
    { name: "Infrastructure Bonds", href: "/investments/infrastructure", icon: Building, indent: true },
    { name: "Tokenized Equities", href: "/investments/equities", icon: Coins, indent: true },
    { name: "Blockchain Investments", href: "/investments/blockchain", icon: Coins, indent: true },
    { name: "Wallet", href: "/wallet", icon: Wallet },
    { name: "Transactions", href: "/transactions", icon: CreditCard },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "G"

    const fullName = user.user_metadata?.full_name || user.email || ""
    if (!fullName) return "U"

    if (fullName.includes("@")) {
      return fullName.charAt(0).toUpperCase()
    }

    const names = fullName.split(" ")
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = "/auth/logout"
  }

  if (isMobile) {
    return (
      <>
        <Button
          variant="default"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden shadow-md bg-primary text-primary-foreground"
          onClick={() => setOpenMobile(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            side="left"
            className="p-0 w-[280px]"
            style={{ backgroundColor: "hsl(var(--sidebar-background))" }}
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <Link href="/" className="flex items-center gap-2" onClick={() => setOpenMobile(false)}>
                  <Coins className="h-6 w-6 text-primary" />
                  <span className="font-bold text-xl">Shillingi X</span>
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
                          item.indent && "ml-4",
                          isActive(item.href) ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                        )}
                        onClick={() => setOpenMobile(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="p-4 border-t">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                          alt={user.user_metadata?.full_name || user.email}
                        />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.user_metadata?.full_name || user.email}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/auth/login" onClick={() => setOpenMobile(false)}>
                      <User className="mr-2 h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <>
      <div
        className={cn(
          "fixed left-0 top-0 h-screen flex-col border-r transition-all duration-300 z-40",
          state === "expanded" ? "w-64" : "w-[70px]",
        )}
        style={{ backgroundColor: "hsl(var(--sidebar-background))" }}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <Link href="/" className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary flex-shrink-0" />
            <span className={cn("font-bold text-xl transition-opacity", state === "collapsed" && "opacity-0 hidden")}>
              Shillingi X
            </span>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="flex-shrink-0">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
        <nav className="flex-1 overflow-auto p-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              if (item.indent && state === "collapsed") return null

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      item.indent && "ml-4",
                      isActive(item.href) ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className={cn("transition-opacity", state === "collapsed" && "opacity-0 hidden")}>
                      {item.name}
                    </span>
                    {state === "collapsed" && !item.indent && <span className="sr-only">{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="p-4 border-t">
          {user ? (
            <div className="flex flex-col gap-2">
              {state === "expanded" && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                      alt={user.user_metadata?.full_name || user.email}
                    />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.user_metadata?.full_name || user.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              )}
              {state === "collapsed" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="w-full h-10">
                      <Avatar className="h-7 w-7">
                        <AvatarImage
                          src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                          alt={user.user_metadata?.full_name || user.email}
                        />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  <span className="ml-2">Logout</span>
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              className={cn("w-full", state === "expanded" ? "justify-start" : "justify-center")}
              asChild
            >
              <Link href="/auth/login">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className={cn("ml-2 transition-opacity", state === "collapsed" && "opacity-0 hidden")}>
                  Login
                </span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
