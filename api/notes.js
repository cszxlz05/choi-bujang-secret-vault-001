import { createClient } from '@supabase/supabase-js';

// 2단계: 자료는 서버 함수가 Supabase에서 읽어 옵니다.
// 주의: 이 함수에는 아직 인증이 없어 주소를 아는 누구나 호출할 수 있습니다. (3단계에서 해소)
// 키 값은 응답·로그·오류 메시지에 절대 넣지 않습니다.
export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    return response.status(500).json({ error: 'SERVER_NOT_CONFIGURED' });
  }
  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from('notes')
      .select('title, content')
      .order('id', { ascending: true });
    if (error) {
      return response.status(502).json({ error: 'DATA_SOURCE_ERROR' });
    }
    return response.status(200).json({ notes: data });
  } catch {
    return response.status(502).json({ error: 'DATA_SOURCE_UNREACHABLE' });
  }
}
