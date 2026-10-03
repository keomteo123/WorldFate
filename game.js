(() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  const ui = {
    year: document.getElementById('year'),
    stats: document.getElementById('stats'),
    selectedBox: document.getElementById('selectedBox'),
    godPanel: document.getElementById('godPanel'),
    worldInfo: document.getElementById('worldInfo'),
    logs: document.getElementById('logs'),
    relationTarget: document.getElementById('relationTarget'),
    modal: document.getElementById('modal'),
    nationInput: document.getElementById('nationInput'),
    nationIdeology: document.getElementById('nationIdeology'),
    nationSpecies: document.getElementById('nationSpecies'),
    renameInput: document.getElementById('renameInput'),
    pause: document.getElementById('pause'),
  };

  const MAP_W = 1200;
  const MAP_H = 720;
  const nationNames = [
  '가나', '가봉', '가이아나', '감비아', '과테말라', '그레나다', '그리스', '기니', '기니비사우', '나미비아',
  '나우루', '나이지리아', '남수단', '남아프리카공화국', '네덜란드', '네팔', '노르웨이', '뉴질랜드', '니제르', '니카라과',
  '대한민국', '덴마크', '도미니카공화국', '도미니카연방', '독일', '동티모르', '라오스', '라이베리아', '라트비아', '러시아',
  '레바논', '레소토', '루마니아', '룩셈부르크', '르완다', '리비아', '리투아니아', '리히텐슈타인', '마다가스카르', '마셜제도',
  '마이크로네시아', '마케도니아', '말라위', '말레이시아', '말리', '몰타', '몰디브', '몰도바', '모로코', '모리셔스',
  '모리타니', '모나코', '몬테네그로', '몽골', '미얀마', '미국', '바누아투', '바레인', '바베이도스', '바하마',
  '방글라데시', '방글라데시', '바티칸시국', '벨기에', '벨리즈', '벨라루스', '베냉', '베네수엘라', '베트남', '부탄',
  '북한', '부르키나파소', '부룬디', '불가리아', '브라질', '브루나이', '사모아', '사우디아라비아', '산마리노', '상투메프린시페',
  '세네갈', '세르비아', '세이셸', '세인트루시아', '세인트빈센트그레나딘', '세인트키츠네비스', '소말리아', '솔로몬제도', '수단', '수리남',
  '스리랑카', '스웨덴', '스위스', '스페인', '슬로바키아', '슬로베니아', '시리아', '시에라리온', '싱가포르', '아랍에미리트',
  '아르메니아', '아르헨티나', '아이슬란드', '아이티', '아일랜드', '아제르바이잔', '아프가니스탄', '안도라', '알바니아', '알제리',
  '앙골라', '앤티가바부다', '에리트레아', '에스토니아', '에스와티니', '에티오피아', '에콰도르', '엘살바도르', '영국', '예멘',
  '오만', '오스트리아', '오스트레일리아', '온두라스', '요르단', '우간다', '우루과이', '우즈베키스탄', '우크라이나', '이라크',
  '이란', '이스라엘', '이집트', '이탈리아', '인도', '인도네시아', '일본', '자메이카', '잠비아', '적도기니',
  '조지아', '중국', '중앙아프리카공화국', '지부티', '짐바브웨', '차드', '체코', '칠레', '카메룬', '카보베르데',
  '카자흐스탄', '카타르', '캄보디아', '캐나다', '케냐', '코모로', '코스타리카', '코트디부아르', '콜롬비아', '콩고공화국',
  '콩고민주공화국', '쿠바', '쿠웨이트', '크로아티아', '키르기스스탄', '키리바시', '키프로스', '타지키스탄', '탄자니아', '태국',
  '대만', '토고', '통가', '투르크메니스탄', '투발루', '튀니지', '튀르키예', '트리니다드토바고', '파나마', '파라과이',
  '파키스탄', '파푸아뉴기니', '팔라우', '팔레스타인', '페루', '포르투갈', '폴란드', '프랑스', '피지', '핀란드',
  '필리핀', '헝가리'
];

  const species = ['인간','엘프','드워프','오크','수인','혼혈족','정령족','거인족'];
  const IDEOLOGIES = ['군주제', '공화정', '연방제', '부족연맹', '도시국가', '신권정'];
  const colors = ['#c75c5c','#5c86c7','#d29a4c','#6ca66b','#9b68b0','#4bafa9','#c7669b','#8b9d5c','#6d76bd','#b66d4f','#5797a9','#ad795b','#7a9dca','#a96c99','#6b9b73','#c49a58','#6d8c9e','#b66b6b','#7773ad','#8a9b65','#aa775e','#5c9c8e','#ad6680','#7b7fb5'];
  const religionColor = {
    신앙: '#d2b86a',
    계율: '#8ca2ff',
    천지: '#69c07c',
    조선: '#a67ccf',
    베헬라: '#ffc76a',
    달: '#a0c5ff',
    전사: '#d86a6a',
    가톨릭: '#d9b84a', 개신교: '#5c86c7', 정교회: '#8b5ea8', 이슬람: '#3f9a5a', 불교: '#e0883a',
    힌두교: '#d9573a', 유교: '#b04a4a', 신토: '#e8e0d0', 토착신앙: '#8a7a5a', 유대교: '#4aa0d9', 도교: '#4bafa9'
  };
  const RESOURCE_ICON = {
    철: '⛓',
    금: '⛏',
    곡물: '🌾',
    목재: '🌲',
    석유: '🛢',
    비단: '🧵',
    보석: '💎',
    낙농: '🐄'
  };

  let W = window.innerWidth;
  let H = window.innerHeight;
  let worldCanvas = document.createElement('canvas');
  worldCanvas.width = MAP_W;
  worldCanvas.height = MAP_H;
  let wctx = worldCanvas.getContext('2d', { alpha: false });

  let land = new Uint8Array(MAP_W * MAP_H);
  let terrain = new Uint8Array(MAP_W * MAP_H);
  let owner = new Int16Array(MAP_W * MAP_H);
  let cellsCost = new Float32Array(MAP_W * MAP_H);

  let nations = [];
  let wars = [];
  let events = [];
  let alliances = [];
  let year = 1;
  let paused = false;
  let speed = 1;
  let selected = -1;
  let targetId = -1;
  let layer = 'political';
  let accumulator = 0;
  let seed = Math.floor(Math.random() * 999999);
  let currentMap = { id: 'random', name: '랜덤 대륙', kind: 'procedural', style: 'continents', latAt: null };
  let initialNationCount = 14; // 세계 생성 시 국가 수 (반란으로 늘어나는 국가 수의 상한 계산용)
  let gameStarted = false; // 홈 화면의 배경 데모가 아니라 실제 게임이 시작됐는지
  let rng = mulberry32(seed);
  let needsClaimFix = false;
  let selectionBorder = [];
  let selectionPath = null;
  let armyUnits = [];
  let warArrows = [];

  let camera = { x: 0, y: 0, zoom: 1 };
  let dragging = false;
  let dragX = 0, dragY = 0;
  let lastTime = performance.now();

  function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function rand(a = 0, b = 1) { return a + rng() * (b - a); }
  function irand(a, b) { return Math.floor(rand(a, b + 1)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function idx(x, y) { return y * MAP_W + x; }
  function inside(x, y) { return x >= 0 && y >= 0 && x < MAP_W && y < MAP_H; }
  function noise(x, y) { const n = Math.sin(x * 127.1 + y * 311.7 + seed * 0.013) * 43758.5453; return n - Math.floor(n); }
  function smoothNoise(x, y) {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const xf = x - x0, yf = y - y0;
    const a = noise(x0, y0), b = noise(x0 + 1, y0), c = noise(x0, y0 + 1), d = noise(x0 + 1, y0 + 1);
    const sx = xf * xf * (3 - 2 * xf);
    const sy = yf * yf * (3 - 2 * yf);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }
  function fbm(x, y) {
    let v = 0, amp = 0.5, f = 1;
    for (let i = 0; i < 5; i++) {
      v += smoothNoise(x * f, y * f) * amp;
      f *= 2;
      amp *= 0.5;
    }
    return v;
  }

  function countLand() {
    let sum = 0;
    for (let i = 0; i < land.length; i++) sum += land[i];
    return sum;
  }

  function getLandComponents() {
    const seen = new Uint8Array(MAP_W * MAP_H);
    const comps = [];
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const i = idx(x, y);
        if (!land[i] || seen[i]) continue;
        const queue = [[x, y]];
        seen[i] = 1;
        let area = 0;
        while (queue.length) {
          const [cx, cy] = queue.pop();
          area++;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = cx + dx, ny = cy + dy;
            if (!inside(nx, ny)) continue;
            const ni = idx(nx, ny);
            if (land[ni] && !seen[ni]) {
              seen[ni] = 1;
              queue.push([nx, ny]);
            }
          }
        }
        comps.push(area);
      }
    }
    return comps;
  }

  // 큰 대륙 중심 생성: 1~3개의 거대 대륙 + 소수의 섬.
  // 노이즈 필드를 만들고, 목표 육지 비율에 맞는 임계값을 분위수로 정한다.
  const LAND_STYLES = {
    continents:  { centers: () => 1 + irand(0, 2), xr: [0.24, 0.76], yr: [0.32, 0.68], rx: [240, 400], ry: [170, 270], gap: 380, ratio: [0.38, 0.06], noise: 0.5, minIsland: 900, islands: [6, 10], islandR: [9, 24] },
    pangaea:     { centers: () => 1, xr: [0.4, 0.6], yr: [0.42, 0.58], rx: [420, 520], ry: [250, 320], gap: 0, ratio: [0.46, 0.04], noise: 0.45, minIsland: 900, islands: [4, 6], islandR: [9, 20] },
    archipelago: { centers: () => 5 + irand(0, 2), xr: [0.14, 0.86], yr: [0.2, 0.8], rx: [110, 210], ry: [80, 150], gap: 200, ratio: [0.28, 0.04], noise: 0.75, minIsland: 250, islands: [24, 20], islandR: [7, 22] }
  };

  function generateLand(style = 'continents') {
    land.fill(0);
    const N = MAP_W * MAP_H;
    const cfg = LAND_STYLES[style] || LAND_STYLES.continents;

    const centers = [];
    const wanted = cfg.centers();
    for (let tries = 0; tries < 120 && centers.length < wanted; tries++) {
      const c = {
        x: rand(cfg.xr[0], cfg.xr[1]) * MAP_W,
        y: rand(cfg.yr[0], cfg.yr[1]) * MAP_H,
        rx: rand(cfg.rx[0], cfg.rx[1]),
        ry: rand(cfg.ry[0], cfg.ry[1]),
        strength: rand(0.9, 1.2)
      };
      if (centers.every(o => Math.hypot(o.x - c.x, o.y - c.y) > cfg.gap)) centers.push(c);
    }
    if (!centers.length) centers.push({ x: MAP_W / 2, y: MAP_H / 2, rx: 380, ry: 250, strength: 1 });

    const field = new Float32Array(N);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const nx = x / MAP_W, ny = y / MAP_H;
        // 도메인 워핑으로 해안선을 굴곡지게
        const wx = x + (fbm(nx * 4.2 + 5.1, ny * 4.2 + 8.3) - 0.5) * 170;
        const wy = y + (fbm(nx * 4.2 + 17.7, ny * 4.2 + 3.9) - 0.5) * 170;
        let v = 0;
        for (const c of centers) {
          const d = Math.hypot((wx - c.x) / c.rx, (wy - c.y) / c.ry);
          v += Math.max(0, 1 - d) * c.strength;
        }
        v += (fbm(nx * 3.4 + 1.7, ny * 3.4 + 2.1) - 0.5) * cfg.noise;
        v += (fbm(nx * 10 + 9.3, ny * 10 + 15.9) - 0.5) * 0.14;
        const edge = Math.min(x, y, MAP_W - 1 - x, MAP_H - 1 - y) / 70;
        v -= (1 - clamp(edge, 0, 1)) * 0.6;
        field[idx(x, y)] = v;
      }
    }

    const targetRatio = cfg.ratio[0] + rand(0, cfg.ratio[1]);
    const sorted = Float32Array.from(field).sort();
    const threshold = sorted[Math.floor((1 - targetRatio) * N)];
    for (let i = 0; i < N; i++) land[i] = field[i] > threshold ? 1 : 0;

    smoothLand(2);
    mergeTinyIslands(cfg.minIsland);
    fillTinyLakes(260);

    // 외딴 섬 (대륙 해안 바깥에 점점이)
    const islandCount = cfg.islands[0] + irand(0, cfg.islands[1]);
    for (let k = 0; k < islandCount; k++) {
      const cx = irand(60, MAP_W - 60);
      const cy = irand(60, MAP_H - 60);
      const r = irand(cfg.islandR[0], cfg.islandR[1]);
      for (let yy = Math.max(1, cy - r); yy < Math.min(MAP_H - 1, cy + r); yy++) {
        for (let xx = Math.max(1, cx - r); xx < Math.min(MAP_W - 1, cx + r); xx++) {
          const d = Math.hypot(xx - cx, yy - cy) / r;
          const bump = (fbm(xx * 0.06 + k * 7, yy * 0.06 + k * 3) - 0.5) * 0.7;
          if (d + bump < 0.85) land[idx(xx, yy)] = 1;
        }
      }
    }
    smoothLand(1);
    mergeTinyIslands(120);
  }

  function fillTinyLakes(maxSize) {
    const seen = new Uint8Array(MAP_W * MAP_H);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const i = idx(x, y);
        if (land[i] || seen[i]) continue;
        const stack = [i];
        const cells = [];
        let touchesEdge = false;
        seen[i] = 1;
        while (stack.length) {
          const c = stack.pop();
          cells.push(c);
          const cx = c % MAP_W, cy = (c - cx) / MAP_W;
          if (cx === 0 || cy === 0 || cx === MAP_W - 1 || cy === MAP_H - 1) touchesEdge = true;
          if (cx > 0 && !land[c - 1] && !seen[c - 1]) { seen[c - 1] = 1; stack.push(c - 1); }
          if (cx < MAP_W - 1 && !land[c + 1] && !seen[c + 1]) { seen[c + 1] = 1; stack.push(c + 1); }
          if (cy > 0 && !land[c - MAP_W] && !seen[c - MAP_W]) { seen[c - MAP_W] = 1; stack.push(c - MAP_W); }
          if (cy < MAP_H - 1 && !land[c + MAP_W] && !seen[c + MAP_W]) { seen[c + MAP_W] = 1; stack.push(c + MAP_W); }
        }
        if (!touchesEdge && cells.length < maxSize) for (const c of cells) land[c] = 1;
      }
    }
  }


  function smoothLand(iterations = 2) {
    for (let pass = 0; pass < iterations; pass++) {
      const next = new Uint8Array(land.length);
      for (let y = 1; y < MAP_H - 1; y++) {
        for (let x = 1; x < MAP_W - 1; x++) {
          const idxHere = idx(x, y);
          let neighbors = 0;
          for (let yy = y - 1; yy <= y + 1; yy++) {
            for (let xx = x - 1; xx <= x + 1; xx++) {
              if (xx === x && yy === y) continue;
              neighbors += land[idx(xx, yy)];
            }
          }
          const isLand = land[idxHere] === 1;
          next[idxHere] = (isLand && neighbors >= 3) || (!isLand && neighbors >= 5) ? 1 : 0;
        }
      }
      land.set(next);
    }
  }

  function mergeTinyIslands(minIslandSize = 50) {
    const seen = new Uint8Array(MAP_W * MAP_H);
    const components = [];

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const i = idx(x, y);
        if (!land[i] || seen[i]) continue;
        const queue = [[x, y]];
        seen[i] = 1;
        const cells = [];
        while (queue.length) {
          const [cx, cy] = queue.pop();
          cells.push([cx, cy]);
          for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
            const nx = cx + dx, ny = cy + dy;
            if (!inside(nx, ny)) continue;
            const ni = idx(nx, ny);
            if (land[ni] && !seen[ni]) {
              seen[ni] = 1;
              queue.push([nx, ny]);
            }
          }
        }
        components.push(cells);
      }
    }

    for (const cells of components) {
      if (cells.length >= minIslandSize) continue;
      for (const [x, y] of cells) land[idx(x, y)] = 0;
    }
  }

  function generateTerrain() {
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const i = idx(x, y);
        if (!land[i]) continue;
        const e = fbm(x * 0.018 + 12, y * 0.018 + 19);
        const h = fbm(x * 0.058 + 32, y * 0.058 + 44);
        const moisture = fbm(x * 0.052 + 50, y * 0.052 + 21);
        // 현실 지도는 위도에 따라 건조대(사막)와 극지의 산악을 늘린다
        let arid = 0, mountainAt = 0.72;
        if (currentMap.latAt) {
          const lat = Math.abs(currentMap.latAt(y));
          if (lat > 14 && lat < 36) arid = 0.2;
          if (lat > 62) mountainAt = 0.62;
        }
        if (h > mountainAt) terrain[i] = 2;
        else if (moisture > 0.64 + arid * 0.6) terrain[i] = 1;
        else if (e < 0.30 + arid) terrain[i] = 3;
        else terrain[i] = 0;
        cellsCost[i] = 1 + (terrain[i] === 2 ? 0.72 : 0) + (terrain[i] === 3 ? 0.15 : 0) + (terrain[i] === 1 ? 0.12 : 0) + rand(0, 0.45);
      }
    }
  }

  function buildDisplayName(n) {
    return n.name;
  }

  function categoryColor(key) {
    let h = 7;
    for (let i = 0; i < key.length; i++) h = (Math.imul(h, 31) + key.charCodeAt(i)) >>> 0;
    return hslToHex((h * 47) % 360, 0.6 + (h % 3) * 0.08, 0.5 + ((h >> 3) % 3) * 0.07);
  }

  function getNationGroup(n) {
    if (!n) return null;
    return alliances.find(g => g.members.includes(n.id)) || null;
  }

  function getGroupColorForNation(n) {
    const group = getNationGroup(n);
    return group ? group.color : n.color;
  }

  function getDisplayNationName(n) {
    const group = getNationGroup(n);
    if (group) return group.name;
    const prefix = n.isColony ? '[식민지] ' : '';
    return `${prefix}${buildDisplayName(n)}`;
  }

  function averageColor(a, b) {
    const ca = hexRGB(a);
    const cb = hexRGB(b);
    return '#' + [0, 1, 2].map(i => Math.round((ca[i] + cb[i]) / 2).toString(16).padStart(2, '0')).join('');
  }

  function hexRGB(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  // ===== 국가 색상: 이미 쓰이는 색(동맹 색 포함)과 Lab 거리가 가장 먼 색을 고른다 =====
  function hslToHex(h, s, l) {
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h / 30) % 12;
      return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
  }

  function hexToLab(hex) {
    const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const [r, g, b] = hexRGB(hex).map(lin);
    const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
    const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
    const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
  }

  function pickNationColor() {
    const used = nations.filter(n => n.alive).map(n => hexToLab(getGroupColorForNation(n)));
    const hueShift = rand(0, 12);
    let best = '#c75c5c', bestD = -1;
    for (let h = 0; h < 360; h += 6) {
      for (const [s, l] of [[0.78, 0.5], [0.85, 0.62], [0.7, 0.36], [0.6, 0.72]]) {
        const hex = hslToHex((h + hueShift) % 360, s, l);
        const lab = hexToLab(hex);
        let m = used.length ? Infinity : 0;
        for (const u of used) {
          const d = Math.hypot(lab[0] - u[0], lab[1] - u[1], lab[2] - u[2]);
          if (d < m) m = d;
        }
        if (m > bestD) { bestD = m; best = hex; }
      }
    }
    return best;
  }

  const NAME_SYLLABLES = ['아', '르', '칸', '벨', '도', '렌', '실', '마', '노', '카', '탈', '리', '오', '스', '엘', '바', '하', '쿠', '테', '시', '발', '모', '란', '디', '젠', '로', '타', '에', '우', '가'];
  function pickNationName() {
    const used = new Set(nations.map(n => n.name));
    const free = nationNames.filter(n => !used.has(n));
    if (free.length) return free[irand(0, free.length - 1)];
    for (let t = 0; t < 60; t++) {
      let s = '';
      for (let i = irand(2, 3); i > 0; i--) s += NAME_SYLLABLES[irand(0, NAME_SYLLABLES.length - 1)];
      if (!used.has(s)) return s;
    }
    return `신생${irand(1, 999)}`;
  }

  function createNations(count) {
    const target = count || irand(12, 18);
    let attempts = 0;
    while (nations.length < target && attempts < 20000) {
      attempts++;
      // 땅이 좁아 자리가 안 나면 점점 간격을 줄인다
      const minDist = Math.max(8, 26 - Math.floor(attempts / 400));
      const x = irand(10, MAP_W - 11);
      const y = irand(10, MAP_H - 11);
      if (!land[idx(x, y)]) continue;
      let good = true;
      for (const n of nations) {
        if (Math.hypot(x - n.seedX, y - n.seedY) < minDist) {
          good = false;
          break;
        }
      }
      if (!good) continue;

      const id = nations.length;
      nations.push({
        id,
        name: pickNationName(),
        color: pickNationColor(),
        species: species[irand(0, species.length - 1)],
        ideology: IDEOLOGIES[irand(0, IDEOLOGIES.length - 1)],
        seedX: x,
        seedY: y,
        population: irand(80, 500),
        army: irand(50, 150),
        gold: irand(150, 700),
        tech: rand(5, 35),
        stability: rand(60, 95),
        power: 0,
        age: 0,
        alive: true,
        cities: [],
        capital: { x, y },
        relations: {},
        plague: 0,
        warExhaustion: 0,
        allianceId: null,
        unionId: null,
        religion: pickReligion(),
        happiness: rand(50, 85),
        demographics: { children: 0.32, adults: 0.53, elders: 0.15 },
        tradeIncome: 0,
        lowStabYears: 0,
        isRebel: false
      });
    }
  }


  // 역사 시나리오: 실제 위경도에서 국가를 만든다
  function snapToLand(x, y) {
    x = Math.round(x); y = Math.round(y);
    for (let r = 0; r <= 16; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 3 || ny < 3 || nx > MAP_W - 4 || ny > MAP_H - 4) continue;
          if (land[idx(nx, ny)]) return { x: nx, y: ny };
        }
      }
    }
    return null;
  }

  function createScenarioNations(sc, def) {
    const P = WFMaps.projection(def, MAP_W, MAP_H);
    for (const r of sc.nations) {
      const pts = r.seeds.map(([lo, la]) => snapToLand(P.x(lo), P.y(la))).filter(Boolean);
      if (!pts.length) continue;
      nations.push({
        id: nations.length, name: r.name, color: r.color || pickNationColor(), species: r.eth, ideology: r.ideo,
        seedX: pts[0].x, seedY: pts[0].y, seeds: pts, reach: r.reach || 1,
        population: 80 + r.pw * 45 + rand(0, 40), army: 80, gold: 150 + r.pw * 80 + rand(0, 100),
        tech: r.tech, stability: rand(65, 90), power: 0, age: 0, alive: true, cities: [],
        capital: { x: pts[0].x, y: pts[0].y }, relations: {}, plague: 0, warExhaustion: 0,
        allianceId: null, unionId: null, religion: r.rel, happiness: rand(55, 80),
        demographics: { children: 0.32, adults: 0.53, elders: 0.15 }, tradeIncome: 0, lowStabYears: 0, isRebel: false
      });
    }
  }

  function applyScenarioDiplomacy(sc) {
    const byName = new Map(nations.map(n => [n.name, n.id]));
    for (const g of sc.alliances || []) {
      const ids = g.members.map(m => byName.get(m)).filter(v => v !== undefined);
      for (let k = 1; k < ids.length; k++) createAllianceBetween(ids[0], ids[k]);
      const group = ids.length ? getNationGroup(nations[ids[0]]) : null;
      if (group) { group.name = g.name; group.color = nations[ids[0]].color; }
    }
    for (const [a, b] of sc.wars || []) {
      if (byName.has(a) && byName.has(b)) forceWarBetween(byName.get(a), byName.get(b));
    }
  }

  function assignTerritories() {
    const INF = 1e30;
    const dist = new Float64Array(MAP_W * MAP_H);
    dist.fill(INF);
    owner.fill(-1);

    const heap = [];
    function push(node) {
      heap.push(node);
      let i = heap.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (heap[p].d <= node.d) break;
        heap[i] = heap[p];
        i = p;
      }
      heap[i] = node;
    }
    function pop() {
      if (!heap.length) return null;
      const root = heap[0];
      const last = heap.pop();
      if (heap.length) {
        let i = 0;
        while (true) {
          const l = i * 2 + 1, r = l + 1;
          if (l >= heap.length) break;
          const c = r < heap.length && heap[r].d < heap[l].d ? r : l;
          if (heap[c].d >= last.d) break;
          heap[i] = heap[c];
          i = c;
        }
        heap[i] = last;
      }
      return root;
    }

    const reachOf = nations.map(n => n.reach || 1);
    for (const n of nations) {
      for (const sd of (n.seeds || [{ x: n.seedX, y: n.seedY }])) {
        const i = idx(sd.x, sd.y);
        dist[i] = 0;
        owner[i] = n.id;
        push({ d: 0, i, n: n.id });
      }
    }

    const dirs = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.42], [-1, 1, 1.42], [1, -1, 1.42], [-1, -1, 1.42]];
    while (heap.length) {
      const q = pop();
      if (!q || q.d !== dist[q.i]) continue;
      const x = q.i % MAP_W, y = Math.floor(q.i / MAP_W);
      for (const d of dirs) {
        const nx = x + d[0], ny = y + d[1];
        if (!inside(nx, ny)) continue;
        const ni = idx(nx, ny);
        if (!land[ni]) continue;
        const nd = q.d + d[2] * cellsCost[ni] / reachOf[q.n];
        if (nd < dist[ni]) {
          dist[ni] = nd;
          owner[ni] = q.n;
          push({ d: nd, i: ni, n: q.n });
        }
      }
    }
  }

  function claimUnclaimedLand() {
    const landCells = [];
    for (let i = 0; i < land.length; i++) {
      if (land[i] && owner[i] < 0) landCells.push(i);
    }
    if (!landCells.length) return;

    const aliveNations = nations.filter(n => n.alive);
    if (!aliveNations.length) return;

    for (const i of landCells) {
      const x = i % MAP_W;
      const y = Math.floor(i / MAP_W);
      let best = null;
      let bestDist = Infinity;
      for (const n of aliveNations) {
        const dx = n.capital.x - x;
        const dy = n.capital.y - y;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) {
          bestDist = dist;
          best = n.id;
        }
      }
      if (best !== null) owner[i] = best;
    }
  }

  function generateCities() {
    for (const n of nations) {
      n.cities = [];
      n.capital = { x: n.seedX, y: n.seedY };
      n.cities.push({ x: n.seedX, y: n.seedY, name: `${n.name} 수도`, capital: true, level: 3, resource: pickResource(), holy: true });
      const count = irand(2, 6);
      let attempts = 0;
      while (n.cities.length < count + 1 && attempts < 1000) {
        attempts++;
        const x = irand(3, MAP_W - 4);
        const y = irand(3, MAP_H - 4);
        if (owner[idx(x, y)] !== n.id) continue;
        let far = true;
        for (const c of n.cities) {
          if (Math.hypot(x - c.x, y - c.y) < 9) { far = false; break; }
        }
        if (far) n.cities.push({ x, y, name: `${n.name} ${['성','항구','도시','마을','요새'][irand(0, 4)]}`, capital: false, level: irand(1, 3), resource: pickResource(), holy: false });
      }
    }
    // 처음 군대 규모도 영토 수에 맞춘다
    for (const n of nations) n.army = desiredArmyFor(provinceCount(n.id), false) * rand(0.85, 1.05);
    refreshMilitaryUnits();
  }

  // ===== 구역(주): 땅을 여러 조각으로 쪼개고, 점령은 구역 단위로 일어난다 =====
  let provSpacing = 38;      // 구역 씨앗 간격(칸). 세계 시나리오는 촘촘하게
  let provOf = new Int16Array(MAP_W * MAP_H).fill(-1);
  let provinces = [];      // { id, sx, sy, cx, cy, cells:Int32Array, adj:[], owner, capture:null }
  let provVersion = 0;     // 구역 소유가 바뀔 때마다 증가 (이웃 캐시 무효화용)

  function generateProvinces(snapOwners) {
    const N = MAP_W * MAP_H;
    provOf.fill(-1);
    provinces = [];

    // 1) 육지 덩어리 라벨링
    const comp = new Int32Array(N).fill(-1);
    const compCells = [];
    for (let i = 0; i < N; i++) {
      if (!land[i] || comp[i] >= 0) continue;
      const id = compCells.length;
      const list = [];
      const stack = [i];
      comp[i] = id;
      while (stack.length) {
        const c = stack.pop();
        list.push(c);
        const x = c % MAP_W;
        if (x > 0 && land[c - 1] && comp[c - 1] < 0) { comp[c - 1] = id; stack.push(c - 1); }
        if (x < MAP_W - 1 && land[c + 1] && comp[c + 1] < 0) { comp[c + 1] = id; stack.push(c + 1); }
        if (c >= MAP_W && land[c - MAP_W] && comp[c - MAP_W] < 0) { comp[c - MAP_W] = id; stack.push(c - MAP_W); }
        if (c < N - MAP_W && land[c + MAP_W] && comp[c + MAP_W] < 0) { comp[c + MAP_W] = id; stack.push(c + MAP_W); }
      }
      compCells.push(list);
    }

    // 2) 구역 씨앗: 국가 수도 자리 + 간격을 둔 무작위 점 + 모든 땅덩어리에 최소 1개
    const seeds = [];
    for (const n of nations) {
      if (!n.alive || n.seedX === undefined) continue;
      for (const sd of (n.seeds || [{ x: n.seedX, y: n.seedY }])) {
        const sx = clamp(Math.floor(sd.x), 0, MAP_W - 1), sy = clamp(Math.floor(sd.y), 0, MAP_H - 1);
        const i = idx(sx, sy);
        if (!land[i]) continue;
        if (seeds.some(s => Math.hypot(s.x - sx, s.y - sy) < 8)) continue;
        seeds.push({ x: sx, y: sy, comp: comp[i] });
      }
    }
    for (let k = 0; k < 12000; k++) {
      const x = Math.floor(hash2(k, 101) * MAP_W), y = Math.floor(hash2(k, 202) * MAP_H);
      const i = idx(x, y);
      if (!land[i]) continue;
      let ok = true;
      for (const s of seeds) {
        if ((s.x - x) * (s.x - x) + (s.y - y) * (s.y - y) < provSpacing * provSpacing) { ok = false; break; }
      }
      if (ok) seeds.push({ x, y, comp: comp[i] });
    }
    const hasSeed = new Uint8Array(compCells.length);
    for (const s of seeds) hasSeed[s.comp] = 1;
    for (let c = 0; c < compCells.length; c++) {
      if (hasSeed[c]) continue;
      const cell = compCells[c][Math.floor(hash2(c, 303) * compCells[c].length)];
      seeds.push({ x: cell % MAP_W, y: Math.floor(cell / MAP_W), comp: c });
    }

    // 3) 각 육지 칸을 같은 땅덩어리의 가장 가까운 씨앗에 배정 (경계를 울퉁불퉁하게 만드는 워핑)
    const BS = 40;
    const gw = Math.ceil(MAP_W / BS), gh = Math.ceil(MAP_H / BS);
    const buckets = Array.from({ length: gw * gh }, () => []);
    const seedsByComp = compCells.map(() => []);
    seeds.forEach((s, si) => {
      buckets[Math.floor(s.y / BS) * gw + Math.floor(s.x / BS)].push(si);
      seedsByComp[s.comp].push(si);
    });
    const raw = new Int32Array(N).fill(-1);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const i = idx(x, y);
        if (!land[i]) continue;
        const wx = x + (smoothNoise(x * 0.03 + 3, y * 0.03 + 7) - 0.5) * 22 + (smoothNoise(x * 0.09 + 5, y * 0.09 + 1) - 0.5) * 8;
        const wy = y + (smoothNoise(x * 0.03 + 11, y * 0.03 + 5) - 0.5) * 22 + (smoothNoise(x * 0.09 + 8, y * 0.09 + 6) - 0.5) * 8;
        const bx = Math.floor(wx / BS), by = Math.floor(wy / BS);
        let best = -1, bestD = Infinity;
        for (let oy = -2; oy <= 2; oy++) {
          const yy = by + oy;
          if (yy < 0 || yy >= gh) continue;
          for (let ox = -2; ox <= 2; ox++) {
            const xx = bx + ox;
            if (xx < 0 || xx >= gw) continue;
            for (const si of buckets[yy * gw + xx]) {
              const s = seeds[si];
              if (s.comp !== comp[i]) continue;
              const d = (s.x - wx) * (s.x - wx) + (s.y - wy) * (s.y - wy);
              if (d < bestD) { bestD = d; best = si; }
            }
          }
        }
        if (best < 0) {
          for (const si of seedsByComp[comp[i]]) {
            const s = seeds[si];
            const d = (s.x - wx) * (s.x - wx) + (s.y - wy) * (s.y - wy);
            if (d < bestD) { bestD = d; best = si; }
          }
        }
        raw[i] = best;
      }
    }

    // 4) 떨어져 나간 조각은 이웃 구역에 합친다
    const seen = new Uint8Array(N);
    const regions = [];
    const biggest = new Map();
    for (let i = 0; i < N; i++) {
      if (raw[i] < 0 || seen[i]) continue;
      const pid = raw[i];
      const cells = [];
      const stack = [i];
      seen[i] = 1;
      while (stack.length) {
        const c = stack.pop();
        cells.push(c);
        const x = c % MAP_W;
        if (x > 0 && !seen[c - 1] && raw[c - 1] === pid) { seen[c - 1] = 1; stack.push(c - 1); }
        if (x < MAP_W - 1 && !seen[c + 1] && raw[c + 1] === pid) { seen[c + 1] = 1; stack.push(c + 1); }
        if (c >= MAP_W && !seen[c - MAP_W] && raw[c - MAP_W] === pid) { seen[c - MAP_W] = 1; stack.push(c - MAP_W); }
        if (c < N - MAP_W && !seen[c + MAP_W] && raw[c + MAP_W] === pid) { seen[c + MAP_W] = 1; stack.push(c + MAP_W); }
      }
      regions.push({ pid, cells });
      const prev = biggest.get(pid);
      if (!prev || prev.cells.length < cells.length) biggest.set(pid, regions[regions.length - 1]);
    }
    for (const r of regions) {
      if (biggest.get(r.pid) === r) continue;
      const tally = new Map();
      for (const c of r.cells) {
        const x = c % MAP_W;
        for (const nb of [x > 0 ? c - 1 : -1, x < MAP_W - 1 ? c + 1 : -1, c >= MAP_W ? c - MAP_W : -1, c < N - MAP_W ? c + MAP_W : -1]) {
          if (nb < 0 || raw[nb] < 0 || raw[nb] === r.pid) continue;
          tally.set(raw[nb], (tally.get(raw[nb]) || 0) + 1);
        }
      }
      let to = -1, bestCount = 0;
      for (const [pid, count] of tally) if (count > bestCount) { bestCount = count; to = pid; }
      if (to >= 0) for (const c of r.cells) raw[c] = to;
    }

    buildProvinceData(raw, seeds.length);

    // 6) 소유 구역 결정: 칸 소유자의 다수결. 처음 생성할 때는 국경이 구역 경계에 딱 맞도록 정리한다.
    for (const p of provinces) p.owner = majorityOwner(p);
    if (snapOwners) {
      for (const n of nations) {
        if (!n.alive || n.seedX === undefined) continue;
        for (const sd of (n.seeds || [{ x: n.seedX, y: n.seedY }])) {
          const pid = provOf[idx(clamp(Math.floor(sd.x), 0, MAP_W - 1), clamp(Math.floor(sd.y), 0, MAP_H - 1))];
          if (pid >= 0) provinces[pid].owner = n.id;
        }
      }
      for (const p of provinces) if (p.owner >= 0) for (const c of p.cells) owner[c] = p.owner;
    }
    for (const p of provinces) p.origOwner = p.owner;
    provVersion++;
  }

  // raw[칸] = 구역 그룹 번호(없으면 -1). 빈 그룹은 건너뛰고 번호를 다시 매겨 provinces / provOf 를 만든다.
  function buildProvinceData(raw, groupCount) {
    const N = MAP_W * MAP_H;
    provOf.fill(-1);
    provinces = [];
    // 5) 구역 객체 만들기 (빈 구역은 건너뛰고 번호를 다시 매김)
    const counts = new Int32Array(groupCount);
    for (let i = 0; i < N; i++) if (raw[i] >= 0) counts[raw[i]]++;
    const remap = new Int32Array(groupCount).fill(-1);
    for (let si = 0; si < groupCount; si++) {
      if (!counts[si]) continue;
      remap[si] = provinces.length;
      provinces.push({ id: provinces.length, cx: 0, cy: 0, cells: new Int32Array(counts[si]), adj: [], owner: -1, origOwner: -1, conqueredYear: -1, capture: null });
    }
    const fill = new Int32Array(provinces.length);
    const sumX = new Float64Array(provinces.length), sumY = new Float64Array(provinces.length);
    for (let i = 0; i < N; i++) {
      if (raw[i] < 0) continue;
      const pid = remap[raw[i]];
      provOf[i] = pid;
      provinces[pid].cells[fill[pid]++] = i;
      sumX[pid] += i % MAP_W;
      sumY[pid] += Math.floor(i / MAP_W);
    }
    for (const p of provinces) {
      const mx = sumX[p.id] / p.cells.length, my = sumY[p.id] / p.cells.length;
      let bestD = Infinity;
      for (const c of p.cells) {
        const x = c % MAP_W, y = Math.floor(c / MAP_W);
        const d = (x - mx) * (x - mx) + (y - my) * (y - my);
        if (d < bestD) { bestD = d; p.cx = x + 0.5; p.cy = y + 0.5; }
      }
    }
    const adj = provinces.map(() => new Set());
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const i = idx(x, y);
        const a = provOf[i];
        if (a < 0) continue;
        if (x < MAP_W - 1) { const b = provOf[i + 1]; if (b >= 0 && b !== a) { adj[a].add(b); adj[b].add(a); } }
        if (y < MAP_H - 1) { const b = provOf[i + MAP_W]; if (b >= 0 && b !== a) { adj[a].add(b); adj[b].add(a); } }
      }
    }
    provinces.forEach((p, i) => { p.adj = [...adj[i]]; });

  }

  function majorityOwner(p) {
    const tally = new Map();
    for (const c of p.cells) {
      const o = owner[c];
      if (o >= 0) tally.set(o, (tally.get(o) || 0) + 1);
    }
    let best = -1, bestCount = 0;
    for (const [o, count] of tally) if (count > bestCount) { bestCount = count; best = o; }
    return best;
  }

  // 칸 단위로 소유를 바꾸는 시스템(반란, 신국가, 붕괴 등) 이후 구역 소유자를 다시 맞춘다
  function syncProvinceOwners() {
    let changed = false;
    for (const p of provinces) {
      if (p.capture) continue;
      const o = majorityOwner(p);
      if (o !== p.owner) { p.owner = o; changed = true; }
    }
    if (changed) provVersion++;
  }

  function provinceCount(id) {
    let c = 0;
    for (const p of provinces) if (p.owner === id) c++;
    return c;
  }

  // 이웃 국가: 구역이 맞닿았거나, 바다 건너 가까운 국가
  let neighborCache = new Map();
  let neighborCacheVersion = -1;
  function buildNeighborCache() {
    neighborCacheVersion = provVersion;
    const map = new Map();
    const link = (a, b) => {
      if (a < 0 || b < 0 || a === b) return;
      if (!map.has(a)) map.set(a, new Set());
      if (!map.has(b)) map.set(b, new Set());
      map.get(a).add(b);
      map.get(b).add(a);
    };
    for (const p of provinces) {
      for (const q of p.adj) if (q > p.id) link(p.owner, provinces[q].owner);
    }
    for (let i = 0; i < provinces.length; i++) {
      const p = provinces[i];
      if (p.owner < 0) continue;
      for (let j = i + 1; j < provinces.length; j++) {
        const q = provinces[j];
        if (q.owner < 0 || q.owner === p.owner) continue;
        if (Math.hypot(p.cx - q.cx, p.cy - q.cy) < 90) link(p.owner, q.owner);
      }
    }
    neighborCache = map;
  }

  function neighbors(id) {
    if (neighborCacheVersion !== provVersion) buildNeighborCache();
    const set = neighborCache.get(id);
    return set ? [...set].filter(o => nations[o]?.alive) : [];
  }

  // ===== 점(군대): 점의 수가 곧 군대의 크기 =====
  const ARMY_PER_DOT = 8;
  const ARMY_PER_PROVINCE = 12;   // 구역 하나가 뒷받침하는 군대 (= 점 1.5개)
  const MAX_DOTS_PER_NATION = 80;

  // 군대 규모는 영토(구역) 수에 비례한다. 전쟁 중이면 더 많이 동원한다.
  function desiredArmyFor(provs, atWar) {
    return 8 + provs * ARMY_PER_PROVINCE * (atWar ? 1.3 : 1);
  }
  let provSyncNeeded = false;
  let armySerial = 0;
  let territoryDirty = false;
  let lastTerritorySync = 0;

  function dotsFor(n) {
    return clamp(Math.round((n.army || 0) / ARMY_PER_DOT), 1, MAX_DOTS_PER_NATION);
  }

  function dotCountOf(id) {
    let c = 0;
    for (const u of armyUnits) if (u.owner === id && !u.dead) c++;
    return c;
  }

  // 국가별 점의 수를 군대 규모에 맞춘다. 모자라면 수도에서 새로 나타나고, 남으면 해산한다.
  function syncMilitaryUnits() {
    const byOwner = new Map();
    for (const u of armyUnits) {
      const n = nations[u.owner];
      if (!n || !n.alive || u.dead) continue;
      if (!byOwner.has(u.owner)) byOwner.set(u.owner, []);
      byOwner.get(u.owner).push(u);
    }
    const next = [];
    for (const n of nations) {
      if (!n.alive || nations[n.id] !== n) continue;
      const want = dotsFor(n);
      const keep = (byOwner.get(n.id) || []).slice(0, want);
      const home = n.capital || { x: n.seedX, y: n.seedY };
      for (let i = keep.length; i < want; i++) {
        keep.push({
          id: `${n.id}-dot-${armySerial++}`,
          owner: n.id,
          x: home.x + 0.5 + rand(-3, 3),
          y: home.y + 0.5 + rand(-3, 3),
          tx: home.x, ty: home.y,
          ox: rand(-1, 1), oy: rand(-1, 1),
          goal: -1,
          slot: i,
          spd: rand(0.85, 1.2),
          wait: rand(0, 1),
          prov: -1,
          sea: false,
          fighting: false,
          dead: false
        });
      }
      keep.forEach((u, i) => { u.slot = i; });
      next.push(...keep);
    }
    armyUnits = next;
  }

  function refreshMilitaryUnits() {
    armyUnits = [];
    syncMilitaryUnits();
  }


  function pickResource() {
    const resources = ['철', '금', '곡물', '목재', '석유', '비단', '보석', '낙농'];
    return resources[irand(0, resources.length - 1)];
  }

  function pickReligion() {
    const religions = ['신앙', '계율', '자연', '죽음', '태양', '달', '전사'];
    return religions[irand(0, religions.length - 1)];
  }

  function logEvent(text, type = '') {
    events.push({ year, text, type });
    if (events.length > 100) events.shift();
  }

  // 지도 정의(랜덤/현실)에 맞춰 육지를 만든다
  function generateLandForMap(def) {
    land.fill(0);
    let latAt = null;
    if (def.kind === 'real' && window.WFMaps) {
      const r = WFMaps.rasterize(def, MAP_W, MAP_H);
      land.set(r.mask);
      latAt = r.latAt;
      mergeTinyIslands(30);
      fillTinyLakes(50);
    } else {
      generateLand(def.style || 'continents');
    }
    currentMap = { ...def, latAt };
  }

  // opts: { mapId, nationCount, seed } — 생략하면 현재 지도와 새 시드로 다시 만든다
  function resetWorld(opts = {}) {
    const def = window.WFMaps ? WFMaps.get(opts.mapId || currentMap.id) : currentMap;
    if (opts.seed !== undefined && opts.seed !== null) seed = opts.seed;
    rng = mulberry32(seed);
    nations = [];
    wars = [];
    events = [];
    alliances = [];
    const sc = opts.scenarioId && window.WFScenarios ? WFScenarios.get(opts.scenarioId) : null;
    year = sc ? sc.year : 1;
    provSpacing = sc ? sc.provSpacing : 38;
    selected = -1;
    targetId = -1;
    selectionBorder = [];
    selectionPath = null;
    armyUnits = [];
    warArrows = [];
    deathFx = [];
    orderTimers.clear();
    needsClaimFix = false;
    baseDirty = true;
    terrain.fill(0);
    owner.fill(-1);
    generateLandForMap(def);
    if (sc) { currentMap.name = sc.name; currentMap.scenarioId = sc.id; }
    generateTerrain();
    if (sc) createScenarioNations(sc, def);
    else {
      const wanted = opts.nationCount || (def.kind === 'procedural' ? irand(Math.max(8, (def.nations || 14) - 3), (def.nations || 14) + 3) : def.nations);
      createNations(wanted);
    }
    initialNationCount = nations.length;
    assignTerritories();
    claimUnclaimedLand();
    generateProvinces(true);
    generateCities();
    fitCamera();
    logEvent(sc ? `${sc.name} — ${sc.year}년의 세계가 펼쳐진다.` : `신이 새로운 세계를 창조했다. (${currentMap.name})`, 'god');
    if (sc) applyScenarioDiplomacy(sc);
    renderWorld();
    updateUI();
  }

  function fitCamera() {
    const sideReserve = W > 900 ? 360 : 40; // 좌우 패널이 차지하는 폭
    camera.zoom = Math.min((W - sideReserve) / MAP_W, (H - 110) / MAP_H);
    camera.zoom = Math.max(0.45, Math.min(1.8, camera.zoom));
    camera.x = (W - MAP_W * camera.zoom) / 2;
    camera.y = (H - MAP_H * camera.zoom) / 2 + 20;
  }

  // ===== 고지도(양피지) 스타일 렌더링 =====
  // 지형 베이스(양피지 질감·음영·바다 물결·산/숲 아이콘)는 세계가 바뀔 때만 만들고,
  // 국가 색상·국경은 renderWorld()에서 매번 덧입힌다.
  const worldImage = wctx.createImageData(MAP_W, MAP_H);
  const baseData = new Uint8ClampedArray(MAP_W * MAP_H * 4);
  const iconCanvas = document.createElement('canvas');
  iconCanvas.width = MAP_W;
  iconCanvas.height = MAP_H;
  let baseDirty = true;
  let nationLabels = [];

  const INK = [74, 50, 30];
  const LAND_COLOR = [
    [221, 204, 158], // 평야
    [194, 196, 142], // 숲
    [204, 186, 154], // 산악
    [234, 212, 156]  // 사막
  ];

  // seed 소비 없이 쓰는 위치 기반 해시 (rng 흐름을 건드리지 않기 위함)
  function hash2(x, y) {
    let h = Math.imul((x * 374761393 + y * 668265263 + seed) | 0, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  // 반대 지형(육지↔바다)까지의 거리장 (chamfer 근사)
  function computeEdgeDistance() {
    const N = MAP_W * MAP_H;
    const dist = new Float32Array(N).fill(1e4);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const i = idx(x, y);
        const v = land[i];
        if ((x > 0 && land[i - 1] !== v) || (x < MAP_W - 1 && land[i + 1] !== v) ||
            (y > 0 && land[i - MAP_W] !== v) || (y < MAP_H - 1 && land[i + MAP_W] !== v)) dist[i] = 1;
      }
    }
    const D = 1.414;
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const i = idx(x, y);
        let d = dist[i];
        if (x > 0) d = Math.min(d, dist[i - 1] + 1);
        if (y > 0) {
          d = Math.min(d, dist[i - MAP_W] + 1);
          if (x > 0) d = Math.min(d, dist[i - MAP_W - 1] + D);
          if (x < MAP_W - 1) d = Math.min(d, dist[i - MAP_W + 1] + D);
        }
        dist[i] = d;
      }
    }
    for (let y = MAP_H - 1; y >= 0; y--) {
      for (let x = MAP_W - 1; x >= 0; x--) {
        const i = idx(x, y);
        let d = dist[i];
        if (x < MAP_W - 1) d = Math.min(d, dist[i + 1] + 1);
        if (y < MAP_H - 1) {
          d = Math.min(d, dist[i + MAP_W] + 1);
          if (x < MAP_W - 1) d = Math.min(d, dist[i + MAP_W + 1] + D);
          if (x > 0) d = Math.min(d, dist[i + MAP_W - 1] + D);
        }
        dist[i] = d;
      }
    }
    return dist;
  }

  function buildBase() {
    baseDirty = false;
    const N = MAP_W * MAP_H;
    const dist = computeEdgeDistance();

    const elev = new Float32Array(N);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const i = idx(x, y);
        if (!land[i]) continue;
        elev[i] = fbm(x * 0.014 + 3, y * 0.014 + 9) * 0.55
          + clamp(dist[i] / 28, 0, 1) * 0.25
          + (terrain[i] === 2 ? 0.4 : 0);
      }
    }
    const elevAt = (x, y) => elev[idx(clamp(x, 0, MAP_W - 1), clamp(y, 0, MAP_H - 1))];

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const i = idx(x, y);
        const p = i * 4;
        const grain = (hash2(x, y) - 0.5) * 9;
        const blotch = (smoothNoise(x * 0.035 + 40, y * 0.035 + 11) - 0.5) * 26;
        let r, g, b;

        if (!land[i]) {
          const d = dist[i];
          const t = clamp(d / 34, 0, 1);
          r = 178 + (108 - 178) * t;
          g = 205 + (146 - 205) * t;
          b = 201 + (160 - 201) * t;
          const f = d + (smoothNoise(x * 0.06, y * 0.06) - 0.5) * 3.2;
          if (Math.abs(f - 5) < 0.55 || Math.abs(f - 10.5) < 0.5 || Math.abs(f - 17) < 0.45) {
            r *= 0.86; g *= 0.88; b *= 0.9;
          }
          r += grain * 0.6 + blotch * 0.25;
          g += grain * 0.6 + blotch * 0.25;
          b += grain * 0.6 + blotch * 0.25;
        } else {
          const c = LAND_COLOR[terrain[i]] || LAND_COLOR[0];
          const shade = clamp((elevAt(x - 1, y - 1) - elevAt(x + 1, y + 1)) * 2.4, -0.3, 0.3);
          r = c[0] + grain + blotch + shade * 70;
          g = c[1] + grain + blotch * 0.9 + shade * 66;
          b = c[2] + grain + blotch * 0.7 + shade * 55;
          const d = dist[i];
          if (d < 4) { // 해안선 잉크 + 안쪽으로 번지는 테두리
            const k = d <= 1.5 ? 0.78 : 0.28 * (1 - (d - 1.5) / 2.5);
            r += (INK[0] - r) * k; g += (INK[1] - g) * k; b += (INK[2] - b) * k;
          }
        }
        baseData[p] = r; baseData[p + 1] = g; baseData[p + 2] = b; baseData[p + 3] = 255;
      }
    }

    // 산·숲·사막 아이콘 (투명 캔버스에 한 번만 그림)
    const ic = iconCanvas.getContext('2d');
    ic.clearRect(0, 0, MAP_W, MAP_H);
    ic.lineJoin = 'round';
    ic.lineCap = 'round';

    const step = 10;
    for (let gy = 4; gy < MAP_H - 4; gy += step) {
      for (let gx = 4; gx < MAP_W - 4; gx += step) {
        const px = Math.round(gx + (hash2(gx, gy) - 0.5) * step * 0.9);
        const py = Math.round(gy + (hash2(gy, gx + 7) - 0.5) * step * 0.9);
        if (!inside(px, py)) continue;
        const i = idx(px, py);
        if (!land[i] || dist[i] < 3 || terrain[i] !== 2) continue;
        const w = 4 + hash2(px, py + 3) * 4;
        const h = w * (1.1 + hash2(px + 5, py) * 0.5);
        ic.fillStyle = 'rgba(176,150,112,0.95)';
        ic.beginPath(); ic.moveTo(px, py - h); ic.lineTo(px - w, py); ic.lineTo(px, py); ic.closePath(); ic.fill();
        ic.fillStyle = 'rgba(112,88,62,0.95)';
        ic.beginPath(); ic.moveTo(px, py - h); ic.lineTo(px + w, py); ic.lineTo(px, py); ic.closePath(); ic.fill();
        ic.strokeStyle = 'rgba(58,40,26,0.95)';
        ic.lineWidth = 0.9;
        ic.beginPath(); ic.moveTo(px - w, py); ic.lineTo(px, py - h); ic.lineTo(px + w, py); ic.stroke();
      }
    }

    const fstep = 7;
    for (let gy = 4; gy < MAP_H - 4; gy += fstep) {
      for (let gx = 4; gx < MAP_W - 4; gx += fstep) {
        const px = Math.round(gx + (hash2(gx + 11, gy) - 0.5) * fstep);
        const py = Math.round(gy + (hash2(gy, gx + 3) - 0.5) * fstep);
        if (!inside(px, py)) continue;
        const i = idx(px, py);
        if (!land[i] || dist[i] < 3 || terrain[i] !== 1 || hash2(px, py) < 0.4) continue;
        const s = 2 + hash2(px + 2, py + 9) * 1.4;
        ic.strokeStyle = 'rgba(58,44,28,0.85)';
        ic.lineWidth = 0.8;
        ic.beginPath(); ic.moveTo(px, py + s); ic.lineTo(px, py + 0.5); ic.stroke();
        ic.fillStyle = 'rgba(94,118,66,0.95)';
        ic.beginPath(); ic.arc(px, py - s * 0.5, s, 0, Math.PI * 2); ic.fill();
        ic.stroke();
      }
    }

    ic.strokeStyle = 'rgba(150,118,66,0.7)';
    ic.lineWidth = 0.8;
    for (let gy = 6; gy < MAP_H - 6; gy += 14) {
      for (let gx = 6; gx < MAP_W - 6; gx += 14) {
        const px = Math.round(gx + (hash2(gx, gy + 21) - 0.5) * 12);
        const py = Math.round(gy + (hash2(gy + 4, gx) - 0.5) * 12);
        if (!inside(px, py)) continue;
        const i = idx(px, py);
        if (!land[i] || dist[i] < 4 || terrain[i] !== 3) continue;
        ic.beginPath(); ic.arc(px, py, 3.2, Math.PI * 1.1, Math.PI * 1.9); ic.stroke();
      }
    }
  }

  function heatColor(v) { // 낮음(청록) → 중간(황금) → 높음(적갈)
    const stops = [[72, 120, 150], [216, 184, 98], [176, 62, 44]];
    const t = clamp(v, 0, 1) * 2;
    const a = stops[t < 1 ? 0 : 1];
    const b = stops[t < 1 ? 1 : 2];
    const f = t < 1 ? t : t - 1;
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  }

  function renderWorld() {
    if (baseDirty) buildBase();
    const data = worldImage.data;
    data.set(baseData);

    const count = new Float64Array(nations.length);
    const sumX = new Float64Array(nations.length);
    const sumY = new Float64Array(nations.length);

    const tints = nations.map(n => {
      if (!n) return null;
      const group = getNationGroup(n);
      let hex = n.color;                                   // 국가
      if (layer === 'alliance') hex = group ? group.color : '#9a9a94'; // 연맹: 무소속은 회색
      else if (layer === 'species') hex = categoryColor('species:' + n.species);
      else if (layer === 'religion') hex = religionColor[n.religion] || categoryColor('religion:' + n.religion);
      return { rgb: hexRGB(hex), heat: null };
    });

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const i = idx(x, y);
        if (!land[i]) continue;
        const id = owner[i];
        if (id < 0) continue;
        const tint = tints[id];
        if (!tint) continue;
        const p = i * 4;

        const lum = (data[p] + data[p + 1] + data[p + 2]) / 3 / 215;
        const src = tint.heat || tint.rgb;
        const a = tint.heat ? 0.7 : 0.55;
        data[p] = data[p] * (1 - a) + src[0] * lum * a;
        data[p + 1] = data[p + 1] * (1 - a) + src[1] * lum * a;
        data[p + 2] = data[p + 2] * (1 - a) + src[2] * lum * a;

        count[id]++; sumX[id] += x; sumY[id] += y;

        // 국경: 인접한 다른 영토(육지)와 맞닿은 칸을 국가색의 어두운 톤으로
        let edge = false;
        if (x > 0 && land[i - 1] && owner[i - 1] !== id) edge = true;
        else if (x < MAP_W - 1 && land[i + 1] && owner[i + 1] !== id) edge = true;
        else if (y > 0 && land[i - MAP_W] && owner[i - MAP_W] !== id) edge = true;
        else if (y < MAP_H - 1 && land[i + MAP_W] && owner[i + MAP_W] !== id) edge = true;
        if (edge) {
          const c = tint.rgb;
          data[p] = data[p] * 0.25 + c[0] * 0.3 + INK[0] * 0.45;
          data[p + 1] = data[p + 1] * 0.25 + c[1] * 0.3 + INK[1] * 0.45;
          data[p + 2] = data[p + 2] * 0.25 + c[2] * 0.3 + INK[2] * 0.45;
        } else {
          // 같은 나라 안의 구역 경계는 옅은 잉크선으로
          const pv = provOf[i];
          if ((x > 0 && land[i - 1] && provOf[i - 1] !== pv) || (x < MAP_W - 1 && land[i + 1] && provOf[i + 1] !== pv) ||
              (y > 0 && land[i - MAP_W] && provOf[i - MAP_W] !== pv) || (y < MAP_H - 1 && land[i + MAP_W] && provOf[i + MAP_W] !== pv)) {
            data[p] = data[p] * 0.8 + INK[0] * 0.2;
            data[p + 1] = data[p + 1] * 0.8 + INK[1] * 0.2;
            data[p + 2] = data[p + 2] * 0.8 + INK[2] * 0.2;
          }
        }
      }
    }

    wctx.putImageData(worldImage, 0, 0);
    wctx.drawImage(iconCanvas, 0, 0);

    nationLabels = [];
    for (const n of nations) {
      if (!n || !n.alive || count[n.id] < 120) continue;
      let cx = sumX[n.id] / count[n.id];
      let cy = sumY[n.id] / count[n.id];
      if (owner[idx(Math.round(cx), Math.round(cy))] !== n.id) {
        const cap = n.cities && (n.cities.find(c => c.capital) || n.cities[0]);
        if (cap) { cx = cap.x; cy = cap.y; }
      }
      nationLabels.push({ name: n.name, x: cx, y: cy, size: Math.sqrt(count[n.id]) });
    }
  }


  function draw() {
    resizeIfNeeded();
    ctx.clearRect(0, 0, W, H);

    const grad = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.8);
    grad.addColorStop(0, '#2b2018');
    grad.addColorStop(1, '#0f0b08');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(worldCanvas, camera.x, camera.y, MAP_W * camera.zoom, MAP_H * camera.zoom);

    drawMapFrame();
    drawNationLabels();
    drawCities();
    drawFlags();
    drawArmyMarkers();
    if (selected >= 0 && nations[selected]?.alive) drawSelection();
    requestAnimationFrame(draw);
  }

  function resizeIfNeeded() {
    if (W !== innerWidth || H !== innerHeight) {
      W = innerWidth; H = innerHeight;
      canvas.width = W; canvas.height = H;
      fitCamera();
    }
  }

  function drawCities() { /* same rendering function */
    if (camera.zoom < 0.9) return;
    for (const n of nations) {
      if (!n.alive) continue;
      for (const c of n.cities) {
        const sx = camera.x + (c.x + 0.5) * camera.zoom;
        const sy = camera.y + (c.y + 0.5) * camera.zoom;
        if (sx < -30 || sy < -30 || sx > W + 30 || sy > H + 30) continue;
        ctx.strokeStyle = '#3a2716';
        ctx.lineWidth = 1.4;
        if (c.capital) { // 수도: 잉크 테두리의 성채 표식
          ctx.fillStyle = '#f3dc92';
          ctx.fillRect(sx - 4, sy - 4, 8, 8);
          ctx.strokeRect(sx - 4, sy - 4, 8, 8);
          ctx.fillStyle = '#3a2716';
          ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
        } else {
          ctx.fillStyle = '#f1e6c8';
          ctx.beginPath();
          ctx.arc(sx, sy, 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        if (camera.zoom > 1.2) {
          ctx.textAlign = 'left';
          ctx.font = `${c.capital ? 'bold ' : ''}11px Georgia, "Noto Serif KR", serif`;
          ctx.fillStyle = '#3a2716';
          ctx.strokeStyle = 'rgba(242,229,193,0.85)';
          ctx.lineWidth = 3;
          ctx.strokeText(c.name, sx + 8, sy + 4);
          ctx.fillText(c.name, sx + 8, sy + 4);
        }
      }
    }
  }

  function drawFlags() {
    if (camera.zoom < 0.8) return;
    for (const n of nations) {
      if (!n.alive) continue;
      const city = n.cities.find(c => c.capital) || n.cities[0];
      if (!city) continue;
      const sx = camera.x + (city.x + 0.5) * camera.zoom;
      const sy = camera.y + (city.y + 0.5) * camera.zoom;
      if (sx < -60 || sy < -60 || sx > W + 60 || sy > H + 60) continue;
      const size = clamp(camera.zoom * 7, 7, 16);
      ctx.save();
      ctx.translate(sx, sy - size - 4);
      ctx.strokeStyle = '#282828';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, size + 5);
      ctx.stroke();
      ctx.fillStyle = getGroupColorForNation(n);
      ctx.beginPath();
      ctx.moveTo(1, 0);
      ctx.lineTo(size * 0.95, size * 0.32);
      ctx.lineTo(1, size * 0.64);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // 국가명: 영토 중심에 큰 자간의 고지도풍 글씨
  function drawNationLabels() {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const alpha = camera.zoom > 2.4 ? 0.4 : 0.86;
    for (const l of nationLabels) {
      const size = clamp(l.size * 0.27 * camera.zoom, 0, 38);
      if (size < 9) continue;
      const sx = camera.x + l.x * camera.zoom;
      const sy = camera.y + l.y * camera.zoom;
      if (sx < -150 || sy < -60 || sx > W + 150 || sy > H + 60) continue;
      ctx.font = `bold ${size}px Georgia, "Noto Serif KR", serif`;
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${(size * 0.14).toFixed(1)}px`;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = Math.max(2, size * 0.16);
      ctx.strokeStyle = 'rgba(244,232,198,0.7)';
      ctx.strokeText(l.name, sx, sy);
      ctx.fillStyle = '#3a2716';
      ctx.fillText(l.name, sx, sy);
    }
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    ctx.restore();
  }

  function drawMapFrame() {
    const x = camera.x, y = camera.y;
    const w = MAP_W * camera.zoom, h = MAP_H * camera.zoom;
    ctx.save();
    ctx.strokeStyle = '#2a1b0f';
    ctx.lineWidth = 4;
    ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
    ctx.strokeStyle = 'rgba(214,180,104,0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 8, y - 8, w + 16, h + 16);
    ctx.strokeStyle = '#2a1b0f';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 11, y - 11, w + 22, h + 22);
    ctx.restore();

    const r = clamp(camera.zoom * 46, 26, 64);
    drawCompass(x + w - r * 1.6, y + h - r * 1.6, r);
  }

  function drawCompass(cx, cy, r) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = '#3a2716';
    ctx.fillStyle = 'rgba(244,232,198,0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (let k = 0; k < 8; k++) {
      const major = k % 2 === 0;
      const len = major ? r : r * 0.55;
      const a = k * Math.PI / 4 - Math.PI / 2;
      const half = Math.PI / 14;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a - half) * r * 0.22, Math.sin(a - half) * r * 0.22);
      ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
      ctx.closePath();
      ctx.fillStyle = major ? '#3a2716' : 'rgba(120,92,58,0.9)';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a + half) * r * 0.22, Math.sin(a + half) * r * 0.22);
      ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
      ctx.closePath();
      ctx.fillStyle = major ? '#f2e3b2' : 'rgba(230,212,170,0.95)';
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#3a2716';
    ctx.font = `bold ${Math.max(10, r * 0.3)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', 0, -r - r * 0.24);
    ctx.restore();
  }

  function isCoastalCell(x, y) {
    for (let yy = y - 1; yy <= y + 1; yy++) {
      for (let xx = x - 1; xx <= x + 1; xx++) {
        if (!inside(xx, yy)) continue;
        if (!land[idx(xx, yy)]) return true;
      }
    }
    return false;
  }

  // 군대는 점의 수로 보인다. 땅 위는 점, 바다 위는 사각형. 교전 중인 점은 붉게 깜빡이고, 쓰러진 자리엔 잠깐 붉은 고리가 남는다.
  function drawArmyMarkers() {
    if (camera.zoom < 0.3) return;
    const t = performance.now() / 1000;
    const size = clamp(camera.zoom * 3.6, 3, 6.5);

    ctx.save();
    for (const fx of deathFx) {
      const sx = camera.x + fx.x * camera.zoom;
      const sy = camera.y + fx.y * camera.zoom;
      if (sx < -60 || sy < -60 || sx > W + 60 || sy > H + 60) continue;
      ctx.beginPath();
      if (fx.kind === 'rebel') { // 반란: 금빛 고리가 넓게 퍼진다
        const k = clamp(fx.t / 2.4, 0, 1);
        ctx.strokeStyle = `rgba(232,170,40,${k})`;
        ctx.lineWidth = 3;
        ctx.arc(sx, sy, 8 + (1 - k) * 60, 0, Math.PI * 2);
      } else {
        ctx.strokeStyle = `rgba(190,40,30,${clamp(fx.t / 0.7, 0, 1)})`;
        ctx.lineWidth = 1.4;
        ctx.arc(sx, sy, size + (0.7 - fx.t) * 14, 0, Math.PI * 2);
      }
      ctx.stroke();
    }

    ctx.lineWidth = 1.1;
    for (const u of armyUnits) {
      if (u.dead) continue;
      const n = nations[u.owner];
      if (!n || !n.alive) continue;
      const sx = camera.x + u.x * camera.zoom;
      const sy = camera.y + u.y * camera.zoom;
      if (sx < -10 || sy < -10 || sx > W + 10 || sy > H + 10) continue;

      ctx.fillStyle = getGroupColorForNation(n);
      ctx.strokeStyle = u.fighting && Math.sin(t * 14 + u.spd * 9) > 0 ? '#c4281c' : '#2a1b0f';
      if (u.sea) {
        ctx.fillRect(sx - size * 0.9, sy - size * 0.9, size * 1.8, size * 1.8);
        ctx.strokeRect(sx - size * 0.9, sy - size * 0.9, size * 1.8, size * 1.8);
      } else {
        ctx.beginPath();
        ctx.arc(sx, sy, size * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }


  function drawWarArrows() {
    if (camera.zoom < 0.5) return;
    for (const arrow of warArrows) {
      const x1 = camera.x + arrow.x1 * camera.zoom;
      const y1 = camera.y + arrow.y1 * camera.zoom;
      const x2 = camera.x + arrow.x2 * camera.zoom;
      const y2 = camera.y + arrow.y2 * camera.zoom;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const head = 8;

      ctx.save();
      ctx.strokeStyle = arrow.color || '#ff8a80';
      ctx.fillStyle = arrow.color || '#ff8a80';
      ctx.lineWidth = Math.max(1.4, camera.zoom * 0.9);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // 선택한 국가의 외곽선을 하나의 Path2D로 만든다 (칸마다 그림자 효과로 그리던 방식은 후반에 매우 느렸음)
  function computeSelectionBorder() {
    selectionBorder = [];
    selectionPath = null;
    if (selected < 0) return;
    const path = new Path2D();
    const provs = provinces.filter(p => p.owner === selected || (p.capture && (p.capture.to === selected || p.capture.from === selected)));
    for (const p of provs) {
      for (const c of p.cells) {
        if (owner[c] !== selected) continue;
        const x = c % MAP_W, y = (c - x) / MAP_W;
        const l = x === 0 || owner[c - 1] !== selected;
        const r = x === MAP_W - 1 || owner[c + 1] !== selected;
        const u = y === 0 || owner[c - MAP_W] !== selected;
        const d = y === MAP_H - 1 || owner[c + MAP_W] !== selected;
        if (l) { path.moveTo(x, y); path.lineTo(x, y + 1); }
        if (r) { path.moveTo(x + 1, y); path.lineTo(x + 1, y + 1); }
        if (u) { path.moveTo(x, y); path.lineTo(x + 1, y); }
        if (d) { path.moveTo(x, y + 1); path.lineTo(x + 1, y + 1); }
        if (l || r || u || d) selectionBorder.push(x, y);
      }
    }
    selectionPath = path;
  }

  function drawSelection() {
    if (!selectionPath) return;
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,240,200,0.85)';
    ctx.lineWidth = 5 / camera.zoom;
    ctx.stroke(selectionPath);
    ctx.strokeStyle = '#b3261e';
    ctx.lineWidth = 2.4 / camera.zoom;
    ctx.stroke(selectionPath);
    ctx.restore();
  }

  function screenToCell(sx, sy) {
    const x = Math.floor((sx - camera.x) / camera.zoom);
    const y = Math.floor((sy - camera.y) / camera.zoom);
    if (!inside(x, y)) return -1;
    return idx(x, y);
  }

  function selectAt(sx, sy) {
    const i = screenToCell(sx, sy);
    if (i < 0) return;
    const id = owner[i];
    if (id >= 0 && nations[id]?.alive) {
      selected = id;
      computeSelectionBorder();
      updateUI();
    }
  }

  function updateUI() {
    ui.year.textContent = `${year}년`;
    ui.stats.textContent = `국가 ${nations.filter(n => n.alive).length} · 전쟁 ${wars.length}`;
    const box = ui.selectedBox;
    const panel = ui.godPanel;

    if (selected < 0 || !nations[selected]?.alive) {
      setHTML(box, '<div class="small">국가를 클릭하세요.</div>');
      panel.style.display = 'none';
    } else {
      const n = nations[selected];
      const group = getNationGroup(n);
      panel.style.display = 'block';
      const relationWars = wars.filter(w => w.a === n.id || w.b === n.id).length;
      setHTML(box, `
        <div style="margin-bottom:10px">
          <span id="flag" style="background:${getGroupColorForNation(n)};color:#fff">⚑</span>
          <span id="nationName">${escapeHTML(getDisplayNationName(n))}</span>
        </div>
        <div class="small">${n.species} · ${n.ideology}${n.isRebel ? ' · 반란군' : ''} ${group ? `· ${group.name}` : ''}</div>
        <div class="small" style="margin:3px 0">🕊 ${escapeHTML(n.religion)} ${n.cities.some(c => c.holy) ? '· 성지 보유' : ''}</div>
        <div class="stat">인구 <b>${format(n.population)}</b></div>
        <div class="stat">영토 <b>${provinceCount(n.id)}</b></div>
        <div class="stat">군대 <b>●${dotCountOf(n.id)}</b></div>
        <div class="stat">골드 <b>${format(n.gold)}</b> ${n.tradeIncome > 0.5 ? `<span class="small">(무역 +${n.tradeIncome.toFixed(1)} / 비용 -${(n.tradeCost || 0).toFixed(1)})</span>` : ''}</div>
        <div class="stat">기술력 <b>${n.tech.toFixed(1)}</b></div>
        <div class="stat">안정도 <b>${n.stability.toFixed(0)}</b></div>
        <div class="stat">불안도 <b>${(n.unrest || 0).toFixed(0)}</b>${(n.unrest || 0) > 45 ? ' <span class="small">⚠ 반란 위험</span>' : ''}</div>
        <div class="stat">행복도 <b>${n.happiness.toFixed(0)}</b></div>
        <div class="stat">도시 <b>${n.cities.length}</b></div>
        <div class="stat">국력 <b>${n.power.toFixed(0)}</b></div>
        <div class="stat">전쟁 <b>${relationWars}</b></div>
        <div class="small" style="margin-top:6px">인구 구성 · 아동 ${(n.demographics.children * 100).toFixed(0)}% · 성인 ${(n.demographics.adults * 100).toFixed(0)}% · 노년 ${(n.demographics.elders * 100).toFixed(0)}%</div>
        <div class="small" style="margin-top:6px">주요 자원: ${Object.entries(computeNationResources(n)).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([r, v]) => `${RESOURCE_ICON[r]}${r}`).join(' · ')}</div>
        <div class="small" style="margin-top:8px">국가 나이: ${n.age}년<br>수도: ${escapeHTML(n.cities.find(c => c.capital)?.name || '없음')}</div>
      `);
    }

    const select = ui.relationTarget;
    const options = nations.filter(n => n.alive && n.id !== selected).map(n => `<option value="${n.id}">${escapeHTML(getDisplayNationName(n))}</option>`).join('');
    setHTML(select, `<option value="-1">대상 선택</option>${options}`);
    if (targetId >= 0 && nations[targetId]?.alive) select.value = String(targetId);
    else targetId = -1;

    const info = ui.worldInfo;
    const alive = nations.filter(n => n.alive);
    const pop = alive.reduce((s, n) => s + n.population, 0);
    const gold = alive.reduce((s, n) => s + n.gold, 0);
    const army = alive.reduce((s, n) => s + n.army, 0);
    const religionCounts = {};
    for (const n of alive) religionCounts[n.religion] = (religionCounts[n.religion] || 0) + 1;
    const topReligion = Object.entries(religionCounts).sort((a, b) => b[1] - a[1])[0];
    const rebelCount = alive.filter(n => n.isRebel).length;
    setHTML(info, `
      <div class="stat">존재 국가 <b>${alive.length}</b></div>
      <div class="stat">세계 인구 <b>${format(pop)}</b></div>
      <div class="stat">세계 군대 <b>●${armyUnits.length}</b></div>
      <div class="stat">세계 골드 <b>${format(gold)}</b></div>
      <div class="stat">주요 종교 <b>${topReligion ? escapeHTML(topReligion[0]) : '-'}</b></div>
      <div class="stat">반란 세력 <b>${rebelCount}</b></div>
      <div class="stat">진행 연도 <b>${year}</b></div>
    `);

    const logs = ui.logs;
    setHTML(logs, events.slice(-18).reverse().map(e => `
      <div class="log ${e.type}"><span class="small">${e.year}년</span><br>${escapeHTML(e.text)}</div>
    `).join(''));
  }

  // 내용이 바뀐 때만 DOM을 갱신한다 (드롭다운이 닫히거나 레이아웃이 매번 다시 계산되는 것을 방지)
  function setHTML(el, html) {
    if (el._html === html) return;
    el._html = html;
    el.innerHTML = html;
  }

  function format(n) {
    n = Math.floor(n);
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
  }

  // 동맹 최대 인원. 예전에는 3개국이 되면 '연합'으로 바뀌며 더 이상 받지 않았다. 이제는 이 값까지 자유롭게 늘어난다.
  const MAX_ALLIANCE_SIZE = 8;

  function nameAlliance(group) {
    const alive = group.members.map(id => nations[id]).filter(n => n && n.alive);
    if (alive.length <= 3) return `${alive.map(n => n.name).join(' · ')} 동맹`;
    const leader = alive.reduce((x, y) => (y.power > x.power ? y : x));
    return `${leader.name} 동맹`;
  }

  function createAllianceBetween(aId, bId) {
    if (aId === bId) return false;
    const a = nations[aId], b = nations[bId];
    if (!a || !b || !a.alive || !b.alive) return false;
    const ga = getNationGroup(a), gb = getNationGroup(b);
    if (ga && ga === gb) return false;
    if (ga && gb) return false; // 서로 다른 두 동맹을 합치지는 않는다

    let group = ga || gb;
    if (!group) {
      const id = alliances.reduce((m, g) => Math.max(m, g.id), 0) + 1;
      group = { id, type: 'alliance', name: '', color: (a.power >= b.power ? a.color : b.color), members: [aId, bId] };
      alliances.push(group);
    } else {
      if (group.members.length >= MAX_ALLIANCE_SIZE) return false;
      if (!group.members.includes(aId)) group.members.push(aId);
      if (!group.members.includes(bId)) group.members.push(bId);
    }
    group.name = nameAlliance(group);
    for (const id of group.members) {
      const n = nations[id];
      if (n) n.allianceId = group.id;
    }

    logEvent(group.members.length > 2 ? `${(ga ? b : a).name}이(가) ${group.name}에 가입했다.` : `${a.name}과 ${b.name}이(가) 동맹을 맺었습니다.`, 'good');
    renderWorld();
    updateUI();
    return true;
  }


  function endAllianceWithTarget(targetIdValue) {
    const group = alliances.find(g => g.members.includes(targetIdValue));
    if (!group) return;
    for (const id of group.members) {
      const n = nations[id];
      if (n) {
        n.allianceId = null;
      }
    }
    alliances = alliances.filter(g => g !== group);
    logEvent(`${group.name} 동맹이 해체되었습니다.`, 'bad');
    renderWorld();
    updateUI();
  }

  function destroyAllianceForSelected() {
    if (selected < 0) return;
    const group = getNationGroup(nations[selected]);
    if (!group) return;
    endAllianceWithTarget(selected);
  }

  function makePeace(aId, bId) {
    if (aId === bId) return false;
    const war = wars.find(w => (w.a === aId && w.b === bId) || (w.b === aId && w.a === bId));
    if (!war) return false;
    war.active = false;
    wars = wars.filter(w => w.active);
    setTruce(nations[aId], nations[bId], 15);
    logEvent(`${nations[aId].name}과 ${nations[bId].name} 사이에 평화 조약이 체결됐다.`, 'good');
    nations[aId].relations[bId] = Math.max(30, (nations[aId].relations[bId] || 0) + 20);
    nations[bId].relations[aId] = Math.max(30, (nations[bId].relations[aId] || 0) + 20);
    updateUI();
    return true;
  }

  function forceWarBetween(aId, bId) {
    if (aId === bId) return;
    if (getNationGroup(nations[aId]) && getNationGroup(nations[aId]) === getNationGroup(nations[bId])) return;
    const existing = wars.some(w => (w.a === aId && w.b === bId) || (w.b === aId && w.a === bId));
    if (existing) return;
    wars.push({ a: aId, b: bId, age: 0, scoreA: 0, scoreB: 0, goal: '영토', active: true, lastChange: year });
    logEvent(`${nations[aId].name} ↔ ${nations[bId].name} 전쟁 발발!`, 'war');
    callAllies(aId, bId);
    callAllies(bId, aId);
    updateUI();
  }

  function computeNationResources(n) {
    const res = { 철: 0, 금: 0, 곡물: 0, 목재: 0, 석유: 0, 비단: 0, 보석: 0, 낙농: 0 };
    for (const city of n.cities) {
      if (!city.resource) continue;
      res[city.resource] = (res[city.resource] || 0) + (city.capital ? 10 : 6) + (city.level || 1);
    }
    res.곡물 += Math.floor(n.population / 180);
    res.철 += Math.floor(n.army / 30);
    res.금 += Math.floor(n.gold / 200);
    return res;
  }

  function simulateYear() {
    year++;
    const provCounts = new Map();
    for (const p of provinces) if (p.owner >= 0) provCounts.set(p.owner, (provCounts.get(p.owner) || 0) + 1);
    const warTouched = new Set();
    for (const w of wars) if (w.active) { warTouched.add(w.a); warTouched.add(w.b); }
    for (const n of nations) {
      if (!n.alive) continue;
      n.age++;
      const provs = provCounts.get(n.id) || 0;
      const atWar = warTouched.has(n.id);

      // 인구: 영토가 감당할 수 있는 수용량까지만 자란다 (넘치면 서서히 줄어듦)
      const capacity = Math.max(60, provs * (35 + n.tech * 1.1));
      let growth = 0.012 + n.tech * 0.00005;
      if (n.plague > 0) {
        growth -= 0.035;
        n.plague--;
      }
      const room = clamp(1 - n.population / capacity, -0.3, 1);
      const happinessFactor = (n.happiness - 50) * 0.0006;
      n.population = Math.max(1, Math.floor(n.population * (1 + growth * room + happinessFactor * Math.max(0, room))));
      n.demographics.elders = clamp(n.demographics.elders + rand(-0.004, 0.005), 0.08, 0.28);
      n.demographics.children = clamp(n.demographics.children + rand(-0.005, 0.004), 0.18, 0.4);
      n.demographics.adults = clamp(1 - n.demographics.elders - n.demographics.children, 0.4, 0.7);
      const resources = computeNationResources(n);
      // 골드: 세금 수입 - (군 유지비 + 행정비 + 무역 비용). 저축은 매년 2%씩 가치가 줄어 무한정 쌓이지 않는다.
      const income = provs * 3 + n.population * 0.02 + (n.tradeIncome || 0) + (resources[n.cities[0]?.resource] || 0) * 0.8;
      const upkeep = n.army * 0.12 * (atWar ? 1.6 : 1) + provs * 1.5 + (n.tradeCost || 0);
      n.gold = Math.max(0, (n.gold + income - upkeep) * 0.98);
      n.tech = clamp(n.tech + rand(0.01, 0.12) + n.gold * 0.00001, 1, 100);
      n.happiness += rand(-0.6, 0.6) + (n.gold > n.population * 0.4 ? 0.3 : -0.3) + (n.stability > 60 ? 0.2 : -0.4);
      n.happiness = clamp(n.happiness, 0, 100);
      n.stability += rand(-0.7, 0.7) + (n.happiness - 50) * 0.01;
      if (n.gold < 30) n.stability -= 0.3;
      if (n.warExhaustion > 20) n.stability -= 0.7;
      n.stability = clamp(n.stability, 0, 100);
      // 군대: 영토 수에 비례한 규모를 목표로 징집(골드 소모) / 초과분은 서서히 해산
      const desiredArmy = desiredArmyFor(provs, atWar);
      if (n.army < desiredArmy && n.gold > 20) {
        const add = Math.min(Math.max(2, (desiredArmy - n.army) * 0.2), n.gold * 2);
        n.army += add;
        n.gold -= add * 0.5;
      } else if (n.army > desiredArmy * 1.25) {
        n.army -= (n.army - desiredArmy * 1.25) * 0.08;
      }
      n.army = Math.max(1, Math.min(n.army, n.population * 0.45));
      n.power = n.army * (1 + n.tech / 100);
    }

    syncMilitaryUnits();
    refreshWarArrows();
    let territoryChanged = false;

    // 전쟁은 점들이 직접 치른다(updateUnits). 여기서는 종전 조건만 본다:
    // 한쪽이 거의 멸망(시작 때 구역의 15% 이하)하면 끝나고, 오랫동안 영토 변화가 없으면 휴전한다.
    for (const w of wars) {
      if (!w.active) continue;
      w.age++;
      const a = nations[w.a], b = nations[w.b];
      if (!a || !b || !a.alive || !b.alive) {
        w.active = false;
        continue;
      }
      const ca = provinceCount(w.a), cb = provinceCount(w.b);
      if (w.startA === undefined) { w.startA = ca; w.startB = cb; w.lastChange = year; }
      const aBroken = ca < w.startA && ca <= Math.max(1, Math.floor(w.startA * 0.15));
      const bBroken = cb < w.startB && cb <= Math.max(1, Math.floor(w.startB * 0.15));
      if (aBroken || bBroken) {
        const win = aBroken ? b : a, lose = aBroken ? a : b;
        endWar(w, `${win.name}이(가) ${lose.name}을(를) 거의 멸망시키고 전쟁에서 승리했다.`);
      } else if (year - (w.lastChange ?? year) > 35) {
        endWar(w, `${a.name}과(와) ${b.name}의 전쟁이 교착 끝에 휴전으로 끝났다.`);
      }
    }

    wars = wars.filter(w => w.active);
    simulateDiplomacy();
    simulateTrade();
    simulateReligion();
    simulateMigration();
    simulateRebellion();
    randomEvents();
    autoColonization();
    if (needsClaimFix) {
      claimUnclaimedLand();
      needsClaimFix = false;
      territoryChanged = true;
      provSyncNeeded = true;
    }
    if (provSyncNeeded) { syncProvinceOwners(); provSyncNeeded = false; } // 칸 단위로 소유가 바뀐 경우에만 (비용이 큼)
    reconcileCities();
    rebuildNationStats();
    if (nations.some(n => n.isRebel)) territoryChanged = true;

    if (territoryChanged && selected >= 0) computeSelectionBorder();
    if (year % 25 === 0) logEvent(`세계력 ${year}년. 새로운 시대가 열리고 있다.`, 'god');
    if (year % 100 === 0) logEvent(`역사 기록: ${year}년의 세계가 기록되었다.`, 'god');
    if (year % 25 === 0 && gameStarted && window.WFMenu) window.WFMenu.autoSave();
    territoryDirty = true; // 지도·UI 갱신은 syncTerritory가 일정 간격으로 묶어서 처리 (고배속 대비)
  }

  // 구역을 하나도 갖지 못한 국가는 멸망. 남의 구역 안에 떨어진 낱칸은 그 구역 소유자에게 돌려준다.
  function rebuildNationStats() {
    const counts = new Int32Array(nations.length + 1);
    for (const p of provinces) if (p.owner >= 0 && p.owner < counts.length) counts[p.owner]++;
    const dead = new Set();
    for (const n of nations) {
      if (!n.alive) continue;
      if (!(counts[n.id] > 0)) {
        n.alive = false;
        dead.add(n.id);
        if (selected === n.id) selected = -1;
        logEvent(`${n.name}이(가) 역사에서 사라졌다.`, 'war');
        continue;
      }
      n.power = n.army * (1 + n.tech / 100);
    }
    for (let i = 0; i < owner.length; i++) {
      const o = owner[i];
      if (o < 0 || (o < counts.length && counts[o] > 0)) continue;
      const pid = provOf[i];
      owner[i] = pid >= 0 && provinces[pid].owner >= 0 && counts[provinces[pid].owner] > 0 ? provinces[pid].owner : -1;
    }
  }


  function adjacentCells(id, target) {
    const result = [];
    for (let y = 1; y < MAP_H - 1; y++) {
      for (let x = 1; x < MAP_W - 1; x++) {
        const i = idx(x, y);
        if (owner[i] !== target) continue;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          if (owner[idx(x + dx, y + dy)] === id) {
            result.push(i);
            break;
          }
        }
      }
    }
    return result;
  }

  function transferCells(from, to, count) {
    const frontier = adjacentCells(to, from);
    if (!frontier.length) return 0;
    frontier.sort(() => Math.random() - 0.5);
    let changed = 0;
    const queue = frontier.slice(0, Math.min(frontier.length, 3));
    while (queue.length && changed < count) {
      const i = queue.shift();
      if (owner[i] !== from) continue;
      owner[i] = to;
      changed++;
      const x = i % MAP_W, y = Math.floor(i / MAP_W);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (!inside(nx, ny)) continue;
        const ni = idx(nx, ny);
        if (owner[ni] === from && !queue.includes(ni)) queue.push(ni);
      }
    }
    return changed;
  }

  function captureWarfrontCells(from, to, count) {
    const frontier = adjacentCells(to, from);
    let changed = 0;
    const candidates = frontier.length ? frontier : [];
    if (!candidates.length) {
      const attackerCells = [];
      for (let i = 0; i < owner.length; i++) {
        if (owner[i] === to) attackerCells.push(i);
      }
      if (!attackerCells.length) return 0;

      let bestCell = -1;
      let bestDist = Infinity;
      for (let i = 0; i < owner.length; i++) {
        if (owner[i] !== from || !land[i]) continue;
        const x = i % MAP_W, y = Math.floor(i / MAP_W);
        for (const a of attackerCells) {
          const ax = a % MAP_W, ay = Math.floor(a / MAP_W);
          const d = Math.abs(x - ax) + Math.abs(y - ay);
          if (d < bestDist) {
            bestDist = d;
            bestCell = i;
          }
        }
      }
      if (bestCell >= 0) {
        owner[bestCell] = to;
        changed = 1;
      }
      return changed;
    }

    candidates.sort(() => Math.random() - 0.5);
    const queue = candidates.slice(0, Math.min(candidates.length, 4));
    while (queue.length && changed < count) {
      const i = queue.shift();
      if (owner[i] !== from) continue;
      owner[i] = to;
      changed++;
      const x = i % MAP_W, y = Math.floor(i / MAP_W);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (!inside(nx, ny)) continue;
        const ni = idx(nx, ny);
        if (owner[ni] === from && !queue.includes(ni)) queue.push(ni);
      }
    }
    return changed;
  }

  // ===== 외교 AI: 국가가 알아서 관계를 쌓고, 동맹을 맺고, 전쟁을 선포한다 =====
  function relOf(a, b) { return a.relations[b.id] || 0; }
  function sameGroup(a, b) { const g = getNationGroup(a); return !!g && g === getNationGroup(b); }
  function truceActive(a, b) { return ((a.truce && a.truce[b.id]) || 0) > year; }
  function setTruce(a, b, years) {
    a.truce = a.truce || {};
    b.truce = b.truce || {};
    a.truce[b.id] = b.truce[a.id] = year + years;
  }

  // 동맹이 있으면 동맹 전체의 국력
  function sidePower(n) {
    const g = getNationGroup(n);
    if (!g) return n.power;
    return g.members.reduce((s, id) => s + (nations[id]?.alive ? nations[id].power : 0), 0);
  }

  function simulateDiplomacy() {
    const living = nations.filter(n => n.alive && nations[n.id] === n);
    const foes = new Map();
    for (const w of wars) {
      if (!w.active) continue;
      for (const [x, y] of [[w.a, w.b], [w.b, w.a]]) {
        if (!foes.has(x)) foes.set(x, new Set());
        foes.get(x).add(y);
      }
    }
    const atWar = (x, y) => !!foes.get(x)?.has(y);

    // 1) 관계 변화: 전쟁 중이면 악화, 같은 적이 있으면 호전, 평화로우면 서서히 가까워짐
    for (const a of living) {
      for (const bId of neighbors(a.id)) {
        const b = nations[bId];
        if (!b?.alive) continue;
        if (a.relations[bId] === undefined) a.relations[bId] = rand(-20, 20);
        if (b.relations[a.id] === undefined) b.relations[a.id] = rand(-20, 20);
        let d = rand(-0.35, 0.5);
        if (atWar(a.id, bId)) d = -2.5;
        else if (sameGroup(a, b)) d = 0.6;
        else {
          const fa = foes.get(a.id), fb = foes.get(bId);
          if (fa && fb && [...fa].some(f => fb.has(f))) d += 1.5;
        }
        a.relations[bId] = clamp(a.relations[bId] + d, -100, 100);
      }
    }

    // 2) 사라진 국가가 낀 동맹 정리
    for (const g of alliances.slice()) {
      const alive = g.members.filter(id => nations[id]?.alive);
      if (alive.length < 2) endAllianceWithTarget(g.members[0]);
      else if (alive.length !== g.members.length) {
        g.members = alive;
        g.name = nameAlliance(g);
      }
    }

    // 3) 동맹 체결: 사이가 좋거나 같은 적을 둔 이웃과
    for (const a of living) {
      if (a.isRebel || rand() > 0.06) continue;
      const ga = getNationGroup(a);
      if (ga && ga.members.length >= MAX_ALLIANCE_SIZE) continue;
      let best = null, bestScore = 15;
      for (const bId of neighbors(a.id)) {
        const b = nations[bId];
        if (!b?.alive || b.isRebel || atWar(a.id, bId)) continue;
        const gb = getNationGroup(b);
        if (gb && (gb === ga || gb.members.length >= MAX_ALLIANCE_SIZE)) continue;
        if (ga && gb) continue;
        const members = [...(ga ? ga.members : [a.id]), ...(gb ? gb.members : [b.id])];
        if (members.some(x => members.some(y => x !== y && atWar(x, y)))) continue;
        let score = (relOf(a, b) + relOf(b, a)) / 2;
        const fa = foes.get(a.id), fb = foes.get(bId);
        if (fa && fb && [...fa].some(f => fb.has(f))) score += 30;
        if (score > bestScore) { best = b; bestScore = score; }
      }
      if (best) createAllianceBetween(a.id, best.id);
    }

    // 4) 동맹 이탈: 구성원과 사이가 크게 나빠진 나라가 동맹을 떠난다 (동맹 전체가 깨지지는 않음)
    for (const g of alliances.slice()) {
      let worst = null, worstRel = -20;
      for (const x of g.members) {
        for (const y of g.members) {
          if (x === y) continue;
          const r = nations[x]?.relations[y] ?? 0;
          if (r < worstRel) { worstRel = r; worst = x; }
        }
      }
      if (worst !== null && rand() < 0.1) leaveAlliance(g, worst);
    }

    // 5) 전쟁 선포: 야심 있는 국가가 만만한 이웃을 노린다
    const avgPower = living.reduce((s, n) => s + n.power, 0) / Math.max(1, living.length);
    for (const a of living) {
      if (a.isRebel) continue;
      if (wars.filter(w => w.active && (w.a === a.id || w.b === a.id)).length >= 2) continue;
      let ambition = 0.012;
      if (a.ideology === '군주제' || a.ideology === '신권정') ambition += 0.008;
      if (a.religion === '전사') ambition += 0.01;
      if (a.power > avgPower) ambition += 0.006;
      if (rand() > ambition) continue;

      let target = null, bestScore = 0;
      for (const bId of neighbors(a.id)) {
        const b = nations[bId];
        if (!b?.alive || atWar(a.id, bId) || sameGroup(a, b) || truceActive(a, b)) continue;
        if (sidePower(b) > sidePower(a) * 1.6) continue;
        let score = -relOf(a, b) + (a.power / Math.max(1, b.power) - 1) * 30;
        if (provinces.some(p => p.owner === a.id && p.adj.some(q => provinces[q].owner === bId))) score += 15;
        if (score > bestScore) { target = b; bestScore = score; }
      }
      if (target && bestScore > 8) forceWarBetween(a.id, target.id);
    }
  }

  function leaveAlliance(g, id) {
    const n = nations[id];
    g.members = g.members.filter(m => m !== id);
    if (n) n.allianceId = null;
    logEvent(`${n ? n.name : '어떤 나라'}이(가) ${g.name}을(를) 떠났다.`, 'bad');
    if (g.members.length < 2) endAllianceWithTarget(g.members[0] ?? id);
    else g.name = nameAlliance(g);
  }

  // 전쟁이 나면 양쪽 동맹국이 각자 편을 들어 참전한다
  function callAllies(callerId, enemyId) {
    const caller = nations[callerId];
    const group = getNationGroup(caller);
    if (!group) return;
    const enemyGroup = getNationGroup(nations[enemyId]);
    if (enemyGroup === group) return;
    for (const id of group.members) {
      if (id === callerId || id === enemyId) continue;
      const ally = nations[id];
      if (!ally?.alive || findWar(id, enemyId)) continue;
      if (rand() < 0.85) {
        wars.push({ a: id, b: enemyId, age: 0, scoreA: 0, scoreB: 0, goal: '동맹 참전', active: true, lastChange: year });
        logEvent(`${ally.name}이(가) 동맹 ${caller.name}을(를) 돕기 위해 참전했다.`, 'war');
      }
    }
  }

  function endWar(w, text) {
    w.active = false;
    const a = nations[w.a], b = nations[w.b];
    if (a && b) setTruce(a, b, 20);
    logEvent(text, 'war');
  }


  function randomEvents() {
    if (rand() < 0.012) {
      const alive = nations.filter(n => n.alive);
      if (!alive.length) return;
      const n = alive[irand(0, alive.length - 1)];
      n.population = Math.max(1, Math.floor(n.population * 0.92));
      n.gold = Math.max(0, n.gold - irand(20, 80));
      n.stability -= irand(3, 12);
      logEvent(`${n.name}에 흉년이 발생했다. 인구와 경제가 감소했다.`, 'bad');
    }
    if (rand() < 0.008) {
      const alive = nations.filter(n => n.alive);
      if (!alive.length) return;
      const n = alive[irand(0, alive.length - 1)];
      n.tech += rand(2, 6);
      n.gold += irand(30, 100);
      logEvent(`${n.name}에서 새로운 기술이 발견됐다.`, 'good');
    }
  }

  function simulateTrade() {
    for (const a of nations) {
      if (!a.alive) continue;
      a.tradeIncome = 0;
      a.tradeCost = 0;
      const ns = neighbors(a.id);
      const aRes = computeNationResources(a);
      const aMain = Object.entries(aRes).sort((x, y) => y[1] - x[1])[0]?.[0];
      for (const bId of ns) {
        const b = nations[bId];
        if (!b?.alive) continue;
        const rel = (a.relations[bId] || 0);
        if (rel < 10) continue;
        const bRes = computeNationResources(b);
        const bMain = Object.entries(bRes).sort((x, y) => y[1] - x[1])[0]?.[0];
        if (bMain && bMain !== aMain) {
          const bonus = 3 + rel * 0.04;
          a.tradeIncome += bonus;
          a.tradeCost += 1 + bonus * 0.4; // 무역로마다 호위·관세·운송 비용이 든다 (매년 골드에서 빠져나감)
          if (rand() < 0.003) logEvent(`${a.name}과(와) ${b.name} 사이에 ${aMain}-${bMain} 무역로가 번성하고 있다.`, 'good');
        }
      }
    }
  }

  function simulateReligion() {
    for (const a of nations) {
      if (!a.alive) continue;
      const ns = neighbors(a.id);
      for (const bId of ns) {
        const b = nations[bId];
        if (!b?.alive || b.religion === a.religion) continue;
        const rel = (a.relations[bId] || 0);
        const holySites = a.cities.filter(c => c.holy).length;
        const pressure = (a.tech * 0.002 + holySites * 0.015 + Math.max(0, rel) * 0.0006);
        if (rand() < pressure * 0.05) {
          const old = b.religion;
          b.religion = a.religion;
          b.stability -= 6;
          logEvent(`${b.name}에서 ${old} 신자들이 ${a.religion}(으)로 개종하기 시작했다.`, 'god');
        }
      }
    }
  }

  function simulateMigration() {
    for (const a of nations) {
      if (!a.alive) continue;
      const ns = neighbors(a.id);
      for (const bId of ns) {
        const b = nations[bId];
        if (!b?.alive) continue;
        if (a.happiness < b.happiness - 20 && rand() < 0.01) {
          const moved = Math.floor(a.population * 0.01);
          if (moved > 0) {
            a.population = Math.max(1, a.population - moved);
            b.population += moved;
            logEvent(`${a.name}의 불만을 느낀 백성들이 ${b.name}(으)로 이주했다.`, 'bad');
          }
        }
      }
    }
  }

  // 식민지화는 구역 단위 점령 체계와 맞지 않아 제거했다 (예전엔 남의 구역에 낱칸만 찍던 방식).
  function autoColonization() {}

  // ===== 반란 =====
  // 불만(unrest)은 안정도·행복도·전쟁·제국 규모·정복지 비율에서 쌓인다.
  // 1) 불만이 높은 나라는 영토 일부가 반란 국가로 떨어져 나가고, 2) 정복당한 구역은 해방/독립을 노린다.
  function createRebelNation(parent, grabbed, name, goal) {
    const total = Math.max(1, provinceCount(parent.id));
    const share = grabbed.length / total;
    const start = grabbed[0];
    const sx = Math.floor(start.cx), sy = Math.floor(start.cy);
    const id = nations.length;
    const popShare = Math.max(10, Math.min(parent.population - 10, Math.floor(parent.population * share)));
    const armyShare = Math.max(ARMY_PER_DOT * 3, Math.floor(parent.army * share));
    parent.population = Math.max(10, parent.population - popShare);
    parent.army = Math.max(ARMY_PER_DOT, parent.army - armyShare);
    parent.stability = clamp(parent.stability + 12, 0, 100);
    parent.unrest = (parent.unrest || 0) * 0.5;
    parent.lowStabYears = 0;

    const rebel = {
      id, name, color: pickNationColor(), species: parent.species, ideology: '부족연맹',
      seedX: sx, seedY: sy, population: popShare, army: armyShare, gold: Math.floor(parent.gold * 0.15),
      tech: parent.tech * 0.7, stability: rand(45, 65), power: 0, age: 0, alive: true, cities: [], capital: { x: sx, y: sy }, relations: {},
      plague: 0, warExhaustion: 0, allianceId: null, unionId: null, religion: parent.religion, happiness: rand(45, 65),
      demographics: { children: 0.32, adults: 0.53, elders: 0.15 }, tradeIncome: 0, lowStabYears: 0, isRebel: true, parentId: parent.id, unrest: 0
    };
    for (const p of grabbed) {
      for (const c of p.cells) if (owner[c] === parent.id) owner[c] = id;
      p.owner = id;
      p.origOwner = id;
      p.capture = null;
    }
    provVersion++;
    for (const c of parent.cities.slice()) {
      if (cityOwner(c) === id) rebel.cities.push(c);
    }
    parent.cities = parent.cities.filter(c => !rebel.cities.includes(c));
    if (!rebel.cities.length) {
      rebel.cities.push({ x: sx, y: sy, name: `${rebel.name} 근거지`, capital: true, level: 1, resource: pickResource(), holy: false });
    } else {
      rebel.cities.forEach(c => { c.capital = false; });
      rebel.cities[0].capital = true;
      rebel.capital = { x: rebel.cities[0].x, y: rebel.cities[0].y };
    }
    if (!parent.cities.some(c => c.capital) && parent.cities.length) parent.cities[0].capital = true;

    nations.push(rebel);
    wars.push({ a: parent.id, b: id, age: 0, scoreA: 0, scoreB: 0, goal: goal || '독립', active: true, lastChange: year });
    deathFx.push({ x: rebel.capital.x + 0.5, y: rebel.capital.y + 0.5, t: 2.4, kind: 'rebel' });
    territoryDirty = true;
    syncMilitaryUnits();
    return rebel;
  }

  // 대규모 반란: 수도를 뺀 영토의 약 30%가 한꺼번에 떨어져 나간다
  // 세계가 잘게 부서지지 않도록: 살아있는 국가 수 상한(시작 국가 수의 약 1.6배) + 나라별 40년 쿨다운
  function canSpawnRebels() {
    const alive = nations.filter(n => n.alive).length;
    return alive < Math.max(initialNationCount * 1.6, initialNationCount + 8);
  }

  function spawnRebellion(n) {
    if (!canSpawnRebels() || year - (n.lastRebellion ?? -999) < 40) return;
    const mine = provinces.filter(p => p.owner === n.id && !p.capture);
    if (mine.length < 3) return;
    n.lastRebellion = year;
    const candidates = mine.filter(p => !isCapitalProvince(p));
    if (!candidates.length) return;
    const start = candidates[irand(0, candidates.length - 1)];
    const grabCount = Math.max(1, Math.floor(mine.length * 0.3));
    const grabbed = [];
    const seenProv = new Set([start.id]);
    const queue = [start];
    while (queue.length && grabbed.length < grabCount) {
      const p = queue.shift();
      grabbed.push(p);
      for (const q of p.adj) {
        const qp = provinces[q];
        if (!seenProv.has(q) && qp.owner === n.id && !qp.capture && !isCapitalProvince(qp)) { seenProv.add(q); queue.push(qp); }
      }
    }
    const rebel = createRebelNation(n, grabbed, `${n.name} 반란군`, '독립');
    logEvent(`${n.name}의 불만이 폭발해 ${rebel.name}이(가) 봉기했다!`, 'war');
  }

  // 점령지 봉기: 원래 주인에게 돌아가거나(해방), 독립 국가를 세운다
  function spawnProvinceRevolt(p, n) {    const orig = nations[p.origOwner];
    const group = [p];
    for (const q of p.adj) {
      const qp = provinces[q];
      if (group.length >= 3) break;
      if (qp.owner === n.id && qp.origOwner === p.origOwner && !qp.capture && !isCapitalProvince(qp)) group.push(qp);
    }
    if (orig && orig.alive && orig.id !== n.id && rand() < 0.6) {
      for (const q of group) {
        for (const c of q.cells) if (owner[c] === n.id) owner[c] = orig.id;
        q.owner = orig.id;
        q.conqueredYear = year;
      }
      provVersion++;
      territoryDirty = true;
      deathFx.push({ x: p.cx, y: p.cy, t: 2.4, kind: 'rebel' });
      logEvent(`${n.name}이(가) 점령했던 땅이 봉기해 ${orig.name}에게 돌아갔다.`, 'war');
      return;
    }
    if (!canSpawnRebels()) return;
    const rebel = createRebelNation(n, group, orig ? `${orig.name} 해방군` : `${n.name} 반란군`, '독립');
    logEvent(`${n.name}의 점령지에서 ${rebel.name}이(가) 봉기했다!`, 'war');
  }

  function simulateRebellion() {
    const living = nations.filter(n => n.alive && nations[n.id] === n);
    const warCount = new Map();
    for (const w of wars) {
      if (!w.active) continue;
      warCount.set(w.a, (warCount.get(w.a) || 0) + 1);
      warCount.set(w.b, (warCount.get(w.b) || 0) + 1);
    }
    const byOwner = new Map();
    for (const p of provinces) {
      if (p.owner < 0) continue;
      if (!byOwner.has(p.owner)) byOwner.set(p.owner, []);
      byOwner.get(p.owner).push(p);
    }

    for (const n of living) {
      // 반란군이 오래 버티면 정식 국가로 인정받는다
      if (n.isRebel) {
        if (n.age >= 25) {
          const old = n.name;
          n.isRebel = false;
          n.name = pickNationName();
          for (const c of n.cities) if (c.capital) c.name = `${n.name} 수도`;
          logEvent(`${old}이(가) 독립 국가 ${n.name}(으)로 인정받았다.`, 'good');
        }
        continue;
      }
      const mine = byOwner.get(n.id) || [];
      const conquered = mine.filter(p => p.origOwner >= 0 && p.origOwner !== n.id && year - p.conqueredYear < 60);
      const target = clamp(
        (60 - n.stability) * 0.9 + (50 - n.happiness) * 0.5 + (warCount.get(n.id) || 0) * 4 +
        Math.max(0, mine.length - 6) * 3 + (conquered.length / Math.max(1, mine.length)) * 30, 0, 100);
      n.unrest = (n.unrest || 0) + (target - (n.unrest || 0)) * 0.1;
      n.lowStabYears = n.stability < 22 ? (n.lowStabYears || 0) + 1 : 0;

      for (const p of conquered) {
        if (p.capture || isCapitalProvince(p)) continue;
        if (rand() < 0.004 + n.unrest * 0.0004) { spawnProvinceRevolt(p, n); break; }
      }
      if (!n.alive) continue;
      if (mine.length >= 3 && ((n.unrest > 45 && rand() < (n.unrest - 45) / 700) || (n.lowStabYears >= 5 && rand() < 0.06))) spawnRebellion(n);
    }
  }


  function refreshWarArrows() {
    warArrows = [];
    for (const w of wars) {
      if (!w.active) continue;
      const a = nations[w.a], b = nations[w.b];
      if (!a || !b || !a.alive || !b.alive) continue;
      const aCity = a.cities.find(c => c.capital) || a.cities[0];
      const bCity = b.cities.find(c => c.capital) || b.cities[0];
      if (!aCity || !bCity) continue;
      warArrows.push({
        x1: aCity.x + 0.5,
        y1: aCity.y + 0.5,
        x2: bCity.x + 0.5,
        y2: bCity.y + 0.5,
        color: a.color
      });
    }
  }

  // ===== 점 이동 · 전투 · 구역 점령 (매 프레임) =====
  const LAND_SPEED = 24;     // 행군 속도 (칸/초, 게임 시간)
  const SEA_SPEED = 16;      // 바다는 땅보다 느림
  const WANDER_SPEED = 9;    // 구역 안에서 뽈뽈거리는 속도
  const FIGHT_RANGE = 7;
  const KILL_RATE = 0.5;     // 점 하나가 초당 적 점 하나를 쓰러뜨릴 확률(근사)
  const CAP_RATE = 0.07;     // 점 1개당 초당 점령 진행도 (1.0 = 구역 전체)
  const ATTACK_GROUP = 8;    // 한 구역에 보내는 점의 수
  const BATTLE_GOLD_PER_SEC = 1.2; // 교전 중인 점 하나가 초당 쓰는 골드
  const DEATH_GOLD = 4;            // 점 하나가 쓰러질 때마다 드는 골드
  let deathFx = [];
  const orderTimers = new Map();

  function isLandAt(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    return inside(ix, iy) && land[idx(ix, iy)] === 1;
  }

  function findWar(a, b) {
    return wars.find(w => w.active && ((w.a === a && w.b === b) || (w.a === b && w.b === a)));
  }

  function addWarScore(w, side, v) {
    if (w.a === side) w.scoreA += v; else w.scoreB += v;
  }

  // 빠른 배속에서도 점이 구역을 건너뛰지 않도록 시간을 잘게 나눠 진행
  function updateUnits(dt) {
    if (!armyUnits.length || dt <= 0) return;
    const steps = Math.min(40, Math.ceil(dt / 0.25));
    for (let s = 0; s < steps; s++) updateUnitsStep(dt / steps);
  }

  // 통행 규칙: 자국 · 적국 · 동맹 · 주인 없는 땅만 지나갈 수 있고, 중립국 영토는 통과할 수 없다
  let pathCache = new Map();
  let pathCacheKey = '', pathCacheAge = 0;
  function provAllowed(nid, foes, p) {
    const o = p.owner;
    if (o < 0 || o === nid || (foes && foes.has(o))) return true;
    const a = nations[nid], b = nations[o];
    return !!(a && b && sameGroup(a, b));
  }

  // goal 구역에서 거꾸로 퍼져 나가며 통행 가능한 구역까지의 거리를 계산 (-1이면 갈 수 없음)
  function distMapTo(nid, foes, goal) {
    const key = nid * 100000 + goal;
    let d = pathCache.get(key);
    if (d) return d;
    d = new Int32Array(provinces.length).fill(-1);
    d[goal] = 0;
    const q = [goal];
    for (let h = 0; h < q.length; h++) {
      const p = provinces[q[h]];
      for (const a of p.adj) {
        if (d[a] >= 0 || !provAllowed(nid, foes, provinces[a])) continue;
        d[a] = d[p.id] + 1;
        q.push(a);
      }
    }
    pathCache.set(key, d);
    return d;
  }

  // 바다를 건너는 직선 경로가 중립국 땅을 지나지 않는지 확인
  function lineClear(nid, foes, x1, y1, x2, y2) {
    const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 2);
    for (let s = 1; s < steps; s++) {
      const x = Math.floor(x1 + (x2 - x1) * s / steps), y = Math.floor(y1 + (y2 - y1) * s / steps);
      if (!inside(x, y) || !land[idx(x, y)]) continue;
      const pid = provOf[idx(x, y)];
      if (pid >= 0 && !provAllowed(nid, foes, provinces[pid])) return false;
    }
    return true;
  }

  function canReach(n, foes, goalProv, mine) {
    if (!mine.length) return true;
    const d = distMapTo(n.id, foes, goalProv.id);
    if (mine.some(q => d[q.id] >= 0)) return true;
    let near = mine[0], nd = Infinity;
    for (const q of mine) {
      const dd = Math.hypot(goalProv.cx - q.cx, goalProv.cy - q.cy);
      if (dd < nd) { nd = dd; near = q; }
    }
    return lineClear(n.id, foes, near.cx, near.cy, goalProv.cx, goalProv.cy);
  }

  function updateUnitsStep(dt) {
    // 구역 소유 · 전쟁 · 동맹이 바뀌지 않았다면 경로 계산을 잠시 재사용
    const ck = `${provVersion}:${wars.length}:${alliances.length}`;
    if (ck !== pathCacheKey || ++pathCacheAge > 30) { pathCache = new Map(); pathCacheKey = ck; pathCacheAge = 0; }
    const foesOf = new Map();
    for (const w of wars) {
      if (!w.active) continue;
      if (!foesOf.has(w.a)) foesOf.set(w.a, new Set());
      if (!foesOf.has(w.b)) foesOf.set(w.b, new Set());
      foesOf.get(w.a).add(w.b);
      foesOf.get(w.b).add(w.a);
    }
    const ownedProvs = new Map();
    for (const p of provinces) {
      if (p.owner < 0) continue;
      if (!ownedProvs.has(p.owner)) ownedProvs.set(p.owner, []);
      ownedProvs.get(p.owner).push(p.id);
    }

    // 점의 현재 위치 파악: 구역별 병력, 국가별 점, 근접 탐색용 격자
    const dotsByOwner = new Map();
    const presence = new Map();
    const grid = new Map();
    for (const u of armyUnits) {
      const n = nations[u.owner];
      if (u.dead || !n || !n.alive) { u.dead = true; continue; }
      const ix = Math.floor(u.x), iy = Math.floor(u.y);
      const onLand = inside(ix, iy) && land[idx(ix, iy)] === 1;
      u.sea = !onLand;
      u.prov = onLand ? provOf[idx(ix, iy)] : -1;
      if (!dotsByOwner.has(u.owner)) dotsByOwner.set(u.owner, []);
      dotsByOwner.get(u.owner).push(u);
      if (u.prov >= 0) {
        if (!presence.has(u.prov)) presence.set(u.prov, new Map());
        const m = presence.get(u.prov);
        m.set(u.owner, (m.get(u.owner) || 0) + 1);
      }
      const key = (ix >> 4) + (iy >> 4) * 128;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push(u);
    }

    // 전쟁 중인 국가는 주기적으로 작전(방어/공격 구역)을 새로 짠다
    for (const [id, foes] of foesOf) {
      const n = nations[id];
      if (!n || !n.alive) continue;
      const t = (orderTimers.get(id) ?? 0) - dt;
      if (t <= 0) {
        orderTimers.set(id, 1.2 + Math.random() * 0.6);
        assignOrders(n, foes, dotsByOwner, presence, ownedProvs);
      } else {
        orderTimers.set(id, t);
      }
    }

    for (const u of armyUnits) {
      if (u.dead) continue;
      const n = nations[u.owner];
      const foes = foesOf.get(u.owner);
      u.fighting = false;

      // 평시에는 자국 구역에 머문다
      let gp = u.goal >= 0 ? provinces[u.goal] : null;
      if (!foes && (!gp || gp.owner !== u.owner)) {
        u.goal = homeGoal(u, ownedProvs);
        gp = u.goal >= 0 ? provinces[u.goal] : null;
      } else if (!gp) {
        u.goal = homeGoal(u, ownedProvs);
        gp = u.goal >= 0 ? provinces[u.goal] : null;
      }

      // 가까운 적 점 찾기
      let enemy = null;
      if (foes) {
        let best = FIGHT_RANGE * FIGHT_RANGE;
        const gx = Math.floor(u.x) >> 4, gy = Math.floor(u.y) >> 4;
        for (let ox = -1; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            const list = grid.get((gx + ox) + (gy + oy) * 128);
            if (!list) continue;
            for (const e of list) {
              if (e.dead || !foes.has(e.owner)) continue;
              const d = (e.x - u.x) * (e.x - u.x) + (e.y - u.y) * (e.y - u.y);
              if (d < best) { best = d; enemy = e; }
            }
          }
        }
      }

      let tx = u.x, ty = u.y, speed = 0;
      const marchSpeed = (u.sea ? SEA_SPEED : LAND_SPEED) * u.spd;
      if (enemy) {
        u.fighting = true;
        tx = enemy.x; ty = enemy.y;
        speed = Math.hypot(enemy.x - u.x, enemy.y - u.y) > 2 ? marchSpeed * 0.5 : 0;
        const en = nations[enemy.owner];
        n.gold = Math.max(0, n.gold - BATTLE_GOLD_PER_SEC * dt); // 싸우는 동안 매 순간 군수 비용
        // 골드가 바닥난 나라는 보급이 끊겨 전투력이 떨어진다
        const mult = (1 + n.tech / 200) / (1 + (en ? en.tech : 0) / 200) * (n.gold < 1 ? 0.6 : 1);
        if (!enemy.dead && Math.random() < 1 - Math.exp(-KILL_RATE * mult * dt)) killDot(enemy);
      } else if (gp && u.prov === u.goal) {
        // 목표 구역에 도착: 구역 안을 뽈뽈거리며 돌아다닌다
        u.wait -= dt;
        if (u.wait <= 0 || Math.hypot(u.tx - u.x, u.ty - u.y) < 0.6) {
          u.wait = 0.4 + Math.random() * 1.0;
          for (let k = 0; k < 8; k++) {
            const wx = u.x + (Math.random() - 0.5) * 22, wy = u.y + (Math.random() - 0.5) * 22;
            const wxi = Math.floor(wx), wyi = Math.floor(wy);
            if (inside(wxi, wyi) && provOf[idx(wxi, wyi)] === u.goal) { u.tx = wx; u.ty = wy; break; }
          }
        }
        tx = u.tx; ty = u.ty; speed = WANDER_SPEED * u.spd;
      } else if (gp) {
        tx = gp.cx + u.ox * 3; ty = gp.cy + u.oy * 3; speed = marchSpeed;
        if (!u.sea && u.prov >= 0 && u.prov !== u.goal) {
          const dm = distMapTo(u.owner, foes, u.goal);
          const cur = dm[u.prov];
          if (cur > 0) {
            // 통행 가능한 구역만 이어서 다음 구역 중심으로 행군
            let hop = null, hd = Infinity;
            for (const a of provinces[u.prov].adj) {
              if (dm[a] !== cur - 1) continue;
              const dd = Math.hypot(provinces[a].cx - u.x, provinces[a].cy - u.y);
              if (dd < hd) { hd = dd; hop = provinces[a]; }
            }
            if (hop) { tx = hop.cx; ty = hop.cy; }
          } else if (cur < 0 && gp.owner !== u.owner) {
            // 갈 수 없는 땅에 서 있으면 철수
            u.goal = homeGoal(u, ownedProvs);
          }
        }
      }

      const dx = tx - u.x, dy = ty - u.y;
      const dist = Math.hypot(dx, dy);
      if (speed > 0 && dist > 0.05) {
        const m = Math.min(speed * dt, dist);
        u.x = clamp(u.x + dx / dist * m, 0.5, MAP_W - 1.5);
        u.y = clamp(u.y + dy / dist * m, 0.5, MAP_H - 1.5);
      }
    }

    if (armyUnits.some(u => u.dead)) armyUnits = armyUnits.filter(u => !u.dead);
    for (const fx of deathFx) fx.t -= dt;
    if (deathFx.length) deathFx = deathFx.filter(fx => fx.t > 0);

    // 구역 점령: 적 점이 없는 구역에 공격국 점이 있으면 진행도가 오르고, 땅이 중심부터 번져 나가며 색이 바뀐다
    for (const p of provinces) {
      const pres = presence.get(p.id);
      let attacker = -1, attDots = 0, contested = false;
      if (pres && p.owner >= 0) {
        const ownerFoes = foesOf.get(p.owner);
        if (ownerFoes) for (const [o, c] of pres) if (ownerFoes.has(o) && c > attDots) { attacker = o; attDots = c; }
        if (attacker >= 0) {
          const af = foesOf.get(attacker);
          for (const [o] of pres) if (o !== attacker && af && af.has(o)) { contested = true; break; }
        }
      }
      if (attacker >= 0 && !contested) {
        if (!p.capture) p.capture = startCapture(p, attacker);
        if (p.capture.to === attacker) p.capture.progress = Math.min(1, p.capture.progress + attDots * CAP_RATE * dt);
        else p.capture.progress -= 0.2 * dt;
      } else if (p.capture && attacker < 0) {
        p.capture.progress -= 0.1 * dt;
      }
      if (p.capture) applyCapture(p);
    }
  }

  function killDot(e) {
    e.dead = true;
    const en = nations[e.owner];
    if (en) {
      en.army = Math.max(1, en.army - ARMY_PER_DOT);
      en.gold = Math.max(0, en.gold - DEATH_GOLD); // 쓰러진 병사의 보충 비용
    }
    deathFx.push({ x: e.x, y: e.y, t: 0.7 });
  }

  function homeGoal(u, ownedProvs) {
    const list = ownedProvs.get(u.owner);
    return list && list.length ? list[u.slot % list.length] : -1;
  }

  // 작전: 적이 들어온 아군 구역은 방어, 나머지 점은 가치 높은 적 구역으로 무리 지어 공격
  function assignOrders(n, foes, dotsByOwner, presence, ownedProvs) {
    const free = (dotsByOwner.get(n.id) || []).slice();
    if (!free.length) return;
    const byDistTo = p => (a, b) => Math.hypot(a.x - p.cx, a.y - p.cy) - Math.hypot(b.x - p.cx, b.y - p.cy);

    const threatened = [];
    for (const pid of ownedProvs.get(n.id) || []) {
      const pres = presence.get(pid);
      if (!pres) continue;
      let hostile = 0;
      for (const [o, c] of pres) if (foes.has(o)) hostile += c;
      if (hostile > 0) threatened.push({ p: provinces[pid], hostile });
    }
    threatened.sort((a, b) => b.hostile - a.hostile);
    for (const t of threatened) {
      if (!free.length) break;
      free.sort(byDistTo(t.p));
      const need = Math.ceil(t.hostile * 1.5) + 1;
      for (let k = 0; k < need && free.length; k++) free.shift().goal = t.p.id;
    }
    if (!free.length) return;

    const targets = attackCandidates(n, foes, presence, ownedProvs);
    if (!targets.length) return;
    let ti = 0;
    while (free.length && ti < Math.min(targets.length, 6)) {
      const p = targets[ti++];
      free.sort(byDistTo(p));
      const take = Math.min(free.length, ATTACK_GROUP);
      for (let k = 0; k < take; k++) free.shift().goal = p.id;
    }
    for (const u of free) u.goal = targets[0].id;
  }

  function attackCandidates(n, foes, presence, ownedProvs) {
    const mine = (ownedProvs.get(n.id) || []).map(id => provinces[id]);
    const out = [];
    for (const p of provinces) {
      if (!foes.has(p.owner)) continue;
      if (!canReach(n, foes, p, mine)) continue; // 중립국을 가로질러야 하면 공격 대상에서 제외
      let near = mine.length ? Infinity : 0;
      for (const q of mine) {
        const d = Math.hypot(p.cx - q.cx, p.cy - q.cy);
        if (d < near) near = d;
      }
      let score = near;
      if (p.adj.some(a => provinces[a].owner === n.id)) score -= 50;
      if (p.capture && p.capture.to === n.id) score -= 90;
      const pres = presence.get(p.id);
      if (pres) for (const [o, c] of pres) if (foes.has(o)) score += c * 10;
      if (isCapitalProvince(p)) score -= 20;
      out.push({ p, score });
    }
    out.sort((a, b) => a.score - b.score);
    // 영토가 흩어지지 않도록, 우리 땅과 맞닿은(또는 점령 중인) 구역이 있으면 그쪽만 노린다
    const joined = out.filter(o => o.p.adj.some(a => provinces[a].owner === n.id) || (o.p.capture && o.p.capture.to === n.id));
    return (joined.length ? joined : out).map(o => o.p);
  }

  function isCapitalProvince(p) {
    const n = nations[p.owner];
    if (!n || !n.capital) return false;
    return provOf[idx(clamp(Math.floor(n.capital.x), 0, MAP_W - 1), clamp(Math.floor(n.capital.y), 0, MAP_H - 1))] === p.id;
  }

  function startCapture(p, to) {
    // 공격국 땅과 맞닿은 칸에서부터 번져 나가 점령지가 한 덩어리로 이어지게 한다
    const seeds = [];
    for (const c of p.cells) {
      const x = c % MAP_W, y = Math.floor(c / MAP_W);
      if ((x > 0 && owner[c - 1] === to) || (x < MAP_W - 1 && owner[c + 1] === to) ||
          (y > 0 && owner[c - MAP_W] === to) || (y < MAP_H - 1 && owner[c + MAP_W] === to)) seeds.push(x, y);
    }
    const sstep = Math.max(2, Math.ceil(seeds.length / 80)) & ~1; // (x,y) 쌍 단위로 솎아내기
    const keyed = Array.from(p.cells, c => {
      const cx = c % MAP_W, cy = Math.floor(c / MAP_W);
      let best = Infinity;
      if (seeds.length) {
        for (let k = 0; k < seeds.length; k += sstep) {
          const dx = cx - seeds[k], dy = cy - seeds[k + 1];
          const d = dx * dx + dy * dy;
          if (d < best) best = d;
        }
      } else {
        const dx = cx - p.cx, dy = cy - p.cy;
        best = dx * dx + dy * dy;
      }
      return [best + Math.random() * 8, c];
    });
    keyed.sort((a, b) => a[0] - b[0]);
    return { to, from: p.owner, progress: 0, flipped: 0, order: Int32Array.from(keyed, k => k[1]) };
  }

  function applyCapture(p) {
    const cap = p.capture;
    const total = cap.order.length;
    const target = cap.progress <= 0 ? 0 : cap.progress >= 1 ? total : Math.floor(cap.progress * total);
    let changed = false;
    while (cap.flipped < target) {
      const c = cap.order[cap.flipped++];
      if (owner[c] === cap.from) { owner[c] = cap.to; changed = true; }
    }
    while (cap.flipped > target) {
      const c = cap.order[--cap.flipped];
      if (owner[c] === cap.to) { owner[c] = cap.from; changed = true; }
    }
    if (changed) territoryDirty = true;
    if (cap.progress <= 0) p.capture = null;
    else if (cap.progress >= 1) finalizeCapture(p, cap);
  }

  function finalizeCapture(p, cap) {
    p.capture = null;
    p.owner = cap.to;
    p.conqueredYear = year;
    provVersion++;
    territoryDirty = true;
    orderTimers.set(cap.to, 0);
    const w = findWar(cap.to, cap.from);
    if (w) { w.lastChange = year; addWarScore(w, cap.to, 4); }
    const loser = nations[cap.from], winner = nations[cap.to];
    // 점령한 영토만큼 군대가 늘어난다 (징집령). 영토를 잃은 쪽은 병력이 조금 줄어든다.
    if (winner) winner.army = Math.max(winner.army, Math.min(winner.army + ARMY_PER_PROVINCE * 0.6, desiredArmyFor(provinceCount(cap.to), true) * 1.3));
    if (loser) loser.army = Math.max(1, loser.army - ARMY_PER_PROVINCE * 0.3);
    if (loser && winner && loser.capital && provOf[idx(clamp(Math.floor(loser.capital.x), 0, MAP_W - 1), clamp(Math.floor(loser.capital.y), 0, MAP_H - 1))] === p.id) {
      logEvent(`${winner.name}이(가) ${loser.name}의 수도 구역을 점령했다!`, 'war');
    }
  }

  // 점령된 구역에 있는 도시는 새 주인에게 넘기고, 수도를 잃은 국가는 수도를 다시 정한다
  function cityOwner(c) {
    const i = idx(clamp(c.x, 0, MAP_W - 1), clamp(c.y, 0, MAP_H - 1));
    const pid = provOf[i];
    return pid >= 0 && provinces[pid] ? provinces[pid].owner : owner[i];
  }

  function reconcileCities() {
    let moved = false;
    for (const n of nations) {
      if (!n.alive) continue;
      for (const c of n.cities.slice()) {
        const o = cityOwner(c);
        if (o === n.id) continue;
        n.cities = n.cities.filter(x => x !== c);
        moved = true;
        const to = o >= 0 ? nations[o] : null;
        if (to && to.alive) {
          const wasCapital = c.capital;
          c.capital = false;
          to.cities.push(c);
          if (wasCapital) logEvent(`${to.name}이(가) ${n.name}의 ${c.name}을(를) 함락시켰다.`, 'war');
        }
      }
    }
    if (!moved) return;
    for (const n of nations) {
      if (!n.alive) continue;
      if (!ensureCapital(n)) {
        n.alive = false;
        if (selected === n.id) selected = -1;
        logEvent(`${n.name}이(가) 전쟁에서 멸망했다.`, 'war');
      }
    }
  }

  function ensureCapital(n) {
    if (!n.cities.length) {
      const p = provinces.find(q => q.owner === n.id && !q.capture);
      if (!p) {
        if (owner.indexOf(n.id) < 0) return false;
        return true;
      }
      n.cities.push({ x: Math.floor(p.cx), y: Math.floor(p.cy), name: `${n.name} 거점`, capital: true, level: 1, resource: pickResource(), holy: false });
    }
    if (!n.cities.some(c => c.capital)) {
      const best = n.cities.reduce((a, b) => ((b.level || 0) > (a.level || 0) ? b : a));
      best.capital = true;
    }
    const cap = n.cities.find(c => c.capital);
    n.capital = { x: cap.x, y: cap.y };
    return true;
  }

  // 프레임 루프에서 호출: 점령이 있었으면 일정 간격으로 지도/UI를 갱신
  function syncTerritory(now) {
    if (!territoryDirty || now - lastTerritorySync < 150) return;
    territoryDirty = false;
    lastTerritorySync = now;
    reconcileCities();
    renderWorld();
    if (selected >= 0) computeSelectionBorder();
    updateUI();
  }


  function forceWar() {
    if (selected < 0) return;
    const n = nations[selected];
    const ns = neighbors(selected).filter(id => nations[id]?.alive);
    if (!ns.length) {
      logEvent(`${n.name} 주변에 전쟁을 일으킬 국가가 없다.`, 'god');
      return;
    }
    const target = ns[irand(0, ns.length - 1)];
    forceWarBetween(selected, target);
  }

  function forcePeace() {
    if (selected < 0) return;
    let changed = false;
    for (const w of wars) {
      if (w.a === selected || w.b === selected) {
        makePeace(w.a, w.b);
        changed = true;
      }
    }
    if (changed) logEvent(`${nations[selected].name} 주변의 전쟁이 신의 힘으로 멈췄다.`, 'god');
  }

  function collapseNation(n) {
    if (!n || !n.alive) return;
    const cells = [];
    for (let i = 0; i < owner.length; i++) if (owner[i] === n.id) cells.push(i);
    let ns = neighbors(n.id);
    if (!ns.length) {
      for (const i of cells) owner[i] = -1;
      n.alive = false;
      needsClaimFix = true;
      provSyncNeeded = true;
      logEvent(`${n.name}이(가) 역사에서 사라졌다.`, 'bad');
      renderWorld();
      return;
    }
    const target = nations[ns[irand(0, ns.length - 1)]];
    if (!target?.alive) return;
    for (const i of cells) owner[i] = target.id;
    for (const p of provinces) if (p.owner === n.id) { p.owner = target.id; p.capture = null; }
    provVersion++;
    target.population += Math.floor(n.population * 0.35);
    target.army += Math.floor(n.army * 0.5);
    target.gold += n.gold;
    n.alive = false;
    wars = wars.filter(w => w.a !== n.id && w.b !== n.id);
    logEvent(`${n.name}이(가) 붕괴하고 영토가 ${target.name}에 흡수됐다.`, 'war');
    renderWorld();
  }

  function renameNation(n, name) {
    const text = String(name || '').trim();
    if (!text || !n) return;
    const old = n.name;
    n.name = text;
    for (const c of n.cities) {
      if (c.capital) c.name = `${n.name} 수도`;
    }
    logEvent(`신이 ${old}의 이름을 ${n.name}(으)로 바꾸었다.`, 'god');
  }

  function bless(type, n) {
    if (!n) return;
    if (type === 'pop') n.population = Math.floor(n.population * 1.1);
    if (type === 'army') n.army = Math.floor(n.army * 1.1);
    if (type === 'gold') n.gold = Math.floor(n.gold * 1.2);
    if (type === 'tech') n.tech = clamp(n.tech + 10, 1, 100);
    if (type === 'cursePop') n.population = Math.max(1, Math.floor(n.population * 0.9));
    if (type === 'curseArmy') n.army = Math.max(1, Math.floor(n.army * 0.9));
    if (type === 'curseGold') n.gold = Math.floor(n.gold * 0.8);
    if (type === 'curseTech') n.tech = Math.max(1, n.tech - 10);
    logEvent(`${n.name}에게 신의 힘이 내려졌다.`, 'god');
  }

  function plagueNation(n) {
    if (!n) return;
    n.plague = 20;
    n.population = Math.max(1, Math.floor(n.population * 0.78));
    n.stability -= 15;
    n.army = Math.max(1, Math.floor(n.army * 0.9));
    logEvent(`신의 역병이 ${n.name}을(를) 덮쳤다.`, 'bad');
  }

  function startWarButton() {
    if (selected < 0 || targetId < 0) return;
    forceWarBetween(selected, targetId);
  }

  function openModal() {
    ui.modal.style.display = 'flex';
    ui.nationInput.focus();
  }

  function closeModal() {
    ui.modal.style.display = 'none';
  }

  function addNationFromModal() {
    const name = (ui.nationInput.value || '').trim();
    const ideology = ui.nationIdeology.value;
    const speciesValue = ui.nationSpecies.value.trim() || species[irand(0, species.length - 1)];
    if (!name) {
      alert('국가 이름을 입력하세요.');
      return;
    }

    let x = irand(8, MAP_W - 9), y = irand(8, MAP_H - 9);
    if (!land[idx(x, y)]) {
      let placed = false;
      for (let i = 0; i < 1000; i++) {
        x = irand(8, MAP_W - 9); y = irand(8, MAP_H - 9);
        if (land[idx(x, y)]) { placed = true; break; }
      }
      if (!placed) {
        alert('육지에만 국가를 세울 수 있습니다.');
        return;
      }
    }

    const id = nations.length;
    const nation = {
      id,
      name,
      color: pickNationColor(),
      species: speciesValue,
      ideology,
      seedX: x,
      seedY: y,
      population: irand(120, 420),
      army: irand(35, 140),
      gold: irand(200, 900),
      tech: rand(8, 45),
      stability: rand(55, 90),
      power: 0,
      age: 1,
      alive: true,
      cities: [],
      capital: { x, y },
      relations: {},
      plague: 0,
      warExhaustion: 0,
      allianceId: null,
      unionId: null,
      religion: pickReligion(),
      happiness: rand(50, 80),
      demographics: { children: 0.32, adults: 0.53, elders: 0.15 },
      tradeIncome: 0,
      lowStabYears: 0,
      isRebel: false
    };
    nations.push(nation);
    // 새 국가는 그 자리의 구역 하나를 차지한다 (전쟁 중에 점령되고 있는 구역은 제외)
    const startProv = provinces[provOf[idx(x, y)]];
    if (startProv && !startProv.capture) {
      for (const c of startProv.cells) owner[c] = id;
      startProv.owner = id;
      startProv.origOwner = id;
      provVersion++;
    } else {
      owner[idx(x, y)] = id;
    }
    nation.cities.push({ x, y, name: `${nation.name} 수도`, capital: true, level: 3, resource: pickResource(), holy: true });
    selected = id;
    computeSelectionBorder();
    closeModal();
    logEvent(`${nation.name}이(가) 세계에 등장했다.`, 'god');
    renderWorld();
    updateUI();
  }

  function gameLoop(t) {
    const dt = Math.min((t - lastTime) / 1000, 0.25);
    lastTime = t;
    if (!paused) {
      accumulator += dt * speed;
      let guard = 0;
      while (accumulator >= 0.75 && guard < 3) { // 고배속에서 한 프레임에 처리하는 연도 수를 제한 (렉 방지)
        accumulator -= 0.75;
        simulateYear();
        guard++;
      }
      if (accumulator > 1.5) accumulator = 1.5;
      updateUnits(Math.min(dt * speed, 2.5));
      syncTerritory(t);
    }
    requestAnimationFrame(gameLoop);
  }

   // --- PC & 모바일 하이브리드 입력 및 멀티터치 줌 변수 ---
  let activePointers = [];    // 현재 화면을 터치 중인 모든 포인터 배열
  let initialTouchDist = -1;  // 두 손가락이 처음 닿았을 때의 거리
  let initialZoom = 1;        // 두 손가락이 처음 닿았을 때의 카메라 줌 값
  let lastPointer = { x: 0, y: 0 };
  let isDistanceZooming = false; // 현재 핀치 줌(확대/축소) 작동 여부

  // 1. 포인터 다운 (마우스 클릭 또는 손가락 터치 시작)
  canvas.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return; // 마우스 우클릭 등은 무시
    
    activePointers.push(e); // 현재 포인터 등록
    dragging = true;
    
    if (activePointers.length === 1) {
      dragX = e.clientX;
      dragY = e.clientY;
      lastPointer.x = e.clientX;
      lastPointer.y = e.clientY;
      canvas.classList.add('dragging');
    } else if (activePointers.length === 2) {
      // 모바일에서 두 손가락이 닿으면 지도 이동(드래그)을 멈추고 줌 모드로 전환
      isDistanceZooming = true;
      const dx = activePointers[0].clientX - activePointers[1].clientX;
      const dy = activePointers[0].clientY - activePointers[1].clientY;
      initialTouchDist = Math.hypot(dx, dy);
      initialZoom = camera.zoom;
    }
    
    canvas.setPointerCapture?.(e.pointerId);
  });

  // 2. 포인터 이동 (마우스 드래그 또는 손가락 움직임 / 핀치 줌)
  window.addEventListener('pointermove', e => {
    const pIdx = activePointers.findIndex(p => p.pointerId === e.pointerId);
    if (pIdx < 0) return;
    activePointers[pIdx] = e; // 실시간 포인터 좌표 갱신

    if (!dragging) return;

    if (activePointers.length === 1 && !isDistanceZooming) {
      // [단일 포인터] PC 마우스 드래그 또는 모바일 한 손가락 지도 이동
      const dx = e.clientX - dragX;
      const dy = e.clientY - dragY;
      camera.x += dx;
      camera.y += dy;
      dragX = e.clientX;
      dragY = e.clientY;
      lastPointer.x = e.clientX;
      lastPointer.y = e.clientY;
    } else if (activePointers.length === 2 && isDistanceZooming) {
      // [멀티 포인터] 모바일 두 손가락 확대 / 축소 (Pinch-to-Zoom)
      const dx = activePointers[0].clientX - activePointers[1].clientX;
      const dy = activePointers[0].clientY - activePointers[1].clientY;
      const currentDist = Math.hypot(dx, dy);

      if (initialTouchDist > 0 && currentDist > 0) {
        // 두 손가락의 중심점(터치 타겟 센터)을 계산하여 그 지점을 기준으로 확대/축소
        const midX = (activePointers[0].clientX + activePointers[1].clientX) / 2;
        const midY = (activePointers[0].clientY + activePointers[1].clientY) / 2;
        
        const oldZoom = camera.zoom;
        const factor = currentDist / initialTouchDist;
        
        const worldX = (midX - camera.x) / oldZoom;
        const worldY = (midY - camera.y) / oldZoom;

        camera.zoom = clamp(initialZoom * factor, 0.35, 8); // 줌 제한 범위 준수
        camera.x = midX - worldX * camera.zoom;
        camera.y = midY - worldY * camera.zoom;
      }
    }
  });

  // 3. 포인터 떼기 (클릭 해제 또는 손가락 떨어짐)
  window.addEventListener('pointerup', e => {
    const pIdx = activePointers.findIndex(p => p.pointerId === e.pointerId);
    if (pIdx >= 0) activePointers.splice(pIdx, 1);

    if (activePointers.length === 0) {
      dragging = false;
      canvas.classList.remove('dragging');
      
      // 확대/축소 중이 아니었고, 터치가 이동한 거리가 짧았다면 단순 클릭(국가 선택)으로 간주
      if (!isDistanceZooming && Math.abs(e.clientX - dragX) <= 8 && Math.abs(e.clientY - dragY) <= 8) {
        const i = screenToCell(e.clientX, e.clientY);
        if (i < 0 || owner[i] < 0) {
          selected = -1;
          updateUI();
        } else {
          selectAt(e.clientX, e.clientY);
        }
      }
      isDistanceZooming = false;
      initialTouchDist = -1;
    } else if (activePointers.length === 1) {
      // 두 손가락 중 하나만 떼었을 때 잔여 드래그 좌표 보정
      isDistanceZooming = false;
      dragX = activePointers[0].clientX;
      dragY = activePointers[0].clientY;
    }
  });

  window.addEventListener('pointercancel', e => {
    activePointers = [];
    dragging = false;
    isDistanceZooming = false;
    canvas.classList.remove('dragging');
  });

  // 4. PC용 마우스 휠 확대/축소 이벤트 (기존과 동일하게 유지)
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const oldZoom = camera.zoom;
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const worldX = (mouseX - camera.x) / oldZoom;
    const worldY = (mouseY - camera.y) / oldZoom;
    camera.zoom = clamp(camera.zoom * factor, 0.35, 8);
    camera.x = mouseX - worldX * camera.zoom;
    camera.y = mouseY - worldY * camera.zoom;
  }, { passive: false });


  window.addEventListener('resize', () => {
    W = innerWidth;
    H = innerHeight;
    canvas.width = W;
    canvas.height = H;
    fitCamera();
  });

  window.addEventListener('keydown', e => {
    // 입력창에 글자를 칠 때나 홈/저장 창이 열려 있을 때는 게임 단축키를 막는다
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (document.body.classList.contains('modal-open')) return;
    if (e.code === 'Space') {
      paused = !paused;
      ui.pause.textContent = paused ? '▶' : 'Ⅱ';
    }
    if (e.key === 'r' || e.key === 'R') {
      if (confirm('새로운 세계를 만들까요?')) {
        seed = Math.floor(Math.random() * 999999);
        resetWorld();
      }
    }
    if (e.key === '1') speed = 1;
    if (e.key === '2') speed = 5;
    if (e.key === '3') speed = 20;
    if (e.key === '4') speed = 100;
    if (e.key === 'Escape') {
      selected = -1;
      updateUI();
    }
  });

  document.getElementById('addNation').onclick = openModal;
  document.getElementById('cancelModal').onclick = closeModal;
  document.getElementById('createNationBtn').onclick = addNationFromModal;
  document.getElementById('pause').onclick = () => { paused = !paused; ui.pause.textContent = paused ? '▶' : 'Ⅱ'; };
  document.querySelectorAll('.speed').forEach(btn => {
    btn.onclick = () => {
      speed = Number(btn.dataset.speed);
      document.querySelectorAll('.speed').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
  });
  document.querySelectorAll('.layer').forEach(btn => {
    btn.onclick = () => {
      layer = btn.dataset.layer;
      document.querySelectorAll('.layer').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderWorld();
    };
  });

  document.getElementById('renameBtn').onclick = () => {
    if (selected >= 0) {
      renameNation(nations[selected], ui.renameInput.value);
      ui.renameInput.value = '';
      updateUI();
    }
  };

  document.getElementById('popUp').onclick = () => { if (selected >= 0) { bless('pop', nations[selected]); updateUI(); } };
  document.getElementById('popDown').onclick = () => { if (selected >= 0) { bless('cursePop', nations[selected]); updateUI(); } };
  document.getElementById('armyUp').onclick = () => { if (selected >= 0) { bless('army', nations[selected]); updateUI(); } };
  document.getElementById('armyDown').onclick = () => { if (selected >= 0) { bless('curseArmy', nations[selected]); updateUI(); } };
  document.getElementById('goldUp').onclick = () => { if (selected >= 0) { bless('gold', nations[selected]); updateUI(); } };
  document.getElementById('goldDown').onclick = () => { if (selected >= 0) { bless('curseGold', nations[selected]); updateUI(); } };
  document.getElementById('techUp').onclick = () => { if (selected >= 0) { bless('tech', nations[selected]); updateUI(); } };
  document.getElementById('techDown').onclick = () => { if (selected >= 0) { bless('curseTech', nations[selected]); updateUI(); } };
  document.getElementById('plague').onclick = () => { if (selected >= 0) { plagueNation(nations[selected]); updateUI(); } };
  document.getElementById('forceWar').onclick = () => { if (selected >= 0) forceWar(); };
  document.getElementById('forcePeace').onclick = () => { if (selected >= 0) forcePeace(); };
  document.getElementById('collapse').onclick = () => {
    if (selected >= 0 && confirm(`${nations[selected].name}을 정말로 역사에서 지울까요?`)) {
      collapseNation(nations[selected]);
      selected = -1;
      updateUI();
    }
  };

  // ===== 저장 / 불러오기 (직렬화) =====
  // 같은 값이 이어지는 구간을 숫자 하나((값+1)*4096+길이)로 압축한다. 지형은 시드로 다시 만들므로 저장하지 않는다.
  function rleEncode(arr) {
    const out = [];
    let i = 0;
    while (i < arr.length) {
      const v = arr[i];
      let j = i + 1;
      while (j < arr.length && arr[j] === v && j - i < 4095) j++;
      out.push((v + 1) * 4096 + (j - i));
      i = j;
    }
    return out;
  }

  function rleDecode(runs, out) {
    let p = 0;
    for (const r of runs) {
      const n = r % 4096;
      out.fill(Math.floor(r / 4096) - 1, p, p + n);
      p += n;
    }
    return out;
  }

  function serializeGame() {
    return {
      v: 2, mapId: currentMap.id, scenarioId: currentMap.scenarioId || null, seed, year, layer, savedAt: Date.now(),
      land: rleEncode(land),
      provOf: rleEncode(provOf),
      prov: provinces.map(p => [p.owner, p.origOwner, p.conqueredYear]),
      nations, alliances, wars, events, initial: initialNationCount
    };
  }

  function deserializeGame(d) {
    if (!d || d.v !== 2 || !d.land || !d.provOf) throw new Error('지원하지 않는 저장 형식입니다.');
    const def = window.WFMaps ? WFMaps.get(d.mapId) : currentMap;
    seed = d.seed;
    rng = mulberry32(seed + 17);
    rleDecode(d.land, land);
    currentMap = { ...def, latAt: def.kind === 'real' && window.WFMaps ? WFMaps.projection(def, MAP_W, MAP_H).latAt : null };
    const scn = d.scenarioId && window.WFScenarios ? WFScenarios.get(d.scenarioId) : null;
    if (scn) { currentMap.name = scn.name; currentMap.scenarioId = scn.id; }
    terrain.fill(0);
    generateTerrain();

    nations = d.nations || [];
    alliances = d.alliances || [];
    wars = d.wars || [];
    events = d.events || [];
    year = d.year || 1;
    layer = ['political', 'alliance', 'species', 'religion'].includes(d.layer) ? d.layer : 'political';
    initialNationCount = d.initial || Math.max(8, nations.filter(n => !n.parentId).length);
    for (const n of nations) { n.relations = n.relations || {}; n.cities = n.cities || []; }

    const raw = new Int32Array(MAP_W * MAP_H);
    rleDecode(d.provOf, raw);
    buildProvinceData(raw, d.prov.length);
    owner.fill(-1);
    provinces.forEach((p, i) => {
      const r = d.prov[i] || [-1, -1, -1];
      p.owner = r[0]; p.origOwner = r[1]; p.conqueredYear = r[2];
      if (p.owner >= 0) for (const c of p.cells) owner[c] = p.owner;
    });

    selected = -1;
    targetId = -1;
    selectionBorder = [];
    selectionPath = null;
    warArrows = [];
    deathFx = [];
    orderTimers.clear();
    needsClaimFix = false;
    provSyncNeeded = false;
    neighborCacheVersion = -1;
    provVersion++;
    baseDirty = true;
    refreshMilitaryUnits();
    fitCamera();
    document.querySelectorAll('.layer').forEach(b => b.classList.toggle('active', b.dataset.layer === layer));
    logEvent('저장된 세계를 불러왔다.', 'god');
    renderWorld();
    updateUI();
  }

  function thumbnailURL() {
    const c = document.createElement('canvas');
    c.width = 192; c.height = 115;
    c.getContext('2d').drawImage(worldCanvas, 0, 0, 192, 115);
    return c.toDataURL('image/jpeg', 0.7);
  }

  function setPaused(v) {
    paused = !!v;
    ui.pause.textContent = paused ? '▶' : 'Ⅱ';
  }

  function setSpeed(v) {
    speed = v;
    document.querySelectorAll('.speed').forEach(b => b.classList.toggle('active', Number(b.dataset.speed) === v));
  }

  // 홈 화면(menu.js)이 쓰는 인터페이스
  window.WFGame = {
    newGame(opts) {
      resetWorld(opts);
      gameStarted = true;
      setPaused(false);
      setSpeed(1);
    },
    serialize: serializeGame,
    deserialize(d) {
      deserializeGame(d);
      gameStarted = true;
    },
    info: () => ({ year, mapId: currentMap.id, scenarioId: currentMap.scenarioId || null, mapName: currentMap.name, nations: nations.filter(n => n.alive).length, started: gameStarted }),
    thumbnail: thumbnailURL,
    setPaused,
    isPaused: () => paused,
    isStarted: () => gameStarted
  };

  ui.relationTarget.onchange = () => { targetId = Number(ui.relationTarget.value); };
  document.getElementById('makeAlliance').onclick = () => { if (selected >= 0 && targetId >= 0) createAllianceBetween(selected, targetId); };
  document.getElementById('breakAlliance').onclick = () => { if (selected >= 0) destroyAllianceForSelected(); };
  document.getElementById('startWar').onclick = () => { startWarButton(); };
  document.getElementById('makePeace').onclick = () => { if (selected >= 0 && targetId >= 0) makePeace(selected, targetId); };

  canvas.width = W;
  canvas.height = H;
  resetWorld();
  setSpeed(5); // 홈 화면 뒤에서 도는 데모 세계
  requestAnimationFrame(draw);
  requestAnimationFrame(gameLoop);
})();