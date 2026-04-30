import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { userId } = await request.json()
    if (!userId) return new Response('Unauthorized', { status: 401 })

    const admin = getSupabaseAdmin()

    const { data: authData } = await admin.auth.admin.getUserById(userId)
    const authUser = authData?.user

    const { error } = await admin.from('users').upsert({
      id: userId,
      email: authUser?.email || '',
      name: authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Usuário',
      avatar_url: authUser?.user_metadata?.avatar_url || null,
      plan: 'free',
      accepted_terms: true,
      accepted_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    if (error) return Response.json({ error: error.message }, { status: 500 })

    await admin.from('message_counts').upsert(
      { user_id: userId, count: 0, reset_at: null },
      { onConflict: 'user_id', ignoreDuplicates: true }
    ).catch(() => {})

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}