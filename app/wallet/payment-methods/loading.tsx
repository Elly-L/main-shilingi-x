import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function PaymentMethodsLoading() {
  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/wallet">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Wallet
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div>
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
