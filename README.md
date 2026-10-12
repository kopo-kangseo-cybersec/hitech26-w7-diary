# 감정 일기 — React + Supabase

하루의 감정과 짧은 기록을 저장하고, 다른 기기에서도 같은 일기를 확인할 수 있는 감정 일기 앱입니다.

## 주요 기능

- 😊 기쁨, 😌 평온, 😢 슬픔, 😠 화남, 😰 불안 감정 선택
- 감정과 내용을 입력해 일기 저장
- 저장된 일기를 최신순으로 표시
- 전체 또는 감정별 필터링
- 일기 삭제
- 불러오는 중, 저장 중, 오류, 빈 목록 상태 표시
- 감정을 선택하지 않았거나 내용이 비어 있으면 저장할 수 없도록 입력 검증
- 모바일 화면을 고려한 반응형 UI

## 기술 스택

- React 19
- Vite
- Tailwind CSS 4 (`@tailwindcss/vite`)
- Supabase JavaScript Client
- Oxlint

## 프로젝트 구조

```text
src/
├── api/
│   └── diaries.js       # 일기 조회·추가·삭제 API
├── lib/
│   └── supabase.js      # Supabase 클라이언트 생성
├── App.jsx              # 일기 작성·필터·목록 화면
├── index.css            # Tailwind 진입점 및 전역 스타일
└── main.jsx             # React 앱 진입점
```

Supabase 클라이언트는 [`src/lib/supabase.js`](./src/lib/supabase.js)에서 한 번만 생성합니다. 컴포넌트가 Supabase SDK를 직접 호출하지 않고 [`src/api/diaries.js`](./src/api/diaries.js)의 함수만 사용하도록 분리했습니다.

## 데이터 저장

일기 데이터는 Supabase의 `diaries` 테이블에 저장됩니다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `bigint` | DB가 자동 생성하는 일기 ID |
| `content` | `text` | 일기 내용 |
| `emotion` | `text` | `joy`, `calm`, `sad`, `angry`, `anxious` 중 하나 |
| `created_at` | `timestamptz` | DB가 자동 생성하는 작성 시각 |

목록 조회 시 `created_at`을 기준으로 내림차순 정렬합니다. 브라우저의 `localStorage`가 아니라 Supabase에 저장하므로 같은 Supabase 프로젝트에 연결된 다른 기기와 브라우저에서도 기록을 확인할 수 있습니다.

## 환경변수 설정

`.env.example`을 복사해 `.env.local`을 만들고 Supabase 프로젝트 값을 입력합니다.

```bash
cp .env.example .env.local
```

`.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

환경변수 파일은 저장소에 커밋하지 않습니다. 실제 키를 소스 코드에 직접 작성하지 않으며, 앱은 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_PUBLISHABLE_KEY`만 사용합니다.

## 보안 및 Supabase 설정 참고

`VITE_` 환경변수는 Vite 특성상 브라우저 번들에 포함되므로 publishable key가 개발자 도구에서 보일 수 있습니다. 이 키를 비밀 키로 취급하거나 소스 코드에 직접 기록하면 안 됩니다.

실제 데이터 보호는 Supabase의 Row Level Security(RLS) 정책과 인증 정책이 담당해야 합니다. 현재 앱은 별도 로그인 기능을 포함하지 않으므로, 운영 환경에서는 익명 사용자가 모든 일기를 읽거나 삭제할 수 있는 정책을 그대로 사용하지 않도록 주의해야 합니다. 사용자별 일기를 제공하려면 Supabase Auth를 추가하고 `user_id` 컬럼 및 사용자별 RLS 정책을 함께 설계해야 합니다.

## 실행 방법

의존성을 설치합니다.

```bash
npm install
```

개발 서버를 실행합니다.

```bash
npm run dev
```

검증 및 배포용 명령:

```bash
npm run lint
npm run build
npm run preview
```

## 커스터마이징한 부분

- 기본 Vite 예시 화면, 이미지, 아이콘을 제거하고 감정 일기 전용 화면으로 교체했습니다.
- 감정 선택 버튼에 선택 상태와 접근성 속성(`aria-pressed`)을 적용했습니다.
- 저장·삭제 중인 항목만 비활성화해 중복 요청을 방지했습니다.
- 저장 실패와 삭제 실패 시 기존 목록을 유지하면서 오류 메시지를 표시합니다.
- 날짜와 시간은 한국어 로케일(`ko-KR`)로 표시합니다.
