"use client"

import type React from "react"

import { useState, useActionState, useEffect, startTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  UserIcon,
  HistoryIcon,
  UsersIcon,
  SettingsIcon,
  ImagePlusIcon,
  Trash2Icon,
  Share2Icon,
  LogOutIcon,
} from "lucide-react"
import {
  updateUsername,
  cancelBookingByUser,
  updateUserProfilePicture,
  deleteUserProfilePicture,
  deleteAccount,
} from "@/app/actions/profile"
import { confirmServiceByUser } from "@/app/actions/booking" // Import new action
import { DUMMY_USER_DATA } from "@/lib/dummy-data"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function UserProfilePage() {
  const router = useRouter()
  const [userType, setUserType] = useState<"user" | "model" | null>(null)
  const [usernameState, updateUsernameAction, isUsernamePending] = useActionState(updateUsername, {
    success: false,
    message: "",
  })
  const [cancelBookingState, cancelBookingAction, isCancelBookingPending] = useActionState(cancelBookingByUser, {
    success: false,
    message: "",
  })
  const [confirmServiceState, confirmServiceAction, isConfirmServicePending] = useActionState(confirmServiceByUser, {
    success: false,
    message: "",
  })
  const [profilePicState, updateUserProfilePictureAction, isProfilePicPending] = useActionState(
    updateUserProfilePicture,
    {
      success: false,
      message: "",
      imageUrl: DUMMY_USER_DATA.profilePictureUrl,
    },
  )
  const [deleteProfilePicState, deleteUserProfilePictureAction, isDeleteProfilePicPending] = useActionState(
    deleteUserProfilePicture,
    { success: false, message: "" },
  )
  const [deleteAccountState, deleteAccountAction, isDeleteAccountPending] = useActionState(deleteAccount, {
    success: false,
    message: "",
  })

  const [currentUsername, setCurrentUsername] = useState(DUMMY_USER_DATA.username)
  const [currentProfilePic, setCurrentProfilePic] = useState(DUMMY_USER_DATA.profilePictureUrl)

  const [profilePicFile, setProfilePicFile] = useState<File | null>(null)
  const [profilePicPreviewUrl, setProfilePicPreviewUrl] = useState<string | undefined>(undefined)
  const profilePicInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const storedUserType = localStorage.getItem("fishhook_user_type") as "user" | "model" | null
    if (storedUserType !== "user") {
      router.push("/home") // Redirect if not a user
    } else {
      setUserType(storedUserType)
    }
  }, [router])

  useEffect(() => {
    if (usernameState.success) {
      // Update local state if server action was successful
      setCurrentUsername(DUMMY_USER_DATA.username)
    }
  }, [usernameState])

  useEffect(() => {
    if (profilePicState.success) {
      setCurrentProfilePic(DUMMY_USER_DATA.profilePictureUrl)
      setProfilePicFile(null)
      if (profilePicInputRef.current) profilePicInputRef.current.value = ""
    }
  }, [profilePicState])

  useEffect(() => {
    if (deleteProfilePicState.success) {
      setCurrentProfilePic(DUMMY_USER_DATA.profilePictureUrl)
      setProfilePicFile(null)
      if (profilePicInputRef.current) profilePicInputRef.current.value = ""
    }
  }, [deleteProfilePicState])

  useEffect(() => {
    if (deleteAccountState.success) {
      localStorage.removeItem("fishhook_user_type")
      router.push("/auth/signup")
    }
  }, [deleteAccountState, router])

  useEffect(() => {
    if (profilePicFile) {
      const url = URL.createObjectURL(profilePicFile)
      setProfilePicPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setProfilePicPreviewUrl(undefined)
    }
  }, [profilePicFile])

  const handleCancelBooking = (bookingId: string, userId: string) => {
    const formData = new FormData()
    formData.append("bookingId", bookingId)
    formData.append("userId", userId)

    startTransition(() => {
      cancelBookingAction(formData)
    })
  }

  const handleConfirmService = (bookingId: string, userId: string) => {
    const formData = new FormData()
    formData.append("bookingId", bookingId)
    formData.append("userId", userId)

    startTransition(() => {
      confirmServiceAction(formData)
    })
  }

  const handleProfilePicSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profilePicFile) {
      alert("Please select an image file to upload.")
      return
    }
    const formData = new FormData()
    formData.append("profilePicture", profilePicFile)
    startTransition(() => {
      updateUserProfilePictureAction(formData)
    })
  }

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      const formData = new FormData()
      formData.append("userType", "user")
      formData.append("userId", DUMMY_USER_DATA.id)
      startTransition(() => {
        deleteAccountAction(formData)
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("fishhook_user_type")
    router.push("/auth/signup")
  }

  if (userType === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/fishhook-logo.jpeg" alt="FishHook Logo" className="h-8 w-8 object-contain" />
            <UserIcon className="h-6 w-6 text-primary" />
            <CardTitle className="text-primary">User Profile</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost">
              <Link href="/home">Back to Home</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/profile/settings">
                <SettingsIcon className="h-4 w-4 mr-2" /> Settings
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOutIcon className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Picture Slot */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ImagePlusIcon className="h-5 w-5" /> Profile Picture
              </h3>
              <div className="flex flex-col items-center gap-4">
                <img
                  src={profilePicPreviewUrl || currentProfilePic || "/placeholder.svg"}
                  alt="Profile"
                  className="h-40 w-40 rounded-full object-cover border-2 border-primary"
                />
                <form onSubmit={handleProfilePicSubmit} className="flex w-full gap-2">
                  <Input
                    id="profilePicture"
                    name="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePicFile(e.target.files ? e.target.files[0] : null)}
                    ref={profilePicInputRef}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isProfilePicPending || !profilePicFile}>
                    {isProfilePicPending ? "Uploading..." : "Upload"}
                  </Button>
                </form>
                {profilePicState?.message && (
                  <p className={cn("text-sm", profilePicState.success ? "text-green-500" : "text-destructive")}>
                    {profilePicState.message}
                  </p>
                )}
                <form action={deleteUserProfilePictureAction} className="w-full">
                  <Button
                    type="submit"
                    variant="destructive"
                    className="w-full"
                    disabled={
                      isDeleteProfilePicPending ||
                      currentProfilePic === "/placeholder.svg?height=150&width=150&text=User"
                    }
                  >
                    <Trash2Icon className="h-4 w-4 mr-2" />
                    {isDeleteProfilePicPending ? "Deleting..." : "Delete Picture"}
                  </Button>
                </form>
                {deleteProfilePicState?.message && (
                  <p className={cn("text-sm", deleteProfilePicState.success ? "text-green-500" : "text-destructive")}>
                    {deleteProfilePicState.message}
                  </p>
                )}
              </div>
            </div>

            {/* Username and other user details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserIcon className="h-5 w-5" /> Username
              </h3>
              <form action={updateUsernameAction} className="flex gap-2">
                <Input
                  id="username"
                  name="username"
                  defaultValue={currentUsername}
                  placeholder="Edit username"
                  className="flex-1"
                />
                <Button type="submit" disabled={isUsernamePending}>
                  {isUsernamePending ? "Saving..." : "Save"}
                </Button>
              </form>
              {usernameState?.message && (
                <p className={cn("text-sm", usernameState.success ? "text-green-500" : "text-destructive")}>
                  {usernameState.message}
                </p>
              )}

              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" /> Following
                </h3>
                <p className="text-2xl font-bold text-primary">{DUMMY_USER_DATA.following}</p>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Share2Icon className="h-5 w-5" /> Share Profile
                </h3>
                <Button className="w-full" onClick={() => alert("Share user profile functionality coming soon!")}>
                  Share My Profile
                </Button>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-destructive">
                  <Trash2Icon className="h-5 w-5" /> Account Actions
                </h3>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDeleteAccount}
                  disabled={isDeleteAccountPending}
                >
                  {isDeleteAccountPending ? "Deleting Account..." : "Delete My Account"}
                </Button>
                {deleteAccountState?.message && (
                  <p className={cn("text-sm mt-2", deleteAccountState.success ? "text-green-500" : "text-destructive")}>
                    {deleteAccountState.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" /> Booking History
            </h3>
            {DUMMY_USER_DATA.bookHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DUMMY_USER_DATA.bookHistory.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.modelName}</TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "font-medium",
                            booking.status === "pending" && "text-orange-500",
                            booking.status === "accepted" && "text-green-500",
                            booking.status === "completed_payment_released" && "text-blue-500",
                            booking.status === "rejected" && "text-destructive",
                            booking.status === "user_cancelled" && "text-gray-500",
                            booking.status === "cancelled_auto" && "text-gray-500",
                          )}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell>{booking.isPaid ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right">₵{booking.totalPrice}</TableCell>
                      <TableCell className="text-right">
                        {(booking.status === "pending" || booking.status === "accepted") && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelBooking(booking.id, DUMMY_USER_DATA.id)}
                            disabled={isCancelBookingPending}
                            className="mr-2"
                          >
                            Cancel
                          </Button>
                        )}
                        {booking.status === "accepted" && booking.isPaid && !booking.userConfirmed && (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmService(booking.id, DUMMY_USER_DATA.id)}
                            disabled={isConfirmServicePending}
                          >
                            Confirm Release
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No booking history found.</p>
            )}
            {cancelBookingState?.message && (
              <p className={cn("text-sm mt-2", cancelBookingState.success ? "text-green-500" : "text-destructive")}>
                {cancelBookingState.message}
              </p>
            )}
            {confirmServiceState?.message && (
              <p className={cn("text-sm mt-2", confirmServiceState.success ? "text-green-500" : "text-destructive")}>
                {confirmServiceState.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
