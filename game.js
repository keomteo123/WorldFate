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
    nationGrade: document.getElementById('nationGrade'),
    nationIdeology: document.getElementById('nationIdeology'),
    nationSpecies: document.getElementById('nationSpecies'),
    renameInput: document.getElementById('renameInput'),
    pause: document.getElementById('pause'),
  };

  const MAP_W = 1200;
  const MAP_H = 720;
  const gradeOrder = ['부족', '시국', '왕국', '제국'];
  const nationNames = [
    '아르덴','벨로스','카르디아','드라켄','에르시아','펠리온','갈리아','하르몬','이르덴','칼레온',
    '루미아','메르디안','노르덴','오르티아','펠로스','퀘리아','라그나','셀레니아','테르반','울레시아',
    '발테르','웨스티아','자르곤','엘리온','키르스','사이렌','모르다','티르나','엔델','아스게르'
  ];
  const species = ['인간','엘프','드워프','오크','수인','혼혈족','정령족','거인족'];
  const colors = ['#c75c5c','#5c86c7','#d29a4c','#6ca66b','#9b68b0','#4bafa9','#c7669b','#8b9d5c','#6d76bd','#b66d4f','#5797a9','#ad795b','#7a9dca','#a96c99','#6b9b73','#c49a58','#6d8c9e','#b66b6b','#7773ad','#8a9b65','#aa775e','#5c9c8e','#ad6680','#7b7fb5'];
  const religionColor = {
    신앙: '#d2b86a',
    계율: '#8ca2ff',
    자연: '#69c07c',
    죽음: '#a67ccf',
    태양: '#ffc76a',
    달: '#a0c5ff',
    전사: '#d86a6a'
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
  let rng = mulberry32(seed);
  let needsClaimFix = false;
  let selectionBorder = [];
  let armyUnits = [];
  let navalUnits = [];
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

  function generateLand() {
    land.fill(0);
    const centers = [];
    const mainContinents = 2 + irand(0, 2);
    for (let i = 0; i < mainContinents; i++) {
      centers.push({
        x: rand(0.14, 0.86) * MAP_W,
        y: rand(0.18, 0.82) * MAP_H,
        r: rand(175, 330),
        strength: rand(0.8, 1.2)
      });
    }

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        let v = 0;
        for (const c of centers) {
          const dx = x - c.x;
          const dy = y - c.y;
          const d = Math.hypot(dx, dy);
          v += Math.max(0, 1 - d / c.r) * c.strength * 0.9;
        }
        const nx = x / MAP_W, ny = y / MAP_H;
        v += (fbm(nx * 2.6 + 1.7, ny * 2.2 + 2.1) - 0.46) * 0.9;
        v += (fbm(nx * 7.8 + 9.3, ny * 7.8 + 15.9) - 0.5) * 0.25;
        if (v > 0.42) land[idx(x, y)] = 1;
      }
    }

    const islandCount = 2600 + irand(0, 1800);
    for (let i = 0; i < islandCount; i++) {
      const cx = irand(10, MAP_W - 10);
      const cy = irand(10, MAP_H - 10);
      const r = irand(2, 20);
      for (let yy = Math.max(0, cy - r); yy < Math.min(MAP_H, cy + r + 1); yy++) {
        for (let xx = Math.max(0, cx - r); xx < Math.min(MAP_W, cx + r + 1); xx++) {
          const d = Math.hypot(xx - cx, yy - cy);
          if (d < r && Math.random() < 0.8) land[idx(xx, yy)] = 1;
        }
      }
    }

    const minorIslandCount = 1400;
    for (let i = 0; i < minorIslandCount; i++) {
      const cx = irand(5, MAP_W - 5);
      const cy = irand(5, MAP_H - 5);
      const r = irand(1, 8);
      for (let yy = Math.max(0, cy - r); yy < Math.min(MAP_H, cy + r + 1); yy++) {
        for (let xx = Math.max(0, cx - r); xx < Math.min(MAP_W, cx + r + 1); xx++) {
          const d = Math.hypot(xx - cx, yy - cy);
          if (d < r && Math.random() < 0.65) land[idx(xx, yy)] = 1;
        }
      }
    }

    while (getLandComponents().length < mainContinents + 1) {
      const cx = rand(0.12, 0.88) * MAP_W;
      const cy = rand(0.12, 0.88) * MAP_H;
      const r = rand(70, 190);
      for (let y = Math.max(0, cy - r); y < Math.min(MAP_H, cy + r + 1); y++) {
        for (let x = Math.max(0, cx - r); x < Math.min(MAP_W, cx + r + 1); x++) {
          if (Math.hypot(x - cx, y - cy) < r) land[idx(x, y)] = 1;
        }
      }
    }

    const targetMin = 0.30;
    const targetMax = 0.42;
    const targetRatio = 0.35 + rand(0, 0.05);

    for (let attempt = 0; attempt < 12; attempt++) {
      const landRatio = countLand() / (MAP_W * MAP_H);
      if (landRatio > targetRatio + 0.04) {
        const removeCount = Math.max(0, Math.floor((landRatio - targetRatio) * MAP_W * MAP_H * 2.5));
        for (let i = 0; i < removeCount; i++) {
          const x = irand(0, MAP_W - 1);
          const y = irand(0, MAP_H - 1);
          if (land[idx(x, y)]) land[idx(x, y)] = 0;
        }
      } else if (landRatio < targetRatio - 0.04) {
        const addCount = Math.max(0, Math.floor((targetRatio - landRatio) * MAP_W * MAP_H * 1.9));
        for (let i = 0; i < addCount; i++) {
          const x = irand(0, MAP_W - 1);
          const y = irand(0, MAP_H - 1);
          const cell = idx(x, y);
          if (!land[cell] && (x < 12 || y < 12 || x > MAP_W - 13 || y > MAP_H - 13)) land[cell] = 1;
        }
      } else break;
    }

    const finalRatio = countLand() / (MAP_W * MAP_H);
    if (finalRatio > targetMax) {
      const removeCount = Math.max(0, Math.floor((finalRatio - targetMax) * MAP_W * MAP_H * 3.6));
      for (let i = 0; i < removeCount; i++) {
        const x = irand(0, MAP_W - 1);
        const y = irand(0, MAP_H - 1);
        if (land[idx(x, y)]) land[idx(x, y)] = 0;
      }
    }
    if (finalRatio < targetMin) {
      const addCount = Math.max(0, Math.floor((targetMin - finalRatio) * MAP_W * MAP_H * 2.9));
      for (let i = 0; i < addCount; i++) {
        const x = irand(0, MAP_W - 1);
        const y = irand(0, MAP_H - 1);
        if (!land[idx(x, y)]) land[idx(x, y)] = 1;
      }
    }

    smoothLand(3);
    mergeTinyIslands();
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

  function mergeTinyIslands() {
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

    const minIslandSize = 50;
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
        if (h > 0.72) terrain[i] = 2;
        else if (moisture > 0.64) terrain[i] = 1;
        else if (e < 0.30) terrain[i] = 3;
        else terrain[i] = 0;
        cellsCost[i] = 1 + (terrain[i] === 2 ? 0.72 : 0) + (terrain[i] === 3 ? 0.15 : 0) + (terrain[i] === 1 ? 0.12 : 0) + rand(0, 0.45);
      }
    }
  }

  function buildDisplayName(n) {
    return `${n.name} ${n.grade}`;
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

  function createNations() {
    const target = irand(12, 18);
    while (nations.length < target) {
      const x = irand(10, MAP_W - 11);
      const y = irand(10, MAP_H - 11);
      if (!land[idx(x, y)]) continue;
      let good = true;
      for (const n of nations) {
        if (Math.hypot(x - n.seedX, y - n.seedY) < 26) {
          good = false;
          break;
        }
      }
      if (!good) continue;

      const grade = gradeOrder[irand(0, gradeOrder.length - 1)];
      const id = nations.length;
      nations.push({
        id,
        name: nationNames[id % nationNames.length],
        grade,
        color: colors[id % colors.length],
        species: species[irand(0, species.length - 1)],
        ideology: ['왕국','공화국','제국','연방','부족연맹'][irand(0, 4)],
        seedX: x,
        seedY: y,
        population: irand(80, 500),
        army: irand(15, 110),
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

    for (const n of nations) {
      const i = idx(n.seedX, n.seedY);
      dist[i] = 0;
      owner[i] = n.id;
      push({ d: 0, i, n: n.id });
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
        const nd = q.d + d[2] * cellsCost[ni];
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
    refreshMilitaryUnits();
  }

  function refreshMilitaryUnits() {
    armyUnits = [];
    navalUnits = [];
    for (const n of nations) {
      if (!n.alive) continue;
      const home = n.cities.find(c => c.capital) || n.cities[0];
      const armyCount = clamp(Math.max(1, Math.round(n.army / 90)), 1, 6);
      for (let i = 0; i < armyCount; i++) {
        const px = home ? home.x + 0.5 + (i % 2 === 0 ? 0.6 : -0.6) : n.seedX;
        const py = home ? home.y + 0.5 + (i % 3 === 0 ? 0.7 : -0.7) : n.seedY;
        armyUnits.push({
          id: `${n.id}-army-${i}`,
          owner: n.id,
          x: px,
          y: py,
          tx: px,
          ty: py,
          speed: 0.25 + rand(0.12, 0.35),
          type: 'army',
          hp: Math.max(1, Math.round(n.army / armyCount)),
          color: n.color
        });
      }

      const coastal = n.cities.filter(c => isCoastalCell(c.x, c.y));
      const transportCount = coastal.length ? clamp(Math.max(1, Math.round(n.gold / 500)), 1, 4) : 0;
      for (let i = 0; i < transportCount; i++) {
        const city = coastal[i % coastal.length] || home;
        navalUnits.push({
          id: `${n.id}-transport-${i}`,
          owner: n.id,
          kind: 'transport',
          x: city.x + 0.5,
          y: city.y + 0.5,
          tx: city.x + 0.5,
          ty: city.y + 0.5,
          speed: 0.18 + rand(0.05, 0.16),
          color: '#dfeaf7'
        });
      }

      const fleetCount = coastal.length ? clamp(Math.max(1, Math.round(n.army / 140)), 1, 3) : 0;
      for (let i = 0; i < fleetCount; i++) {
        const city = coastal[i % coastal.length] || home;
        navalUnits.push({
          id: `${n.id}-fleet-${i}`,
          owner: n.id,
          kind: 'fleet',
          x: city.x + 0.5,
          y: city.y + 0.5,
          tx: city.x + 0.5,
          ty: city.y + 0.5,
          speed: 0.22 + rand(0.08, 0.2),
          color: '#b9d8ff'
        });
      }
    }
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

  function resetWorld() {
    rng = mulberry32(seed);
    nations = [];
    wars = [];
    events = [];
    alliances = [];
    year = 1;
    selected = -1;
    targetId = -1;
    selectionBorder = [];
    armyUnits = [];
    navalUnits = [];
    warArrows = [];
    needsClaimFix = false;
    land.fill(0);
    terrain.fill(0);
    owner.fill(-1);
    generateLand();
    generateTerrain();
    createNations();
    assignTerritories();
    claimUnclaimedLand();
    generateCities();
    fitCamera();
    logEvent('신이 새로운 세계를 창조했다.', 'god');
    renderWorld();
    updateUI();
  }

  function fitCamera() {
    camera.zoom = Math.min((W - 130) / MAP_W, (H - 120) / MAP_H);
    camera.zoom = Math.max(0.45, Math.min(1.8, camera.zoom));
    camera.x = (W - MAP_W * camera.zoom) / 2;
    camera.y = (H - MAP_H * camera.zoom) / 2 + 15;
  }

  function renderWorld() {
    const image = wctx.createImageData(MAP_W, MAP_H);
    const data = image.data;

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const i = idx(x, y);
        const p = i * 4;

        if (!land[i]) {
          const deep = 18 + Math.sin(x * 0.07) * 8 + Math.cos(y * 0.09) * 10;
          const seaR = clamp(Math.round(28 + deep), 12, 58);
          const seaG = clamp(Math.round(42 + deep * 1.2), 20, 88);
          const seaB = clamp(Math.round(68 + deep * 1.7), 36, 128);
          data[p] = seaR;
          data[p + 1] = seaG;
          data[p + 2] = seaB;
          data[p + 3] = 255;
          continue;
        }

        const t = terrain[i];
        let r = 110, g = 150, b = 92;
        if (t === 1) { r = 88; g = 128; b = 82; }
        if (t === 2) { r = 118; g = 110; b = 90; }
        if (t === 3) { r = 168; g = 148; b = 98; }

        const shore = (x < 2 || y < 2 || x > MAP_W - 3 || y > MAP_H - 3) ? 8 : 0;
        r = Math.min(255, r + shore);
        g = Math.min(255, g + shore * 0.8);
        b = Math.min(255, b + shore * 1.2);

        const id = owner[i];
        if (id < 0) {
          data[p] = r; data[p + 1] = g; data[p + 2] = b; data[p + 3] = 255;
          continue;
        }

        let n = nations[id];
        if (!n) {
          data[p] = r; data[p + 1] = g; data[p + 2] = b; data[p + 3] = 255;
          continue;
        }

        const group = getNationGroup(n);
        const rgb = hexRGB(group ? group.color : n.color);
        if (layer === 'political') {
          const tint = 0.76;
          data[p] = Math.min(255, rgb[0] * tint + r * (1 - tint));
          data[p + 1] = Math.min(255, rgb[1] * tint + g * (1 - tint));
          data[p + 2] = Math.min(255, rgb[2] * tint + b * (1 - tint));
        } else {
          let val = 0;
          if (layer === 'population') val = clamp(n.population / 1000, 0, 1);
          if (layer === 'army') val = clamp(n.army / 300, 0, 1);
          if (layer === 'gold') val = clamp(n.gold / 1500, 0, 1);
          if (layer === 'tech') val = clamp(n.tech / 100, 0, 1);
          data[p] = clamp(Math.round(r * (1 - val * 0.22) + 42 + val * 170), 0, 255);
          data[p + 1] = clamp(Math.round(g * (1 - val * 0.22) + 52 + val * 170), 0, 255);
          data[p + 2] = clamp(Math.round(b * (1 - val * 0.22) + 62 + val * 170), 0, 255);
        }
        data[p + 3] = 255;
      }
    }

    wctx.putImageData(image, 0, 0);

    if (camera.zoom > 1.2) {
      wctx.strokeStyle = 'rgba(255,255,255,0.12)';
      wctx.lineWidth = 0.8;
      wctx.beginPath();
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          const i = idx(x, y);
          if (!land[i]) continue;
          const left = x > 0 && land[idx(x - 1, y)];
          const up = y > 0 && land[idx(x, y - 1)];
          if (!left) { wctx.moveTo(x, y); wctx.lineTo(x, y + 1); }
          if (!up) { wctx.moveTo(x, y); wctx.lineTo(x + 1, y); }
        }
      }
      wctx.stroke();
    }
  }

  function draw() {
    resizeIfNeeded();
    ctx.clearRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#101b25');
    grad.addColorStop(1, '#081018');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(worldCanvas, camera.x, camera.y, MAP_W * camera.zoom, MAP_H * camera.zoom);

    drawWarArrows();
    drawCities();
    drawFlags();
    drawArmyMarkers();
    drawFleetMarkers();
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
        ctx.fillStyle = c.capital ? '#fff2a4' : '#e9e9e9';
        ctx.beginPath();
        ctx.arc(sx, sy, c.capital ? 3.8 : 2.3, 0, Math.PI * 2);
        ctx.fill();
        if (camera.zoom > 1.2) {
          ctx.font = `${c.capital ? 'bold ' : ''}10px Arial`;
          ctx.fillStyle = '#fff';
          ctx.strokeStyle = '#111a';
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

      if (camera.zoom > 1.4) {
        const label = getDisplayNationName(n);
        ctx.font = `bold ${clamp(camera.zoom * 4.5, 11, 15)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 3;
        ctx.strokeText(label, sx, sy + 18);
        ctx.fillText(label, sx, sy + 18);
      }
    }
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

  function drawArmyMarkers() {
    if (camera.zoom < 0.7) return;
    for (const u of armyUnits) {
      const n = nations[u.owner];
      if (!n || !n.alive) continue;
      const sx = camera.x + u.x * camera.zoom;
      const sy = camera.y + u.y * camera.zoom;
      if (sx < -25 || sy < -25 || sx > W + 25 || sy > H + 25) continue;

      const size = clamp(camera.zoom * 3.2, 3, 8);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.fillStyle = getGroupColorForNation(n);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.95, size * 0.9);
      ctx.lineTo(-size * 0.95, size * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  function drawFleetMarkers() {
    if (camera.zoom < 0.8) return;
    for (const u of navalUnits) {
      const n = nations[u.owner];
      if (!n || !n.alive) continue;
      const sx = camera.x + u.x * camera.zoom;
      const sy = camera.y + u.y * camera.zoom;
      if (sx < -25 || sy < -25 || sx > W + 25 || sy > H + 25) continue;

      const size = clamp(camera.zoom * 2.8, 3.5, 7);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.strokeStyle = u.kind === 'fleet' ? '#d9ecff' : '#cadbf5';
      ctx.fillStyle = u.kind === 'fleet' ? 'rgba(179, 214, 255, 0.95)' : 'rgba(225, 230, 240, 0.9)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-size * 0.9, size * 0.25);
      ctx.lineTo(0, -size * 0.45);
      ctx.lineTo(size * 0.9, size * 0.25);
      ctx.lineTo(size * 0.5, size * 0.78);
      ctx.lineTo(-size * 0.5, size * 0.78);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
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

  function computeSelectionBorder() {
    selectionBorder = [];
    if (selected < 0) return;
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (owner[idx(x, y)] !== selected) continue;
        let edge = false;
        if (x === 0 || owner[idx(x - 1, y)] !== selected) edge = true;
        else if (x === MAP_W - 1 || owner[idx(x + 1, y)] !== selected) edge = true;
        else if (y === 0 || owner[idx(x, y - 1)] !== selected) edge = true;
        else if (y === MAP_H - 1 || owner[idx(x, y + 1)] !== selected) edge = true;
        if (edge) selectionBorder.push(x, y);
      }
    }
  }

  function drawSelection() {
    ctx.save();
    ctx.strokeStyle = '#ffe18a';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ffe18a';
    ctx.shadowBlur = 10;
    for (let i = 0; i < selectionBorder.length; i += 2) {
      const x = selectionBorder[i], y = selectionBorder[i + 1];
      const sx = camera.x + x * camera.zoom;
      const sy = camera.y + y * camera.zoom;
      if (sx < -6 || sy < -6 || sx > W + 6 || sy > H + 6) continue;
      ctx.strokeRect(sx, sy, camera.zoom, camera.zoom);
    }
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
      box.innerHTML = '<div class="small">국가를 클릭하세요.</div>';
      panel.style.display = 'none';
    } else {
      const n = nations[selected];
      const group = getNationGroup(n);
      panel.style.display = 'block';
      const relationWars = wars.filter(w => w.a === n.id || w.b === n.id).length;
      box.innerHTML = `
        <div style="margin-bottom:10px">
          <span id="flag" style="background:${getGroupColorForNation(n)};color:#fff">⚑</span>
          <span id="nationName">${escapeHTML(getDisplayNationName(n))}</span>
        </div>
        <div class="small">${n.species} · ${n.ideology} · ${n.grade} ${group ? `· ${group.name}` : ''}</div>
        <div class="small" style="margin:3px 0">🕊 ${escapeHTML(n.religion)} ${n.cities.some(c => c.holy) ? '· 성지 보유' : ''}</div>
        <div class="stat">인구 <b>${format(n.population)}</b></div>
        <div class="stat">군대 <b>${format(n.army)}</b></div>
        <div class="stat">골드 <b>${format(n.gold)}</b> ${n.tradeIncome > 0.5 ? `<span class="small">(무역 +${n.tradeIncome.toFixed(1)})</span>` : ''}</div>
        <div class="stat">기술력 <b>${n.tech.toFixed(1)}</b></div>
        <div class="stat">안정도 <b>${n.stability.toFixed(0)}</b></div>
        <div class="stat">행복도 <b>${n.happiness.toFixed(0)}</b></div>
        <div class="stat">도시 <b>${n.cities.length}</b></div>
        <div class="stat">국력 <b>${n.power.toFixed(0)}</b></div>
        <div class="stat">전쟁 <b>${relationWars}</b></div>
        <div class="small" style="margin-top:6px">인구 구성 · 아동 ${(n.demographics.children * 100).toFixed(0)}% · 성인 ${(n.demographics.adults * 100).toFixed(0)}% · 노년 ${(n.demographics.elders * 100).toFixed(0)}%</div>
        <div class="small" style="margin-top:6px">주요 자원: ${Object.entries(computeNationResources(n)).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([r, v]) => `${RESOURCE_ICON[r]}${r}`).join(' · ')}</div>
        <div class="small" style="margin-top:8px">국가 나이: ${n.age}년<br>수도: ${escapeHTML(n.cities.find(c => c.capital)?.name || '없음')}</div>
      `;
    }

    const select = ui.relationTarget;
    const options = nations.filter(n => n.alive && n.id !== selected).map(n => `<option value="${n.id}">${escapeHTML(getDisplayNationName(n))}</option>`).join('');
    select.innerHTML = `<option value="-1">대상 선택</option>${options}`;
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
    info.innerHTML = `
      <div class="stat">존재 국가 <b>${alive.length}</b></div>
      <div class="stat">세계 인구 <b>${format(pop)}</b></div>
      <div class="stat">세계 군대 <b>${format(army)}</b></div>
      <div class="stat">세계 골드 <b>${format(gold)}</b></div>
      <div class="stat">주요 종교 <b>${topReligion ? escapeHTML(topReligion[0]) : '-'}</b></div>
      <div class="stat">반란 세력 <b>${rebelCount}</b></div>
      <div class="stat">진행 연도 <b>${year}</b></div>
    `;

    const logs = ui.logs;
    logs.innerHTML = events.slice(-18).reverse().map(e => `
      <div class="log ${e.type}"><span class="small">${e.year}년</span><br>${escapeHTML(e.text)}</div>
    `).join('');
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

  function createAllianceBetween(aId, bId) {
    if (aId === bId) return false;
    const a = nations[aId], b = nations[bId];
    if (!a || !b || !a.alive || !b.alive) return false;
    if (getNationGroup(a) && getNationGroup(a) === getNationGroup(b)) return false;

    let group = alliances.find(g => g.members.includes(aId) || g.members.includes(bId));
    if (!group) {
      group = { id: alliances.length + 1, type: 'alliance', name: `${a.name} ${a.grade} · ${b.name} ${b.grade} 동맹`, color: averageColor(a.color, b.color), members: [aId, bId] };
      alliances.push(group);
    } else {
      if (group.type === 'union') return false;
      if (!group.members.includes(aId)) group.members.push(aId);
      if (!group.members.includes(bId)) group.members.push(bId);
      group.name = `${group.members.map(id => nations[id].name).join(' · ')} 동맹`;
    }

    for (const id of group.members) {
      const n = nations[id];
      if (n) {
        n.allianceId = group.id;
        n.unionId = null;
      }
    }

    if (group.members.length >= 3) {
      const leader = group.members.map(id => nations[id]).sort((x, y) => y.population - x.population)[0];
      const union = { id: alliances.length + 1, type: 'union', name: `${leader.name} 연합`, color: group.color, members: [...group.members] };
      alliances = alliances.filter(g => g !== group);
      alliances.push(union);
      for (const id of union.members) {
        const n = nations[id];
        if (n) {
          n.allianceId = union.id;
          n.unionId = union.id;
        }
      }
      logEvent(`${union.name}이(가) 형성되었습니다.`, 'god');
    } else {
      logEvent(`${a.name}과 ${b.name}이(가) 동맹을 맺었습니다.`, 'good');
    }

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
        n.unionId = null;
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
    wars.push({ a: aId, b: bId, age: 0, scoreA: 0, scoreB: 0, goal: '영토', active: true });
    logEvent(`${nations[aId].name} ↔ ${nations[bId].name} 전쟁 발발!`, 'war');
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
    for (const n of nations) {
      if (!n.alive) continue;
      n.age++;
      let cityBonus = n.cities.length * 0.012;
      let growth = 0.006 + cityBonus + n.tech * 0.00005;
      if (n.plague > 0) {
        growth -= 0.035;
        n.plague--;
      }
      const happinessFactor = (n.happiness - 50) * 0.0006;
      n.population = Math.max(1, Math.floor(n.population * (1 + growth + happinessFactor)));
      n.demographics.elders = clamp(n.demographics.elders + rand(-0.004, 0.005), 0.08, 0.28);
      n.demographics.children = clamp(n.demographics.children + rand(-0.005, 0.004), 0.18, 0.4);
      n.demographics.adults = clamp(1 - n.demographics.elders - n.demographics.children, 0.4, 0.7);
      const resources = computeNationResources(n);
      const income = n.cities.length * irand(5, 12) + n.population * 0.025 + n.tradeIncome + resources[n.cities[0]?.resource] * 1.2;
      n.gold = Math.max(0, n.gold + income - n.army * 0.035);
      n.tech = clamp(n.tech + rand(0.01, 0.12) + n.gold * 0.00001, 1, 100);
      n.happiness += rand(-0.6, 0.6) + (n.gold > n.population * 0.4 ? 0.3 : -0.3) + (n.stability > 60 ? 0.2 : -0.4);
      n.happiness = clamp(n.happiness, 0, 100);
      n.stability += rand(-0.7, 0.7) + (n.happiness - 50) * 0.01;
      if (n.gold < 30) n.stability -= 0.3;
      if (n.warExhaustion > 20) n.stability -= 0.7;
      n.stability = clamp(n.stability, 0, 100);
      const desiredArmy = n.population * 0.18;
      if (n.gold > 100 && n.army < desiredArmy) n.army += Math.min(4, n.gold * 0.01);
      if (n.army > n.population * 0.45) n.army = n.population * 0.45;
      n.power = n.army * (1 + n.tech / 100);
    }

    updateMilitaryMovement();
    refreshWarArrows();
    let territoryChanged = false;

    for (const w of wars) {
      if (!w.active) continue;
      w.age++;
      const a = nations[w.a], b = nations[w.b];
      if (!a || !b || !a.alive || !b.alive) {
        w.active = false;
        continue;
      }

      const battleCount = irand(7, 12);
      for (let i = 0; i < battleCount; i++) {
        const pa = a.power * rand(0.7, 1.2);
        const pb = b.power * rand(0.7, 1.2);
        const diff = Math.max(0.15, Math.abs(pa - pb) / Math.max(1, Math.min(pa, pb)));
        if (pa > pb) {
          w.scoreA += rand(1.5, 3.8) + diff * 2.2;
          w.scoreB = Math.max(-100, w.scoreB - rand(0.4, 1.1));
        } else {
          w.scoreB += rand(1.5, 3.8) + diff * 2.2;
          w.scoreA = Math.max(-100, w.scoreA - rand(0.4, 1.1));
        }

        const attacker = pa >= pb ? w.a : w.b;
        const defender = attacker === w.a ? w.b : w.a;
        const captureSize = Math.max(2, Math.min(12, Math.round((Math.max(pa, pb) / Math.min(pa, pb)) * 2.4)));
        const captured = captureWarfrontCells(defender, attacker, captureSize);
        if (captured > 0) {
          territoryChanged = true;
          logEvent(`${nations[attacker].name}이(가) 전쟁터에서 직접 영토를 점령했다.`, 'war');
        }
      }

      a.army = Math.max(1, a.army - Math.max(0, Math.floor(a.army * 0.006 * rand(0.8, 2.2))));
      b.army = Math.max(1, b.army - Math.max(0, Math.floor(b.army * 0.006 * rand(0.8, 2.2))));

      if (w.age >= 2 && w.scoreA >= 10) { const captured = captureWarfrontCells(w.b, w.a, 6); territoryChanged = territoryChanged || captured > 0; }
      if (w.age >= 2 && w.scoreB >= 10) { const captured = captureWarfrontCells(w.a, w.b, 6); territoryChanged = territoryChanged || captured > 0; }

      if (w.age > 28 || w.scoreA >= 55 || w.scoreB >= 55) {
        let winner = null;
        if (w.scoreA > w.scoreB + 8) winner = w.a;
        if (w.scoreB > w.scoreA + 8) winner = w.b;
        if (winner !== null) {
          const win = nations[winner]; const lose = winner === w.a ? nations[w.b] : nations[w.a];
          if (win && lose) logEvent(`${win.name}이(가) ${lose.name}를 제압하고 전쟁을 승리했다.`, 'war');
        }
        w.active = false;
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
    rebuildNationStats();

    if (needsClaimFix) {
      claimUnclaimedLand();
      needsClaimFix = false;
      territoryChanged = true;
    }
    if (nations.some(n => n.isRebel)) territoryChanged = true;

    if (territoryChanged && selected >= 0) computeSelectionBorder();
    if (year % 25 === 0) logEvent(`세계력 ${year}년. 새로운 시대가 열리고 있다.`, 'god');
    if (year % 100 === 0) logEvent(`역사 기록: ${year}년의 세계가 기록되었다.`, 'god');
    renderWorld();
    updateUI();
  }

  function rebuildNationStats() {
    for (const n of nations) {
      if (!n.alive) continue;
      let count = 0;
      for (let i = 0; i < owner.length; i++) if (owner[i] === n.id) count++;
      if (count === 0) {
        n.alive = false; continue;
      }
      n.power = n.army * (1 + n.tech / 100);
    }
  }

  function neighbors(id) {
    const set = new Set();
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (owner[idx(x, y)] !== id) continue;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (!inside(nx, ny)) continue;
          const o = owner[idx(nx, ny)];
          if (o >= 0 && o !== id && nations[o]?.alive) set.add(o);
        }
      }
    }
    return [...set];
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

  function simulateDiplomacy() {
    for (const a of nations) {
      if (!a.alive) continue;
      const ns = neighbors(a.id);
      for (const bId of ns) {
        const b = nations[bId];
        if (!b?.alive) continue;
        if (a.relations[bId] === undefined) a.relations[bId] = rand(-20, 20);
        if (b.relations[a.id] === undefined) b.relations[a.id] = rand(-20, 20);
        const r = (a.relations[bId] + b.relations[a.id]) / 2;
        if (r > 55 && rand() < 0.002) {
          a.gold += 20; b.gold += 20;
          a.relations[bId] += 5; b.relations[a.id] += 5;
          logEvent(`${a.name}과 ${b.name}의 관계가 크게 개선됐다.`, 'good');
        }
        if (r < -45 && rand() < 0.004) {
          forceWarBetween(a.id, b.id);
        }
      }
      for (const k in a.relations) {
        a.relations[k] += rand(-0.15, 0.15);
        a.relations[k] = clamp(a.relations[k], -100, 100);
      }
    }

    for (let i = 0; i < nations.length; i++) {
      const a = nations[i];
      if (!a || !a.alive) continue;
      const living = nations.filter(n => n.alive && n.id !== a.id);
      if (!living.length) continue;
      if (rand() < 0.008 && a.relations[living[0].id] !== undefined) {
        const enemy = living[irand(0, living.length - 1)];
        if (enemy && (a.relations[enemy.id] || 0) < -20) forceWarBetween(a.id, enemy.id);
      }
    }
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

  function autoColonization() {
    const imperial = nations.filter(n => n.alive && (n.grade === '제국' || n.ideology === '제국' || n.power > 220));
    if (!imperial.length) return;
    for (const n of imperial) {
      if (n.isColony) continue;
      if (rand() < 0.015) {
        const objectives = [];
        for (let i = 0; i < land.length; i++) {
          if (land[i] && owner[i] >= 0 && owner[i] !== n.id) {
            const x = i % MAP_W, y = Math.floor(i / MAP_W);
            const dx = x - n.capital.x, dy = y - n.capital.y;
            if (Math.hypot(dx, dy) > 180) objectives.push(i);
          }
        }
        if (!objectives.length) continue;
        const i = objectives[irand(0, objectives.length - 1)];
        const targetOwner = owner[i];
        const target = nations[targetOwner];
        if (!target || !target.alive || target.id === n.id) continue;
        const x = i % MAP_W, y = Math.floor(i / MAP_W);
        const colonyId = n.id;
        const colonyName = `${n.name} 식민지`;
        owner[i] = colonyId;
        n.gold += 55;
        n.power += 10;
        n.isColony = false;
        target.isColony = false;
        logEvent(`${n.name}이(가) ${target.name}의 외곽 땅을 식민지화했다.`, 'god');
        const colony = {
          ...n,
          id: target.id + 1000,
          name: colonyName,
          grade: '식민지',
          isColony: true,
          colonizer: n.id,
          color: '#7b6ed1',
          seedX: x,
          seedY: y,
          alive: true,
          cities: [{ x, y, name: `${colonyName} 거점`, capital: true, level: 2, resource: pickResource(), holy: false }],
          capital: { x, y },
          population: Math.max(30, Math.floor(n.population * 0.12)),
          army: Math.max(6, Math.floor(n.army * 0.08)),
          gold: Math.max(20, Math.floor(n.gold * 0.08)),
          relations: {},
          isRebel: false
        };
        nations.push(colony);
      }
    }
  }

  function spawnRebellion(n) {
    const cells = [];
    for (let i = 0; i < owner.length; i++) if (owner[i] === n.id) cells.push(i);
    if (cells.length < 30) return;
    const startI = cells[irand(0, cells.length - 1)];
    const sx = startI % MAP_W, sy = Math.floor(startI / MAP_W);
    const grabTarget = Math.max(10, Math.floor(cells.length * 0.25));
    const seen = new Uint8Array(owner.length);
    const queue = [startI];
    seen[startI] = 1;
    const grabbed = [];
    while (queue.length && grabbed.length < grabTarget) {
      const i = queue.shift();
      if (owner[i] !== n.id) continue;
      grabbed.push(i);
      const x = i % MAP_W, y = Math.floor(i / MAP_W);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (!inside(nx, ny)) continue;
        const ni = idx(nx, ny);
        if (!seen[ni] && owner[ni] === n.id) { seen[ni] = 1; queue.push(ni); }
      }
    }
    if (grabbed.length < 10) return;

    const id = nations.length;
    const popShare = Math.min(n.population - 10, Math.floor(n.population * (grabbed.length / cells.length)));
    const armyShare = Math.floor(n.army * 0.3);
    n.population = Math.max(10, n.population - popShare);
    n.army = Math.max(1, n.army - armyShare);
    n.stability = clamp(n.stability + 20, 0, 100);
    n.lowStabYears = 0;

    const rebel = {
      id, name: `${n.name} 반란군`, grade: '반란군', color: colors[id % colors.length], species: n.species, ideology: '부족연맹',
      seedX: sx, seedY: sy, population: Math.max(10, popShare), army: Math.max(5, armyShare), gold: Math.floor(n.gold * 0.15),
      tech: n.tech * 0.6, stability: rand(40, 60), power: 0, age: 0, alive: true, cities: [], capital: { x: sx, y: sy }, relations: {},
      plague: 0, warExhaustion: 0, allianceId: null, unionId: null, religion: n.religion, happiness: rand(45, 65),
      demographics: { children: 0.32, adults: 0.53, elders: 0.15 }, tradeIncome: 0, lowStabYears: 0, isRebel: true
    };
    for (const i of grabbed) owner[i] = id;
    for (const c of n.cities.slice()) {
      if (owner[idx(c.x, c.y)] === id) rebel.cities.push(c);
    }
    n.cities = n.cities.filter(c => !rebel.cities.includes(c));
    if (!rebel.cities.length) {
      rebel.cities.push({ x: sx, y: sy, name: `${rebel.name} 근거지`, capital: true, level: 1, resource: pickResource(), holy: false });
      owner[idx(sx, sy)] = id;
    } else {
      rebel.cities[0].capital = true;
      rebel.capital = { x: rebel.cities[0].x, y: rebel.cities[0].y };
    }
    if (!n.cities.some(c => c.capital) && n.cities.length) n.cities[0].capital = true;

    nations.push(rebel);
    wars.push({ a: n.id, b: id, age: 0, scoreA: 0, scoreB: 0, goal: '독립', active: true });
    logEvent(`${n.name}의 낮은 안정도로 인해 ${rebel.name}이(가) 봉기했다!`, 'war');
  }

  function simulateRebellion() {
    for (const n of nations.slice()) {
      if (!n.alive || n.isRebel) continue;
      if (n.stability < 22) {
        n.lowStabYears = (n.lowStabYears || 0) + 1;
      } else {
        n.lowStabYears = 0;
      }
      if (n.lowStabYears >= 5 && n.cities.length >= 3 && rand() < 0.15) {
        spawnRebellion(n);
      }
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

  function updateMilitaryMovement() {
    const hostilePairs = new Set();
    for (const w of wars) {
      if (w.active) hostilePairs.add(`${w.a}-${w.b}`);
    }

    for (const u of armyUnits) {
      const n = nations[u.owner];
      if (!n || !n.alive) continue;
      let target = null;
      for (const other of nations) {
        if (!other.alive || other.id === n.id) continue;
        if (hostilePairs.has(`${n.id}-${other.id}`) || hostilePairs.has(`${other.id}-${n.id}`)) {
          target = other;
          break;
        }
      }
      if (!target) {
        u.tx = n.capital.x + 0.5 + Math.sin((year + n.id) * 0.8) * 1.2;
        u.ty = n.capital.y + 0.5 + Math.cos((year + n.id) * 0.9) * 1.2;
      } else {
        const city = (target.cities.find(c => c.capital) || target.cities[0]);
        if (city) {
          u.tx = city.x + 0.5;
          u.ty = city.y + 0.5;
        }
      }
      const dx = u.tx - u.x;
      const dy = u.ty - u.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.15) {
        u.x += (dx / dist) * u.speed;
        u.y += (dy / dist) * u.speed;
      }
    }

    for (const u of navalUnits) {
      const n = nations[u.owner];
      if (!n || !n.alive) continue;
      if (u.kind === 'transport') {
        const tradeTargets = nations.filter(other => other.alive && other.id !== n.id && n.relations[other.id] > 10 && other.cities.some(c => isCoastalCell(c.x, c.y)));
        if (tradeTargets.length) {
          const other = tradeTargets[irand(0, tradeTargets.length - 1)];
          const city = other.cities.find(c => isCoastalCell(c.x, c.y)) || other.cities[0];
          if (city) {
            u.tx = city.x + 0.5;
            u.ty = city.y + 0.5;
          }
        } else {
          const city = n.cities.find(c => isCoastalCell(c.x, c.y)) || n.cities[0];
          u.tx = city.x + 0.5;
          u.ty = city.y + 0.5;
        }
      } else {
        let target = null;
        for (const other of nations) {
          if (!other.alive || other.id === n.id) continue;
          if (hostilePairs.has(`${n.id}-${other.id}`) || hostilePairs.has(`${other.id}-${n.id}`)) {
            const city = (other.cities.find(c => isCoastalCell(c.x, c.y)) || other.cities[0]);
            if (city) {
              target = city;
              break;
            }
          }
        }
        if (target) {
          u.tx = target.x + 0.5;
          u.ty = target.y + 0.5;
        }
      }

      const dx = u.tx - u.x;
      const dy = u.ty - u.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.15) {
        u.x += (dx / dist) * u.speed;
        u.y += (dy / dist) * u.speed;
      }
    }

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
      logEvent(`${n.name}이(가) 역사에서 사라졌다.`, 'bad');
      renderWorld();
      return;
    }
    const target = nations[ns[irand(0, ns.length - 1)]];
    if (!target?.alive) return;
    for (const i of cells) owner[i] = target.id;
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
    const grade = ui.nationGrade.value;
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
      grade,
      color: colors[id % colors.length],
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
    owner[idx(x, y)] = id;
    for (let yy = y - 2; yy <= y + 2; yy++) {
      for (let xx = x - 2; xx <= x + 2; xx++) {
        if (inside(xx, yy) && land[idx(xx, yy)]) owner[idx(xx, yy)] = id;
      }
    }
    nation.cities.push({ x, y, name: `${nation.name} 수도`, capital: true, level: 3, resource: pickResource(), holy: true });
    selected = id;
    computeSelectionBorder();
    closeModal();
    logEvent(`${nation.name} ${nation.grade}이(가) 세계에 등장했다.`, 'god');
    renderWorld();
    updateUI();
  }

  function gameLoop(t) {
    const dt = (t - lastTime) / 1000;
    lastTime = t;
    if (!paused) {
      accumulator += dt * speed;
      while (accumulator >= 0.75) {
        accumulator -= 0.75;
        simulateYear();
      }
    }
    requestAnimationFrame(gameLoop);
  }

  let pointerId = null;
  let lastPointer = { x: 0, y: 0 };

  canvas.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointerId = e.pointerId;
    dragging = true;
    dragX = e.clientX;
    dragY = e.clientY;
    lastPointer.x = e.clientX;
    lastPointer.y = e.clientY;
    canvas.classList.add('dragging');
    canvas.setPointerCapture?.(e.pointerId);
  });

  window.addEventListener('pointerup', e => {
    if (pointerId !== null && e.pointerId !== pointerId) return;
    dragging = false;
    pointerId = null;
    canvas.classList.remove('dragging');
    if (Math.abs(e.clientX - dragX) <= 8 && Math.abs(e.clientY - dragY) <= 8) {
      selectAt(e.clientX, e.clientY);
    }
  });

  window.addEventListener('pointermove', e => {
    if (!dragging || (pointerId !== null && e.pointerId !== pointerId)) return;
    const dx = e.clientX - dragX;
    const dy = e.clientY - dragY;
    camera.x += dx;
    camera.y += dy;
    dragX = e.clientX;
    dragY = e.clientY;
    lastPointer.x = e.clientX;
    lastPointer.y = e.clientY;
  });

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

  document.getElementById('newWorld').onclick = () => {
    if (confirm('새로운 세계를 만들까요? 현재 세계는 사라집니다.')) {
      seed = Math.floor(Math.random() * 999999);
      resetWorld();
    }
  };

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

  document.getElementById('save').onclick = () => {
    const data = { seed, land: Array.from(land), terrain: Array.from(terrain), owner: Array.from(owner), nations, alliances, wars, events, year, selected, layer };
    localStorage.setItem('fantasyGodWorld', JSON.stringify(data));
    logEvent('세계가 저장됐다.', 'god');
    updateUI();
  };

  document.getElementById('load').onclick = () => {
    const raw = localStorage.getItem('fantasyGodWorld');
    if (!raw) { alert('저장된 세계가 없습니다.'); return; }
    try {
      const d = JSON.parse(raw);
      seed = d.seed;
      land = Uint8Array.from(d.land);
      terrain = Uint8Array.from(d.terrain);
      owner = Int16Array.from(d.owner);
      nations = d.nations || [];
      alliances = d.alliances || [];
      wars = d.wars || [];
      events = d.events || [];
      year = d.year || 1;
      selected = d.selected || -1;
      layer = d.layer || 'political';
      computeSelectionBorder();
      renderWorld();
      updateUI();
      logEvent('저장된 세계를 불러왔다.', 'god');
    } catch (e) {
      alert('세계 데이터를 불러오지 못했습니다.');
    }
  };

  ui.relationTarget.onchange = () => { targetId = Number(ui.relationTarget.value); };
  document.getElementById('makeAlliance').onclick = () => { if (selected >= 0 && targetId >= 0) createAllianceBetween(selected, targetId); };
  document.getElementById('breakAlliance').onclick = () => { if (selected >= 0) destroyAllianceForSelected(); };
  document.getElementById('startWar').onclick = () => { startWarButton(); };
  document.getElementById('makePeace').onclick = () => { if (selected >= 0 && targetId >= 0) makePeace(selected, targetId); };

  canvas.width = W;
  canvas.height = H;
  resetWorld();
  requestAnimationFrame(draw);
  requestAnimationFrame(gameLoop);
})();
