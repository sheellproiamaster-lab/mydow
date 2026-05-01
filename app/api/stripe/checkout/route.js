import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PRICE_IDS = {
  plus: process.env.STRIPE_PRICE_PLUS,
  pro: process.env.STRIPE_PRICE_PRO,
}

export async function POST(request) {
  try {
    const { userId, plan, userEmail } = await request.json()
    if (!userId || !plan) return Response.json({ error: 'Missing params' }, { status: 400 })

    const priceId = PRICE_IDS[plan]
    if (!priceId) return Response.json({ error: 'Invalid plan' }, { status: 400 })

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/chat?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/chat?upgraded=false`,
      metadata: { userId, plan },
    })

    return Response.json({ url: session.url })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}