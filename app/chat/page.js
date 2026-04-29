import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatClient from './ChatClient'

export default async function ChatPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [userRes, mcRes, memRes, convsRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('message_counts').select('*').eq('user_id', user.id).single(),
    supabase.from('memory').select('*').eq('user_id', user.id).single(),
    supabase.from('conversations').select('id, title, is_favorite, created_at, updated_at')
      .eq('user_id', user.id)
      .order('is_favorite', { ascending: false })
      .order('updated_at', { ascending: false }),
  ])

  const userProfile = userRes.data || { id: user.id, email: user.email, name: user.email?.split('@')[0] || 'Usuário', plan: 'free', accepted_terms: false }
  const messageCount = mcRes.data || { count: 20, reset_at: null }
  const memory = memRes.data || { field1: '', field2: '', field3: '' }
  const conversations = convsRes.data || []

  return (
    <ChatClient
      user={userProfile}
      messageCount={messageCount}
      memory={memory}
      conversations={conversations}
    />
  )
}
