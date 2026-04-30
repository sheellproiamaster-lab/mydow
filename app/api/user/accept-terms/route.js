import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const { userId } = await request.json()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const admin = getSupabaseAdmin()
  const { error } = await admin
    .from('users')
    .update({ accepted_terms: true, accepted_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
