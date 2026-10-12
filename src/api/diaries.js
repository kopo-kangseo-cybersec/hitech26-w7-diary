import { supabase } from '../lib/supabase'

function getClient() {
  if (!supabase) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
  }

  return supabase
}

export async function getDiaries() {
  const { data, error } = await getClient()
    .from('diaries')
    .select('id, content, emotion, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createDiary({ content, emotion }) {
  const { data, error } = await getClient()
    .from('diaries')
    .insert({ content, emotion })
    .select('id, content, emotion, created_at')
    .single()

  if (error) throw error
  return data
}

export async function removeDiary(id) {
  const { error } = await getClient().from('diaries').delete().eq('id', id)

  if (error) throw error
}