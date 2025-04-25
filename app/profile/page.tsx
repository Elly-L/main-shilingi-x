"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Check, Copy, Edit, Key, Loader2, Save, User } from "lucide-react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { ProfileUpload } from "@/components/profile-upload"
import { supabase } from "@/lib/supabaseClient"

export default function ProfilePage() {
  const { toast } = useToast()
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // User profile data
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    bio: "Passionate investor focused on long-term growth and sustainable investments.",
    walletAddress: "0x1a2b3c4d5e6f7g8h9i0j",
    joinDate: "",
    totalInvestments: 0,
    totalReturns: 0,
    avatarUrl: null as string | null,
  })

  // Fetch user profile data including investments
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        console.log("Fetching profile for user:", user.id)

        // First, check if profile exists with user_id
        let { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single()

        // If no profile found with user_id, check if it exists with id = user.id
        if (profileError && profileError.code === "PGRST116") {
          console.log("No profile found with user_id, checking if profile exists with id = user.id")

          const { data: idProfile, error: idProfileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()

          if (!idProfileError && idProfile) {
            console.log("Found profile with id = user.id:", idProfile)
            profileData = idProfile

            // Update the profile to also have user_id set
            const { error: updateError } = await supabase
              .from("profiles")
              .update({ user_id: user.id })
              .eq("id", user.id)

            if (updateError) {
              console.error("Error updating profile with user_id:", updateError)
            }
          } else {
            // No profile found at all, create a new one
            console.log("No profile found at all, creating new one with id = user.id")

            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert([
                {
                  id: user.id, // CRITICAL: Use the user.id from auth as the profile id
                  user_id: user.id, // Also set user_id for future queries
                  full_name: user.user_metadata?.full_name || "User",
                  email: user.email,
                  phone_number: user.user_metadata?.phone_number || "",
                },
              ])
              .select()

            if (createError) {
              console.error("Create profile error:", createError)
              throw createError
            }

            if (newProfile && newProfile.length > 0) {
              console.log("Created new profile:", newProfile[0])
              profileData = newProfile[0]
            } else {
              throw new Error("Failed to create profile")
            }
          }
        } else if (profileError) {
          console.error("Unexpected profile error:", profileError)
          throw profileError
        }

        console.log("Profile data:", profileData)

        // Fetch investments data
        const { data: investmentsData, error: investmentsError } = await supabase
          .from("investments")
          .select("amount, interest_rate")
          .eq("user_id", user.id)
          .eq("status", "active")

        if (investmentsError && investmentsError.code !== "PGRST116") {
          console.warn("Investments error:", investmentsError)
        }

        console.log("Investments data:", investmentsData)

        // Calculate total investments and returns
        const totalInvestments = investmentsData ? investmentsData.reduce((sum, inv) => sum + Number(inv.amount), 0) : 0

        const totalReturns = investmentsData
          ? investmentsData.reduce((sum, inv) => {
              const returnAmount = (Number(inv.amount) * (Number(inv.interest_rate) || 10)) / 100
              return sum + returnAmount
            }, 0)
          : 0

        setUserData({
          ...userData,
          fullName: user.user_metadata?.full_name || profileData?.full_name || "User",
          email: user.email || "",
          phoneNumber: user.user_metadata?.phone_number || profileData?.phone_number || "",
          bio:
            user.user_metadata?.bio ||
            profileData?.bio ||
            "Passionate investor focused on long-term growth and sustainable investments.",
          avatarUrl: profileData?.avatar_url || null,
          joinDate: new Date(user.created_at || Date.now()).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          totalInvestments,
          totalReturns,
        })

        setError(null)
      } catch (error: any) {
        console.error("Error fetching user data:", error)
        setError(error.message || "Failed to load profile data")
        toast({
          title: "Error loading profile",
          description: error.message || "There was an error loading your profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user, toast, userData])

  const handleSaveProfile = async () => {
    setIsSaving(true)

    try {
      // First update the auth user metadata
      const { error: authError } = await updateProfile({
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        bio: userData.bio,
      })

      if (authError) {
        throw authError
      }

      // Then update the profile in the profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: userData.fullName,
          phone_number: userData.phoneNumber,
          bio: userData.bio,
        })
        .eq("id", user?.id)

      if (profileError) {
        throw profileError
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error updating profile",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setIsEditing(false)
    }
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(userData.walletAddress)
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
    })
  }

  const handleAvatarUpdate = (url: string) => {
    setUserData({
      ...userData,
      avatarUrl: url,
    })
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Profile</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
              <p className="text-muted-foreground">View and manage your personal information.</p>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <ProfileUpload currentAvatarUrl={userData.avatarUrl} onUploadComplete={handleAvatarUpdate} />
                </div>
                <h2 className="text-xl font-bold">{userData.fullName}</h2>
                <p className="text-sm text-muted-foreground mb-4">Member since {userData.joinDate}</p>

                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs font-medium">Wallet Address</p>
                        <p className="text-xs font-mono truncate max-w-[150px]">{userData.walletAddress}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleCopyAddress}>
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy address</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <div className="w-full flex justify-between items-center">
                  <span className="text-sm">Total Investments</span>
                  <span className="font-medium">KES {userData.totalInvestments.toLocaleString()}</span>
                </div>
                <div className="w-full flex justify-between items-center">
                  <span className="text-sm">Total Returns</span>
                  <span className="font-medium text-green-600">+KES {userData.totalReturns.toLocaleString()}</span>
                </div>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  {isEditing ? "Edit your personal information below" : "View your personal information"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      <span>Security</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          {isEditing ? (
                            <Input
                              id="fullName"
                              value={userData.fullName}
                              onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                            />
                          ) : (
                            <div className="p-2 border rounded-md bg-muted/50">{userData.fullName}</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          {isEditing ? (
                            <Input
                              id="email"
                              type="email"
                              value={userData.email}
                              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                              disabled
                            />
                          ) : (
                            <div className="p-2 border rounded-md bg-muted/50">{userData.email}</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          {isEditing ? (
                            <Input
                              id="phoneNumber"
                              value={userData.phoneNumber}
                              onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                            />
                          ) : (
                            <div className="p-2 border rounded-md bg-muted/50">{userData.phoneNumber}</div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        {isEditing ? (
                          <textarea
                            id="bio"
                            className="w-full min-h-[100px] p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            value={userData.bio}
                            onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                          />
                        ) : (
                          <div className="p-2 border rounded-md bg-muted/50 min-h-[100px]">{userData.bio}</div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-md bg-green-50">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-green-100 rounded-full">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Email Verified</p>
                            <p className="text-sm text-muted-foreground">{userData.email}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Change Email
                        </Button>
                      </div>

                      <div className="p-4 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Password</p>
                            <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Change Password
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Enable
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h3 className="font-medium">Login Sessions</h3>
                        <div className="p-4 border rounded-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Current Session</p>
                              <p className="text-sm text-muted-foreground">Nairobi, Kenya • Chrome on macOS</p>
                            </div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}
