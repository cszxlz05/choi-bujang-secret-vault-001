# BYTE BACK 방어전 시작 틀 R5

이 저장소는 1단계에서 학생 본인이 GitHub 저장소와 Vercel 배포를 만드는 출발점입니다. 포함된 메모 네 건은 가상 자료입니다. 실제 학생 자료, 토큰, 비밀키를 넣지 마세요.

## 현재 상태 (2단계 저장점)

- 가상 메모는 코드·정적 파일이 아니라 학습용 Supabase 테이블 `public.notes`(id, owner_id, title, content, created_at)에 있습니다. 테이블은 RLS를 켜 두었고 anon·authenticated의 권한을 회수했습니다. `owner_id`는 칸만 있고 `auth.users` 외래키는 없습니다.
- 화면(`public/index.html`)은 `/api/notes`를 호출합니다. `api/notes.js`는 서버 환경변수 `SUPABASE_URL`, `SUPABASE_SECRET_KEY`만 읽습니다. 키는 브라우저 파일·응답·로그에 넣지 않습니다. 환경변수는 Vercel 프로젝트 설정에서 직접 넣고, 바꾼 뒤에는 재배포해야 합니다.
- `aleph.config.json`의 `step`은 2입니다. `scripts/build-public.mjs`는 더 이상 `data.json`을 복사하지 않고, 배포의 `/aleph.json`은 계속 만듭니다.
- 저장소와 정적 파일에서 `data.json`과 `public/data.json`을 삭제했습니다. 메모 본문이 든 시드 SQL은 저장소에 두지 않습니다(`*.local.sql`은 `.gitignore`).
- `vercel.json`의 headers로 모든 응답에 `X-Content-Type-Options: nosniff`를 붙입니다.
- 다시 실행하는 방법: `npm run build -- --local`(로컬 정적 확인), `npm run test:r5`, `npm run test:package`. 로컬 실행은 배포나 심판 접수를 증명하지 않습니다.

### 남은 약점 (2단계 기준)

- **`/api/notes`는 인증이 없습니다.** 주소를 아는 누구나 호출해 가상 메모를 읽을 수 있습니다. 3단계 로그인으로 해소할 예정이며, 그 전까지는 가상 메모만 둡니다.
- **옛 공개 이력은 지워지지 않았습니다.** 이전 공개 커밋과 이전 배포(옛 배포 URL)에는 공개 시절의 메모가 남아 있을 수 있습니다. 최신 파일에서 메모를 제거했을 뿐이므로 과거 노출이 해소되었다고 쓰지 않습니다.

### 최신 파일에 메모가 없는지 확인하는 절차

검색어(`KEYWORD`)는 가상 메모에서 고른 고정 문구를 실행할 때만 입력합니다. 이 문서와 저장소에는 적지 않습니다. 적으면 그 파일이 검색에 걸립니다.

```bash
# 1) GitHub 최신 파일: 결과가 0건이어야 함
git grep -nF "$KEYWORD" HEAD
# 2) 배포된 첫 화면: 0이어야 함
curl -s https://<배포주소>/ | grep -cF "$KEYWORD"
# 3) 옛 공개 주소: 404이거나 메모가 없어야 함
curl -s -o /dev/null -w "%{http_code}\n" https://<배포주소>/data.json
# 4) 배포 식별 파일: 200이어야 함
curl -s -o /dev/null -w "%{http_code}\n" https://<배포주소>/aleph.json
# 5) 보안 헤더: x-content-type-options: nosniff가 보여야 함
curl -sI https://<배포주소>/ | grep -i x-content-type-options
```

기록 형식: 검색 결과(최신 파일·배포본)와 공개 API의 남은 약점을 각각 따로 적습니다.

## 학생이 하는 일: 세 걸음

1. GitHub 계정을 만듭니다.
2. 방어전 1단계 카드의 **Deploy** 버튼을 누릅니다. Vercel에 GitHub로 로그인하고, 새 저장소가 **본인 계정의 Public 저장소**인지 확인한 뒤 Deploy를 누릅니다.
3. 배포가 끝나면 화면에 나온 `https://…vercel.app` 주소를 방어전 1단계 카드에 붙여넣고 제출합니다. 저장소 주소나 설정 파일은 적지 않습니다.

배포가 끝나면 `/`에서 점령된 가상 자료실을 볼 수 있습니다. `/data.json`에는 같은 가상 메모가 공개됩니다. 이 공개 상태를 확인하는 것이 1단계의 출발점입니다. 1단계 접수와 심판 판정은 포털에서 확인합니다.

## 시작 틀의 자동 처리

`vercel.json`은 정적 결과물 `public`을 배포합니다. 빌드 명령 `npm run build`는 Vercel이 제공하는 GitHub 저장소 소유자·이름, 커밋 SHA, 배포 URL을 검증하고 `public/aleph.json`을 생성합니다. 이 값이 없으면 빌드가 실패하므로, 성공한 것처럼 빈 주소를 내보내지 않습니다. `aleph.json`의 내용만으로 저장소 소유권이나 방어 성공을 인정하지 않습니다. 심판이 공개 저장소의 실제 커밋과 배포된 자료를 따로 대조해야 합니다.

`aleph.config.json`의 `repoUrl`과 `publicAppUrl`은 이전 제출 묶음 방식의 자리표시자입니다. 1단계에서는 학생이 편집하지 않습니다. 2단계 이후 코딩 도구가 필요한 설정과 보호 기능을 단계별로 작성합니다. `npm run bundle`과 `bundle-notes.json`도 1단계의 세 걸음에는 포함되지 않습니다.

로컬에서 가상 화면만 확인할 때는 `npm run build -- --local`을 사용합니다. 로컬 실행은 Vercel 배포나 심판 접수를 증명하지 않습니다. 저장소의 `src/attack-check.mjs`는 실제 배포가 된 뒤 `/data.json`을 비로그인으로 요청해 공개 가상 메모의 확인 표시를 읽습니다.

## 다음 단계의 코딩 도구에 전달할 규칙

[AGENTS.md](AGENTS.md)를 먼저 읽히고 한 번에 한 제작 단위만 요청하세요. 2단계부터는 자료 보호를 구현할 때 `public/data.json`을 복사하는 1단계 빌드 흐름도 함께 바꿔야 합니다. 3단계 이후의 로그인, 허용 경로, 5단계의 원본 API 주소, 6단계 이후 정책 규칙은 해당 단계 원고와 계약에 맞춰 추가합니다. 비밀번호·토큰·서버 전용 키·실제 학생 기록을 코드, Git, 제출 묶음에 넣지 않습니다.

`src/decider.mjs`와 `src/detect.mjs`의 로컬 시험은 반 엔진이나 운영 심판의 결과가 아닙니다. 1단계 이후 제출 묶음 계약 `aleph.defense.submission.v2`는 `scripts/bundle.mjs`에 남아 있으며, 코딩 도구가 해당 단계의 최신 배포 주소와 Git 원격을 맞춘 뒤 사용합니다.
