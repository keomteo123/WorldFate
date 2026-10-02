// 홈 화면 · 새 게임(지도 선택) · 저장/불러오기. 게임 본체는 window.WFGame 인터페이스로만 다룬다.
(() => {
  const $ = id => document.getElementById(id);
  const META_KEY = 'wf_meta';
  const SLOT_KEY = s => `wf_slot_${s}`;
  const SLOTS = ['auto', '1', '2', '3', '4', '5', '6', '7', '8'];

  // ---------- 저장소 ----------
  function loadMeta() {
    try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveMeta(m) {
    try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) { /* 용량 부족 */ }
  }

  const b64 = bytes => {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  };
  const unb64 = str => Uint8Array.from(atob(str), c => c.charCodeAt(0));

  // gzip 압축(지원 브라우저) 후 base64. 미지원이면 JSON 그대로.
  async function pack(obj) {
    const json = JSON.stringify(obj);
    if (typeof CompressionStream === 'undefined') return 'j:' + json;
    const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
    return 'z:' + b64(new Uint8Array(await new Response(stream).arrayBuffer()));
  }
  async function unpack(str) {
    if (str.startsWith('j:')) return JSON.parse(str.slice(2));
    const stream = new Blob([unb64(str.slice(2))]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }

  async function writeSlot(slot, name) {
    const data = WFGame.serialize();
    const packed = await pack(data);
    const info = WFGame.info();
    try {
      localStorage.setItem(SLOT_KEY(slot), packed);
    } catch (e) {
      toast('저장 공간이 부족해요. 오래된 저장을 지워 주세요.');
      return false;
    }
    const meta = loadMeta();
    meta[slot] = { name, savedAt: data.savedAt, year: info.year, mapName: info.mapName, nations: info.nations, thumb: WFGame.thumbnail() };
    saveMeta(meta);
    return true;
  }

  async function readSlot(slot) {
    const raw = localStorage.getItem(SLOT_KEY(slot));
    return raw ? unpack(raw) : null;
  }

  function deleteSlot(slot) {
    localStorage.removeItem(SLOT_KEY(slot));
    const meta = loadMeta();
    delete meta[slot];
    saveMeta(meta);
  }

  function latestSlot() {
    const meta = loadMeta();
    let best = null;
    for (const s of SLOTS) if (meta[s] && localStorage.getItem(SLOT_KEY(s)) && (!best || meta[s].savedAt > meta[best].savedAt)) best = s;
    return best;
  }

  // ---------- 화면 전환 ----------
  const PANELS = ['home', 'newGame', 'saveLoad', 'helpDlg'];
  let origin = 'home';       // 대화상자를 연 곳: 홈 화면 / 게임 중 상단 버튼
  let wasPaused = false;
  let overlayOpen = false;

  function show(id) {
    PANELS.forEach(p => $(p).classList.toggle('open', p === id));
    const open = !!id;
    if (open && !overlayOpen && WFGame.isStarted()) { wasPaused = WFGame.isPaused(); WFGame.setPaused(true); }
    if (!open && overlayOpen && WFGame.isStarted()) WFGame.setPaused(wasPaused);
    overlayOpen = open;
    document.body.classList.toggle('modal-open', open);
  }

  function closeAll() { show(null); }

  function showHome() {
    const started = WFGame.isStarted();
    $('hmResume').style.display = started ? '' : 'none';
    $('hmContinue').disabled = !latestSlot();
    $('hmHint').textContent = started ? `${WFGame.info().mapName} · ${WFGame.info().year}년` : '';
    show('home');
  }

  function back() { origin === 'home' ? showHome() : closeAll(); }

  function toast(text) {
    const el = $('toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 2400);
  }

  // ---------- 새 게임 ----------
  let selectedMap = 'random';
  let mapGridBuilt = false;

  function buildMapGrid() {
    if (mapGridBuilt) return;
    mapGridBuilt = true;
    const grid = $('mapGrid');
    let lastKind = null;
    for (const def of WFMaps.list) {
      if (def.kind !== lastKind) {
        const h = document.createElement('div');
        h.className = 'mapGroup';
        h.textContent = def.kind === 'real' ? '현실 지도' : '랜덤 지도';
        grid.appendChild(h);
        lastKind = def.kind;
      }
      const card = document.createElement('div');
      card.className = 'mapCard';
      card.dataset.id = def.id;
      card.appendChild(WFMaps.thumbnail(def, 160, 96));
      card.insertAdjacentHTML('beforeend', `<div class="mn">${def.icon ? def.icon + ' ' : ''}${def.name}</div><div class="md">${def.desc}</div>`);
      card.onclick = () => selectMap(def.id);
      grid.appendChild(card);
    }
  }

  function selectMap(id) {
    selectedMap = id;
    const def = WFMaps.get(id);
    document.querySelectorAll('.mapCard').forEach(c => c.classList.toggle('sel', c.dataset.id === id));
    $('ngCount').value = def.nations || 14;
    $('ngCountVal').textContent = $('ngCount').value;
  }

  function openNewGame(from) {
    origin = from;
    buildMapGrid();
    selectMap(selectedMap);
    show('newGame');
  }

  function parseSeed(text) {
    const t = text.trim();
    if (!t) return Math.floor(Math.random() * 999999);
    if (/^\d+$/.test(t)) return parseInt(t, 10) % 999999999;
    let h = 7;
    for (const ch of t) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0;
    return Math.abs(h) % 999999999;
  }

  function startNewGame() {
    const seed = parseSeed($('ngSeed').value);
    const btn = $('ngStart');
    btn.disabled = true;
    btn.textContent = '세계를 만드는 중…';
    // 화면이 갱신된 뒤 무거운 생성 작업을 시작한다
    setTimeout(() => {
      try {
        WFGame.newGame({ mapId: selectedMap, nationCount: Number($('ngCount').value), seed });
        wasPaused = false;
        closeAll();
        toast(`${WFMaps.get(selectedMap).name} — 새로운 세계가 시작됩니다`);
      } finally {
        btn.disabled = false;
        btn.textContent = '시작';
      }
    }, 30);
  }

  // ---------- 저장 · 불러오기 ----------
  function ago(ts) {
    const m = Math.floor((Date.now() - ts) / 60000);
    if (m < 1) return '방금 전';
    if (m < 60) return `${m}분 전`;
    if (m < 1440) return `${Math.floor(m / 60)}시간 전`;
    return new Date(ts).toLocaleDateString('ko-KR');
  }

  function renderSlots() {
    const meta = loadMeta();
    const started = WFGame.isStarted();
    const list = $('slotList');
    list.innerHTML = '';
    for (const s of SLOTS) {
      const m = meta[s] && localStorage.getItem(SLOT_KEY(s)) ? meta[s] : null;
      const row = document.createElement('div');
      row.className = 'slot';
      const title = s === 'auto' ? '자동 저장' : `슬롯 ${s}`;
      row.innerHTML = `
        <div class="th" ${m && m.thumb ? `style="background-image:url(${m.thumb})"` : ''}>${m ? '' : '비어 있음'}</div>
        <div class="info">
          <div class="sn">${title}${m ? ` · ${escapeHTML(m.name)}` : ''}</div>
          <div class="sm">${m ? `${m.year}년 · ${escapeHTML(m.mapName)} · 국가 ${m.nations}<br>${ago(m.savedAt)}` : '저장된 세계가 없습니다.'}</div>
        </div>
        <div class="btns"></div>`;
      const btns = row.querySelector('.btns');
      const mk = (label, cls, fn, disabled) => {
        const b = document.createElement('button');
        b.textContent = label;
        if (cls) b.className = cls;
        b.disabled = !!disabled;
        b.onclick = fn;
        return b;
      };
      const top = document.createElement('div');
      top.className = 'row';
      if (s !== 'auto') top.appendChild(mk('저장', 'primary', () => doSave(s, !!m), !started));
      top.appendChild(mk('불러오기', '', () => doLoad(s), !m));
      btns.appendChild(top);
      if (m) btns.appendChild(mk('삭제', '', () => { if (confirm(`${title}을(를) 삭제할까요?`)) { deleteSlot(s); renderSlots(); } }));
      list.appendChild(row);
    }
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
  }

  async function doSave(slot, occupied) {
    if (occupied && !confirm('이 슬롯에 덮어쓸까요?')) return;
    const name = $('slName').value.trim() || `${WFGame.info().year}년`;
    if (await writeSlot(slot, name)) {
      toast('저장했습니다');
      renderSlots();
    }
  }

  async function doLoad(slot) {
    if (WFGame.isStarted() && origin !== 'home' && !confirm('현재 진행 중인 세계는 사라집니다. 불러올까요?')) return;
    try {
      const data = await readSlot(slot);
      if (!data) return;
      WFGame.deserialize(data);
      wasPaused = false;
      closeAll();
      toast('불러왔습니다');
    } catch (e) {
      console.error(e);
      toast('저장 데이터를 불러오지 못했습니다');
    }
  }

  function openSaveLoad(from) {
    origin = from;
    const info = WFGame.info();
    $('slName').value = `${info.year}년 ${info.mapName}`;
    renderSlots();
    show('saveLoad');
  }

  // ---------- 이벤트 연결 ----------
  $('hmResume').onclick = closeAll;
  $('hmNew').onclick = () => openNewGame('home');
  $('hmLoad').onclick = () => openSaveLoad('home');
  $('hmHelp').onclick = () => { origin = 'home'; show('helpDlg'); };
  $('hmContinue').onclick = async () => {
    const s = latestSlot();
    if (s) await doLoad(s);
  };
  $('ngBack').onclick = back;
  $('ngStart').onclick = startNewGame;
  $('ngCount').oninput = () => { $('ngCountVal').textContent = $('ngCount').value; };
  $('ngDice').onclick = () => { $('ngSeed').value = String(Math.floor(Math.random() * 999999)); };
  $('slClose').onclick = back;
  $('helpClose').onclick = back;

  $('homeBtn').onclick = showHome;
  $('newWorld').onclick = () => openNewGame('game');
  $('save').onclick = () => openSaveLoad('game');
  $('load').onclick = () => openSaveLoad('game');

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlayOpen) {
      const homeOpen = $('home').classList.contains('open');
      if (homeOpen) { if (WFGame.isStarted()) closeAll(); } else back();
    }
  });

  let autoSaving = false;
  window.WFMenu = {
    openNewGame, openSaveLoad, showHome,
    // 25년마다 자동 저장 (홈/저장 창이 열려 있을 땐 건너뜀)
    async autoSave() {
      if (autoSaving || overlayOpen || !WFGame.isStarted()) return;
      autoSaving = true;
      try { await writeSlot('auto', `${WFGame.info().year}년 ${WFGame.info().mapName}`); } finally { autoSaving = false; }
    }
  };

  showHome();
})();
