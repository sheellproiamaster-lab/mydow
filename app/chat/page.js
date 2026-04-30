import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatClient from './ChatClient'

export default async function ChatPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [userRes, mcRes, memRes, convsRes, ulRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('message_counts').select('*').eq('user_id', user.id).single(),
    supabase.from('memory').select('*').eq('user_id', user.id).single(),
    supabase.from('conversations').select('id, title, is_favorite, created_at, updated_at')
      .eq('user_id', user.id)
      .order('is_favorite', { ascending: false })
      .order('updated_at', { ascending: false }),
    supabase.from('usage_limits').select('*').eq('user_id', user.id).single(),
  ])

  const userProfile = userRes.data || {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
    avatar_url: user.user_metadata?.avatar_url || null,
    plan: 'free',
    accepted_terms: false,
    preferences: null,
  }

  const messageCount = mcRes.data || { count: 20, reset_at: null }
  const memory = memRes.data || { field1: '', field2: '', field3: '' }
  const conversations = convsRes.data || []
  const usageLimits = ulRes.data || { images_used: 0, docs_analyzed: 0, docs_generated: 0, week_reset_at: null }

  return (
    <ChatClient
      user={userProfile}
      messageCount={messageCount}
      memory={memory}
      conversations={conversations}
      usageLimits={usageLimits}
    />
  )
}
