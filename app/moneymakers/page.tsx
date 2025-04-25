import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins } from "lucide-react"
import Link from "next/link"

export default function AdminLandingPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-10 px-4">
      <div className="flex items-center gap-2 mb-8">
        <Coins className="h-10 w-10 text-primary" />
        <span className="font-bold text-3xl">Shillingi X Admin</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Portal</CardTitle>
          <CardDescription>Sign in to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Button asChild size="lg">
              <Link href="/moneymakers/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/moneymakers/register">Register</Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          Authorized personnel only. Unauthorized access is prohibited.
        </CardFooter>
      </Card>
    </div>
  )
}
