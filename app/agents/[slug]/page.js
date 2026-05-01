import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AgentPageClient from './AgentPageClient'

const VALID_AGENTS = ['academic', 'nexus', 'kyw', 'jud', 'shyw', 'games', 'tradutor', 'organizador']

export default async function AgentPage({ params }) {
  const { slug } = params
  if (!VALID_AGENTS.includes(slug)) redirect('/chat')

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [userRes, mcRes, memRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('message_counts').select('*').eq('user_id', user.id).single(),
    supabase.from('memory').select('*').eq('user_id', user.id).single(),
  ])

  const userProfile = userRes.data || {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
    plan: 'free',
    accepted_terms: true,
    preferences: null,
  }

  return (
    <AgentPageClient
      slug={slug}
      user={userProfile}
      messageCount={mcRes.data || { count: 0, reset_at: null }}
      memory={memRes.data || { field1: '', field2: '', field3: '' }}
    />
  )
}
