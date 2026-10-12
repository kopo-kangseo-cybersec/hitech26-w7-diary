import { supabase } from '../lib/supabase'

const allowedEmotions = ['joy', 'calm', 'sad', 'angry', 'anxious']

export async function listDiaries() {
  const { data, error } = await supabase.from('diaries').select('id, content, emotion, created_at').order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createDiary({ content, emotion }) {
  if (!allowedEmotions.includes(emotion)) throw new Error('지원하지 않는 감정입니다.')

  const { data, error } = await supabase.from('diaries').insert({ content, emotion }).select('id, content, emotion, created_at').single()

  if (error) throw error
  return data
}

export async function deleteDiary(id) {
  const { error } = await supabase.from('diaries').delete().eq('id', id)

  if (error) throw error
}