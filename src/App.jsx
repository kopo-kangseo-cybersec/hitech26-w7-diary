import { useEffect, useState } from 'react'
import { addDiary, deleteDiary, getDiaries } from './api/diaries.js'

const emotions = [
  { id: 'joy', emoji: '😊', label: '기쁨', tint: 'joy' },
  { id: 'calm', emoji: '😌', label: '평온', tint: 'calm' },
  { id: 'sad', emoji: '😢', label: '슬픔', tint: 'sad' },
  { id: 'angry', emoji: '😠', label: '화남', tint: 'angry' },
  { id: 'anxious', emoji: '😰', label: '불안', tint: 'anxious' },
]

const formatDate = (value) =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(value)

const formatTime = (value) =>
  new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(value)

function App() {
  const [diaries, setDiaries] = useState([])
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [content, setContent] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [todayDate, setTodayDate] = useState('')

  useEffect(() => {
    const loadDiaries = async () => {
      setTodayDate(formatDate(new Date()))
      setIsLoading(true)
      try {
        setDiaries(await getDiaries())
      } catch (loadError) {
        setError(`기록을 불러오지 못했어요. ${loadError.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadDiaries()
  }, [])

  const handleSave = async (event) => {
    event.preventDefault()
    if (!selectedEmotion || !content.trim() || isSaving) return

    setIsSaving(true)
    setError('')
    try {
      const diary = await addDiary({ content: content.trim(), emotion: selectedEmotion })
      setDiaries((current) => [diary, ...current])
      setSelectedEmotion('')
      setContent('')
    } catch (saveError) {
      setError(`기록을 저장하지 못했어요. ${saveError.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    setError('')
    try {
      await deleteDiary(id)
      setDiaries((current) => current.filter((diary) => diary.id !== id))
    } catch (deleteError) {
      setError(`기록을 삭제하지 못했어요. ${deleteError.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredDiaries =
    activeFilter === 'all'
      ? diaries
      : diaries.filter((diary) => diary.emotion === activeFilter)
  const selectedEmotionInfo = emotions.find(({ id }) => id === selectedEmotion)

  return (
    <div className="app-shell min-h-screen">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="마음결 홈">
          <span className="wordmark-mark" aria-hidden="true">ㅁ</span>
          마음결
        </a>
        <span className="topbar-note">나를 돌보는 작은 기록</span>
      </header>

      <main id="top" className="journal-layout">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">오늘의 마음을 천천히 들여다봐요</p>
          <h1 id="page-title">마음이 머문 자리</h1>
          <p className="today-date">{todayDate}</p>
        </section>

        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} aria-label="오류 메시지 닫기">
              닫기
            </button>
          </div>
        )}

        <div className="journal-columns">
          <section className="composer" aria-labelledby="composer-title">
            <div className="section-heading">
              <span className="section-index">01</span>
              <div>
                <h2 id="composer-title">지금 기분은 어떤가요?</h2>
                <p>마음을 가장 잘 표현하는 감정을 골라주세요.</p>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="emotion-picker" role="group" aria-label="감정 선택">
                {emotions.map(({ id, emoji, label, tint }) => (
                  <button
                    key={id}
                    type="button"
                    className={`emotion-option emotion-${tint}${selectedEmotion === id ? ' is-selected' : ''}`}
                    aria-pressed={selectedEmotion === id}
                    onClick={() => setSelectedEmotion(id)}
                  >
                    <span className="emotion-emoji" aria-hidden="true">{emoji}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <label className="field-label" htmlFor="diary-content">
                오늘의 한마디
              </label>
              <textarea
                id="diary-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="오늘 어떤 일이 있었나요? 짧은 한마디도 좋아요."
                rows={5}
                maxLength={1000}
                required
              />
              <div className="composer-footer">
                <span className="character-count">{content.length} / 1000</span>
                <button
                  className="save-button"
                  type="submit"
                  disabled={!selectedEmotion || !content.trim() || isSaving}
                >
                  {isSaving ? '저장 중...' : '기록 남기기'}
                  {!isSaving && <span aria-hidden="true">↗</span>}
                </button>
              </div>
            </form>
            <div className="composer-aside" aria-live="polite">
              {selectedEmotionInfo ? (
                <><span>{selectedEmotionInfo.emoji}</span> 오늘의 감정은 <strong>{selectedEmotionInfo.label}</strong></>
              ) : (
                <><span aria-hidden="true">✳</span> 감정은 매일 달라도 괜찮아요.</>
              )}
            </div>
          </section>

          <section className="entries" aria-labelledby="entries-title">
            <div className="entries-heading">
              <div className="section-heading">
                <span className="section-index">02</span>
                <div>
                  <h2 id="entries-title">마음 기록</h2>
                  <p>차곡차곡 쌓인 오늘들의 이야기</p>
                </div>
              </div>
              <span className="entry-count">{diaries.length}<span>개</span></span>
            </div>

            <div className="filter-tabs" role="tablist" aria-label="감정별 기록 필터">
              <button
                type="button"
                role="tab"
                aria-selected={activeFilter === 'all'}
                className={activeFilter === 'all' ? 'is-active' : ''}
                onClick={() => setActiveFilter('all')}
              >전체 <span>{diaries.length}</span></button>
              {emotions.map(({ id, emoji, label }) => {
                const count = diaries.filter((diary) => diary.emotion === id).length
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={activeFilter === id}
                    className={activeFilter === id ? 'is-active' : ''}
                    onClick={() => setActiveFilter(id)}
                    aria-label={`${label} 감정 기록 ${count}개 필터`}
                  >
                    <span aria-hidden="true">{emoji}</span><span className="filter-label">{label}</span>
                  </button>
                )
              })}
            </div>

            {isLoading ? (
              <div className="list-message" role="status">
                <span className="loading-spinner" aria-hidden="true" />
                기록을 불러오고 있어요
              </div>
            ) : filteredDiaries.length === 0 ? (
              <div className="empty-state">
                <span className="empty-mark" aria-hidden="true">✳</span>
                <h3>{activeFilter === 'all' ? '아직 기록이 없어요' : '이 감정의 기록이 없어요'}</h3>
                <p>{activeFilter === 'all' ? '오늘의 마음을 첫 기록으로 남겨보세요.' : '다른 감정의 기록도 둘러보세요.'}</p>
              </div>
            ) : (
              <div className="diary-list">
                {filteredDiaries.map((diary) => {
                  const emotion = emotions.find(({ id }) => id === diary.emotion)
                  const createdAt = new Date(diary.created_at)
                  return (
                    <article className={`diary-entry entry-${emotion?.tint ?? 'calm'}`} key={diary.id}>
                      <div className="entry-emotion" aria-label={emotion?.label ?? '감정'}>
                        {emotion?.emoji ?? '😌'}
                      </div>
                      <div className="entry-body">
                        <div className="entry-meta">
                          <span className="entry-emotion-label">{emotion?.label ?? '평온'}</span>
                          <time dateTime={diary.created_at}>{formatDate(createdAt)} · {formatTime(createdAt)}</time>
                        </div>
                        <p>{diary.content}</p>
                      </div>
                      <button
                        className="delete-button"
                        type="button"
                        onClick={() => handleDelete(diary.id)}
                        disabled={deletingId !== null}
                        aria-label={`${formatDate(createdAt)} 기록 삭제`}
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

      <footer className="page-footer">
        <span>오늘의 마음도, 내일의 나를 만드는 조각</span>
        <span>마음결 <span aria-hidden="true">·</span> 나만의 감정 일기</span>
      </footer>
    </div>
  )
}

export default App
