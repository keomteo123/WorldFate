// 화면 아래 도구 막대. 탭을 누르면 그 위에 도구 칸이 열린다.
//  - 보기: 권능을 끄고 '국가를 눌러 정보 확인' 상태로 돌아간다. 칸에는 지도 모드와 군대 표시 전환이 있다.
//  - 그 밖의 탭: 권능을 고른 뒤 지도를 누르면 국가를 선택하지 않아도 그 자리에 바로 발동한다.
//    외교 권능 가운데 pair가 붙은 것은 두 나라를 차례로 누른다 (전쟁 선포 → 가 국 → 나 국).
//  - 실제 효과는 game.js의 applyPower가 맡는다. 여기서는 WFGame.setPower(이름)으로 무엇을 쓸지만 알려 준다.
//  - 권능을 더하려면 아래 CATS에 한 줄 추가하고, game.js의 applyPower에 같은 id의 처리를 넣으면 된다.
//  - icon은 icons.js의 아이콘 이름이다. 글자는 한국어로만 쓴다 (i18n.js가 화면에서 자동 번역).
(() => {
  // on: 'map'이면 아무 곳이나, 없으면 나라를 눌러야 한다 (안내 문구만 달라진다)
  // kind: 'layer' 지도 모드(하나만 켜짐) · 'toggle' 켜고 끄는 표시 — 이 둘은 권능이 아니라 누르면 바로 바뀐다
  const CATS = {
    view: [
      { id: 'political', icon: 'flag', name: '국가', kind: 'layer' },
      { id: 'alliance', icon: 'union', name: '연맹', kind: 'layer' },
      { id: 'species', icon: 'pop', name: '종족', kind: 'layer' },
      { id: 'religion', icon: 'temple', name: '종교', kind: 'layer' },
      { id: 'armies', icon: 'units', name: '군대 표시', kind: 'toggle' }
    ],
    disaster: [
      { id: 'quake', icon: 'quake', name: '지진', on: 'map' },
      { id: 'storm', icon: 'storm', name: '태풍', on: 'map' },
      { id: 'drought', icon: 'drought', name: '가뭄', on: 'map' },
      { id: 'flood', icon: 'flood', name: '홍수', on: 'map' },
      { id: 'plague', icon: 'plague', name: '전염병' },
      { id: 'volcano', icon: 'volcano', name: '화산', on: 'map' },
      { id: 'meteor', icon: 'meteor', name: '운석', on: 'map' },
      { id: 'lightning', icon: 'lightning', name: '번개', on: 'map' }
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
    diplomacy: [
      { id: 'dipWar', icon: 'swords', name: '전쟁 선포', pair: true },
      { id: 'dipPeace', icon: 'treaty', name: '평화 조약', pair: true },
      { id: 'dipAlly', icon: 'link', name: '동맹 맺기', pair: true },
      { id: 'dipBreak', icon: 'unlink', name: '동맹 해체' },
      { id: 'dipColonize', icon: 'colonize', name: '식민지화', pair: true },
      { id: 'dipRelease', icon: 'release', name: '식민지 해방' }
    ],
    fate: [
      { id: 'spawn', icon: 'spawn', name: '국가 생성', on: 'map' },
      { id: 'forceWar', icon: 'war', name: '전쟁 강제' },
      { id: 'forcePeace', icon: 'peace', name: '평화 강제' },
      { id: 'collapse', icon: 'collapse', name: '국가 붕괴' }
    ]
  };
  // 권능이 듣지 않았을 때 누른 자리에 띄우는 말 (game.js의 applyPower가 돌려주는 why)
  const FAIL = {
    nation: '국가가 없는 곳이에요',
    land: '육지에만 세울 수 있어요',
    ally: '같은 동맹끼리는 싸울 수 없어요',
    atwar: '이미 전쟁 중이에요',
    nowar: '두 나라는 전쟁 중이 아니에요',
    nowars: '전쟁 중인 나라가 아니에요',
    nofoe: '주변에 싸울 나라가 없어요',
    allied: '이미 같은 동맹이에요',
    twoGroups: '서로 다른 동맹에 속해 있어요',
    full: '동맹이 가득 찼어요',
    noally: '동맹이 없는 나라예요',
    colOff: '설정에서 식민지가 꺼져 있어요',
    subject: '이미 종속 관계인 나라예요',
    weak: '국력·기술 격차가 부족해요',
    nocolony: '식민지가 아닌 나라예요'
  };

  const $ = id => document.getElementById(id);
  const G = window.WFGame, icons = window.WFIcons;
  const tray = $('dockTray'), hint = $('dockHint');
  const tabs = [...document.querySelectorAll('#dockTabs .dkTab[data-cat]')];
  const byId = {};
  for (const cat in CATS) for (const t of CATS[cat]) { t.cat = cat; if (!t.kind) byId[t.id] = t; }

  let openCat = null; // 도구 칸이 열려 있는 탭
  let armed = null;   // 지금 켜져 있는 권능 (null이면 보기)
  let pick = null;    // 외교 권능에서 먼저 고른 나라의 이름

  function tile(t) {
    const b = document.createElement('button');
    b.className = 'dkTool';
    const i = document.createElement('i'); i.innerHTML = icons.svg(t.icon);
    const s = document.createElement('span'); s.textContent = t.name;
    b.append(i, s);
    if (t.kind === 'layer') {
      b.classList.toggle('on', G.getLayer() === t.id);
      b.onclick = () => G.setLayer(t.id); // 바뀌면 game.js가 'wf:view'를 알려 주고, 그때 칸을 다시 그린다
    } else if (t.kind === 'toggle') {
      const on = G.getShowArmies();
      b.classList.add('toggle', on ? 'on' : 'off');
      b.onclick = () => G.setShowArmies(!on);
    } else {
      if (t.sign) b.dataset.sign = t.sign;
      b.classList.toggle('armed', armed === t);
      b.onclick = () => { armed = armed === t ? null : t; pick = null; sync(); };
    }
    return b;
  }

  function renderTray() {
    tray.classList.toggle('open', !!openCat);
    tray.textContent = '';
    if (!openCat) return;
    let prev = null;
    for (const t of CATS[openCat]) {
      if (prev && prev.kind !== t.kind) { const sep = document.createElement('span'); sep.className = 'dkSep'; tray.appendChild(sep); }
      tray.appendChild(tile(t));
      prev = t;
    }
  }

  function renderHint() {
    hint.classList.toggle('open', !!armed);
    if (!armed) return;
    $('dockHintIcon').innerHTML = icons.svg(armed.icon);
    $('dockHintName').textContent = armed.name;
    $('dockHintPick').textContent = pick || '';
    $('dockHintText').textContent = armed.pair ? (pick ? '상대 나라를 누르세요' : '첫 번째 나라를 누르세요')
      : armed.on === 'map' ? '지도를 눌러 발동' : '나라를 눌러 발동';
  }

  function sync() {
    for (const b of tabs) {
      const cat = b.dataset.cat;
      b.classList.toggle('active', cat === 'view' ? !armed : openCat === cat);
      b.classList.toggle('armed', !!armed && armed.cat === cat);
    }
    renderTray();
    renderHint();
    if (G.getPower() !== (armed ? armed.id : null)) G.setPower(armed ? armed.id : null);
  }

  function disarm() { armed = null; pick = null; openCat = null; sync(); }

  for (const b of tabs) {
    b.addEventListener('click', () => {
      const cat = b.dataset.cat;
      if (cat === 'view') { armed = null; pick = null; } // 보기 = 권능을 끄고 국가를 눌러 살펴보는 상태
      openCat = openCat === cat ? null : cat;             // 같은 탭을 다시 누르면 칸만 접는다 (권능은 켜진 채)
      if (openCat && window.WFPanels) window.WFPanels.close();
      sync();
    });
  }
  $('dockHintClose').onclick = disarm;
  window.addEventListener('wf:panel-open', () => { if (openCat) { openCat = null; sync(); } });
  // 지도 모드 · 군대 표시가 바뀌었거나, 세계를 새로 만들었거나 불러왔다
  window.addEventListener('wf:view', () => { pick = null; if (openCat === 'view') renderTray(); renderHint(); });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && (armed || openCat) && !document.body.classList.contains('modal-open')) disarm();
  });

  // 권능을 쓴 결과. 성공한 모습은 캔버스 연출(fx.js)이 보여 주고, 여기서는 안내 문구와 실패한 까닭만 다룬다.
  window.addEventListener('wf:power', e => {
    const d = e.detail;
    if (d.step === 1) pick = d.name; else if (d.step === 0 || d.step === 2) pick = null;
    renderHint();
    if (d.ok || !FAIL[d.why]) return;
    const el = document.createElement('div');
    el.className = 'pfx fail';
    el.style.left = d.x + 'px';
    el.style.top = (d.y - 26) + 'px';
    const c = document.createElement('span');
    c.textContent = FAIL[d.why];
    el.appendChild(c);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  });

  sync();
})();
