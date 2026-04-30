import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const { userId, title } = await request.json()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('conversations')
    .insert({ user_id: userId, title: title || 'Nova conversa', is_favorite: false })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
