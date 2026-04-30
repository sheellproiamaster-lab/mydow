import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const { conversationId, userId, patch } = await request.json()
  if (!conversationId || !userId || !patch) return new Response('Bad Request', { status: 400 })

  const admin = getSupabaseAdmin()
  const { error } = await admin
    .from('conversations')
    .update(patch)
    .eq('id', conversationId)
    .eq('user_id', userId)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
