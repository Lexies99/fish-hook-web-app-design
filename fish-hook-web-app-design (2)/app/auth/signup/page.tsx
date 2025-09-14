"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { signup } from "@/app/actions/auth" // Import the server action

export default function SignUpPage() {
  const [userType, setUserType] = useState<"user" | "model">("user")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [state, formAction, isPending] = useActionState(signup, { success: false, message: "", userType: "" })
  const router = useRouter()

  useEffect(() => {
    if (state.success && state.userType) {
      localStorage.setItem("fishhook_user_type", state.userType) // Store user type in localStorage
      router.push("/home") // Redirect after storing
    }
  }, [state, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2">
            <img src="/images/fishhook-logo.jpeg" alt="FishHook Logo" className="h-8 w-8 object-contain" />
            <CardTitle className="text-2xl font-bold text-primary">FishHook Signup</CardTitle>
          </div>
          <CardDescription>Create your account to join the FishHook community.</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userType">Account Type</Label>
                <Select
                  value={userType}
                  onValueChange={(value: "user" | "model") => setUserType(value)}
                  name="userType"
                >
                  <SelectTrigger id="userType">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="model">Model/Influencer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" placeholder="johndoe" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
                <Input id="dob" name="dob" type="hidden" value={date ? format(date, "yyyy-MM-dd") : ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender" required>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telephone">Telephone Number</Label>
                <Input id="telephone" name="telephone" type="tel" placeholder="+233241234567" required />
                <p className="text-xs text-muted-foreground">Used for account verification.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region/Town</Label>
                <Input id="region" name="region" placeholder="Accra, Ghana" required />
              </div>
            </div>

            {userType === "model" && (
              <div className="space-y-2">
                <Label htmlFor="bodyType">Body Type</Label>
                <Input id="bodyType" name="bodyType" placeholder="e.g., Athletic, Slim, Curvy" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" name="confirm-password" type="password" required />
            </div>

            {state?.message && (
              <p className={cn("text-sm text-center", state.success ? "text-green-500" : "text-destructive")}>
                {state.message}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing up..." : "Sign Up"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
