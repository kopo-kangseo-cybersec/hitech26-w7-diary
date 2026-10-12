# 감정 일기

React와 Supabase로 만든 감정 일기 앱입니다. 하루의 감정과 짧은 기록을 저장하고, 어디서든 같은 기록을 다시 확인할 수 있습니다.

## 주요 기능

- 기쁨, 평온, 슬픔, 화남, 불안 중 하나를 선택해 일기 작성
- 내용이 비어 있거나 감정을 선택하지 않은 경우 저장 방지
- Supabase `diaries` 테이블에 기록 저장
- 기록을 최신순으로 조회
- 전체 또는 감정별 필터링
- 기록 삭제 전 확인창 표시
- 불러오기, 저장, 삭제 중 오류 메시지 표시
- 불러오는 중, 저장 중, 빈 목록 상태 안내
- `ko-KR` 로케일을 사용한 작성 날짜·시간 표시
- 모바일과 데스크톱 화면에 대응하는 반응형 UI

## 기술 스택

- React 19
- Vite
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Supabase (`@supabase/supabase-js`)
- Oxlint

## 프로젝트 구조

```text
src/
├── api/
│   └── diaries.js       # 일기 조회·추가·삭제 함수
├── lib/
│   └── supabase.js      # Supabase 클라이언트 생성
├── App.jsx              # 일기 작성, 목록, 필터 및 상태 처리
├── index.css            # Tailwind import 및 전역 스타일
└── main.jsx             # React 앱 진입점
```

데이터 접근은 `src/api/diaries.js`에 모아 컴포넌트가 Supabase 클라이언트를 직접 호출하지 않도록 구성했습니다. Supabase 클라이언트도 `src/lib/supabase.js`에서 한 번만 생성합니다.

## 데이터베이스

Supabase에 다음 구조의 `diaries` 테이블이 이미 생성되어 있어야 합니다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `bigint` | DB가 자동 생성하는 기본 키 |
| `content` | `text` | 일기 내용, 필수 |
| `emotion` | `text` | `joy`, `calm`, `sad`, `angry`, `anxious` 중 하나 |
| `created_at` | `timestamptz` | DB가 자동 생성하는 작성 시각 |

기존 `localStorage` 기반 기록과 달리 데이터가 Supabase에 저장되므로 같은 Supabase 프로젝트를 사용하는 다른 기기와 브라우저에서도 기록을 확인할 수 있습니다. 현재 앱은 전체 기록을 조회한 뒤 감정 필터를 클라이언트에서 적용합니다.

## 환경변수 설정

`.env.example`을 복사해 `.env.local`을 만들고 Supabase 프로젝트 값을 입력합니다.

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
```

환경변수가 없으면 앱이 시작될 때 설정 오류를 표시합니다. `.env.local`은 `.gitignore`에 포함되어 있으므로 실제 키를 저장소에 커밋하지 않습니다.

## 실행 방법

Node.js가 설치된 환경에서 다음 명령을 실행합니다.

```bash
npm install
npm run dev
```

개발 서버가 실행되면 터미널에 표시된 로컬 URL을 브라우저에서 엽니다.

### 검증 및 배포용 명령

```bash
# 린트
npm run lint

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 보안 참고

- 브라우저에서 사용하는 `VITE_SUPABASE_PUBLISHABLE_KEY`는 프론트엔드 번들에 포함되므로 사용자가 개발자 도구에서 볼 수 있습니다. 이 키를 비밀 키로 간주하거나 서버 전용 `service_role` 키를 넣으면 안 됩니다.
- 실제 데이터 보호는 Supabase의 Row Level Security(RLS) 정책과 인증 설정으로 해야 합니다. 현재 화면에는 사용자 인증이 없으므로, RLS 정책을 설정하지 않으면 누구나 접근 가능한 데이터가 될 수 있습니다.
- 배포 전 Supabase 대시보드에서 `diaries` 테이블의 RLS를 활성화하고, 애플리케이션의 사용자 모델에 맞는 `SELECT`, `INSERT`, `DELETE` 정책을 설정해야 합니다.
- Supabase URL과 publishable key는 코드에 직접 작성하지 않고 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` 환경변수로 읽습니다.

## 커스터마이징

- 감정별 이모지와 한국어 라벨을 버튼으로 구성했습니다.
- 따뜻한 오렌지 계열 배경과 카드형 목록으로 감정 기록 서비스에 맞는 UI를 구성했습니다.
- 삭제는 실수 방지를 위해 브라우저 확인창을 거칩니다.
- 기록이 없을 때와 선택한 감정의 기록이 없을 때 서로 다른 안내 문구를 보여줍니다.
