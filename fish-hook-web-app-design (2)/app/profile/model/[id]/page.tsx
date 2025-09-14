"use client"

import type React from "react"

import { useState, useEffect, useActionState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSignIcon, MapPinIcon, RulerIcon, UserIcon, CalendarIcon } from "lucide-react"
import Link from "next/link"
import { DUMMY_MODELS, DUMMY_USER_DATA } from "@/lib/dummy-data"
import { createBooking } from "@/app/actions/booking"
import { cn } from "@/lib/utils"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { MobileMoneyPaymentDialog } from "@/components/mobile-money-payment-dialog" // Import the new component

interface Model {
  id: string
  name: string
  username: string
  bodyType: string
  region: string
  pricePerHour: number
  isOnline: boolean
  coordinates: { lat: number; lon: number }
  avatarUrl: string
}

export default function ModelPublicProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [userType, setUserType] = useState<"user" | "model" | null>(null)
  const [model, setModel] = useState<Model | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined)
  const [bookingTime, setBookingTime] = useState("")
  const [userLocation, setUserLocation] = useState("")
  const [liveLocationLink, setLiveLocationLink] = useState("")
  const [callerLine, setCallerLine] = useState("")

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [bookingFormData, setBookingFormData] = useState<FormData | null>(null) // To store form data before payment

  const [bookingState, createBookingAction, isBookingPending] = useActionState(createBooking, {
    success: false,
    message: "",
  })

  useEffect(() => {
    const storedUserType = localStorage.getItem("fishhook_user_type") as "user" | "model" | null
    setUserType(storedUserType)

    const foundModel = DUMMY_MODELS.find((m) => m.id === params.id)
    if (foundModel) {
      setModel(foundModel)
    } else {
      router.push("/search")
    }
  }, [params.id, router])

  const handleBookingFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!model || !bookingDate || !bookingTime || !userLocation || !liveLocationLink || !callerLine) {
      // Basic client-side validation
      alert("Please fill in all booking details.")
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.append("modelId", model.id)
    formData.append("userId", DUMMY_USER_DATA.id)
    formData.append("bookingDate", format(bookingDate, "yyyy-MM-dd"))
    formData.append("bookingTime", bookingTime)
    formData.append("totalPrice", (model.pricePerHour * 1.15).toFixed(2)) // Send marked-up price

    setBookingFormData(formData) // Store form data
    setIsPaymentDialogOpen(true) // Open payment dialog
  }

  const handlePaymentSuccess = () => {
    if (bookingFormData) {
      createBookingAction(bookingFormData) // Call server action after successful payment
    }
  }

  useEffect(() => {
    if (bookingState.success) {
      setShowBookingForm(false) // Close form on successful booking creation
      // Optionally, show a toast or redirect to user's booking history
    }
  }, [bookingState])

  if (userType === null || !model) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <p>Loading model profile...</p>
      </div>
    )
  }

  const userPrice = (model.pricePerHour * 1.15).toFixed(2)

  return (
    <div className="w-full max-w-3xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/fishhook-logo.jpeg" alt="FishHook Logo" className="h-8 w-8 object-contain" />
            <UserIcon className="h-6 w-6 text-primary" />
            <CardTitle className="text-primary">{model.name}'s Profile</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost">
              <Link href="/search">Back to Search</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/home">Back to Home</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <img
              src={model.avatarUrl || "/placeholder.svg"}
              alt={model.name}
              className="h-32 w-32 rounded-full object-cover border-2 border-primary"
            />
            <h2 className="text-2xl font-bold">{model.name}</h2>
            <p className="text-muted-foreground">@{model.username}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left">
              <p className="flex items-center gap-1">
                <RulerIcon className="h-4 w-4 text-primary" /> {model.bodyType}
              </p>
              <p className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4 text-primary" /> {model.region}
              </p>
              <p className="flex items-center gap-1">
                <DollarSignIcon className="h-4 w-4 text-primary" /> ₵{userPrice}/hr (User Price)
              </p>
              <p className={`font-medium ${model.isOnline ? "text-green-600" : "text-destructive"}`}>
                {model.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {userType === "user" && (
            <div className="mt-6">
              <Button className="w-full" onClick={() => setShowBookingForm(true)} disabled={!model.isOnline}>
                {model.isOnline ? "Book Now" : "Model is Offline"}
              </Button>
            </div>
          )}

          {showBookingForm && userType === "user" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-primary">Book {model.name}</CardTitle>
                <CardDescription>Price: ₵{userPrice}/hr (includes 15% commission).</CardDescription>
              </CardHeader>
              <form onSubmit={handleBookingFormSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bookingDate">Booking Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !bookingDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {bookingDate ? format(bookingDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={bookingDate}
                          onSelect={setBookingDate}
                          captionLayout="dropdown-buttons"
                          fromYear={new Date().getFullYear()}
                          toYear={new Date().getFullYear() + 1}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookingTime">Booking Time</Label>
                    <Input
                      id="bookingTime"
                      name="bookingTime"
                      type="time"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userLocation">Your Location (Address)</Label>
                    <Input
                      id="userLocation"
                      name="userLocation"
                      placeholder="e.g., 123 Main St, Accra"
                      required
                      value={userLocation}
                      onChange={(e) => setUserLocation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="liveLocationLink">Live Location Link</Label>
                    <Input
                      id="liveLocationLink"
                      name="liveLocationLink"
                      type="url"
                      placeholder="e.g., Google Maps live share link"
                      required
                      value={liveLocationLink}
                      onChange={(e) => setLiveLocationLink(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="callerLine">Your Caller Line (Phone Number)</Label>
                    <Input
                      id="callerLine"
                      name="callerLine"
                      type="tel"
                      placeholder="e.g., +233241234567"
                      required
                      value={callerLine}
                      onChange={(e) => setCallerLine(e.target.value)}
                    />
                  </div>
                  {bookingState?.message && (
                    <p
                      className={cn(
                        "text-sm text-center",
                        bookingState.success ? "text-green-500" : "text-destructive",
                      )}
                    >
                      {bookingState.message}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={isBookingPending}>
                    Confirm Booking & Pay
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowBookingForm(false)}>
                    Cancel
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </CardContent>
      </Card>

      {model && (
        <MobileMoneyPaymentDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          amount={Number.parseFloat(userPrice)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
