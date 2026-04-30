import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const { userId } = await request.json()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const admin = getSupabaseAdmin()

  const { data: existing } = await admin.from('users').select('id').eq('id', userId).single()

  if (existing) {
    const { error } = await admin
      .from('users')
      .update({ accepted_terms: true, accepted_at: new Date().toISOString() })
      .eq('id', userId)
    if (error) return Response.json({ error: error.message }, { status: 500 })
  } else {
    // Row missing — create it now using auth data
    const { data: authData } = await admin.auth.admin.getUserById(userId)
    const authUser = authData?.user
    await admin.from('users').insert({
      id: userId,
      email: authUser?.email || '',
      name: authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Usuário',
      avatar_url: authUser?.user_metadata?.avatar_url || null,
      plan: 'free',
      accepted_terms: true,
      accepted_at: new Date().toISOString(),
    }).catch(() => {})
    await admin.from('message_counts').upsert({
      user_id: userId, count: 0, reset_at: null,
    }, { onConflict: 'user_id' }).catch(() => {})
  }

  return Response.json({ success: true })
}
