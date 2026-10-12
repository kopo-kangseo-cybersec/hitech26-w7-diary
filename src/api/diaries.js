import { supabase } from '../lib/supabase'

export async function getDiaries() {
  const { data, error } = await supabase
    .from('diaries')
    .select('id, content, emotion, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function createDiary({ content, emotion }) {
  const { data, error } = await supabase
    .from('diaries')
    .insert({ content, emotion })
    .select('id, content, emotion, created_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteDiary(id) {
  const { error } = await supabase.from('diaries').delete().eq('id', id)

  if (error) {
    throw error
  }
}
