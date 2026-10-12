import { useEffect, useState } from 'react'
import { createDiary, getDiaries, removeDiary } from './api/diaries'

const emotions = [
  { value: 'joy', emoji: '😊', label: '기쁨', color: 'bg-[#fff0c7] text-[#8a5b00]' },
  { value: 'calm', emoji: '😌', label: '평온', color: 'bg-[#dcefe4] text-[#276044]' },
  { value: 'sad', emoji: '😢', label: '슬픔', color: 'bg-[#dce8f7] text-[#365d8c]' },
  { value: 'angry', emoji: '😠', label: '화남', color: 'bg-[#f9d9d2] text-[#994234]' },
  { value: 'anxious', emoji: '😰', label: '불안', color: 'bg-[#e9def4] text-[#65447e]' },
]

const filters = [{ value: 'all', label: '전체' }, ...emotions]

function getEmotion(value) {
  return emotions.find((emotion) => emotion.value === value)
}

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
  const [activeFilter, setActiveFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  async function loadDiaries({ resetError = true } = {}) {
    if (resetError) setError('')

    try {
      setDiaries(await getDiaries())
    } catch (loadError) {
      setError(loadError.message || '일기를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDiaries({ resetError: false })
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedContent = content.trim()

    if (!selectedEmotion || !trimmedContent) return

    setIsSaving(true)
    setError('')

    try {
      const diary = await createDiary({
        content: trimmedContent,
        emotion: selectedEmotion,
      })
      setDiaries((currentDiaries) => [diary, ...currentDiaries])
      setContent('')
      setSelectedEmotion('')
    } catch (saveError) {
      setError(saveError.message || '일기를 저장하지 못했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    setDeletingId(id)
    setError('')

    try {
      await removeDiary(id)
      setDiaries((currentDiaries) => currentDiaries.filter((diary) => diary.id !== id))
    } catch (deleteError) {
      setError(deleteError.message || '일기를 삭제하지 못했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredDiaries =
    activeFilter === 'all'
      ? diaries
      : diaries.filter((diary) => diary.emotion === activeFilter)
  const isFormValid = Boolean(selectedEmotion && content.trim())

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f4ef]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
        <header className="mb-10 flex items-start justify-between gap-4 sm:mb-14">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#a66b55]">
              Daily reflection
            </p>
            <h1
              className="text-4xl leading-none text-[#27302d] sm:text-6xl"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              오늘의 마음
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#6c746f] sm:text-base">
              잠깐 멈추고, 지금의 감정을 기록해 보세요.
            </p>
          </div>
          <div className="hidden h-16 w-16 rotate-3 items-center justify-center rounded-full bg-[#e5d6c1] text-3xl shadow-sm sm:flex">
            🌿
          </div>
        </header>

        <div className="grid gap-12 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <section aria-labelledby="write-heading">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#27302d] text-sm text-white">
                01
              </span>
              <h2 id="write-heading" className="text-lg font-bold text-[#27302d]">
                지금의 마음 남기기
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-5 shadow-[0_18px_45px_rgba(74,62,49,0.08)] sm:p-7">
              <fieldset>
                <legend className="mb-4 text-sm font-semibold text-[#4e5852]">오늘 어떤 기분인가요?</legend>
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {emotions.map((emotion) => {
                    const isSelected = selectedEmotion === emotion.value

                    return (
                      <button
                        key={emotion.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedEmotion(emotion.value)}
                        className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl border px-1 py-3 text-center transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#a66b55] focus:ring-offset-2 ${
                          isSelected
                            ? `${emotion.color} border-current shadow-sm`
                            : 'border-transparent bg-[#f7f4ef] text-[#6c746f]'
                        }`}
                      >
                        <span className="text-2xl" aria-hidden="true">{emotion.emoji}</span>
                        <span className="text-[11px] font-semibold sm:text-xs">{emotion.label}</span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <label htmlFor="diary-content" className="mb-3 mt-7 block text-sm font-semibold text-[#4e5852]">
                어떤 일이 있었나요?
              </label>
              <textarea
                id="diary-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="오늘의 순간을 짧게 기록해 보세요..."
                rows="6"
                className="w-full resize-none rounded-2xl border border-[#e7e1d8] bg-[#fcfbf9] px-4 py-3 text-sm leading-6 text-[#27302d] outline-none transition placeholder:text-[#a7aaa4] focus:border-[#a66b55] focus:ring-2 focus:ring-[#a66b55]/15"
              />
              <button
                type="submit"
                disabled={!isFormValid || isSaving}
                className="mt-5 flex w-full items-center justify-center rounded-full bg-[#a66b55] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#8d5846] focus:outline-none focus:ring-2 focus:ring-[#a66b55] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#d5c8be]"
              >
                {isSaving ? '저장 중...' : '기록 저장하기'}
              </button>
            </form>
          </section>

          <section aria-labelledby="diary-list-heading">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9e5dc] text-sm font-bold text-[#276044]">
                  02
                </span>
                <h2 id="diary-list-heading" className="text-lg font-bold text-[#27302d]">
                  나의 기록
                </h2>
              </div>
              <span className="text-xs font-semibold text-[#929992]">{diaries.length}개의 기록</span>
            </div>

            <div className="mb-7 flex gap-1 overflow-x-auto border-b border-[#e5ded5] pb-px" role="tablist" aria-label="감정 필터">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`shrink-0 border-b-2 px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#a66b55] focus:ring-inset ${
                    activeFilter === filter.value
                      ? 'border-[#a66b55] text-[#a66b55]'
                      : 'border-transparent text-[#929992] hover:text-[#4e5852]'
                  }`}
                >
                  {filter.value === 'all' ? filter.label : `${filter.emoji} ${filter.label}`}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-[#efc9c0] bg-[#fff4f1] px-4 py-3 text-sm text-[#994234]" role="alert">
                <span>{error}</span>
                {!isLoading && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoading(true)
                      loadDiaries()
                    }}
                    className="shrink-0 font-bold underline underline-offset-2"
                  >
                    다시 시도
                  </button>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="flex min-h-52 items-center justify-center rounded-3xl border border-dashed border-[#d8d0c7] text-sm text-[#929992]">
                기록을 불러오는 중...
              </div>
            ) : filteredDiaries.length === 0 ? (
              <div className="flex min-h-52 flex-col items-center justify-center rounded-3xl border border-dashed border-[#d8d0c7] px-6 text-center">
                <span className="mb-3 text-3xl" aria-hidden="true">📝</span>
                <p className="font-semibold text-[#4e5852]">
                  {diaries.length === 0 ? '아직 남겨진 기록이 없어요.' : '이 감정의 기록이 없어요.'}
                </p>
                <p className="mt-1 text-sm text-[#929992]">오늘의 마음을 첫 번째로 남겨보세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDiaries.map((diary) => {
                  const emotion = getEmotion(diary.emotion)

                  return (
                    <article key={diary.id} className="group rounded-3xl border border-[#ebe5dd] bg-white p-5 shadow-[0_10px_30px_rgba(74,62,49,0.04)] transition hover:shadow-[0_14px_35px_rgba(74,62,49,0.08)] sm:p-6">
                      <div className="flex items-start gap-4">
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl ${emotion?.color || 'bg-[#f7f4ef]'}`} aria-label={emotion?.label}>
                          {emotion?.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-[#3e4842]">{diary.content}</p>
                          <time dateTime={diary.created_at} className="mt-3 block text-xs font-medium text-[#a0a49f]">
                            {formatDate(diary.created_at)}
                          </time>
                        </div>
                        <button
                          type="button"
                          aria-label="이 기록 삭제"
                          disabled={deletingId === diary.id}
                          onClick={() => handleDelete(diary.id)}
                          className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-[#b3aaa1] opacity-100 transition hover:bg-[#fff4f1] hover:text-[#994234] focus:outline-none focus:ring-2 focus:ring-[#a66b55] disabled:cursor-not-allowed disabled:opacity-40 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          {deletingId === diary.id ? '삭제 중' : '삭제'}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

export default App
