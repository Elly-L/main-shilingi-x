import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Home
      </Link>

      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: March 29, 2025</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Introduction</CardTitle>
            <CardDescription>Your privacy is important to us.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This Privacy Policy explains how Shillingi X ("we", "us", or "our") collects, uses, and discloses your
              personal information when you use our platform, including our website, uses, and discloses your personal
              information when you use our platform, including our website, mobile applications, and all related
              services (collectively, the "Service").
            </p>
            <p>
              By accessing or using the Service, you agree to the collection and use of information in accordance with
              this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We collect several types of information from and about users of our Service, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal information: Name, email address, phone number, and other identifiers.</li>
              <li>Financial information: Payment details, transaction history, and investment preferences.</li>
              <li>Technical information: IP address, browser type, device information, and usage data.</li>
              <li>Blockchain information: Wallet addresses and transaction data on public blockchains.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We use the information we collect for various purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, maintain, and improve our Service.</li>
              <li>To process transactions and manage your account.</li>
              <li>To comply with legal and regulatory requirements.</li>
              <li>To communicate with you about updates, security alerts, and support.</li>
              <li>To personalize your experience and deliver relevant content.</li>
              <li>To detect, prevent, and address technical issues and fraudulent activities.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We implement appropriate security measures to protect your personal information from unauthorized access,
              alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic
              storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for any activities
              that occur under your account.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to access and receive a copy of your personal information.</li>
              <li>The right to rectify or update your personal information.</li>
              <li>The right to request deletion of your personal information.</li>
              <li>The right to restrict or object to processing of your personal information.</li>
              <li>The right to data portability.</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided at the end of this Privacy
              Policy.
            </p>
          </CardContent>
        </Card>

        <Separator />

        <div className="text-center text-sm text-muted-foreground">
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@shillingix.com</p>
        </div>
      </div>
    </div>
  )
}
