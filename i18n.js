// 번역 엔진. 게임 문구의 원본은 한국어이고, 화면에 나타나는 글(DOM)을 선택한 언어로 바꿔 준다.
//  - 사전(i18n-data.js): [한국어, en, 简体, 繁體, 日本語, Русский, Türkçe, Français, Deutsch, Español, Português]
//    한국어 문구에 {0} {1}이 있으면 패턴(로그 문장 등)으로 쓰인다.
//  - 국가 이름은 브라우저의 Intl.DisplayNames로 자동 번역한다.
//  - MutationObserver가 새로 생기거나 바뀐 글자를 자동으로 번역하므로 다른 코드는 한국어만 쓰면 된다.
(() => {
  const LANGS = [
    { id: 'ko', name: '한국어', idx: 0, intl: 'ko' },
    { id: 'en-GB', name: 'English (UK)', idx: 1, intl: 'en-GB' },
    { id: 'en-US', name: 'English (US)', idx: 1, intl: 'en-US' },
    { id: 'zh-CN', name: '中文 (简体)', idx: 2, intl: 'zh-CN' },
    { id: 'zh-TW', name: '中文 (繁體)', idx: 3, intl: 'zh-TW' },
    { id: 'ja', name: '日本語', idx: 4, intl: 'ja' },
    { id: 'ru', name: 'Русский', idx: 5, intl: 'ru' },
    { id: 'tr', name: 'Türkçe', idx: 6, intl: 'tr' },
    { id: 'fr', name: 'Français', idx: 7, intl: 'fr' },
    { id: 'de', name: 'Deutsch', idx: 8, intl: 'de' },
    { id: 'es', name: 'Español', idx: 9, intl: 'es' },
    { id: 'pt', name: 'Português', idx: 10, intl: 'pt' }
  ];
  const KEY = 'wf_lang';

  // 영국식 철자 (사전은 미국식으로 쓰여 있다)
  const GB = [['color', 'colour'], ['Color', 'Colour'], ['defense', 'defence'], ['Defense', 'Defence'], ['center', 'centre'], ['neighbor', 'neighbour'],
    ['honor', 'honour'], ['labor', 'labour'], ['favor', 'favour'], ['civilization', 'civilisation'], ['organize', 'organise'], ['gray', 'grey'],
    ['harbor', 'harbour'], ['plow', 'plough'], ['analyze', 'analyse'], ['program', 'programme'], ['catalog', 'catalogue'], ['fulfill', 'fulfil'],
    ['artifact', 'artefact'], ['recognized', 'recognised'], ['independence', 'independence']];

  function detect() {
    const n = (navigator.language || 'ko').toLowerCase();
    if (n.startsWith('ko')) return 'ko';
    if (n.startsWith('en-gb') || n === 'en-au' || n === 'en-nz' || n === 'en-ie') return 'en-GB';
    if (n.startsWith('en')) return 'en-US';
    if (n.startsWith('zh')) return /tw|hk|mo|hant/.test(n) ? 'zh-TW' : 'zh-CN';
    const base = n.slice(0, 2);
    return LANGS.some(l => l.id === base) ? base : 'en-US';
  }

  let langId = 'ko';
  try { langId = localStorage.getItem(KEY) || ''; } catch (e) {}
  if (!LANGS.some(l => l.id === langId)) langId = detect();
  let L = LANGS.find(l => l.id === langId);

  // ---------- 사전 ----------
  const exact = new Map();
  let patterns = [];
  const names = new Map(); // 한국어 국가명 → ISO 코드
  let regionNames = null;
  const cache = new Map();

  function addRows(rows) {
    for (const r of rows) {
      if (/\{#?\d+\}/.test(r[0])) {
        const parts = r[0].split(/\{(#?)(\d+)\}/); // [lit, hash, num, lit, hash, num, ...]
        const order = [];
        let src = '';
        for (let i = 0; i < parts.length; i += 3) {
          src += parts[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          if (i + 2 < parts.length) { src += parts[i + 1] ? '(\\d+)' : '(.+?)'; order.push(Number(parts[i + 2])); }
        }
        patterns.push({ re: new RegExp('^' + src + '$', 's'), order, row: r, weight: r[0].replace(/\{#?\d+\}/g, '').length });
      } else exact.set(r[0], r);
    }
    patterns.sort((a, b) => b.weight - a.weight);
  }
  function addNames(str) {
    for (const pair of str.split(',')) { const [k, v] = pair.split(':'); if (k) names.set(k.trim(), v.trim()); }
  }

  function regionName(ko) {
    const code = names.get(ko);
    if (!code) return null;
    try {
      if (!regionNames || regionNames.lang !== L.intl) regionNames = { lang: L.intl, dn: new Intl.DisplayNames([L.intl], { type: 'region' }) };
      const v = regionNames.dn.of(code);
      return v && v !== code ? v : null;
    } catch (e) { return null; }
  }

  // 언어별 보정: 이름 뒤 격변화·접미사 때문에 어색해지는 문장을 따로 고친다
  const overrides = {};
  function addOverrides(idx, obj) { overrides[idx] = Object.assign(overrides[idx] || {}, obj); }

  function pick(row) {
    let v = overrides[L.idx] && overrides[L.idx][row[0]];
    if (v == null) v = row[L.idx];
    if (v == null || v === '') v = row[1] != null ? row[1] : row[0];
    if (L.id === 'en-GB') for (const [a, b] of GB) v = v.split(a).join(b);
    return v;
  }

  // ---------- 번역 ----------
  function trCore(text, depth) {
    const hit = exact.get(text);
    if (hit) return pick(hit);
    const nm = regionName(text);
    if (nm) return nm;
    if (depth < 3) {
      for (const p of patterns) {
        const m = p.re.exec(text);
        if (!m) continue;
        const params = [];
        p.order.forEach((num, i) => { params[num] = trPiece(m[i + 1], depth + 1); });
        return pick(p.row).replace(/\{(\d+)\}/g, (_, k) => (params[k] != null ? params[k] : ''));
      }
    }
    return null;
  }

  // 구분자(' · ' ', ')로 이어진 글자와 앞쪽 기호(이모지 등)를 처리한다
  function trPiece(text, depth) {
    const t = text.trim();
    if (!t) return text;
    const lead = text.slice(0, text.indexOf(t)), trail = text.slice(text.indexOf(t) + t.length);
    let out = trCore(t, depth);
    if (out == null) {
      const m = /^([^\p{L}\p{N}{]+)(.+)$/u.exec(t);
      if (m) { const r = trCore(m[2], depth); if (r != null) out = m[1] + r; }
    }
    if (out == null && depth < 3) {
      for (const sep of [' · ', ', ', ' / ']) {
        if (!t.includes(sep)) continue;
        const parts = t.split(sep);
        const tp = parts.map(x => trPiece(x, depth + 1));
        if (tp.some((x, i) => x !== parts[i])) { out = tp.join(sep); break; }
      }
    }
    return out == null ? text : lead + out + trail;
  }

  function tr(text) {
    if (typeof text !== 'string' || L.id === 'ko' || !text) return text;
    const key = L.id + '\u0001' + text;
    let v = cache.get(key);
    if (v === undefined) {
      v = trPiece(text, 0);
      if (cache.size > 4000) cache.clear();
      cache.set(key, v);
    }
    return v;
  }

  // ---------- 화면(DOM) ----------
  const nodeSrc = new WeakMap(); // 글자 노드 → { src, out }
  const attrSrc = new WeakMap(); // 요소 → { 속성: { src, out } }
  const ATTRS = ['placeholder', 'title'];
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CANVAS']);

  function skipEl(el) {
    for (let e = el; e; e = e.parentElement) {
      if (SKIP.has(e.tagName) || e.hasAttribute && e.hasAttribute('data-noi18n') || e.id === 'termsDlg' || e.id === 'stLang') return true;
    }
    return false;
  }

  function doText(node) {
    if (!node.parentElement || skipEl(node.parentElement)) return;
    const st = nodeSrc.get(node);
    const cur = node.data;
    let src;
    if (st && cur === st.out) src = st.src; else src = cur;
    const out = L.id === 'ko' ? src : tr(src);
    if (out === src && !st) return;
    nodeSrc.set(node, { src, out });
    if (out !== cur) node.data = out;
  }

  function doAttrs(el) {
    if (skipEl(el)) return;
    for (const a of ATTRS) {
      if (!el.hasAttribute(a)) continue;
      let map = attrSrc.get(el);
      if (!map) { map = {}; attrSrc.set(el, map); }
      const cur = el.getAttribute(a), st = map[a];
      const src = st && cur === st.out ? st.src : cur;
      const out = L.id === 'ko' ? src : tr(src);
      if (out === src && !st) continue;
      map[a] = { src, out };
      if (out !== cur) el.setAttribute(a, out);
    }
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1) return;
    if (SKIP.has(root.tagName)) return;
    doAttrs(root);
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 3) doText(n); else doAttrs(n);
    }
  }

  let observer = null;
  function observe() {
    if (observer) return;
    observer = new MutationObserver(recs => {
      for (const r of recs) {
        if (r.type === 'characterData') doText(r.target);
        else if (r.type === 'attributes') doAttrs(r.target);
        else for (const n of r.addedNodes) walk(n);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  // ---------- 선택 ----------
  function renderPicker() {
    const sel = document.getElementById('stLang');
    if (!sel) return;
    if (!sel.options.length) for (const l of LANGS) sel.add(new Option(l.name, l.id));
    sel.value = L.id;
  }

  function set(id) {
    const next = LANGS.find(l => l.id === id);
    if (!next) return;
    L = next; langId = id;
    try { localStorage.setItem(KEY, id); } catch (e) {}
    cache.clear();
    regionNames = null;
    document.documentElement.lang = id;
    walk(document.body);
    renderPicker();
    window.dispatchEvent(new Event('wf-lang'));
  }

  // alert/confirm 도 번역한다
  const _alert = window.alert.bind(window), _confirm = window.confirm.bind(window);
  window.alert = m => _alert(tr(String(m)));
  window.confirm = m => _confirm(tr(String(m)));

  window.WFI18n = { langs: LANGS, tr, set, get: () => L.id, addRows, addNames, addOverrides, renderPicker };

  function start() {
    document.documentElement.lang = L.id;
    renderPicker();
    walk(document.body);
    observe();
  }
  // 사전(i18n-data.js)은 이 파일 다음에 로드되어 addRows를 부른다. 모든 스크립트가 로드된 뒤 처음 번역한다.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 0));
  else setTimeout(start, 0);
})();
