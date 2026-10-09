# guide.md — 감정 일기 (`hitech26-w7-diary`)

> 이 문서는 실습 중 계속 펴놓고 따라가는 매뉴얼입니다.
> "이번 주 처음 쓰는 것"(React, Supabase, 환경변수, Netlify)에 대한 개념 설명은 **주차 폴더 안내판(README.md)**을 참고하세요.

## 왜 오늘은 "처음부터 서버에 저장"하나요

6주차 To-Do는 localStorage에 저장했기 때문에, 다른 컴퓨터나 휴대폰에서 열면 목록이 비어 있었습니다. 오늘은 처음부터 **데이터를 Supabase(온라인 DB)에 저장**하는 감정 일기를 만듭니다. 그래서 순서도 달라집니다 — 화면보다 **데이터를 먼저 정의**하고 시작합니다.

## 오늘의 브랜치 구조

```
main              (원본 보관 — 절대 merge하지 않습니다)
 └─ dev           (작업 통합 브랜치, PR 기준)
     ├─ diary     (감정 일기 구현 — 완성 후 dev로 merge)
     └─ prod      (dev 완성 후 만들어 Netlify로 배포)
```

- `main`은 처음 Fork했을 때 상태 그대로 보관하는 원본입니다.
- `prod`는 지난주까지의 `gh-pages` 자리를 대신하는 **배포 전용 브랜치**입니다. Netlify는 `prod`에 push될 때마다 자동으로 다시 배포합니다. 그래서 `dev`에서 작업 중인 코드가 실수로 배포되지 않습니다.
- `gh-pages`와 다른 점: `gh-pages`에는 완성된 파일을 그대로 올렸지만, `prod`에는 **소스 코드**가 올라가고 빌드(`npm run build`)는 Netlify가 대신 합니다.

## 시작 상태

이 저장소의 `main`에는 **Vite + React 기본 프로젝트**가 미리 세팅되어 있습니다. 직접 `npm create vite`를 실행할 필요가 없습니다.

| 파일 | 설명 |
|---|---|
| `src/`, `index.html`, `package.json` 등 | Vite + React 기본 템플릿 |
| `.env.example` | 환경변수 예시 (값은 비어 있음) |
| `.gitignore` | `node_modules`, `dist`, **`.env*` 파일**이 GitHub에 올라가지 않도록 등록됨 |
| `guide.md` | 지금 보고 있는 문서 |
| `README.md` | 완성 후 직접 채우는 소개 뼈대 |

---

## 0단계 — 계정 준비

1. [supabase.com](https://supabase.com) → **Start your project** → GitHub 계정으로 가입
2. [netlify.com](https://www.netlify.com) → GitHub 계정으로 가입

> 💡 Supabase 무료 플랜은 만들 수 있는 프로젝트 수에 제한이 있습니다. 이전에 만든 프로젝트가 있다면 정리하거나, 오늘 수업 전에 확인해두세요.

## 1단계 — Fork & Clone

1. `hitech26-w7-diary` 저장소를 본인 GitHub 계정으로 Fork
2. 로컬로 Clone 후 VS Code로 열기

## 2단계 — `dev` 브랜치 만들고 실행 확인

`main`은 원본 보관용이므로, 실행 확인부터 `dev`에서 합니다.

1. `dev` 브랜치 생성 후 GitHub에 올리기
   ```bash
   git checkout -b dev
   git push -u origin dev
   ```
2. 터미널에서 실행
   ```bash
   npm install
   npm run dev
   ```
3. 터미널에 나온 주소(`http://localhost:5173`)를 열어 Vite + React 기본 화면이 뜨는지 확인 → 확인되면 터미널에서 `Ctrl + C`로 종료
4. 구현용 `diary` 브랜치 생성
   ```bash
   git checkout -b diary
   ```

이후 구현은 모두 `diary` 브랜치에서 진행합니다.

> 💡 `npm install` 후 `git status`에 `package-lock.json` 변경이 보일 수 있습니다. 컴퓨터마다 npm 버전이 달라 생기는 정상적인 변화이니, 5단계에서 구현 결과와 함께 커밋하면 됩니다.

## 3단계 — Supabase 프로젝트와 테이블 만들기 (데이터 정의)

### 3-1. 프로젝트 생성

1. Supabase 대시보드 → **New project**
2. 이름: `w7-diary` (자유), Region: **Northeast Asia (Seoul)**
3. Database Password: 자동 생성 후 **안전한 곳에 따로 저장** (오늘 실습에서는 쓰지 않지만 잃어버리면 다시 볼 수 없습니다)
4. **GitHub 저장소 연결 옵션은 연결하지 않고 넘어갑니다.** (DB 설정을 저장소 파일로 관리하는 고급 기능으로, 오늘 실습에는 필요 없습니다)
5. 그 외 옵션은 기본값 그대로 두고 생성 → 1~2분 기다립니다

### 3-2. 테이블 생성

왼쪽 메뉴 **SQL Editor** → 아래 SQL을 붙여넣고 **Run**

```sql
-- 1) 감정 일기 테이블 (데이터 정의)
create table public.diaries (
  id bigint primary key generated always as identity,
  content text not null,
  emotion text not null check (emotion in ('joy', 'calm', 'sad', 'angry', 'anxious')),
  created_at timestamptz not null default now()
);

-- 2) 브라우저(anon 역할)에서 이 테이블에 접근할 수 있는 권한
grant select, insert, delete on public.diaries to anon;

-- 3) 행 단위 보안(RLS) 켜기 — 정책으로 허용한 것만 가능해집니다
alter table public.diaries enable row level security;

-- 4) 정책: 누구나 읽기 / 쓰기 / 삭제 가능 (실습용 — 아래 보안 체크포인트에서 문제점을 다룹니다)
create policy "anyone can read" on public.diaries
  for select to anon using (true);

create policy "anyone can insert" on public.diaries
  for insert to anon with check (true);

create policy "anyone can delete" on public.diaries
  for delete to anon using (true);
```

5. 왼쪽 메뉴 **Table Editor** → `diaries` 테이블이 보이는지 확인

**[체크포인트]** SQL의 각 줄이 무엇을 정의하는지 Copilot Chat에게 물어보고, 아래 질문에 답해보세요.
- `emotion` 컬럼에 `'happy'`를 넣으면 어떻게 될까요?
- `id`와 `created_at`은 왜 앱에서 보내지 않아도 될까요?
- `grant`와 RLS 정책은 각각 무엇을 막고, 무엇을 허용하나요?

## 4단계 — 환경변수 설정

1. Supabase에서 두 값을 확인합니다
   - **Project URL** (`https://xxxx.supabase.co`) — 왼쪽 메뉴 **Project Overview**
   - **Publishable key** (`sb_publishable_...`로 시작) — 왼쪽 메뉴 **Project Settings → API Keys**

   > 💡 상단의 **Connect** 버튼은 쓰지 않습니다. Framework·Variant 등을 고르는 화면이 나오는데, 오늘은 환경변수 파일과 연결 코드를 직접(Copilot과 함께) 만들기 때문에 필요 없습니다.
2. 프로젝트 루트에 있는 `.env.example`을 복사해 **`.env.local`** 파일을 만들고 값을 채웁니다
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx
   ```
3. Supabase 라이브러리 설치
   ```bash
   npm install @supabase/supabase-js
   ```
   > 💡 macOS에서는 `fsevents ... install scripts not yet covered by allowScripts` 경고가 나올 수 있습니다. npm이 **승인하지 않은 패키지의 설치 스크립트를 자동 실행하지 않도록** 막았다는 안내이며, 실습에는 영향이 없으니 그대로 진행합니다. (설치 스크립트는 악성 패키지가 자주 악용하는 경로라서 npm이 기본으로 막아두는 것입니다)

> ⚠️ **Secret key(`sb_secret_...`) 또는 `service_role` 키는 절대 사용하지 마세요.** 이 키는 RLS를 무시하고 모든 데이터에 접근할 수 있는 관리자 키입니다. 브라우저에서 실행되는 코드에는 Publishable key만 씁니다.

**[체크포인트]** `git status`를 실행해보세요. `.env.local`이 목록에 **보이지 않아야** 정상입니다. 보인다면 커밋하지 말고 손을 들어주세요.

## 5단계 — PRD 작성 → Plan 모드 → Agent 구현

1. Copilot Chat을 **Plan 모드**로 열고 아래 PRD를 그대로 붙여넣습니다
2. Copilot이 세운 계획을 읽어봅니다 — 아래 항목이 계획에 들어 있는지 확인하고, 빠졌다면 추가를 요청합니다
   - `src/lib/supabase.js`에서 클라이언트를 만드는가
   - `src/api/diaries.js`에 조회·추가·삭제 함수를 모으는가
   - 로딩·저장 중·오류·빈 상태를 처리하는가
3. 계획이 괜찮으면 **Start Implementation** → Agent가 구현합니다
   - 채팅에 **"계획 검토 필요"**만 깜빡이고 버튼이 보이지 않으면, 채팅창에 `계획 승인, 구현 시작해줘`라고 입력하세요. Copilot이 계획을 마치고 여러분의 승인을 기다리는 상태입니다.
   - PRD를 보내기 전에 **관계없는 편집기 탭은 닫아두세요.** 열려 있는 파일이 첨부 자료로 함께 전달될 수 있습니다.
4. Agent가 터미널 명령(설치 등) 실행을 요청하면 내용을 읽어보고 허용합니다

```
[Copilot Plan 모드 프롬프트 — 감정 일기 PRD]
아래 PRD로 감정 일기 앱을 만들어줘. 이 프로젝트는 이미 Vite + React로 세팅되어 있고,
@supabase/supabase-js도 설치되어 있어.

## 목표
하루의 감정과 짧은 기록을 남기고, 어느 기기에서 열어도 같은 기록을 볼 수 있는 감정 일기

## 데이터 정의 (Supabase `diaries` 테이블 — 이미 만들어져 있음, 새로 만들지 말 것)
- id: bigint, DB가 자동 생성
- content: text, 필수
- emotion: text, 필수 — 'joy' | 'calm' | 'sad' | 'angry' | 'anxious' 중 하나
- created_at: timestamptz, DB가 자동 생성

## 화면 구성
- 작성 영역: 감정 선택 버튼 5개(😊 기쁨=joy, 😌 평온=calm, 😢 슬픔=sad, 😠 화남=angry, 😰 불안=anxious)
  + 내용 입력창 + 저장 버튼
- 목록 영역: 기록을 최신순으로 표시 — 감정 이모지, 내용, 작성 날짜·시간, 삭제 버튼
- 감정 필터: 전체 / 감정별 탭

## 상태 정의
- 불러오는 중: 목록을 불러오는 동안 로딩 표시
- 저장 중: 저장 버튼 비활성화 + "저장 중..." 표시 (중복 저장 방지)
- 오류: 불러오기·저장·삭제 실패 시 화면에 오류 메시지 표시
- 빈 상태: 기록이 없을 때(필터 결과 없음 포함) 안내 문구 표시
- 입력 검증: 감정을 선택하지 않았거나 내용이 비어 있으면 저장 불가

## 구조 요구사항
- Supabase 클라이언트는 src/lib/supabase.js 한 곳에서만 생성하고,
  환경변수 import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY를 사용
- 데이터 조회·추가·삭제 함수는 src/api/diaries.js에 모으고, 컴포넌트는 이 함수만 호출
- 키 값을 코드에 직접 적지 말 것
- 스타일은 Tailwind CSS 사용 (Vite 플러그인 방식)
- Vite 기본 템플릿의 예시 화면·이미지는 정리할 것
```

6. `npm run dev`로 실행해 확인합니다
   - 일기를 작성 → 목록에 나타나는가
   - **새로고침** → 그대로 남아 있는가
   - Supabase **Table Editor**의 `diaries` 테이블에 방금 쓴 행이 보이는가
   - 삭제 → 목록과 Table Editor 양쪽에서 사라지는가
7. 잘 되면 커밋
   ```bash
   git add .
   git commit -m "feat: 감정 일기 구현 (Supabase 연동)"
   ```
   > 💡 **Source Control의 "커밋 메시지 생성"(✨ 버튼)으로 메시지를 만들 수도 있습니다.** 기본은 영어로 생성되는데, 한국어로 받고 싶다면 아래처럼 설정하세요.
   > 1. VS Code 설정(`Ctrl + ,` / Mac은 `Cmd + ,`) → 검색창에 `commit message generation` 입력
   > 2. **GitHub › Copilot › Chat › Commit Message Generation: Instructions** → **settings.json에서 편집**
   > 3. 아래 내용을 넣고 저장
   >    ```json
   >    "github.copilot.chat.commitMessageGeneration.instructions": [
   >      { "text": "커밋 메시지는 한국어로 작성한다. 첫 줄은 'feat: ', 'fix: ', 'docs: ' 같은 영어 접두어 뒤에 한국어 요약을 쓴다." }
   >    ]
   >    ```
   > 4. 다시 "커밋 메시지 생성"을 누르면 한국어로 만들어집니다. AI가 만든 메시지도 **내용이 맞는지 읽어보고** 커밋하세요.

**[체크포인트]** `src/api/diaries.js`를 열어보세요. 컴포넌트(화면)에는 Supabase 코드가 없고, 이 파일에만 있나요? 이렇게 나눠두면 나중에 저장소를 바꿀 때 어떤 점이 편할지 한 문장으로 설명해보세요.

**[체크포인트 — 오류 상태 확인]** `.env.local`의 Publishable key 끝 글자 하나를 일부러 바꾸고 `npm run dev`를 다시 실행해보세요. 화면에 오류 메시지가 뜨나요? 확인 후 **원래 값으로 되돌립니다.**

## 6단계 — 보안 체크포인트 (사이버보안과라면 꼭!)

1. 앱을 실행한 상태에서 브라우저 **개발자 도구(F12) → Network 탭** → 새로고침
2. `supabase.co`로 가는 요청을 클릭 → **Headers**에서 `apikey` 값을 찾아보세요

**생각해볼 것**
- `.env.local`로 숨겼는데 왜 브라우저에서 키가 보일까요? → 프론트엔드 코드는 결국 사용자의 브라우저에서 실행되기 때문에, 브라우저에 전달된 값은 누구나 볼 수 있습니다. **Publishable key는 원래 공개되는 것을 전제로 한 키**입니다.
- 그렇다면 `.env.local`은 왜 쓸까요? → 키를 **GitHub 저장소(코드 기록)에 남기지 않기 위해서**, 그리고 개발용·배포용 값을 코드 수정 없이 바꿔 끼우기 위해서입니다.
- 키가 공개라면 데이터를 지켜주는 것은? → **`grant` 권한과 RLS 정책**입니다.
- 지금 정책(`using (true)`)의 문제는? → 배포 주소를 아는 사람이라면 **누구나 모든 일기를 읽고, 지울 수 있습니다.** 실제 서비스라면 로그인(Supabase Auth)을 붙이고 "내가 쓴 글만 보고 지울 수 있다"는 정책을 만들어야 합니다.

> 이 내용을 README의 "보안에서 확인한 것"에 자기 말로 정리합니다.

## 7단계 — `dev`로 merge 후 README 작성

```bash
git checkout dev
git merge diary
```

`dev` 브랜치에서 `README.md`를 작성합니다 (소개 / 만든 방법 / 데이터 저장 / 보안 / 배포 링크는 비워두고 배포 후 채움 / 커스터마이징). 작성 후 커밋 & push

```bash
git add README.md
git commit -m "docs: README 작성"
git push origin dev
```

## 8단계 — `prod` 브랜치 만들고 Netlify 배포

### 8-1. `prod` 브랜치 생성

```bash
git checkout -b prod
git push -u origin prod
git checkout dev
```

### 8-2. Netlify 연결

1. Netlify → **Add new project → Import an existing project → GitHub**
2. 본인 계정의 `hitech26-w7-diary` 선택
3. 배포 설정
   | 항목 | 값 |
   |---|---|
   | Branch to deploy | **`prod`** |
   | Build command | `npm run build` |
   | Publish directory | `dist` |
4. **환경변수 추가** — 같은 화면의 Environment variables(또는 배포 후 **Site configuration → Environment variables**)에 `.env.local`과 같은 두 값을 등록
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Deploy → 완료되면 나온 주소로 접속

> 💡 **로컬에서는 되는데 배포하면 화면이 비거나 오류가 난다면?** 거의 대부분 환경변수 문제입니다. `.env.local`은 GitHub에 올라가지 않았으니 Netlify는 그 값을 모릅니다. Netlify에 환경변수를 등록한 뒤 **Deploys → Trigger deploy → Clear cache and deploy site**로 다시 배포하세요. (Vite는 빌드할 때 환경변수를 코드에 넣기 때문에, 등록 후 반드시 다시 빌드해야 합니다.)

### 8-3. 확인 — 오늘의 핵심 장면

1. 배포 주소를 **휴대폰**으로 열어보세요
2. 컴퓨터에서 쓴 일기가 휴대폰에도 보이나요? 휴대폰에서 하나 쓰고 컴퓨터를 새로고침해보세요

6주차 To-Do와 무엇이 달라졌는지 직접 확인하는 순간입니다.

### 8-4. 이후 수정이 생기면

`diary`(또는 새 작업 브랜치)에서 수정 → `dev`에 merge → `dev`를 `prod`에 merge → push 하면 Netlify가 자동으로 다시 배포합니다.

```bash
git checkout prod
git merge dev
git push origin prod
git checkout dev
```

## 9단계 — README 배포 링크 채우기, 태그, PR 제출

1. `dev`의 README에 Netlify 배포 링크를 채우고 커밋 & push → 위 8-4 방법으로 `prod`에도 반영
2. Git 태그 생성 및 Release Note 작성
   ```bash
   git tag v1.0
   git push origin v1.0
   ```
   GitHub 저장소 → **Releases → Draft a new release** → `v1.0` 선택 후 Release Note 작성
3. `dev` → `main` 방향으로 PR 생성, PR 템플릿을 채워 제출 (`main`은 원본 보관용이므로 실제 merge는 하지 않습니다 — 교수 안내에 따르세요)

## 이해 단계 체크포인트

- [ ] localStorage와 Supabase 저장의 차이를 "다른 기기에서 열었을 때"를 예로 들어 설명할 수 있다
- [ ] `diaries` 테이블의 컬럼과, 각 컬럼이 왜 필요한지 설명할 수 있다
- [ ] `.env.local`을 쓰는 이유와, 그래도 Publishable key가 브라우저에 보이는 이유를 설명할 수 있다
- [ ] RLS 정책이 무엇을 하는지, 지금 정책의 한계가 무엇인지 설명할 수 있다
- [ ] `dev`(통합)와 `prod`(배포)를 나눈 이유를 설명할 수 있다

## 커스터마이징 범위 가이드

자유: 색상, 폰트, 이모지·감정 이름 표현, 레이아웃
선택 도전 (시간 남는 학생 대상):
- 삭제 전 확인 창 띄우기
- 감정별 기록 개수 통계 표시
- 일기 수정 기능 — ⚠️ 수정하려면 `update` 권한과 정책이 추가로 필요합니다. 어떤 SQL이 필요한지 Copilot에게 먼저 물어보고, 무엇을 허용하는 코드인지 이해한 뒤 실행하세요.

> ⚠️ 감정 종류를 새로 추가하려면 테이블의 `check` 조건도 함께 바꿔야 합니다. 화면만 바꾸면 저장할 때 오류가 납니다 — 데이터 정의가 왜 중요한지 확인하는 좋은 예입니다.

## 막혔을 때

- **`npm run dev` 했는데 화면이 하얗다** → F12 → Console 탭의 빨간 오류를 Copilot Chat에 그대로 붙여넣어 물어보세요.
- **`Invalid API key` / 401 오류** → `.env.local`의 키 값 앞뒤 공백, 변수 이름 철자(`VITE_` 접두사)를 확인하고, 수정 후 `npm run dev`를 **다시 실행**하세요. (실행 중에는 `.env.local` 변경이 반영되지 않습니다.)
- **`permission denied for table diaries` 오류** → 3-2의 `grant` 줄이 실행되었는지 확인하세요.
- **목록은 비어 있는데 오류도 없다 / 저장이 안 된다** → RLS 정책이 빠졌을 가능성이 큽니다. Supabase → **Authentication → Policies**(또는 Table Editor의 RLS 표시)에서 `diaries`에 정책 3개가 있는지 확인하세요.
- **`new row violates check constraint` 오류** → 앱이 `joy / calm / sad / angry / anxious` 외의 값을 보내고 있습니다. `src/api/diaries.js`에서 보내는 `emotion` 값을 확인하세요.
- **Tailwind 클래스가 적용되지 않는다** → `vite.config.js`에 Tailwind 플러그인이 등록되었는지, CSS 파일에 `@import "tailwindcss";`가 있는지 Copilot에게 확인 요청하세요.
- **Netlify 배포 후 빈 화면** → 8-2의 💡 안내(환경변수 등록 후 Clear cache and deploy)를 따르세요.
- **`git status`에 `.env.local`이 보인다** → 커밋하지 말고 바로 알려주세요. `.gitignore` 설정을 함께 확인합니다.
