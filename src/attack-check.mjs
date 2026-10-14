// The student changes this check as each stage adds an attack to the same app.
// Never return tokens, private keys, real names, or note bodies.
export async function runAttackChecks(config) {
  if (config.step !== 1 && config.step !== 2) throw new Error('이 단계의 공격 점검을 src/attack-check.mjs에 구현해 주세요.');
  let app;
  try {
    app = new URL(config.publicAppUrl);
  } catch {
    throw new Error('aleph.config.json의 실제 배포 주소를 먼저 넣어 주세요.');
  }
  if (app.protocol !== 'https:' || app.username || app.password || app.search || app.hash
      || app.pathname !== '/' || app.hostname.endsWith('.example')) {
    throw new Error('aleph.config.json의 실제 배포 주소를 먼저 넣어 주세요.');
  }
  if (typeof config.sampleMarker !== 'string' || !config.sampleMarker) throw new Error('가상 메모의 확인 표시를 넣어 주세요.');
  if (config.step === 2) return runStepTwoChecks(app);
  const response = await fetch(new URL('/data.json', app), {
    redirect: 'error', signal: AbortSignal.timeout(10000),
  });
  let visible = false;
  if (response.ok) {
    try {
      const data = await response.json();
      visible = data?.sampleMarker === config.sampleMarker && Array.isArray(data.notes)
        && data.notes.length > 0;
    } catch {
      // A non-JSON response is a failed check, not a successful deployment.
    }
  }
  return [{ attackId: 'anonymous_note_read', expected: '비로그인 화면에서 가상 메모를 확인',
    observed: visible ? '비로그인 요청에서 공개 가상 메모 확인 표시가 보임' : `비로그인 요청에서 확인 표시가 보이지 않음 (HTTP ${response.status})` }];
}

// 2단계: 옛 공개 주소와 새 서버 함수를 비로그인으로 각각 실제 요청해 결과만 기록합니다.
// 응답 본문(메모 내용)은 기록하지 않고, 메모가 보였는지 여부만 적습니다.
async function notesVisible(app, path) {
  const response = await fetch(new URL(path, app), {
    redirect: 'error', signal: AbortSignal.timeout(10000),
  });
  let visible = false;
  if (response.ok) {
    try {
      const data = await response.json();
      visible = Array.isArray(data?.notes) && data.notes.length > 0;
    } catch {
      // JSON이 아니면 메모가 보인 것이 아닙니다.
    }
  }
  return { visible, status: response.status };
}

async function runStepTwoChecks(app) {
  const oldPublic = await notesVisible(app, '/data.json');
  const api = await notesVisible(app, '/api/notes');
  return [
    { attackId: 'anonymous_data_json_read',
      expected: '비로그인으로 /data.json을 열어도 메모가 보이지 않음',
      observed: oldPublic.visible
        ? `비로그인 요청에서 /data.json에 메모가 보임 (HTTP ${oldPublic.status})`
        : `비로그인 요청에서 /data.json에 메모가 보이지 않음 (HTTP ${oldPublic.status})` },
    { attackId: 'anonymous_api_notes_read',
      expected: '3단계 전이라 /api/notes는 공개 상태 (알려진 약점)',
      observed: api.visible
        ? `비로그인 요청에서 /api/notes가 메모를 돌려줌 (HTTP ${api.status}). 인증은 3단계에서 추가`
        : `비로그인 요청에서 /api/notes에 메모가 보이지 않음 (HTTP ${api.status})` },
  ];
}
