"use client"

import { CardFooter } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Bell, ChevronLeft, Key, Lock, Save, Shield, User } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"

export default function SettingsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)

  // Profile settings
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [country, setCountry] = useState("kenya")
  const [bio, setBio] = useState("")

  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(true)
  const [loginAlerts, setLoginAlerts] = useState(true)

  // Preferences
  const [currency, setCurrency] = useState("kes")
  const [language, setLanguage] = useState("en")
  const [theme, setTheme] = useState("light")

  // Admin settings
  const [contractAddress, setContractAddress] = useState(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "")

  const { user, updateProfile } = useAuth()

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "")
      setEmail(user.email || "")
      setPhoneNumber(user.user_metadata?.phone_number || "")
      setBio(user.user_metadata?.bio || "")
      setCountry(user.user_metadata?.country || "kenya")
    }
  }, [user])

  const handleSaveSettings = async () => {
    setIsSaving(true)

    try {
      const { error } = await updateProfile({
        fullName,
        phoneNumber,
        bio,
        country,
      })

      if (error) {
        toast({
          title: "Error updating settings",
          description: error.message,
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      // Update contract address in environment variables
      if (contractAddress !== process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
        // This is a placeholder. In a real application, you would need to securely update the environment variable.
        // This might involve calling an API endpoint on your server that has the necessary permissions.
        console.warn("Updating environment variables from the client is not secure. Implement a server-side solution.")
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS = contractAddress // This will only change it in the current process
        toast({
          title: "Contract address updated (client-side only)",
          description: "Remember to update the environment variable on the server for persistent changes.",
        })
      }

      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully",
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Error updating settings",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Button variant="ghost" size="sm" asChild className="mb-6">
              <Link href="/dashboard">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Preferences</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal information and contact details.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select value={country} onValueChange={setCountry}>
                          <SelectTrigger id="country">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kenya">Kenya</SelectItem>
                            <SelectItem value="uganda">Uganda</SelectItem>
                            <SelectItem value="tanzania">Tanzania</SelectItem>
                            <SelectItem value="rwanda">Rwanda</SelectItem>
                            <SelectItem value="ethiopia">Ethiopia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          className="w-full min-h-[100px] p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Wallet Information</CardTitle>
                    <CardDescription>View and manage your connected wallet.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-muted rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Key className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Connected Wallet</p>
                            <p className="text-sm text-muted-foreground">0x1a2b3c4d5e6f7g8h9i0j</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your account security and authentication methods.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                      </div>
                      <Switch id="twoFactor" checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                    </div>

                    {!twoFactorEnabled && (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/settings/two-factor">
                          <Shield className="mr-2 h-4 w-4" />
                          Set Up Two-Factor Authentication
                        </Link>
                      </Button>
                    )}

                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/settings/change-password">
                          <Lock className="mr-2 h-4 w-4" />
                          Change Password
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage how you receive security notifications.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <Switch
                        id="emailNotifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <Switch id="smsNotifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="loginAlerts">Login Alerts</Label>
                      <Switch id="loginAlerts" checked={loginAlerts} onCheckedChange={setLoginAlerts} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Display Preferences</CardTitle>
                    <CardDescription>Customize how Shillingi X appears to you.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <RadioGroup value={theme} onValueChange={setTheme} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="light" id="light" />
                          <Label htmlFor="light">Light</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dark" id="dark" />
                          <Label htmlFor="dark">Dark</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="system" id="system" />
                          <Label htmlFor="system">System</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="sw">Swahili</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger id="currency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kes">Kenyan Shilling (KES)</SelectItem>
                          <SelectItem value="usd">US Dollar (USD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Preferences</CardTitle>
                    <CardDescription>Manage how your data is used and stored.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="analytics">Usage Analytics</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow us to collect anonymous usage data to improve our service.
                        </p>
                      </div>
                      <Switch id="analytics" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing">Marketing Communications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about new features and investment opportunities.
                        </p>
                      </div>
                      <Switch id="marketing" defaultChecked />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/privacy">View Privacy Policy</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}
