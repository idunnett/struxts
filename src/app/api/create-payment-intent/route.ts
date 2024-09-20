// app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { env } from "../../../env"

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export async function POST(req: NextRequest) {
  try {
    // You can get additional data from the request body if necessary
    const { amount } = await req.json() // Expecting 'amount' to be sent from the client

    // Create a PaymentIntent with the specified amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 5000, // Default to $50.00 if no amount is specified
      currency: "cad",
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error("Error creating PaymentIntent:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to create PaymentIntent" }),
      { status: 500 },
    )
  }
}
