"use server"

import { revalidatePath } from "next/cache"
import { DUMMY_USER_DATA, DUMMY_MODEL_DATA, DUMMY_MODELS } from "@/lib/dummy-data"

// Helper to generate a unique ID (for dummy data)
const generateUniqueId = () => Math.random().toString(36).substring(2, 15)

export async function createBooking(_prevState: { success: boolean; message: string } | null, formData: FormData) {
  const modelId = formData.get("modelId") as string
  const userId = formData.get("userId") as string // Current logged-in user ID
  const userLocation = formData.get("userLocation") as string
  const liveLocationLink = formData.get("liveLocationLink") as string
  const callerLine = formData.get("callerLine") as string
  const bookingDate = formData.get("bookingDate") as string
  const bookingTime = formData.get("bookingTime") as string
  const totalPrice = Number.parseFloat(formData.get("totalPrice") as string) // Price user pays

  if (
    !modelId ||
    !userId ||
    !userLocation ||
    !liveLocationLink ||
    !callerLine ||
    !bookingDate ||
    !bookingTime ||
    isNaN(totalPrice) ||
    totalPrice <= 0
  ) {
    return { success: false, message: "All booking details are required." }
  }

  const model = DUMMY_MODELS.find((m) => m.id === modelId)
  if (!model) {
    return { success: false, message: "Model not found." }
  }

  // Simulate payment success (for now, always true)
  const isPaid = true

  const newBooking = {
    id: generateUniqueId(),
    userId: userId,
    userName: DUMMY_USER_DATA.username, // Use dummy user's name
    modelId: model.id,
    modelName: model.name,
    date: bookingDate,
    time: bookingTime,
    status: "pending" as const,
    userGPS: model.coordinates ? `geo:${model.coordinates.lat},${model.coordinates.lon}` : "N/A", // Placeholder, ideally user's GPS
    userLocation,
    liveLocationLink,
    callerLine,
    createdAt: new Date().toISOString(),
    isPaid: isPaid,
    totalPrice: totalPrice,
    userConfirmed: false,
    modelConfirmed: false,
  }

  // Add to model's bookings (assuming DUMMY_MODEL_DATA is the current model)
  if (DUMMY_MODEL_DATA.id === modelId) {
    DUMMY_MODEL_DATA.bookings.push(newBooking)
  } else {
    // In a real app, you'd update the specific model's data in a DB
    console.warn(
      `Booking created for model ${modelId}, but DUMMY_MODEL_DATA is for ${DUMMY_MODEL_DATA.id}. Data not added to DUMMY_MODEL_DATA.bookings.`,
    )
  }

  // Add to user's booking history
  DUMMY_USER_DATA.bookHistory.push({
    id: newBooking.id,
    modelName: newBooking.modelName,
    date: newBooking.date,
    time: newBooking.time,
    status: newBooking.status,
    price: model.pricePerHour, // Store model's base price in user history
    totalPrice: newBooking.totalPrice,
    isPaid: newBooking.isPaid,
    modelId: newBooking.modelId,
    userLocation: newBooking.userLocation,
    liveLocationLink: newBooking.liveLocationLink,
    callerLine: newBooking.callerLine,
    userConfirmed: newBooking.userConfirmed,
    modelConfirmed: newBooking.modelConfirmed,
    createdAt: newBooking.createdAt,
  })

  revalidatePath("/profile/model")
  revalidatePath("/profile/user")
  return { success: true, message: "Booking created successfully! Waiting for model's acceptance." }
}

export async function confirmServiceByUser(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData,
) {
  const bookingId = formData.get("bookingId") as string
  const userId = formData.get("userId") as string // Current logged-in user ID

  const modelBookingIndex = DUMMY_MODEL_DATA.bookings.findIndex((b) => b.id === bookingId)
  const userBookingIndex = DUMMY_USER_DATA.bookHistory.findIndex((b) => b.id === bookingId)

  if (modelBookingIndex === -1 || userBookingIndex === -1) {
    return { success: false, message: "Booking not found." }
  }

  const booking = DUMMY_MODEL_DATA.bookings[modelBookingIndex]

  if (booking.userId !== userId) {
    return { success: false, message: "Unauthorized action." }
  }

  if (booking.status !== "accepted" || !booking.isPaid) {
    return { success: false, message: "Booking is not in a state to be confirmed or not paid." }
  }

  booking.userConfirmed = true
  DUMMY_USER_DATA.bookHistory[userBookingIndex].userConfirmed = true

  console.log(`User ${userId} confirmed service for booking ${bookingId}.`)

  // Check if both confirmed to release payment
  if (booking.userConfirmed && booking.modelConfirmed) {
    await releasePayment(booking.id)
  }

  revalidatePath("/profile/model")
  revalidatePath("/profile/user")
  return { success: true, message: "Service confirmed by you!" }
}

export async function confirmServiceByModel(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData,
) {
  const bookingId = formData.get("bookingId") as string
  const modelId = formData.get("modelId") as string // Current logged-in model ID

  const modelBookingIndex = DUMMY_MODEL_DATA.bookings.findIndex((b) => b.id === bookingId)
  const userBookingIndex = DUMMY_USER_DATA.bookHistory.findIndex((b) => b.id === bookingId)

  if (modelBookingIndex === -1 || userBookingIndex === -1) {
    return { success: false, message: "Booking not found." }
  }

  const booking = DUMMY_MODEL_DATA.bookings[modelBookingIndex]

  if (booking.modelId !== modelId) {
    return { success: false, message: "Unauthorized action." }
  }

  if (booking.status !== "accepted" || !booking.isPaid) {
    return { success: false, message: "Booking is not in a state to be confirmed or not paid." }
  }

  booking.modelConfirmed = true
  DUMMY_USER_DATA.bookHistory[userBookingIndex].modelConfirmed = true

  console.log(`Model ${modelId} confirmed service delivered for booking ${bookingId}.`)

  // Check if both confirmed to release payment
  if (booking.userConfirmed && booking.modelConfirmed) {
    await releasePayment(booking.id)
  }

  revalidatePath("/profile/model")
  revalidatePath("/profile/user")
  return { success: true, message: "Service confirmed as delivered!" }
}

async function releasePayment(bookingId: string) {
  const modelBookingIndex = DUMMY_MODEL_DATA.bookings.findIndex((b) => b.id === bookingId)
  const userBookingIndex = DUMMY_USER_DATA.bookHistory.findIndex((b) => b.id === bookingId)

  if (modelBookingIndex === -1 || userBookingIndex === -1) {
    console.error(`Payment release failed: Booking ${bookingId} not found.`)
    return { success: false, message: "Booking not found for payment release." }
  }

  const booking = DUMMY_MODEL_DATA.bookings[modelBookingIndex]

  if (!booking.isPaid || !booking.userConfirmed || !booking.modelConfirmed) {
    console.error(`Payment release failed: Booking ${bookingId} not ready for release.`)
    return { success: false, message: "Booking not ready for payment release." }
  }

  const modelNetPrice = booking.totalPrice / 1.15 // Calculate model's base price
  const commissionAmount = booking.totalPrice - modelNetPrice // 15% commission

  // Simulate payment release
  DUMMY_MODEL_DATA.earnings += modelNetPrice // Add net earnings to model
  booking.status = "completed_payment_released" // Update status
  DUMMY_USER_DATA.bookHistory[userBookingIndex].status = "completed_payment_released"

  console.log(`Payment released for booking ${bookingId}:`)
  console.log(`  Total paid by user: ₵${booking.totalPrice.toFixed(2)}`)
  console.log(`  Commission (15%) to admin: ₵${commissionAmount.toFixed(2)}`)
  console.log(`  Net payment to model: ₵${modelNetPrice.toFixed(2)}`)

  return { success: true, message: "Payment released successfully!" }
}
