import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Create redirect response FIRST so cookies survive the redirect
  const response = NextResponse.redirect(`${origin}/chat`)

  if (!code) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) { response.cookies.set({ name, value, ...options }) },
        remove(name, options) { response.cookies.set({ name, value: '', ...options }) },
      },
    }
  )

  let session = null
  try {
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    session = data?.session
  } catch {
    return response
  }

  if (session?.user) {
    const { user } = session
    const admin = getSupabaseAdmin()
    const { data: existing } = await admin.from('users').select('id').eq('id', user.id).single()

    if (!existing) {
      await admin.from('users').insert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
        avatar_url: user.user_metadata?.avatar_url || null,
        plan: 'free',
        accepted_terms: false,
      }).catch(() => {})

      await admin.from('message_counts').insert({
        user_id: user.id,
        count: 0,
        reset_at: null,
      }).catch(() => {})
    }
  }

  return response
}
