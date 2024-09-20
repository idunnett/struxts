// app/api/create-setup-intent/route.ts
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { env } from "../../../env"

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json() // Pass the Stripe customer ID from the frontend

    // Create a SetupIntent for this customer
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    })

    return NextResponse.json({ clientSecret: setupIntent.client_secret })
  } catch (error) {
    console.error("Error creating SetupIntent:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to create SetupIntent" }),
      { status: 500 },
    )
  }
}
