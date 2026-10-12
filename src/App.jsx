import { useEffect, useMemo, useState } from 'react'
import { createDiary, deleteDiary, fetchDiaries } from './api/diaries'

const emotions = [
  { value: 'joy', label: '기쁨', emoji: '😊' },
  { value: 'calm', label: '평온', emoji: '😌' },
  { value: 'sad', label: '슬픔', emoji: '😢' },
  { value: 'angry', label: '화남', emoji: '😠' },
  { value: 'anxious', label: '불안', emoji: '😰' },
]

const emotionMap = Object.fromEntries(
  emotions.map((emotion) => [emotion.value, emotion]),
)

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
    async function loadDiaries() {
      try {
        setError('')
        setDiaries(await fetchDiaries())
      } catch (loadError) {
        setError(loadError.message || '일기를 불러오지 못했어요.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDiaries()
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

    try {
      setIsSaving(true)
      setError('')
      const diary = await createDiary({
        content: trimmedContent,
        emotion: selectedEmotion,
      })
      setDiaries((currentDiaries) => [diary, ...currentDiaries])
      setContent('')
      setSelectedEmotion('')
    } catch (saveError) {
      setError(saveError.message || '일기를 저장하지 못했어요.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('이 기록을 삭제할까요?')) {
      return
    }

    try {
      setDeletingId(id)
      setError('')
      await deleteDiary(id)
      setDiaries((currentDiaries) =>
        currentDiaries.filter((diary) => diary.id !== id),
      )
    } catch (deleteError) {
      setError(deleteError.message || '일기를 삭제하지 못했어요.')
    } finally {
      setDeletingId(null)
    }
  }

  const canSubmit = selectedEmotion && content.trim() && !isSaving

  return (
    <main className="min-h-screen bg-[#fffaf5] px-4 py-8 text-slate-800 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold tracking-[0.2em] text-orange-500">
            MY MOOD DIARY
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            오늘의 마음을 기록해요
          </h1>
          <p className="mt-3 text-slate-500">
            짧은 한 줄도 괜찮아요. 지금 느끼는 감정을 남겨보세요.
          </p>
        </header>

        <section className="rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(125,73,32,0.08)] sm:p-7">
          <form onSubmit={handleSubmit}>
            <fieldset disabled={isSaving} className="min-w-0">
              <legend className="mb-4 text-lg font-bold text-slate-900">
                지금 어떤 기분인가요?
              </legend>
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.value}
                    type="button"
                    aria-pressed={selectedEmotion === emotion.value}
                    onClick={() => setSelectedEmotion(emotion.value)}
                    className={`rounded-2xl border px-1 py-3 text-center transition focus:outline-none focus:ring-2 focus:ring-orange-300 sm:py-4 ${
                      selectedEmotion === emotion.value
                        ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm'
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-orange-200 hover:bg-orange-50/60'
                    }`}
                  >
                    <span className="block text-2xl sm:text-3xl">
                      {emotion.emoji}
                    </span>
                    <span className="mt-1 block text-xs font-medium sm:text-sm">
                      {emotion.label}
                    </span>
                  </button>
                ))}
              </div>

              <label
                htmlFor="diary-content"
                className="mt-6 block text-lg font-bold text-slate-900"
              >
                오늘의 기록
              </label>
              <textarea
                id="diary-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="오늘 어떤 일이 있었나요?"
                rows={4}
                className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-4 w-full rounded-2xl bg-orange-500 py-3.5 font-bold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {isSaving ? '저장 중...' : '기록 저장하기'}
              </button>
            </fieldset>
          </form>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-orange-500">ARCHIVE</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                나의 기록
              </h2>
            </div>
            <span className="text-sm text-slate-400">
              {filteredDiaries.length}개의 기록
            </span>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-500 hover:bg-orange-50'
              }`}
            >
              전체
            </button>
            {emotions.map((emotion) => (
              <button
                key={emotion.value}
                type="button"
                onClick={() => setFilter(emotion.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === emotion.value
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-500 hover:bg-orange-50'
                }`}
              >
                {emotion.emoji} {emotion.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="rounded-3xl bg-white px-6 py-14 text-center text-slate-400">
              기록을 불러오는 중...
            </div>
          ) : filteredDiaries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/50 px-6 py-14 text-center">
              <p className="text-3xl">🌿</p>
              <p className="mt-3 font-semibold text-slate-700">
                {filter === 'all'
                  ? '아직 기록이 없어요.'
                  : '이 감정으로 남긴 기록이 없어요.'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                오늘의 마음을 첫 번째로 남겨보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDiaries.map((diary) => {
                const emotion = emotionMap[diary.emotion]
                return (
                  <article
                    key={diary.id}
                    className="flex gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                      {emotion?.emoji || '💭'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap break-words leading-relaxed text-slate-700">
                        {diary.content}
                      </p>
                      <time
                        dateTime={diary.created_at}
                        className="mt-3 block text-xs text-slate-400"
                      >
                        {new Date(diary.created_at).toLocaleString('ko-KR', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </time>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(diary.id)}
                      disabled={deletingId === diary.id}
                      aria-label="기록 삭제"
                      className="shrink-0 self-start rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-wait disabled:opacity-50"
                    >
                      {deletingId === diary.id ? '삭제 중...' : '삭제'}
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
