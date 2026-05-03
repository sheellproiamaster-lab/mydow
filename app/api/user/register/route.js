import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { userId, email, name } = await request.json()
    if (!userId) return new Response('Unauthorized', { status: 401 })

    const admin = getSupabaseAdmin()

    await admin.from('users').upsert({
      id: userId,
      email: email || '',
      name: name || email?.split('@')[0] || 'Usuário',
      plan: 'free',
      accepted_terms: false,
    }, { onConflict: 'id', ignoreDuplicates: true })

    await admin.from('message_counts').upsert({
      user_id: userId,
      count: 0,
      reset_at: null,
    }, { onConflict: 'user_id', ignoreDuplicates: true })

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}