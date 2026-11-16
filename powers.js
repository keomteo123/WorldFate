// 신의 권능 도구 막대. 권능을 고른 뒤 지도를 누르면 국가를 선택하지 않아도 그 자리에 바로 발동한다.
//  - 실제 효과는 game.js의 applyPower가 맡는다. 여기서는 WFGame.setPower(이름)으로 무엇을 쓸지만 알려 준다.
//  - 권능을 더하려면 아래 CATS에 한 줄 추가하고, game.js의 applyPower에 같은 id의 처리를 넣으면 된다.
//  - icon은 icons.js의 아이콘 이름이다.
//  - 글자는 한국어로만 쓴다 (i18n.js가 화면에서 자동 번역).
(() => {
  const CATS = {
    disaster: [
      { id: 'quake', icon: 'quake', name: '지진' },
      { id: 'storm', icon: 'storm', name: '폭풍' },
      { id: 'flood', icon: 'flood', name: '홍수' },
      { id: 'drought', icon: 'drought', name: '가뭄' },
      { id: 'volcano', icon: 'volcano', name: '화산' },
      { id: 'plague', icon: 'plague', name: '역병' }
    ],
    bless: [
      { id: 'popUp', icon: 'pop', name: '인구 +10%', sign: '+' },
      { id: 'armyUp', icon: 'army', name: '군대 +10%', sign: '+' },
      { id: 'goldUp', icon: 'gold', name: '골드 +20%', sign: '+' },
      { id: 'techUp', icon: 'tech', name: '기술 +10', sign: '+' }
    ],
    curse: [
      { id: 'popDown', icon: 'pop', name: '인구 -10%', sign: '−' },
      { id: 'armyDown', icon: 'army', name: '군대 -10%', sign: '−' },
      { id: 'goldDown', icon: 'gold', name: '골드 -20%', sign: '−' },
      { id: 'techDown', icon: 'tech', name: '기술 -10', sign: '−' }
    ],
    fate: [
      { id: 'spawn', icon: 'spawn', name: '국가 생성' },
      { id: 'forceWar', icon: 'war', name: '전쟁 강제' },
      { id: 'forcePeace', icon: 'peace', name: '평화 강제' },
      { id: 'collapse', icon: 'collapse', name: '국가 붕괴' }
    ]
  };
  const FAIL = { nation: '국가가 없는 곳이에요', land: '육지에만 세울 수 있어요' };

  const $ = id => document.getElementById(id);
  const tray = $('dockTray'), hint = $('dockHint');
  const tabs = [...document.querySelectorAll('#dockTabs .dkTab:not(.dkPanel)')];
  const byId = {};
  for (const cat in CATS) for (const t of CATS[cat]) { t.cat = cat; byId[t.id] = t; }

  let openCat = null; // 권능 칸이 열려 있는 분류
  let armed = null;   // 지금 켜져 있는 권능 (null이면 살펴보기)

  function renderTray() {
    tray.classList.toggle('open', !!openCat);
    tray.textContent = '';
    if (!openCat) return;
    for (const t of CATS[openCat]) {
      const b = document.createElement('button');
      b.className = 'dkTool' + (armed === t ? ' armed' : '');
      if (t.sign) b.dataset.sign = t.sign;
      const i = document.createElement('i'); i.innerHTML = window.WFIcons.svg(t.icon);
      const s = document.createElement('span'); s.textContent = t.name;
      b.append(i, s);
      b.onclick = () => { armed = armed === t ? null : t; sync(); };
      tray.appendChild(b);
    }
  }

  function sync() {
    for (const b of tabs) {
      const cat = b.dataset.cat;
      b.classList.toggle('active', cat ? openCat === cat : !armed);
      b.classList.toggle('armed', !!cat && !!armed && armed.cat === cat);
    }
    renderTray();
    hint.classList.toggle('open', !!armed);
    if (armed) {
      $('dockHintIcon').innerHTML = window.WFIcons.svg(armed.icon);
      $('dockHintName').textContent = armed.name;
    }
    window.WFGame.setPower(armed ? armed.id : null);
  }

  function disarm() { armed = null; openCat = null; sync(); }

  for (const b of tabs) {
    b.addEventListener('click', () => {
      if (b.dataset.tool === 'inspect') { disarm(); return; }
      openCat = openCat === b.dataset.cat ? null : b.dataset.cat; // 같은 탭을 다시 누르면 칸만 접는다 (권능은 켜진 채)
      if (openCat && window.WFPanels) window.WFPanels.close();
      sync();
    });
  }
  $('dockHintClose').onclick = disarm;
  window.addEventListener('wf:panel-open', () => { if (openCat) { openCat = null; sync(); } });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && (armed || openCat) && !document.body.classList.contains('modal-open')) disarm();
  });

  // 권능을 쓴 자리에 잠깐 효과를 띄운다 (실패하면 이유를 알려 준다)
  window.addEventListener('wf:power', e => {
    const d = e.detail, t = byId[d.kind];
    if (!d.ok && !FAIL[d.why]) return;
    const el = document.createElement('div');
    el.className = 'pfx' + (d.ok ? '' : ' fail');
    el.style.left = d.x + 'px';
    el.style.top = (d.ok ? d.y : d.y - 26) + 'px';
    const c = document.createElement(d.ok ? 'i' : 'span');
    if (d.ok) c.innerHTML = window.WFIcons.svg(t ? t.icon : 'bless'); else c.textContent = FAIL[d.why];
    el.appendChild(c);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  });

  sync();
})();
