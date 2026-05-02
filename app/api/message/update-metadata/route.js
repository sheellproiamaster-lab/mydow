import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const { conversationId, content, metadata } = await request.json()
  if (!conversationId) return new Response('Bad Request', { status: 400 })

  const admin = getSupabaseAdmin()
  const { data: msgs } = await admin
    .from('messages')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('role', 'assistant')
    .order('created_at', { ascending: false })
    .limit(1)

  if (msgs?.[0]?.id) {
    await admin.from('messages').update({ content, metadata }).eq('id', msgs[0].id)
  }

  return Response.json({ ok: true })
}