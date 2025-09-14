import { NextResponse } from "next/server"

/**
 * Webhook endpoint to receive POST requests from external services.
 * This handler will parse the incoming JSON body and log it.
 *
 * Example usage (e.g., from a payment gateway or a booking system):
 * POST /api/webhooks
 * Content-Type: application/json
 * Body: { "event": "payment_successful", "bookingId": "b123", "amount": 1725.00, "currency": "GHS" }
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json()
    console.log("--- Webhook Received ---")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Payload:", JSON.stringify(payload, null, 2))
    console.log("------------------------")

    // In a real application, you would process the payload here:
    // - Verify the sender (e.g., using a secret key or signature)
    // - Update your database based on the event (e.g., mark a booking as paid)
    // - Trigger other internal processes (e.g., send a notification)

    return NextResponse.json({ message: "Webhook received successfully!", status: "success" }, { status: 200 })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ message: "Error processing webhook", status: "error" }, { status: 500 })
  }
}

// You can also add other HTTP methods if needed, e.g., for testing or specific integrations
export async function GET() {
  return NextResponse.json(
    { message: "This is the webhook endpoint. Send a POST request.", status: "info" },
    { status: 200 },
  )
}
