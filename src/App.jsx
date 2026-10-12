import { useEffect, useMemo, useState } from 'react'
import { createDiary, deleteDiary, listDiaries } from './api/diaries'

const emotions = [
  { value: 'joy', label: '기쁨', emoji: '😊' },
  { value: 'calm', label: '평온', emoji: '😌' },
  { value: 'sad', label: '슬픔', emoji: '😢' },
  { value: 'angry', label: '화남', emoji: '😠' },
  { value: 'anxious', label: '불안', emoji: '😰' },
]

const getEmotion = (value) => emotions.find((emotion) => emotion.value === value)

function App() {
  const [diaries, setDiaries] = useState([])
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [filter, setFilter] = useState('all')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const filteredDiaries = useMemo(
    () =>
      filter === 'all'
        ? diaries
        : diaries.filter((diary) => diary.emotion === filter),
    [diaries, filter],
  )

  useEffect(() => {
    const loadDiaries = async () => {
      try {
        setError('')
        setDiaries(await listDiaries())
      } catch (loadError) {
        setError(`일기를 불러오지 못했습니다: ${loadError.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadDiaries()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmedContent = content.trim()

    if (!selectedEmotion || !trimmedContent) {
      setError('감정을 선택하고 내용을 입력해 주세요.')
      return
    }

    try {
      setError('')
      setIsSaving(true)
      const diary = await createDiary({
        content: trimmedContent,
        emotion: selectedEmotion,
      })
      setDiaries((currentDiaries) => [diary, ...currentDiaries])
      setContent('')
      setSelectedEmotion('')
    } catch (saveError) {
      setError(`일기를 저장하지 못했습니다: ${saveError.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setError('')
      setDeletingId(id)
      await deleteDiary(id)
      setDiaries((currentDiaries) =>
        currentDiaries.filter((diary) => diary.id !== id),
      )
    } catch (deleteError) {
      setError(`일기를 삭제하지 못했습니다: ${deleteError.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (date) =>
    new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date))

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-8 sm:px-8 lg:py-14">
      <header className="mb-10 flex items-end justify-between gap-6 border-b border-[#d9d0c3] pb-8">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#9a6547]">Daily feelings</p>
          <h1 className="font-['Playfair_Display'] text-4xl font-bold tracking-tight text-[#302a25] sm:text-6xl">마음의 기록</h1>
          <p className="mt-3 max-w-md text-base leading-7 text-[#756b62]">오늘의 감정을 가볍게 적어두세요. 나중의 나에게 건네는 작은 편지입니다.</p>
        </div>
        <span className="hidden text-5xl sm:block" aria-hidden="true">✦</span>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.4fr)]">
        <section className="h-fit border border-[#d9d0c3] bg-[#fbf8f3] p-6 shadow-[8px_8px_0_#e6d8ca] sm:p-8">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b27b59]">New entry</p>
            <h2 className="mt-2 font-['Playfair_Display'] text-2xl font-bold text-[#302a25]">오늘은 어떤가요?</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-[#51483f]">감정을 골라주세요</legend>
              <div className="grid grid-cols-5 gap-2">
                {emotions.map((emotion) => (
                  <button key={emotion.value} type="button" aria-pressed={selectedEmotion === emotion.value} onClick={() => setSelectedEmotion(emotion.value)} className={`flex min-h-20 flex-col items-center justify-center gap-1 border px-1 text-xs transition ${selectedEmotion === emotion.value ? 'border-[#9a6547] bg-[#ead8c7] text-[#603d2a]' : 'border-[#e1d7cb] bg-white text-[#756b62] hover:border-[#b27b59]'}`}>
                    <span className="text-2xl" aria-hidden="true">{emotion.emoji}</span>
                    {emotion.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="mt-7 block text-sm font-semibold text-[#51483f]" htmlFor="diary-content">오늘의 한마디</label>
            <textarea id="diary-content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="지금 마음에 남아 있는 것을 적어보세요..." rows="6" className="mt-3 w-full resize-none border border-[#e1d7cb] bg-white p-4 text-sm leading-6 outline-none transition placeholder:text-[#b2a79d] focus:border-[#9a6547]" />
            <button type="submit" disabled={isSaving} className="mt-4 w-full bg-[#9a6547] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#7e5037] disabled:cursor-wait disabled:opacity-60">{isSaving ? '저장 중...' : '기록 남기기'}</button>
          </form>
        </section>

        <section aria-labelledby="diary-list-title">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b27b59]">Your archive</p>
              <h2 id="diary-list-title" className="mt-2 font-['Playfair_Display'] text-3xl font-bold text-[#302a25]">지난 마음들</h2>
            </div>
            <div className="flex max-w-full gap-1 overflow-x-auto border-b border-[#d9d0c3]">
              <button type="button" onClick={() => setFilter('all')} className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold ${filter === 'all' ? 'border-[#9a6547] text-[#603d2a]' : 'border-transparent text-[#93877c]'}`}>전체</button>
              {emotions.map((emotion) => (
                <button key={emotion.value} type="button" onClick={() => setFilter(emotion.value)} className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold ${filter === emotion.value ? 'border-[#9a6547] text-[#603d2a]' : 'border-transparent text-[#93877c]'}`}>{emotion.emoji} {emotion.label}</button>
              ))}
            </div>
          </div>

          {error && <p role="alert" className="mb-5 border border-[#d79b8d] bg-[#fff1ed] px-4 py-3 text-sm text-[#9a4439]">{error}</p>}

          {isLoading ? (
            <div className="border-y border-[#d9d0c3] py-16 text-center text-sm text-[#93877c]">기록을 불러오는 중...</div>
          ) : diaries.length === 0 ? (
            <div className="border-y border-[#d9d0c3] py-16 text-center"><p className="text-4xl" aria-hidden="true">✍️</p><p className="mt-4 font-['Playfair_Display'] text-xl font-bold text-[#51483f]">아직 작성한 일기가 없습니다.</p><p className="mt-2 text-sm text-[#93877c]">왼쪽에서 첫 번째 마음을 기록해 보세요.</p></div>
          ) : filteredDiaries.length === 0 ? (
            <div className="border-y border-[#d9d0c3] py-16 text-center"><p className="text-4xl" aria-hidden="true">🔎</p><p className="mt-4 font-['Playfair_Display'] text-xl font-bold text-[#51483f]">이 감정으로 작성한 일기가 없습니다.</p><p className="mt-2 text-sm text-[#93877c]">다른 감정을 선택하거나 새로운 기록을 남겨보세요.</p></div>
          ) : (
            <div className="divide-y divide-[#d9d0c3] border-y border-[#d9d0c3]">
              {filteredDiaries.map((diary) => {
                const emotion = getEmotion(diary.emotion)
                return <article key={diary.id} className="group flex gap-4 py-6 first:pt-5"><span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#ead8c7] text-2xl" aria-label={emotion?.label}>{emotion?.emoji}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold text-[#9a6547]">{emotion?.label}</p><time className="text-xs text-[#a2968a]" dateTime={diary.created_at}>{formatDate(diary.created_at)}</time></div><p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-7 text-[#51483f]">{diary.content}</p></div><button type="button" onClick={() => handleDelete(diary.id)} disabled={deletingId === diary.id} aria-label="일기 삭제" className="h-fit px-2 py-1 text-xs text-[#a2968a] opacity-0 transition hover:text-[#9a4439] group-hover:opacity-100 focus:opacity-100 disabled:cursor-wait disabled:opacity-50">{deletingId === diary.id ? '삭제 중' : '삭제'}</button></article>
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
