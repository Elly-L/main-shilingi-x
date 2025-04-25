import { CardFooter } from "@/components/ui/card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Coins } from "lucide-react"
import Link from "next/link"

export default function LogoutLoading() {
  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <div className="flex flex-col items-center justify-center">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Coins className="h-8 w-8 text-primary" />
          <span className="font-bold text-2xl">Shillingi X</span>
        </Link>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              <Skeleton className="h-8 w-40 mx-auto" />
            </CardTitle>
            <CardDescription className="text-center">
              <Skeleton className="h-4 w-60 mx-auto" />
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Skeleton className="h-12 w-12 rounded-full" />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-40 mx-auto" />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
