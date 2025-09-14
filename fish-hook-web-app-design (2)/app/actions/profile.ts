"use server"

import { revalidatePath } from "next/cache"
import { DUMMY_USER_DATA, DUMMY_MODEL_DATA } from "@/lib/dummy-data"

export async function updateUsername(_prevState: { success: boolean; message: string } | null, formData: FormData) {
  const newUsername = formData.get("username") as string
  if (!newUsername || newUsername.trim() === "") {
    return { success: false, message: "Username cannot be empty." }
  }

  // Simulate update
  DUMMY_USER_DATA.username = newUsername
  console.log(`Username updated to: ${newUsername}`)

  revalidatePath("/profile/user") // Revalidate the user profile page
  return { success: true, message: "Username updated successfully!" }
}

export async function updatePricing(_prevState: { success: boolean; message: string } | null, formData: FormData) {
  const newPrice = Number.parseFloat(formData.get("pricePerHour") as string)
  if (isNaN(newPrice) || newPrice <= 0) {
    return { success: false, message: "Price must be a positive number." }
  }

  // Simulate update
  DUMMY_MODEL_DATA.pricePerHour = newPrice
  console.log(`Pricing updated to: ₵${newPrice}/hour (model's net price)`)

  revalidatePath("/profile/model") // Revalidate the model profile page
  return { success: true, message: "Pricing updated successfully!" }
}

export async function updateModelProfilePicture(
  _prevState: { success: boolean; message: string; imageUrl?: string } | null,
  formData: FormData,
) {
  // Check if a file was provided (simulated upload)
  const profilePictureFile = formData.get("profilePicture") as File | null

  if (!profilePictureFile || profilePictureFile.size === 0) {
    return { success: false, message: "Please select an image file." }
  }

  // Simulate processing the file. In a real app, you'd upload this to storage.
  // For this demo, we'll just update the URL to a generic "uploaded" placeholder.
  const simulatedImageUrl = "/placeholder.svg?height=150&width=150&text=Model Uploaded" // A new placeholder to show change

  // Simulate update
  DUMMY_MODEL_DATA.profilePictureUrl = simulatedImageUrl
  console.log(
    `Model profile picture simulated upload: ${profilePictureFile.name}. Updated URL to: ${simulatedImageUrl}`,
  )

  revalidatePath("/profile/model")
  return { success: true, message: "Profile picture uploaded!", imageUrl: simulatedImageUrl }
}

export async function deleteModelProfilePicture() {
  // Simulate deletion by reverting to a placeholder
  DUMMY_MODEL_DATA.profilePictureUrl = "/placeholder.svg?height=150&width=150"
  console.log("Model profile picture deleted.")

  revalidatePath("/profile/model")
  return { success: true, message: "Profile picture deleted!" }
}

export async function updateUserProfilePicture(
  _prevState: { success: boolean; message: string; imageUrl?: string } | null,
  formData: FormData,
) {
  const profilePictureFile = formData.get("profilePicture") as File | null

  if (!profilePictureFile || profilePictureFile.size === 0) {
    return { success: false, message: "Please select an image file." }
  }

  const simulatedImageUrl = "/placeholder.svg?height=150&width=150&text=User Uploaded"

  DUMMY_USER_DATA.profilePictureUrl = simulatedImageUrl
  console.log(`User profile picture simulated upload: ${profilePictureFile.name}. Updated URL to: ${simulatedImageUrl}`)

  revalidatePath("/profile/user")
  return { success: true, message: "Profile picture uploaded!", imageUrl: simulatedImageUrl }
}

export async function deleteUserProfilePicture() {
  DUMMY_USER_DATA.profilePictureUrl = "/placeholder.svg?height=150&width=150&text=User"
  console.log("User profile picture deleted.")

  revalidatePath("/profile/user")
  return { success: true, message: "Profile picture deleted!" }
}

export async function deleteAccount(_prevState: { success: boolean; message: string } | null, formData: FormData) {
  const userType = formData.get("userType") as "user" | "model"
  const userId = formData.get("userId") as string

  // In a real application, you would delete the user's data from your database here.
  // For this dummy implementation, we'll just log the action.
  console.log(`Simulating deletion of ${userType} account with ID: ${userId}`)

  // Simulate clearing data or marking as deleted
  if (userType === "user" && userId === DUMMY_USER_DATA.id) {
    // Clear user data (for demo purposes)
    DUMMY_USER_DATA.username = "deleted_user"
    DUMMY_USER_DATA.profilePictureUrl = "/placeholder.svg?height=150&width=150&text=Deleted"
    DUMMY_USER_DATA.bookHistory = []
    DUMMY_USER_DATA.following = 0
  } else if (userType === "model" && userId === DUMMY_MODEL_DATA.id) {
    // Clear model data (for demo purposes)
    DUMMY_MODEL_DATA.username = "deleted_model"
    DUMMY_MODEL_DATA.profilePictureUrl = "/placeholder.svg?height=150&width=150&text=Deleted"
    DUMMY_MODEL_DATA.earnings = 0
    DUMMY_MODEL_DATA.followers = 0
    DUMMY_MODEL_DATA.bookings = []
    DUMMY_MODEL_DATA.pricePerHour = 0
  } else {
    return { success: false, message: "Account not found or unauthorized." }
  }

  revalidatePath("/") // Revalidate all paths that might display this user/model
  return { success: true, message: "Account deleted successfully. You will be logged out." }
}

export async function updateBookingStatus(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData,
) {
  const bookingId = formData.get("bookingId") as string
  const status = formData.get("status") as
    | "accepted"
    | "rejected"
    | "cancelled_auto"
    | "user_cancelled"
    | "completed_payment_released"

  const modelBookingIndex = DUMMY_MODEL_DATA.bookings.findIndex((b) => b.id === bookingId)
  const userBookingIndex = DUMMY_USER_DATA.bookHistory.findIndex((b) => b.id === bookingId)

  if (modelBookingIndex === -1 || userBookingIndex === -1) {
    return { success: false, message: "Booking not found." }
  }

  // Simulate update
  DUMMY_MODEL_DATA.bookings[modelBookingIndex].status = status
  DUMMY_USER_DATA.bookHistory[userBookingIndex].status = status

  console.log(`Booking ${bookingId} status updated to: ${status}`)

  revalidatePath("/profile/model")
  revalidatePath("/profile/user")
  return { success: true, message: `Booking ${bookingId} ${status}!` }
}

export async function cancelBookingByUser(
  _prevState: { success: boolean; message: string; refundAmount?: number; commissionAmount?: number } | null,
  formData: FormData,
) {
  const bookingId = formData.get("bookingId") as string
  const userId = formData.get("userId") as string // Assuming we pass the user ID for a real scenario

  const modelBookingIndex = DUMMY_MODEL_DATA.bookings.findIndex((b) => b.id === bookingId)
  const userBookingIndex = DUMMY_USER_DATA.bookHistory.findIndex((b) => b.id === bookingId)

  if (modelBookingIndex === -1 || userBookingIndex === -1) {
    return { success: false, message: "Booking not found." }
  }

  const booking = DUMMY_MODEL_DATA.bookings[modelBookingIndex]

  if (
    booking.status === "completed_payment_released" ||
    booking.status === "rejected" ||
    booking.status === "cancelled_auto" ||
    booking.status === "user_cancelled"
  ) {
    return { success: false, message: "Booking cannot be cancelled at this stage." }
  }

  let refundAmount = 0
  let commissionAmount = 0

  if (booking.isPaid) {
    const userPaidPrice = booking.totalPrice
    const modelNetPrice = userPaidPrice / 1.15 // Calculate model's base price (what model would get)
    commissionAmount = userPaidPrice - modelNetPrice // 15% commission (retained by admin)
    refundAmount = modelNetPrice // Amount refunded to user (model's net price)

    // Simulate sending commission to admin
    console.log(`Simulating ₵${commissionAmount.toFixed(2)} commission sent to admin for booking ${bookingId}.`)
    // Simulate refunding to user
    console.log(`Simulating ₵${refundAmount.toFixed(2)} refunded to user ${userId} for booking ${bookingId}.`)
  } else {
    // If not paid, no commission, full refund (or just cancellation)
    refundAmount = booking.totalPrice // Or 0 if no payment was made
    console.log(`Booking ${bookingId} cancelled before payment. No commission deducted.`)
  }

  // Update status for both model's and user's view
  DUMMY_MODEL_DATA.bookings[modelBookingIndex].status = "user_cancelled"
  DUMMY_USER_DATA.bookHistory[userBookingIndex].status = "user_cancelled"

  revalidatePath("/profile/model")
  revalidatePath("/profile/user")
  return {
    success: true,
    message: `Booking ${bookingId} cancelled. Refund: ₵${refundAmount.toFixed(2)}. Commission: ₵${commissionAmount.toFixed(2)}.`,
    refundAmount,
    commissionAmount,
  }
}
