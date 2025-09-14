"use client"

import type React from "react"
import { useState, useActionState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface MobileMoneyPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  onPaymentSuccess: () => void
}

// Simulate a mobile money payment action
async function simulateMobileMoneyPayment(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData,
) {
  const phoneNumber = formData.get("phoneNumber") as string
  const network = formData.get("network") as string
  const amount = Number.parseFloat(formData.get("amount") as string)

  if (!phoneNumber || !network || isNaN(amount) || amount <= 0) {
    return { success: false, message: "Please fill in all payment details." }
  }

  console.log(`Simulating mobile money payment:`)
  console.log(`  Phone Number: ${phoneNumber}`)
  console.log(`  Network: ${network}`)
  console.log(`  Amount: ₵${amount.toFixed(2)}`)

  // Simulate a delay for payment processing
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Simulate success or failure randomly (for a real app, this would be a payment gateway response)
  const success = Math.random() > 0.1 // 90% success rate for demo
  if (success) {
    return { success: true, message: "Payment successful! Redirecting to booking confirmation..." }
  } else {
    return { success: false, message: "Payment failed. Please try again or check your balance." }
  }
}

export function MobileMoneyPaymentDialog({
  open,
  onOpenChange,
  amount,
  onPaymentSuccess,
}: MobileMoneyPaymentDialogProps) {
  const [paymentState, paymentAction, isPaymentPending] = useActionState(simulateMobileMoneyPayment, {
    success: false,
    message: "",
  })
  const [phoneNumber, setPhoneNumber] = useState("")
  const [network, setNetwork] = useState("")

  useEffect(() => {
    if (paymentState.success) {
      // Give a moment for the user to see the success message, then trigger success callback
      const timer = setTimeout(() => {
        onPaymentSuccess()
        onOpenChange(false) // Close dialog
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [paymentState, onPaymentSuccess, onOpenChange])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setPhoneNumber("")
      setNetwork("")
      // Reset action state when dialog closes
      paymentAction(new FormData()) // Pass empty form data to reset state
    }
  }, [open, paymentAction])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append("amount", amount.toFixed(2)) // Add amount to form data
    paymentAction(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-primary">Mobile Money Payment</DialogTitle>
          <DialogDescription>Complete your booking payment for ₵{amount.toFixed(2)}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="e.g., +233241234567"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="network">Mobile Network</Label>
              <Select name="network" required value={network} onValueChange={setNetwork}>
                <SelectTrigger id="network">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                  <SelectItem value="vodafone">Vodafone Cash</SelectItem>
                  <SelectItem value="airtel">AirtelTigo Money</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentState?.message && (
              <p className={cn("text-sm text-center", paymentState.success ? "text-green-500" : "text-destructive")}>
                {paymentState.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPaymentPending}>
              {isPaymentPending ? "Processing..." : `Pay ₵${amount.toFixed(2)}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
