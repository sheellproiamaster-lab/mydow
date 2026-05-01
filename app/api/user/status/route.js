import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const { userId } = await request.json()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const admin = getSupabaseAdmin()
  const [mcRes, convsRes] = await Promise.all([
    admin.from('message_counts').select('*').eq('user_id', userId).single(),
    admin.from('conversations').select('id, title, is_favorite, updated_at').eq('user_id', userId).order('updated_at', { ascending: false }),
  ])

  return Response.json({
    msgCount: mcRes.data || { count: 0, reset_at: null },
    conversations: convsRes.data || [],
  })
}