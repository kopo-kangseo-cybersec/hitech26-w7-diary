import { useEffect, useMemo, useState } from 'react'
import { createDiary, deleteDiary, getDiaries } from './api/diaries'

const EMOTIONS = [
  { value: 'joy', label: '기쁨', emoji: '😊' },
  { value: 'calm', label: '평온', emoji: '😌' },
  { value: 'sad', label: '슬픔', emoji: '😢' },
  { value: 'angry', label: '화남', emoji: '😠' },
  { value: 'anxious', label: '불안', emoji: '😰' },
]

const emotionByValue = Object.fromEntries(
  EMOTIONS.map((emotion) => [emotion.value, emotion]),
)

function formatDate(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

function App() {
  const [diaries, setDiaries] = useState([])
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [content, setContent] = useState('')
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDiaries() {
      try {
        const data = await getDiaries()
        if (isMounted) {
          setDiaries(data)
        }
      } catch {
        if (isMounted) {
          setError('일기를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDiaries()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredDiaries = useMemo(
    () =>
      filter === 'all'
        ? diaries
        : diaries.filter((diary) => diary.emotion === filter),
    [diaries, filter],
  )

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedContent = content.trim()

    if (!selectedEmotion || !trimmedContent || isSaving) {
      return
    }

    setError('')
    setIsSaving(true)

    try {
      const diary = await createDiary({
        content: trimmedContent,
        emotion: selectedEmotion,
      })
      setDiaries((currentDiaries) => [diary, ...currentDiaries])
      setContent('')
      setSelectedEmotion('')
    } catch {
      setError('일기를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    setError('')
    setDeletingId(id)

    try {
      await deleteDiary(id)
      setDiaries((currentDiaries) =>
        currentDiaries.filter((diary) => diary.id !== id),
      )
    } catch {
      setError('일기를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setDeletingId(null)
    }
  }

  const canSubmit = selectedEmotion && content.trim() && !isSaving

  return (
    <main className="min-h-screen bg-[#fffaf7] px-4 py-8 text-stone-800 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center sm:mb-10">
          <p className="mb-2 text-sm font-semibold tracking-[0.2em] text-rose-400">
            TODAY&apos;S FEELING
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            감정 일기
          </h1>
          <p className="mt-3 text-sm text-stone-500 sm:text-base">
            오늘의 마음을 가볍게 기록해 보세요.
          </p>
        </header>

        <section className="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold text-stone-900">오늘은 어떤 기분인가요?</h2>
          <form className="mt-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {EMOTIONS.map((emotion) => (
                <button
                  key={emotion.value}
                  type="button"
                  aria-pressed={selectedEmotion === emotion.value}
                  onClick={() => setSelectedEmotion(emotion.value)}
                  className={`rounded-2xl border px-1 py-3 text-center transition ${
                    selectedEmotion === emotion.value
                      ? 'border-rose-300 bg-rose-50 text-rose-600 shadow-sm'
                      : 'border-stone-100 bg-stone-50 text-stone-600 hover:border-rose-200 hover:bg-rose-50/50'
                  }`}
                >
                  <span className="block text-2xl" aria-hidden="true">
                    {emotion.emoji}
                  </span>
                  <span className="mt-1 block text-xs font-medium sm:text-sm">
                    {emotion.label}
                  </span>
                </button>
              ))}
            </div>
            <label className="mt-5 block">
              <span className="sr-only">오늘의 기록</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="오늘 하루는 어땠나요?"
                rows="4"
                className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
              />
            </label>
            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-3 w-full rounded-2xl bg-rose-400 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
            >
              {isSaving ? '저장 중...' : '기록 저장하기'}
            </button>
          </form>
        </section>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-stone-900">나의 기록</h2>
            <span className="text-sm text-stone-400">{filteredDiaries.length}개</span>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-500 hover:bg-stone-100'
              }`}
            >
              전체
            </button>
            {EMOTIONS.map((emotion) => (
              <button
                key={emotion.value}
                type="button"
                onClick={() => setFilter(emotion.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === emotion.value
                    ? 'bg-stone-800 text-white'
                    : 'bg-white text-stone-500 hover:bg-stone-100'
                }`}
              >
                {emotion.emoji} {emotion.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-sm text-stone-400" role="status">
              기록을 불러오는 중...
            </div>
          ) : filteredDiaries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-200 bg-white/60 px-6 py-14 text-center">
              <span className="text-4xl" aria-hidden="true">
                📝
              </span>
              <p className="mt-3 text-sm text-stone-500">
                {filter === 'all'
                  ? '아직 기록이 없어요. 첫 마음을 남겨보세요.'
                  : '이 감정으로 남긴 기록이 없어요.'}
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {filteredDiaries.map((diary) => {
                const emotion = emotionByValue[diary.emotion]

                return (
                  <li
                    key={diary.id}
                    className="flex gap-3 rounded-3xl border border-stone-100 bg-white p-4 shadow-sm sm:gap-4 sm:p-5"
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-2xl"
                      aria-label={emotion?.label}
                    >
                      {emotion?.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-stone-700">
                        {diary.content}
                      </p>
                      <time
                        dateTime={diary.created_at}
                        className="mt-2 block text-xs text-stone-400"
                      >
                        {formatDate(diary.created_at)}
                      </time>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(diary.id)}
                      disabled={deletingId === diary.id}
                      className="h-fit shrink-0 rounded-lg px-2 py-1 text-xs text-stone-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === diary.id ? '삭제 중' : '삭제'}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
