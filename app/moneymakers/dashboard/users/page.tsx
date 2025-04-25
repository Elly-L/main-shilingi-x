"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { Loader2, Search, UserPlus, MoreHorizontal, User, Mail, Calendar, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UsersPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editedUser, setEditedUser] = useState({
    full_name: "",
    email: "",
    role: "user",
    status: "active",
  })

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })

        if (fetchError) throw fetchError

        setUsers(data || [])
      } catch (err) {
        console.error("Error fetching users:", err)
        toast({
          variant: "destructive",
          title: "Error loading users",
          description: err.message || "Failed to load user data",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setIsViewModalOpen(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setEditedUser({
      full_name: user.full_name || "",
      email: user.email || "",
      role: user.role || "user",
      status: user.status || "active",
    })
    setIsEditModalOpen(true)
  }

  const handleSaveUser = async () => {
    try {
      setIsLoading(true)

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editedUser.full_name,
          role: editedUser.role,
          status: editedUser.status,
        })
        .eq("id", selectedUser.id)

      if (error) throw error

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? { ...user, full_name: editedUser.full_name, role: editedUser.role, status: editedUser.status }
            : user,
        ),
      )

      setIsEditModalOpen(false)
      toast({
        title: "User updated",
        description: "User information has been updated successfully",
      })
    } catch (err) {
      console.error("Error updating user:", err)
      toast({
        variant: "destructive",
        title: "Error updating user",
        description: err.message || "Failed to update user information",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeactivateUser = async (userId) => {
    try {
      setIsLoading(true)

      const { error } = await supabase.from("profiles").update({ status: "inactive" }).eq("id", userId)

      if (error) throw error

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, status: "inactive" } : user)))

      toast({
        title: "User deactivated",
        description: "User has been deactivated successfully",
      })
    } catch (err) {
      console.error("Error deactivating user:", err)
      toast({
        variant: "destructive",
        title: "Error deactivating user",
        description: err.message || "Failed to deactivate user",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage platform users and their permissions</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all users on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Joined</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-medium">{user.full_name || "N/A"}</td>
                        <td className="p-4 align-middle">{user.email || "N/A"}</td>
                        <td className="p-4 align-middle capitalize">{user.role || "user"}</td>
                        <td className="p-4 align-middle">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="p-4 align-middle">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              user.status === "inactive"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                            }`}
                          >
                            {user.status || "active"}
                          </span>
                        </td>
                        <td className="p-4 align-middle">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewUser(user)}>View Details</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>Edit User</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeactivateUser(user.id)}>
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted-foreground">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View User Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View detailed information about this user.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-2">
              <div className="flex justify-center mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedUser.avatar_url || "/placeholder.svg"} alt={selectedUser.full_name} />
                  <AvatarFallback className="text-lg">{getInitials(selectedUser.full_name)}</AvatarFallback>
                </Avatar>
              </div>

              <div className="grid grid-cols-[24px_1fr] items-start gap-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedUser.full_name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                </div>
              </div>

              <div className="grid grid-cols-[24px_1fr] items-start gap-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedUser.email || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                </div>
              </div>

              <div className="grid grid-cols-[24px_1fr] items-start gap-4">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium capitalize">{selectedUser.role || "user"}</p>
                  <p className="text-sm text-muted-foreground">User Role</p>
                </div>
              </div>

              <div className="grid grid-cols-[24px_1fr] items-start gap-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {new Date(selectedUser.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">Joined Date</p>
                </div>
              </div>

              <div className="grid grid-cols-[24px_1fr] items-start gap-4">
                <div
                  className={`h-5 w-5 rounded-full ${
                    selectedUser.status === "inactive" ? "bg-yellow-500" : "bg-green-500"
                  }`}
                />
                <div>
                  <p className="font-medium capitalize">{selectedUser.status || "active"}</p>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-start">
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewModalOpen(false)
                handleEditUser(selectedUser)
              }}
            >
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={editedUser.full_name}
                  onChange={(e) => setEditedUser({ ...editedUser, full_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={editedUser.email} disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={editedUser.role}
                  onValueChange={(value) => setEditedUser({ ...editedUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editedUser.status}
                  onValueChange={(value) => setEditedUser({ ...editedUser, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
