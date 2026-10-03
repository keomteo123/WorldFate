// 배경음악 재생과 소리 설정(곡 · 볼륨 · 음소거). 설정은 localStorage에 저장되고, 로그인하면 settings.js가 계정과 동기화한다.
(function () {
  const KEY = 'wf_settings';
  const TRACKS = [
    { file: 'Lines_on_the_Map.mp4', name: 'Lines on the Map' },
    { file: 'The_Sovereign_Map.mp4', name: 'The Sovereign Map' }
  ];
  const DEFAULTS = { track: TRACKS[0].file, volume: 0.5, muted: false };

  let state = Object.assign({}, DEFAULTS);
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
  if (!TRACKS.some(t => t.file === state.track)) state.track = DEFAULTS.track;
  state.volume = Math.min(1, Math.max(0, Number(state.volume)));
  if (!isFinite(state.volume)) state.volume = DEFAULTS.volume;
  state.muted = !!state.muted;

  let el = null, started = false;
  const listeners = [];

  function syncButton() {
    const b = document.getElementById('soundBtn');
    if (b) b.textContent = state.muted ? '🔇' : '🔊';
  }

  function applyVolume() {
    if (el) el.volume = state.muted ? 0 : state.volume;
  }

  function play() {
    if (!el) {
      el = new Audio(state.track);
      el.loop = true;
    }
    applyVolume();
    el.play().catch(() => {});
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    syncButton();
    listeners.forEach(fn => fn(Object.assign({}, state)));
  }

  function set(patch) {
    const prevTrack = state.track;
    Object.assign(state, patch);
    if (!TRACKS.some(t => t.file === state.track)) state.track = prevTrack;
    state.volume = Math.min(1, Math.max(0, Number(state.volume) || 0));
    state.muted = !!state.muted;
    if (el && state.track !== prevTrack) {
      el.pause();
      el = null;
      if (started) play();
    }
    applyVolume();
    if (started && el && el.paused && !state.muted) el.play().catch(() => {});
    save();
  }

  // 브라우저 정책상 첫 입력 이후에 재생을 시작한다
  const unlock = () => {
    started = true;
    if (!el || el.paused) play();
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, unlock, { passive: true }));

  window.addEventListener('DOMContentLoaded', () => {
    syncButton();
    const b = document.getElementById('soundBtn');
    if (b) b.onclick = () => { unlock(); set({ muted: !state.muted }); };
  });

  window.WFAudio = {
    tracks: TRACKS,
    get: () => Object.assign({}, state),
    set,
    onChange: fn => listeners.push(fn)
  };
})();
