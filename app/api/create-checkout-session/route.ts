import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

let stripe: Stripe | null = null

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
  })
} else {
  // Заглушка для локальной разработки без ключа
  stripe = {
    products: {
      list: async () => ({ data: [] }),
      create: async (data: any) => ({ id: "prod_mock", ...data }),
    },
    prices: {
      list: async () => ({ data: [] }),
      create: async (data: any) => ({ id: "price_mock", ...data }),
    },
    checkout: {
      sessions: {
        create: async (data: any) => ({
          url: "http://localhost:3000/mock-checkout",
          id: "sess_mock",
        }),
      },
    },
  } as unknown as Stripe
}

export async function POST(request: NextRequest) {
  try {
    const { planType } = await request.json()

    let priceId: string

    if (planType === "premium") {
      const products = await stripe.products.list({
        limit: 10,
      })

      let product = products.data.find((p) => p.name === "KIRA Premium")

      if (!product) {
        product = await stripe.products.create({
          name: "KIRA Premium",
          description: "Daily personalized AI-powered astrological insights and compatibility analysis",
        })
      }

      const prices = await stripe.prices.list({
        product: product.id,
        limit: 10,
      })

      let price = prices.data.find(
        (p) =>
          p.unit_amount === 1500 &&
          p.currency === "usd" &&
          p.recurring?.interval === "month",
      )

      if (!price) {
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: 1500,
          currency: "usd",
          recurring: {
            interval: "month",
          },
        })
      }

      priceId = price.id
    } else {
      throw new Error("Invalid plan type")
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/?canceled=true`,
      metadata: {
        planType,
      },
      billing_address_collection: "required",
      allow_promotion_codes: true,
      customer_email: undefined,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create checkout session",
      },
      { status: 500 },
    )
  }
}
