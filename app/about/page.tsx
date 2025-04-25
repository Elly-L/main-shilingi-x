import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Github, Linkedin, Mail, Twitter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Shillingi X</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Democratizing access to government securities, infrastructure bonds, and equities through blockchain
          technology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-4">
            Shillingi X was founded with a clear mission: to break down the barriers to investment opportunities in
            Kenya and across Africa. We believe that everyone should have access to wealth-building assets, regardless
            of their economic status.
          </p>
          <p className="text-muted-foreground mb-4">
            By leveraging blockchain technology and the Hedera network, we've created a platform that allows investments
            starting from as little as KES 50, making previously inaccessible financial instruments available to all.
          </p>
          <p className="text-muted-foreground">
            Our platform integrates seamlessly with M-Pesa, making deposits and withdrawals simple and familiar for
            Kenyan users, while smart contracts ensure transparency and automation in all transactions.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Why Blockchain?</h2>
          <p className="text-muted-foreground mb-4">
            Blockchain technology enables us to fractionalize traditionally large-ticket investments like government
            bonds and equities, making them accessible to micro-investors.
          </p>
          <p className="text-muted-foreground mb-4">
            Smart contracts automate interest payments, redemptions, and transfers, reducing operational costs and
            ensuring timely execution of all investment-related activities.
          </p>
          <p className="text-muted-foreground">
            The immutable nature of blockchain provides an unprecedented level of transparency and security, giving our
            users confidence in their investments and the platform as a whole.
          </p>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Team</h2>
        <div className="flex flex-col items-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-primary/20">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ME.jpg-HmLE2STaqQXbqkV3gj46VgH6Qv5MaX.jpeg"
                    alt="Elly Odhiambo"
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold">Elly Odhiambo</h3>
                <p className="text-muted-foreground mb-4">Founder & CEO</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Elly is a passionate technologist and entrepreneur with a vision to democratize access to investment
                  opportunities in Africa. With a background in software engineering and blockchain technology, he
                  founded Shillingi X to bridge the gap between traditional finance and the digital economy.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" asChild>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </a>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </a>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      <span className="sr-only">GitHub</span>
                    </a>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href="mailto:contact@example.com">
                      <Mail className="h-4 w-4" />
                      <span className="sr-only">Email</span>
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-primary/10 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Investing?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join thousands of investors who are growing their wealth with Shillingi X, starting with as little as KES 50.
        </p>
        <Button asChild size="lg">
          <Link href="/auth">
            Create Account <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
