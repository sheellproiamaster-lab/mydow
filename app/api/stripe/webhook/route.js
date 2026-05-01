import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, plan } = session.metadata || {}
    if (userId && plan) {
      await admin.from('users').update({ plan }).eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    const customerId = sub.customer
    const { data: users } = await admin.from('users').select('id').eq('stripe_customer_id', customerId)
    if (users?.length) {
      await admin.from('users').update({ plan: 'free' }).eq('id', users[0].id)
    }
  }

  return Response.json({ received: true })
}