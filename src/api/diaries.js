import { supabase } from '../lib/supabase.js'

const getClient = () => {
  if (!supabase) {
    throw new Error('VITE_SUPABASE_URL과 VITE_SUPABASE_PUBLISHABLE_KEY를 .env.local에 설정해주세요.')
  }
  return supabase
}

export const getDiaries = async () => {
  const { data, error } = await getClient()
    .from('diaries')
    .select('id, content, emotion, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const addDiary = async ({ content, emotion }) => {
  const { data, error } = await getClient()
    .from('diaries')
    .insert({ content, emotion })
    .select('id, content, emotion, created_at')
    .single()

  if (error) throw error
  return data
}

export const deleteDiary = async (id) => {
  const { error } = await getClient().from('diaries').delete().eq('id', id)
  if (error) throw error
}