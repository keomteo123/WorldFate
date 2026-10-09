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
    if (/access.?denied|denied/i.test(m)) return '로그인이 취소되었어요.';
    if (/provider.*(not enabled|disabled)|unsupported provider/i.test(m)) return '이 로그인 방법은 아직 준비 중이에요.';
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
    const r = WFRules.get();
    $('stColonies').checked = r.colonies;
    $('stDisasters').checked = r.disasters;
    $('stEvent').value = Math.round(r.eventRate * 10);
    $('stEventVal').textContent = r.eventRate.toFixed(1);
    $('stTech').value = Math.round(r.techSpeed * 10);
    $('stTechVal').textContent = r.techSpeed.toFixed(1);
    WFI18n.renderPicker();
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

  // ---------- 소셜 로그인 (Google · Discord) ----------
  const CONSENT_KEY = 'wf_terms_ok'; // 이 기기에서 동의한 약관 버전

  async function oauthStart(provider) {
    let agreed = null;
    try { agreed = localStorage.getItem(CONSENT_KEY); } catch (e) {}
    // 처음이거나 약관 버전이 바뀌었으면 이동 전에 동의를 받는다 (가입인지 로그인인지는 제공자 쪽에서 구분되지 않음)
    if (agreed !== WFTerms.version) {
      if (!(await WFTerms.ask())) return msg('약관에 동의하셔야 로그인할 수 있어요.', true);
      try { localStorage.setItem(CONSENT_KEY, WFTerms.version); } catch (e) {}
    }
    const back = encodeURIComponent(location.origin + location.pathname);
    location.href = `${SB_URL}/auth/v1/authorize?provider=${provider}&redirect_to=${back}`;
  }

  // 제공자에서 돌아온 주소(#access_token=…)를 세션으로 바꾼다
  async function oauthFinish() {
    const p = new URLSearchParams(location.hash.replace(/^#/, ''));
    const err = p.get('error_description') || new URLSearchParams(location.search).get('error_description');
    const clean = () => history.replaceState(null, '', location.pathname);
    if (err) { clean(); open('accountDlg'); return msg(friendly(err), true); }
    const access = p.get('access_token');
    if (!access) return;
    clean();
    try {
      const user = await sb('/auth/v1/user', { token: access });
      storeSession({ access_token: access, refresh_token: p.get('refresh_token'), expires_in: Number(p.get('expires_in')) || 3600, user });
      sb('/auth/v1/user', { method: 'PUT', token: access, body: { data: WFTerms.consentData() } }).catch(() => {});
      renderAccount();
      authChanged();
    } catch (e) { msg(e.message, true); }
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
  $('stLang').onchange = () => WFI18n.set($('stLang').value);
  $('stColonies').onchange = () => WFRules.set({ colonies: $('stColonies').checked });
  $('stDisasters').onchange = () => WFRules.set({ disasters: $('stDisasters').checked });
  $('stEvent').oninput = () => { const v = $('stEvent').value / 10; $('stEventVal').textContent = v.toFixed(1); WFRules.set({ eventRate: v }); };
  $('stTech').oninput = () => { const v = $('stTech').value / 10; $('stTechVal').textContent = v.toFixed(1); WFRules.set({ techSpeed: v }); };
  $('stMuted').onchange = () => WFAudio.set({ muted: $('stMuted').checked });
  WFAudio.onChange(() => { if ($('settingsDlg').classList.contains('open')) renderSettings() });

  $('acGoogle').onclick = () => oauthStart('google');
  $('acDiscord').onclick = () => oauthStart('discord');
  $('acLogout').onclick = logout;

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
  oauthFinish();
})();
