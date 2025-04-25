import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Home
      </Link>

      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: March 29, 2025</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Introduction</CardTitle>
            <CardDescription>Welcome to Shillingi X, a Web3 micro-investment platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              These Terms of Service ("Terms") govern your access to and use of the Shillingi X platform, including our
              website, mobile applications, and all related services (collectively, the "Service"). By accessing or
              using the Service, you agree to be bound by these Terms.
            </p>
            <p>
              Please read these Terms carefully before using the Service. If you do not agree to these Terms, you may
              not access or use the Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              To use the Service, you must be at least 18 years old and have the legal capacity to enter into a binding
              agreement. By using the Service, you represent and warrant that you meet these requirements.
            </p>
            <p>
              You must also comply with all applicable laws and regulations in your jurisdiction when using the Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Account Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              To use certain features of the Service, you may need to create an account. When you create an account, you
              must provide accurate and complete information. You are responsible for maintaining the confidentiality of
              your account credentials and for all activities that occur under your account.
            </p>
            <p>
              You agree to notify us immediately of any unauthorized use of your account or any other breach of
              security. We will not be liable for any loss or damage arising from your failure to comply with this
              section.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Investment Risks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Investing in financial instruments, including tokenized securities and digital assets, involves risks. The
              value of your investments can go up or down, and you may lose some or all of your invested capital.
            </p>
            <p>
              Before making any investment decisions, you should carefully consider your investment objectives, level of
              experience, and risk appetite. If necessary, seek independent financial advice.
            </p>
            <p>
              Past performance is not indicative of future results. Shillingi X does not guarantee any returns on
              investments made through the Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Blockchain and Digital Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Shillingi X utilizes blockchain technology and digital assets. You acknowledge and agree that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Blockchain transactions are irreversible and cannot be canceled or reversed once initiated.</li>
              <li>You are responsible for the security of your digital wallet and private keys.</li>
              <li>
                Blockchain networks may experience delays, congestion, or technical issues that are beyond our control.
              </li>
              <li>
                Regulatory changes may impact the availability or legality of certain digital assets or blockchain-based
                services.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Separator />

        <div className="text-center text-sm text-muted-foreground">
          <p>If you have any questions about these Terms, please contact us at support@shillingix.com</p>
        </div>
      </div>
    </div>
  )
}
