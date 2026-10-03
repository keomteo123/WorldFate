// 설정 창(배경음악, 이 기기에만 저장) · 계정(Supabase 로그인).
(() => {
  const $ = id => document.getElementById(id);
  const SB_URL = 'https://fnsstufvjpejxobyilxl.supabase.co';
  const SB_KEY = 'sb_publishable_mGdUqmbmb-KtObMYFrXT4Q_QZVrl_om';
  const SESSION_KEY = 'wf_session';

  let session = null; // { access_token, refresh_token, expires_at, user }

  // ---------- Supabase Auth (REST) ----------
  async function sb(path, { method = 'GET', body, token } = {}) {
    const res = await fetch(SB_URL + path, {
      method,
      headers: { apikey: SB_KEY, 'Content-Type': 'application/json', Authorization: `Bearer ${token || SB_KEY}` },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(friendly(data.msg || data.error_description || data.message || data.error || `오류 ${res.status}`));
    return data;
  }

  function friendly(m) {
    if (/invalid login/i.test(m)) return '이메일 또는 비밀번호가 맞지 않아요.';
    if (/already registered|already been registered/i.test(m)) return '이미 가입된 이메일이에요.';
    if (/password.*(at least|short|characters)/i.test(m)) return '비밀번호는 6자 이상이어야 해요.';
    if (/invalid.*email|email.*invalid/i.test(m)) return '이메일 형식이 올바르지 않아요.';
    if (/not confirmed/i.test(m)) return '이메일 인증을 먼저 완료해 주세요.';
    if (/rate limit/i.test(m)) return '요청이 너무 많아요. 잠시 뒤 다시 시도해 주세요.';
    return m;
  }

  function storeSession(s) {
    if (s && s.access_token) {
      session = { access_token: s.access_token, refresh_token: s.refresh_token, user: s.user,
        expires_at: s.expires_at || Math.floor(Date.now() / 1000) + (s.expires_in || 3600) };
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) {}
    } else {
      session = null;
      try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
    }
  }

  async function validToken() {
    if (!session) return null;
    if (session.expires_at - 60 < Date.now() / 1000) {
      try {
        storeSession(await sb('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: session.refresh_token } }));
      } catch (e) { storeSession(null); renderAccount(); return null; }
    }
    return session.access_token;
  }

  // 다른 모듈(menu.js 클라우드 저장)이 쓰는 인터페이스
  async function rest(path, { method = 'GET', body, prefer } = {}) {
    const token = await validToken();
    if (!token) throw new Error('로그인이 필요해요.');
    const headers = { apikey: SB_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    if (prefer) headers.Prefer = prefer;
    const res = await fetch(SB_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error((data && (data.message || data.hint)) || `오류 ${res.status}`);
    return data;
  }
  window.WFAuth = { loggedIn: () => !!session, rest };
  const authChanged = () => window.dispatchEvent(new Event('wf-auth'));

  // ---------- 화면 ----------
  function renderSettings() {
    const s = WFAudio.get();
    const sel = $('stTrack');
    if (!sel.options.length) {
      for (const t of WFAudio.tracks) sel.add(new Option(t.name, t.file));
    }
    sel.value = s.track;
    $('stVolume').value = Math.round(s.volume * 100);
    $('stVolumeVal').textContent = Math.round(s.volume * 100);
    $('stMuted').checked = s.muted;
  }

  function renderAccount() {
    const email = session && session.user && session.user.email;
    $('acOut').style.display = email ? 'none' : '';
    $('acIn').style.display = email ? '' : 'none';
    $('acEmailShown').textContent = email || '';
    $('hmAccount').textContent = email ? `계정 · ${email}` : '로그인 · 계정';
  }

  function msg(text, bad) {
    const m = $('acMsg');
    m.textContent = text || '';
    m.style.color = bad ? '#e08a7a' : '';
  }

  async function auth(kind) {
    const email = $('acEmail').value.trim(), password = $('acPass').value;
    if (!email || !password) return msg('이메일과 비밀번호를 입력해 주세요.', true);
    $('acLogin').disabled = $('acSignup').disabled = true;
    msg('잠시만요…');
    try {
      if (kind === 'signup') {
        const r = await sb('/auth/v1/signup', { method: 'POST', body: { email, password } });
        if (!r.access_token) { msg('가입 완료! 이메일로 온 인증 링크를 누른 뒤 로그인해 주세요.'); return; }
        storeSession(r);
      } else {
        storeSession(await sb('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } }));
      }
      $('acPass').value = '';
      msg('');
      renderAccount();
      renderSettings();
      renderAccount();
      authChanged();
    } catch (e) {
      msg(e.message, true);
    } finally {
      $('acLogin').disabled = $('acSignup').disabled = false;
    }
  }

  async function logout() {
    const token = session && session.access_token;
    storeSession(null);
    renderAccount();
    msg('');
    authChanged();
    if (token) sb('/auth/v1/logout', { method: 'POST', token }).catch(() => {});
  }

  function open(id) {
    $('home').classList.remove('open');
    $(id).classList.add('open');
  }
  function close(id) {
    $(id).classList.remove('open');
    $('home').classList.add('open');
  }

  // ---------- 연결 ----------
  $('hmSettings').onclick = () => { renderSettings(); open('settingsDlg'); };
  $('hmAccount').onclick = () => { msg(''); renderAccount(); open('accountDlg'); };
  $('stClose').onclick = () => close('settingsDlg');
  $('acClose').onclick = () => close('accountDlg');

  $('stTrack').onchange = () => WFAudio.set({ track: $('stTrack').value });
  $('stVolume').oninput = () => { $('stVolumeVal').textContent = $('stVolume').value; WFAudio.set({ volume: $('stVolume').value / 100 }); };
  $('stMuted').onchange = () => WFAudio.set({ muted: $('stMuted').checked });
  WFAudio.onChange(() => { if ($('settingsDlg').classList.contains('open')) renderSettings() });

  $('acLogin').onclick = () => auth('login');
  $('acSignup').onclick = () => auth('signup');
  $('acLogout').onclick = logout;
  $('acPass').addEventListener('keydown', e => { if (e.key === 'Enter') auth('login'); });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    for (const id of ['settingsDlg', 'accountDlg']) {
      if ($(id).classList.contains('open')) { e.stopImmediatePropagation(); close(id); return; }
    }
  }, true);

  // 저장된 로그인 복원
  try { session = JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { session = null; }
  renderAccount();
  if (session) authChanged();
})();
