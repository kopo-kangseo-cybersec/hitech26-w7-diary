# 감정 일기 — React + Supabase

감정을 선택하고 짧은 일기를 작성해 저장하는 웹 앱입니다. 작성한 기록은 최신순으로 확인하고 감정별로 필터링하거나 삭제할 수 있습니다.

## 소개

React와 Supabase를 연결해 어느 기기에서든 같은 일기를 볼 수 있도록 만들었습니다.

## 어떻게 만들었나요

Vite와 React로 시작한 뒤 Copilot Plan 모드에서 화면과 데이터 구조를 계획하고 Agent로 구현했습니다. Supabase 클라이언트와 일기 API를 분리하고, Tailwind CSS로 화면을 구성했습니다.

## 데이터는 어디에 저장되나요

Supabase의 `diaries` 테이블에 `id`, `content`, `emotion`, `created_at`을 저장합니다. `id`와 `created_at`은 DB가 자동으로 만들며, localStorage와 달리 다른 기기나 브라우저에서도 같은 데이터를 볼 수 있습니다.

## 보안에서 확인한 것

Supabase 환경변수는 `.env.local`에 보관하고 GitHub에는 올리지 않았습니다. Publishable key는 브라우저에서 보일 수 있으며, 실제 데이터 접근은 `grant` 권한과 RLS 정책이 제한합니다. 현재 실습용 정책은 누구나 모든 일기를 읽고 삭제할 수 있으므로, 실제 서비스에서는 로그인과 사용자별 RLS 정책이 필요합니다.

## 실행 방법

로컬 실행:

```bash
npm install
npm run dev
```

배포 링크: [wonje-emotion-diary.vercel.app](https://wonje-emotion-diary.vercel.app)

## 커스터마이징한 부분

감정별 필터, 전체 기록 없음과 필터 결과 없음의 구분된 안내, 저장·삭제 중 상태, 오류 메시지, 반응형 레이아웃을 추가했습니다.
