# 감정 일기 — React + Supabase

하루의 감정과 짧은 기록을 저장하고, 다른 기기에서도 같은 기록을 확인할 수 있는 감정 일기입니다.
자세한 실습 절차는 [`guide.md`](./guide.md)를 참고하세요.

## 소개

다섯 가지 감정 중 하나를 선택해 오늘의 마음을 기록할 수 있습니다.

- 기쁨, 평온, 슬픔, 화남, 불안 감정 선택
- 짧은 일기 작성 및 저장
- 최신순 기록 목록
- 전체 또는 감정별 필터
- 기록 삭제
- 로딩 중, 저장 중, 오류, 빈 상태 처리

## 어떻게 만들었나요

Copilot Plan 모드에서 PRD를 먼저 검토한 뒤, 다음 순서로 구현했습니다.

1. Tailwind CSS Vite 플러그인과 Supabase 클라이언트를 설정했습니다.
2. [src/lib/supabase.js](./src/lib/supabase.js)에서 Supabase 클라이언트를 한 번만 생성했습니다.
3. [src/api/diaries.js](./src/api/diaries.js)에 조회·추가·삭제 함수를 분리했습니다.
4. [src/App.jsx](./src/App.jsx)에 작성 폼, 목록, 필터, 상태 처리를 구현했습니다.
5. Vite 기본 화면과 이미지를 제거하고 반응형 UI로 꾸몄습니다.

사용한 주요 기술은 React, Vite, Tailwind CSS, `@supabase/supabase-js`입니다.

## 데이터는 어디에 저장되나요

일기 데이터는 Supabase의 `diaries` 테이블에 저장됩니다.

| 컬럼 | 설명 |
|---|---|
| `id` | DB가 자동 생성하는 고유 번호 |
| `content` | 일기 내용 |
| `emotion` | `joy`, `calm`, `sad`, `angry`, `anxious` 중 하나 |
| `created_at` | DB가 자동 생성하는 작성 시각 |

이전 `localStorage` 방식은 한 브라우저에만 데이터가 저장되지만, Supabase 방식은 서버의 데이터베이스에 저장됩니다. 따라서 같은 Supabase 프로젝트를 사용하면 다른 기기나 다른 브라우저에서도 기록을 조회할 수 있습니다.

## 보안에서 확인한 것

Supabase URL과 Publishable Key는 `.env.local`에 저장하고 GitHub에는 올리지 않습니다. `.gitignore`가 `.env*` 파일을 제외하고, 코드에서는 다음 환경변수만 읽습니다.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
```

Publishable Key는 브라우저에서 실행되는 앱에 포함되므로 개발자 도구에서 보일 수 있습니다. 이 키는 비밀 키가 아니며, 실제 접근 권한은 Supabase의 RLS(Row Level Security) 정책이 제한합니다. `service_role` 키나 Secret Key는 브라우저 코드에 절대 사용하지 않습니다.

현재 실습용 RLS 정책은 인증 없이 누구나 `diaries`를 읽고, 추가하고, 삭제할 수 있도록 되어 있습니다. 따라서 여러 사용자가 같은 데이터를 공유하고 다른 사용자의 기록도 삭제할 수 있다는 한계가 있습니다. 실제 서비스에서는 사용자 인증과 사용자별 RLS 정책이 필요합니다.

## 실행 방법

1. 의존성을 설치합니다.

	```bash
	npm install
	```

2. `.env.example`을 참고해 프로젝트 루트에 `.env.local`을 만들고 Supabase 값을 입력합니다.

3. 개발 서버를 실행합니다.

	```bash
	npm run dev
	```

4. 배포 전에는 다음 명령으로 확인합니다.

	```bash
	npm run lint
	npm run build
	```

배포 시에는 Netlify 환경변수에도 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_PUBLISHABLE_KEY`를 등록해야 합니다.

## 커스터마이징한 부분

- `DM Sans`와 `Fraunces` 글꼴을 조합해 차분한 기록 중심의 분위기를 만들었습니다.
- 감정별 색상과 이모지를 사용해 목록을 빠르게 구분할 수 있도록 했습니다.
- 모바일에서는 세로 레이아웃, 넓은 화면에서는 작성 영역과 목록을 나란히 배치합니다.
- 삭제 중인 기록만 버튼을 비활성화해 다른 기록의 작업을 막지 않도록 했습니다.
- 기록이 없을 때와 선택한 감정의 기록이 없을 때 서로 다른 안내 문구를 표시합니다.
