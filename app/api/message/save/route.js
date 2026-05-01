import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const { conversationId, role, content } = await request.json()
  if (!conversationId) return new Response('Bad Request', { status: 400 })

  const admin = getSupabaseAdmin()
  await admin.from('messages').insert({ conversation_id: conversationId, role, content })
  await admin.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId)

  return Response.json({ ok: true })
}