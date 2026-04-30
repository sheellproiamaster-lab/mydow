import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const { conversationId, userId } = await request.json()
  if (!conversationId || !userId) return new Response('Bad Request', { status: 400 })

  const admin = getSupabaseAdmin()
  await admin.from('messages').delete().eq('conversation_id', conversationId).catch(() => {})
  const { error } = await admin
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', userId)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
