import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const { userId, email, name, avatarUrl } = await request.json()
  if (!userId || !email) return new Response('Bad Request', { status: 400 })

  const admin = getSupabaseAdmin()

  const { data: existing } = await admin.from('users').select('id').eq('id', userId).single()
  if (existing) return Response.json({ ok: true, created: false })

  await admin.from('users').insert({
    id: userId,
    email,
    name: name || email.split('@')[0] || 'Usuário',
    avatar_url: avatarUrl || null,
    plan: 'free',
    accepted_terms: false,
  }).catch(() => {})

  await admin.from('message_counts').insert({
    user_id: userId,
    count: 0,
    reset_at: null,
  }).catch(() => {})

  return Response.json({ ok: true, created: true })
}
