"use client"

import type React from "react"

import { useState, useActionState, useEffect, startTransition, useRef } from "react" // Import useRef
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DollarSignIcon,
  ImagePlusIcon,
  Trash2Icon,
  UsersIcon,
  CalendarCheckIcon,
  MapPinIcon,
  SettingsIcon,
  PhoneIcon,
  LinkIcon,
  Share2Icon,
  LogOutIcon,
  CopyIcon,
} from "lucide-react"
import { UserIcon } from "lucide-react"
import {
  updatePricing,
  updateModelProfilePicture,
  deleteModelProfilePicture,
  updateBookingStatus,
  deleteAccount,
} from "@/app/actions/profile"
import { confirmServiceByModel } from "@/app/actions/booking" // Import new action
import { DUMMY_MODEL_DATA } from "@/lib/dummy-data"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Define Booking type for clarity
interface Booking {
  id: string
  userId: string
  userName: string
  date: string
  time: string
  status: "pending" | "accepted" | "rejected" | "user_cancelled" | "cancelled_auto" | "completed_payment_released"
  userGPS: string
  userLocation: string
  liveLocationLink: string
  callerLine: string
  createdAt: string // ISO string
  isPaid: boolean
  totalPrice: number
  userConfirmed: boolean
  modelConfirmed: boolean
}

export default function ModelProfilePage() {
  const router = useRouter()
  const [userType, setUserType] = useState<"user" | "model" | null>(null)

  const [pricingState, updatePricingAction, isPricingPending] = useActionState(updatePricing, {
    success: false,
    message: "",
  })
  const [profilePicState, updateModelProfilePictureAction, isProfilePicPending] = useActionState(
    updateModelProfilePicture,
    {
      success: false,
      message: "",
      imageUrl: DUMMY_MODEL_DATA.profilePictureUrl,
    },
  )
  const [deleteProfilePicState, deleteModelProfilePictureAction, isDeleteProfilePicPending] = useActionState(
    deleteModelProfilePicture,
    { success: false, message: "" },
  )
  const [bookingStatusState, updateBookingStatusAction, isBookingStatusPending] = useActionState(updateBookingStatus, {
    success: false,
    message: "",
  })
  const [confirmServiceState, confirmServiceAction, isConfirmServicePending] = useActionState(confirmServiceByModel, {
    success: false,
    message: "",
  })
  const [deleteAccountState, deleteAccountAction, isDeleteAccountPending] = useActionState(deleteAccount, {
    success: false,
    message: "",
  })

  const [currentPrice, setCurrentPrice] = useState(DUMMY_MODEL_DATA.pricePerHour)
  const [currentProfilePic, setCurrentProfilePic] = useState(DUMMY_MODEL_DATA.profilePictureUrl)
  const [bookings, setBookings] = useState<Booking[]>(DUMMY_MODEL_DATA.bookings ?? [])

  // New state for profile picture file and its preview URL
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null)
  const [profilePicPreviewUrl, setProfilePicPreviewUrl] = useState<string | undefined>(undefined)
  const profilePicInputRef = useRef<HTMLInputElement>(null) // Ref for file input

  useEffect(() => {
    const storedUserType = localStorage.getItem("fishhook_user_type") as "user" | "model" | null
    if (storedUserType !== "model") {
      router.push("/home") // Redirect if not a model
    } else {
      setUserType(storedUserType)
    }
  }, [router])

  useEffect(() => {
    if (pricingState.success) {
      setCurrentPrice(DUMMY_MODEL_DATA.pricePerHour)
    }
  }, [pricingState])

  useEffect(() => {
    if (profilePicState.success) {
      setCurrentProfilePic(DUMMY_MODEL_DATA.profilePictureUrl)
      setProfilePicFile(null) // Clear file input state
      if (profilePicInputRef.current) profilePicInputRef.current.value = "" // Clear file input
    }
  }, [profilePicState])

  useEffect(() => {
    if (deleteProfilePicState.success) {
      setCurrentProfilePic(DUMMY_MODEL_DATA.profilePictureUrl)
      setProfilePicFile(null) // Clear file input state
      if (profilePicInputRef.current) profilePicInputRef.current.value = "" // Clear file input
    }
  }, [deleteProfilePicState])

  useEffect(() => {
    if (bookingStatusState.success || confirmServiceState.success) {
      setBookings([...DUMMY_MODEL_DATA.bookings]) // Refresh bookings from dummy data
    }
  }, [bookingStatusState, confirmServiceState])

  useEffect(() => {
    if (deleteAccountState.success) {
      localStorage.removeItem("fishhook_user_type")
      router.push("/auth/signup")
    }
  }, [deleteAccountState, router])

  // Effect to create and revoke object URL for profile picture preview
  useEffect(() => {
    if (profilePicFile) {
      const url = URL.createObjectURL(profilePicFile)
      setProfilePicPreviewUrl(url)
      return () => URL.revokeObjectURL(url) // Clean up on unmount or file change
    } else {
      setProfilePicPreviewUrl(undefined)
    }
  }, [profilePicFile])

  // Simulate automatic cancellation for pending bookings older than 30 minutes
  useEffect(() => {
    const checkExpiredBookings = async () => {
      const now = new Date().getTime()
      const thirtyMinutes = 30 * 60 * 1000 // 30 minutes in milliseconds

      for (const booking of DUMMY_MODEL_DATA.bookings) {
        if (booking.status === "pending") {
          const createdAtTime = new Date(booking.createdAt).getTime()
          if (now - createdAtTime > thirtyMinutes) {
            console.log(`Booking ${booking.id} expired. Auto-cancelling...`)
            const formData = new FormData()
            formData.append("bookingId", booking.id)
            formData.append("status", "cancelled_auto")
            // Directly call the server action to update status
            await startTransition(() => updateBookingStatusAction(formData))
          }
        }
      }
    }

    // Run once on mount and then every minute (for simulation)
    checkExpiredBookings()
    const interval = setInterval(checkExpiredBookings, 60 * 1000) // Check every minute
    return () => clearInterval(interval) // Cleanup interval on unmount
  }, [updateBookingStatusAction]) // Dependency on action to re-run when it changes

  const handleBookingAction = (bookingId: string, status: "accepted" | "rejected") => {
    const formData = new FormData()
    formData.append("bookingId", bookingId)
    formData.append("status", status)

    startTransition(() => {
      updateBookingStatusAction(formData)
    })
  }

  const handleConfirmServiceDelivered = (bookingId: string, modelId: string) => {
    const formData = new FormData()
    formData.append("bookingId", bookingId)
    formData.append("modelId", modelId)

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
    formData.append("profilePicture", profilePicFile) // Append the file
    startTransition(() => {
      updateModelProfilePictureAction(formData)
    })
  }

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      const formData = new FormData()
      formData.append("userType", "model")
      formData.append("userId", DUMMY_MODEL_DATA.id)
      startTransition(() => {
        deleteAccountAction(formData)
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("fishhook_user_type")
    router.push("/auth/signup")
  }

  const handleCopyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${DUMMY_MODEL_DATA.username}` // Example referral link
    navigator.clipboard
      .writeText(referralLink)
      .then(() => alert("Referral link copied to clipboard!"))
      .catch((err) => console.error("Failed to copy referral link:", err))
  }

  if (userType === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/fishhook-logo.jpeg" alt="FishHook Logo" className="h-8 w-8 object-contain" />
            <UserIcon className="h-6 w-6 text-primary" />
            <CardTitle className="text-primary">Model/Influencer Profile</CardTitle>
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
                  src={profilePicPreviewUrl || currentProfilePic || "/placeholder.svg"} // Use preview or current
                  alt="Profile"
                  className="h-40 w-40 rounded-full object-cover border-2 border-primary"
                />
                <form onSubmit={handleProfilePicSubmit} className="flex w-full gap-2">
                  <Input
                    id="profilePicture"
                    name="profilePicture" // Name for FormData
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
                <form action={deleteModelProfilePictureAction} className="w-full">
                  <Button
                    type="submit"
                    variant="destructive"
                    className="w-full"
                    disabled={
                      isDeleteProfilePicPending || currentProfilePic === "/placeholder.svg?height=150&width=150"
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

            {/* Earnings Dashboard & Followers */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSignIcon className="h-5 w-5" /> Earnings Dashboard
                </h3>
                <Card className="p-4 bg-primary text-primary-foreground">
                  <CardTitle className="text-4xl font-bold">₵{DUMMY_MODEL_DATA.earnings.toFixed(2)}</CardTitle>
                  <CardDescription className="text-primary-foreground/80">Total Earnings (Net)</CardDescription>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" /> Followers
                </h3>
                <p className="text-2xl font-bold text-primary">{DUMMY_MODEL_DATA.followers}</p>
              </div>

              {/* Pricing Slot */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSignIcon className="h-5 w-5" /> Pricing Slot (per hour)
                </h3>
                <form action={updatePricingAction} className="flex gap-2">
                  <Input
                    id="pricePerHour"
                    name="pricePerHour"
                    type="number"
                    step="0.01"
                    defaultValue={currentPrice}
                    placeholder="Set your net price (GHS)"
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isPricingPending}>
                    {isPricingPending ? "Saving..." : "Save"}
                  </Button>
                </form>
                {pricingState?.message && (
                  <p className={cn("text-sm", pricingState.success ? "text-green-500" : "text-destructive")}>
                    {pricingState.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  User will see: ₵{(currentPrice * 1.15).toFixed(2)}/hr (15% added for commission)
                </p>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Share2Icon className="h-5 w-5" /> Share Profile
                </h3>
                <Button className="w-full" onClick={() => alert("Share model profile functionality coming soon!")}>
                  Share My Profile
                </Button>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CopyIcon className="h-5 w-5" /> Referral Link
                </h3>
                <Button className="w-full" onClick={handleCopyReferralLink}>
                  Copy Referral Link
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

          {/* Bookings List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CalendarCheckIcon className="h-5 w-5" /> Bookings List
            </h3>
            {bookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Location Info</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.userName}</TableCell>
                      <TableCell>
                        {booking.date} at {booking.time}
                      </TableCell>
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
                        {booking.status === "accepted" && (
                          <div className="text-xs text-muted-foreground">
                            User: {booking.userConfirmed ? "Confirmed" : "Pending"} | Model:{" "}
                            {booking.modelConfirmed ? "Confirmed" : "Pending"}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{booking.isPaid ? "Yes" : "No"}</TableCell>
                      <TableCell>₵{booking.totalPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-sm">
                        <p className="flex items-center gap-1">
                          <MapPinIcon className="h-3 w-3" /> {booking.userLocation}
                        </p>
                        <a
                          href={booking.liveLocationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <LinkIcon className="h-3 w-3" /> Live GPS
                        </a>
                        <a
                          href={`tel:${booking.callerLine}`}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <PhoneIcon className="h-3 w-3" /> {booking.callerLine}
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        {booking.status === "pending" && (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleBookingAction(booking.id, "accepted")}
                              disabled={isBookingStatusPending}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBookingAction(booking.id, "rejected")}
                              disabled={isBookingStatusPending}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {booking.status === "accepted" && booking.isPaid && !booking.modelConfirmed && (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmServiceDelivered(booking.id, DUMMY_MODEL_DATA.id)}
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
              <p className="text-muted-foreground">No bookings found.</p>
            )}
            {bookingStatusState?.message && (
              <p className={cn("text-sm mt-2", bookingStatusState.success ? "text-green-500" : "text-destructive")}>
                {bookingStatusState.message}
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
