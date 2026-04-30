import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { userId } = await request.json()
    if (!userId) return new Response('Unauthorized', { status: 401 })

    const admin = getSupabaseAdmin()

    // Upsert — cria ou atualiza em uma única operação
    const { error } = await admin
      .from('users')
      .upsert({
        id: userId,
        accepted_terms: true,
        accepted_at: new Date().toISOString(),
      }, { onConflict: 'id', ignoreDuplicates: false })

    if (error) {
      console.error('accept-terms error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Garantir que message_counts existe
    await admin
      .from('message_counts')
      .upsert({ user_id: userId, count: 0, reset_at: null }, { onConflict: 'user_id', ignoreDuplicates: true })
      .catch(() => {})

    return Response.json({ success: true })
  } catch (err) {
    console.error('accept-terms exception:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}