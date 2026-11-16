// 신의 권능 · 재해의 캔버스 연출. game.js가 그리는 지도 캔버스 위에 덧그린다.
//  - WFFx.add(kind, x, y, opts): 지도 좌표(칸)에 효과를 하나 띄운다. kind는 아래 DRAW의 이름.
//  - WFFx.draw(ctx, camera, W, H): game.js의 draw()가 매 프레임 부른다.
//  - WFFx.shake(): 화면 흔들림 {x, y} 또는 null (지진 · 화산 · 운석 · 번개)
//  - WFFx.clear(): 새 세계를 만들거나 불러올 때 남은 효과를 지운다.
// 효과는 게임 속도와 상관없이 실제 시간으로 흐른다. 그래서 일시정지 중에 권능을 써도 끝까지 보인다.
// 새 효과를 더하려면: DUR에 길이(ms)를 적고, 필요하면 SETUP에서 모양을 미리 뽑고, DRAW에 그리는 함수를 넣는다.
(() => {
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut = k => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
  const easeIn = k => Math.pow(clamp(k, 0, 1), 3);
  // 서서히 나타났다가 서서히 사라지는 정도 (0~1)
  const fade = (k, a = 0.12, b = 0.3) => Math.min(1, k / a, (1 - k) / b);
  const tr = s => (window.WFI18n ? window.WFI18n.tr(s) : s);
  // 움직임 줄이기를 켠 기기에서는 화면 흔들림과 번쩍임을 끈다
  const calm = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  // 씨앗 난수: 효과마다 모양은 다르지만 프레임마다 흔들리지는 않게, 모양은 만들 때 한 번만 뽑는다
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const DUR = {
    quake: 2800, storm: 4400, drought: 4000, flood: 3800, plague: 4000, volcano: 4400, meteor: 3200, lightning: 1100,
    bless: 1600, curse: 1600, link: 2100, spawn: 1700, collapse: 1900
  };
  // ----- 연출 크기 -----
  // RADIUS: 효과의 반지름(지도 칸). 실제로 피해가 미치는 범위(game.js의 BLAST · POWER_RADIUS)와 비슷하게 맞춰 둔다.
  // SCALE: 모든 연출을 한꺼번에 키우거나 줄이는 배율. 연출이 크거나 작게 느껴지면 이 숫자 하나만 바꾸면 된다.
  // ZOOM_MIN: 지도를 아주 작게 보고 있어도 이 배율 아래로는 줄이지 않는다 (너무 작으면 안 보인다).
  const SCALE = 1;
  const ZOOM_MIN = 0.8, ZOOM_MAX = 2.6;
  const RADIUS = { quake: 32, storm: 36, drought: 30, flood: 32, plague: 28, volcano: 26, meteor: 24, collapse: 32, spawn: 28 };
  // 화면 흔들림: [세기(px), 길이(ms), 시작 지연(ms)]
  const SHAKE = { quake: [6, 1200, 0], volcano: [3, 700, 0], meteor: [9, 850, 900], lightning: [2, 160, 0], collapse: [2.5, 450, 0] };
  const METEOR_HIT = 900 / DUR.meteor; // 운석이 땅에 닿는 시점 (game.js는 이 시간에 맞춰 피해를 준다)

  let list = [];
  let serial = 1;

  function add(kind, x, y, opts) {
    if (!DRAW[kind]) return null;
    const f = Object.assign({ kind, x, y, t0: performance.now(), dur: DUR[kind] || 1500, seed: (serial++ * 2654435761) >>> 0 }, opts || {});
    if (SETUP[kind]) SETUP[kind](f, rng(f.seed));
    list.push(f);
    if (list.length > 48) list.shift();
    return f;
  }

  function shake() {
    if (calm.matches || !list.length) return null;
    const t = performance.now();
    let amp = 0;
    for (const f of list) {
      const s = SHAKE[f.kind];
      if (!s) continue;
      const e = t - f.t0 - s[2];
      if (e < 0 || e > s[1]) continue;
      amp = Math.max(amp, s[0] * Math.pow(1 - e / s[1], 2));
    }
    if (amp < 0.2) return null;
    return { x: Math.sin(t / 23) * amp + Math.sin(t / 7.3) * amp * 0.4, y: Math.cos(t / 19) * amp * 0.8 };
  }

  function draw(ctx, cam, W, H) {
    if (!list.length) return;
    const t = performance.now();
    list = list.filter(f => t - f.t0 < f.dur);
    for (const f of list) {
      const k = (t - f.t0) / f.dur;
      const sx = cam.x + f.x * cam.zoom, sy = cam.y + f.y * cam.zoom;
      const z = clamp(cam.zoom, ZOOM_MIN, ZOOM_MAX) * SCALE; // 지도 배율을 따라가되, 멀리서 봐도 너무 작아지지 않게
      ctx.save();
      DRAW[f.kind](ctx, f, k, sx, sy, z, t, cam, W, H);
      ctx.restore();
    }
  }

  // ----- 그리기 도우미 -----
  function ring(ctx, x, y, r, color, width) {
    if (r <= 0) return;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  function disc(ctx, x, y, r, color) {
    if (r <= 0) return;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fillStyle = color;
    ctx.fill();
  }
  function glow(ctx, x, y, r, stops) { // stops: [[위치, 색], ...]
    if (r <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    for (const [p, c] of stops) g.addColorStop(p, c);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function star(ctx, x, y, s) { // 네 갈래 반짝임
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.quadraticCurveTo(x, y, x + s, y);
    ctx.quadraticCurveTo(x, y, x, y + s);
    ctx.quadraticCurveTo(x, y, x - s, y);
    ctx.quadraticCurveTo(x, y, x, y - s);
    ctx.fill();
  }
  function label(ctx, text, x, y, color, alpha, z) {
    if (!text || alpha <= 0) return;
    ctx.globalAlpha = clamp(alpha, 0, 1);
    ctx.font = `800 ${Math.round(clamp(13 * z, 13, 18))}px Georgia, "Noto Serif KR", "Malgun Gothic", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(20,12,6,.9)';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1;
  }
  // 중심에서 뻗어 나가는 갈라진 금 (단위 원 기준 좌표)
  function makeCracks(r, count, reach) {
    const cracks = [];
    for (let i = 0; i < count; i++) {
      const base = (i / count) * TAU + (r() - 0.5) * 0.7;
      const pts = [[0, 0]];
      let a = base, d = 0;
      const steps = 4 + Math.floor(r() * 3);
      for (let s = 1; s <= steps; s++) {
        a += (r() - 0.5) * 0.9;
        d += (reach / steps) * (0.7 + r() * 0.6);
        pts.push([Math.cos(a) * d, Math.sin(a) * d]);
      }
      cracks.push(pts);
      if (r() < 0.6) { // 곁가지
        const from = pts[1 + Math.floor(r() * (pts.length - 2))];
        const ba = a + (r() < 0.5 ? 1 : -1) * (0.6 + r() * 0.6);
        const bl = reach * (0.2 + r() * 0.25);
        cracks.push([from, [from[0] + Math.cos(ba) * bl * 0.5, from[1] + Math.sin(ba) * bl * 0.5], [from[0] + Math.cos(ba + 0.4) * bl, from[1] + Math.sin(ba + 0.4) * bl]]);
      }
    }
    return cracks;
  }
  // 갈라진 금을 reveal(0~1)만큼만 그린다
  function strokeCracks(ctx, cracks, sx, sy, R, reveal) {
    ctx.beginPath();
    for (const pts of cracks) {
      const upto = reveal * (pts.length - 1);
      ctx.moveTo(sx + pts[0][0] * R, sy + pts[0][1] * R);
      for (let i = 1; i < pts.length; i++) {
        if (i <= upto) ctx.lineTo(sx + pts[i][0] * R, sy + pts[i][1] * R);
        else {
          const part = upto - (i - 1);
          if (part > 0) ctx.lineTo(sx + (pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * part) * R, sy + (pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * part) * R);
          break;
        }
      }
    }
    ctx.stroke();
  }

  // ----- 효과마다 미리 뽑아 두는 모양 -----
  const SETUP = {
    quake(f, r) {
      f.cracks = makeCracks(r, 6, 0.95);
      f.jag = Array.from({ length: 3 }, () => Array.from({ length: 28 }, () => r() - 0.5));
      f.dust = Array.from({ length: 12 }, () => ({ a: r() * TAU, d: 0.25 + r() * 0.7, s: 3 + r() * 5 }));
    },
    storm(f, r) {
      f.rain = Array.from({ length: 30 }, () => ({ a: r() * TAU, d: Math.sqrt(r()), ph: r() }));
      f.dir = r() < 0.5 ? 1 : -1;
    },
    drought(f, r) {
      f.cracks = makeCracks(r, 7, 0.9);
      f.waves = Array.from({ length: 6 }, () => ({ x: (r() - 0.5) * 1.5, ph: r() * TAU, sp: 0.6 + r() * 0.7 }));
    },
    flood(f, r) {
      f.ph = r() * TAU;
    },
    plague(f, r) {
      f.blobs = Array.from({ length: 15 }, () => ({ a: r() * TAU, d: 0.1 + r() * 0.8, s: 5 + r() * 7, ph: r() * TAU }));
    },
    volcano(f, r) {
      f.bombs = Array.from({ length: 18 }, () => ({ vx: (r() - 0.5) * 2, vy: -(0.45 + r() * 0.6), delay: r() * 0.5, s: 1.8 + r() * 2.2 }));
      f.ash = Array.from({ length: 10 }, () => ({ ox: (r() - 0.5) * 2, sp: r(), s: r() }));
    },
    meteor(f, r) {
      f.debris = Array.from({ length: 22 }, () => ({ a: r() * TAU, v: 0.6 + r() * 1.2, s: 1.5 + r() * 2.5, hot: r() < 0.45 }));
      f.smoke = Array.from({ length: 6 }, () => ({ ox: (r() - 0.5) * 0.8, sp: 0.5 + r() * 0.6, s: r() }));
      f.cracks = makeCracks(r, 5, 0.55);
    },
    lightning(f, r) {
      // 번개 줄기 두 가지 (번쩍-번쩍 두 번 친다). 좌표는 내리친 곳 기준 [옆으로, 위로(0=땅, 1=하늘)]
      const bolt = () => {
        const main = [[(r() - 0.5) * 0.5, 1]];
        const n = 11;
        for (let i = n - 1; i >= 1; i--) { // 위에서 아래로 지그재그. 땅에 가까워질수록 내리친 곳으로 모인다.
          const side = (i % 2 ? 1 : -1) * (0.05 + r() * 0.11);
          main.push([main[0][0] * (i / n) + side * Math.min(1, i / 3), i / n + (r() - 0.5) * 0.03]);
        }
        main.push([0, 0]);
        const forks = [];
        for (let b = 0; b < 2; b++) {
          const from = main[2 + Math.floor(r() * 4)];
          const dir = r() < 0.5 ? -1 : 1;
          forks.push([from, [from[0] + dir * (0.08 + r() * 0.1), from[1] - 0.1], [from[0] + dir * (0.14 + r() * 0.16), from[1] - 0.2 - r() * 0.08]]);
        }
        return { main, forks };
      };
      f.bolts = [bolt(), bolt(), bolt()];
      f.sparks = Array.from({ length: 9 }, () => ({ a: r() * TAU, l: 0.5 + r() * 0.8 }));
    },
    bless(f, r) {
      f.sp = Array.from({ length: 11 }, () => ({ x: (r() - 0.5) * 34, h: 26 + r() * 56, s: 1.8 + r() * 2.6, ph: r() * TAU }));
    },
    curse(f, r) {
      f.sp = Array.from({ length: 10 }, () => ({ x: (r() - 0.5) * 36, h: 34 + r() * 48, s: 2.1 + r() * 2.1, d: r() * 0.3 }));
    },
    spawn(f, r) {
      f.rays = Array.from({ length: 14 }, (_, i) => ({ a: (i / 14) * TAU + (r() - 0.5) * 0.2, l: 0.7 + r() * 0.6 }));
    },
    collapse(f, r) {
      f.dust = Array.from({ length: 14 }, () => ({ a: r() * TAU, d: 0.3 + r() * 0.7, s: 3 + r() * 5 }));
      f.cracks = makeCracks(r, 5, 0.8);
    }
  };

  // ----- 효과 그리기. k = 진행도(0~1), (sx, sy) = 화면 좌표, z = 크기 배율, t = 지금 시각(ms) -----
  const DRAW = {
    // 지진: 땅이 갈라지고 충격파가 퍼진다
    quake(ctx, f, k, sx, sy, z) {
      const R = RADIUS.quake * z;
      for (let i = 0; i < 3; i++) {
        const kk = clamp(k * 1.7 - i * 0.2, 0, 1);
        if (kk <= 0 || kk >= 1) continue;
        const r = R * (0.15 + 1.15 * easeOut(kk));
        ctx.beginPath();
        for (let a = 0; a <= 28; a++) {
          const ang = (a / 28) * TAU, rr = r + f.jag[i][a % 28] * 5 * z * (0.4 + kk);
          const px = sx + Math.cos(ang) * rr, py = sy + Math.sin(ang) * rr * 0.82;
          a ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(52,30,14,${(1 - kk) * 0.5})`;
        ctx.lineWidth = Math.max(2.4, 5 * z * (1 - kk * 0.5));
        ctx.stroke();
        ctx.strokeStyle = `rgba(226,182,120,${(1 - kk) * 0.9})`;
        ctx.lineWidth = Math.max(1.1, 1.9 * z * (1 - kk * 0.5));
        ctx.stroke();
      }
      const a = k < 0.6 ? 1 : (1 - k) / 0.4;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = `rgba(36,20,9,${a * 0.9})`;
      ctx.lineWidth = Math.max(1.6, 2.6 * z);
      strokeCracks(ctx, f.cracks, sx, sy, R, easeOut(k * 3));
      ctx.strokeStyle = `rgba(214,170,110,${a * 0.5})`;
      ctx.lineWidth = Math.max(0.8, 0.9 * z);
      ctx.translate(1.2, 1.2);
      strokeCracks(ctx, f.cracks, sx, sy, R, easeOut(k * 3));
      ctx.translate(-1.2, -1.2);
      for (const d of f.dust) {
        const e = easeOut(k);
        disc(ctx, sx + Math.cos(d.a) * d.d * R * (0.3 + 0.7 * e), sy + Math.sin(d.a) * d.d * R * 0.8 * (0.3 + 0.7 * e) - 11 * z * k, d.s * z * (0.6 + 0.7 * k), `rgba(198,172,130,${(1 - k) * 0.45})`);
      }
    },

    // 태풍: 눈을 중심으로 소용돌이치는 구름과 비
    storm(ctx, f, k, sx, sy, z, t) {
      const R = RADIUS.storm * z, a = fade(k, 0.14, 0.25);
      sx += Math.sin(k * 3.2) * 5 * z * f.dir;
      glow(ctx, sx, sy, R * 1.15, [[0, 'rgba(70,90,120,0)'], [0.12, `rgba(92,112,146,${0.1 * a})`], [0.4, `rgba(108,130,166,${0.5 * a})`], [0.78, `rgba(84,104,138,${0.28 * a})`], [1, 'rgba(84,104,138,0)']]);
      const spin = -(t / 520) * f.dir;
      ctx.lineCap = 'round';
      for (let arm = 0; arm < 4; arm++) {
        ctx.beginPath();
        for (let s = 0; s <= 20; s++) {
          const u = s / 20, ang = spin + arm * (TAU / 4) + u * 3.4 * f.dir, r = (0.13 + 0.87 * u) * R;
          const px = sx + Math.cos(ang) * r, py = sy + Math.sin(ang) * r;
          s ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.strokeStyle = `rgba(236,243,250,${0.2 * a})`;
        ctx.lineWidth = 6.5 * z;
        ctx.stroke();
        ctx.strokeStyle = `rgba(246,250,255,${0.72 * a})`;
        ctx.lineWidth = Math.max(1.3, 2 * z);
        ctx.stroke();
      }
      ring(ctx, sx, sy, 0.12 * R, `rgba(250,252,255,${0.85 * a})`, Math.max(1.1, 1.6 * z));
      ctx.strokeStyle = `rgba(190,216,242,${0.6 * a})`;
      ctx.lineWidth = Math.max(1, 1.2 * z);
      ctx.beginPath();
      for (const d of f.rain) {
        const off = (t / 300 + d.ph) % 1;
        const px = sx + Math.cos(d.a) * d.d * R + (off - 0.5) * 8 * z, py = sy + Math.sin(d.a) * d.d * R + (off - 0.5) * 15 * z;
        ctx.moveTo(px, py);
        ctx.lineTo(px + 2.2 * z, py + 5 * z);
      }
      ctx.stroke();
    },

    // 가뭄: 이글거리는 볕과 갈라지는 땅
    drought(ctx, f, k, sx, sy, z, t) {
      const R = RADIUS.drought * z, a = fade(k, 0.15, 0.3);
      glow(ctx, sx, sy, R * 1.2, [[0, `rgba(255,176,64,${0.42 * a})`], [0.55, `rgba(240,140,50,${0.2 * a})`], [1, 'rgba(240,140,50,0)']]);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = `rgba(92,50,18,${a * 0.8})`;
      ctx.lineWidth = Math.max(1.3, 2 * z);
      strokeCracks(ctx, f.cracks, sx, sy, R, easeOut(k * 2.4));
      // 아지랑이
      ctx.strokeStyle = `rgba(255,226,170,${a * 0.42})`;
      ctx.lineWidth = Math.max(1, 1.4 * z);
      for (const w of f.waves) {
        const rise = ((t / 1500) * w.sp + w.ph) % 1;
        const bx = sx + w.x * R * 0.6, by = sy + R * 0.2 - rise * R * 1.3;
        ctx.globalAlpha = Math.sin(rise * Math.PI);
        ctx.beginPath();
        for (let s = 0; s <= 8; s++) {
          const px = bx + Math.sin(s * 1.1 + t / 180 + w.ph) * 2.4 * z, py = by - s * 2.4 * z;
          s ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // 해
      const hx = sx, hy = sy - R * 1.05, hr = 6.5 * z;
      glow(ctx, hx, hy, hr * 3.2, [[0, `rgba(255,224,130,${0.55 * a})`], [1, 'rgba(255,224,130,0)']]);
      ctx.strokeStyle = `rgba(255,214,110,${a * 0.9})`;
      ctx.lineWidth = Math.max(1.4, 2 * z);
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * TAU + t / 2600;
        ctx.moveTo(hx + Math.cos(ang) * hr * 1.45, hy + Math.sin(ang) * hr * 1.45);
        ctx.lineTo(hx + Math.cos(ang) * hr * 2.05, hy + Math.sin(ang) * hr * 2.05);
      }
      ctx.stroke();
      disc(ctx, hx, hy, hr, `rgba(255,226,128,${a})`);
    },

    // 홍수: 물이 차올랐다가 빠진다
    flood(ctx, f, k, sx, sy, z, t) {
      const R = RADIUS.flood * z;
      const r = R * easeOut(k * 1.7);
      const a = k < 0.62 ? Math.min(1, k * 8) : (1 - k) / 0.38;
      ctx.beginPath();
      for (let i = 0; i <= 44; i++) {
        const ang = (i / 44) * TAU;
        const rr = r * (1 + 0.06 * Math.sin(ang * 5 + t / 300 + f.ph) + 0.04 * Math.sin(ang * 9 - t / 210));
        const px = sx + Math.cos(ang) * rr, py = sy + Math.sin(ang) * rr * 0.86;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(52,122,188,${0.46 * a})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(202,230,252,${0.85 * a})`;
      ctx.lineWidth = Math.max(1.2, 1.8 * z);
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const u = (t / 1100 + i / 3) % 1;
        ctx.beginPath();
        ctx.ellipse(sx, sy, r * u, r * u * 0.86, 0, 0, TAU);
        ctx.strokeStyle = `rgba(222,240,255,${a * (1 - u) * 0.6})`;
        ctx.lineWidth = Math.max(1, 1.5 * z);
        ctx.stroke();
      }
    },

    // 전염병: 퍼져 나가는 푸르스름한 독기
    plague(ctx, f, k, sx, sy, z, t) {
      const R = RADIUS.plague * z, a = fade(k, 0.12, 0.35);
      glow(ctx, sx, sy, R * 1.15, [[0, `rgba(120,178,62,${0.36 * a})`], [0.6, `rgba(96,150,50,${0.2 * a})`], [1, 'rgba(96,150,50,0)']]);
      const e = easeOut(k);
      for (const b of f.blobs) {
        const px = sx + Math.cos(b.a) * b.d * R * (0.35 + 0.65 * e) + Math.sin(t / 520 + b.ph) * 4 * z;
        const py = sy + Math.sin(b.a) * b.d * R * (0.35 + 0.65 * e) * 0.85 - k * 13 * z * b.d;
        disc(ctx, px, py, b.s * 0.65 * z * (0.7 + 0.5 * k), `rgba(146,200,88,${a * 0.42})`);
      }
      for (let i = 0; i < 2; i++) {
        const u = (t / 1300 + i / 2) % 1;
        ring(ctx, sx, sy, R * u, `rgba(178,226,116,${(1 - u) * 0.7 * a})`, Math.max(1.2, 2 * z));
      }
      for (let i = 0; i < 9; i++) {
        const ang = (i / 9) * TAU + t / 900 * (i % 2 ? 1 : -1), rr = R * (0.45 + 0.2 * Math.sin(t / 400 + i));
        disc(ctx, sx + Math.cos(ang) * rr, sy + Math.sin(ang) * rr * 0.85, Math.max(1.1, 1.4 * z), `rgba(218,248,160,${a * 0.9})`);
      }
    },

    // 화산: 분화구가 달아오르고 용암 덩이와 재가 솟구친다
    volcano(ctx, f, k, sx, sy, z, t) {
      const R = RADIUS.volcano * z, a = fade(k, 0.06, 0.35);
      const kk = clamp(k * 4, 0, 1);
      if (kk < 1) ring(ctx, sx, sy, R * 1.4 * easeOut(kk), `rgba(255,150,60,${(1 - kk) * 0.75})`, Math.max(1.5, 3 * z));
      for (const p of f.ash) {
        const px = sx + p.ox * R * (0.15 + k * 0.9), py = sy - R * 0.25 - k * R * (0.9 + p.sp * 1.1);
        disc(ctx, px, py, (4.5 + p.s * 6) * z * (0.5 + k * 1.4), `rgba(58,52,48,${0.36 * Math.min(1, k * 6) * (1 - k)})`);
      }
      const pulse = 0.85 + 0.15 * Math.sin(t / 90);
      glow(ctx, sx, sy, R * 0.95 * pulse, [[0, `rgba(255,236,170,${0.95 * a})`], [0.22, `rgba(255,150,50,${0.75 * a})`], [0.6, `rgba(214,70,24,${0.32 * a})`], [1, 'rgba(214,70,24,0)']]);
      ctx.lineCap = 'round';
      for (const b of f.bombs) {
        const tt = (k - b.delay * 0.55) / 0.42;
        if (tt <= 0 || tt >= 1) continue;
        const pos = u => [sx + b.vx * R * 1.7 * u, sy + (b.vy * R * 3.1 * u + 2.5 * R * u * u)];
        const [x1, y1] = pos(Math.max(0, tt - 0.09)), [x2, y2] = pos(tt);
        const al = 1 - tt * 0.5;
        ctx.strokeStyle = `rgba(255,132,36,${al * 0.75})`;
        ctx.lineWidth = Math.max(1, b.s * z * 0.65);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        disc(ctx, x2, y2, Math.max(1.2, b.s * z * 0.72), `rgba(255,226,130,${al})`);
      }
    },

    // 운석: 불덩이가 비스듬히 떨어져 터지고, 그을린 구덩이가 남는다
    meteor(ctx, f, k, sx, sy, z, t, cam, W, H) {
      const R = RADIUS.meteor * z, hit = METEOR_HIT;
      if (k < hit) {
        const p = easeIn(0.35 + 0.65 * (k / hit)) / easeIn(1);
        const fromX = sx + H * 0.5, fromY = sy - H * 0.85;
        const x = fromX + (sx - fromX) * p, y = fromY + (sy - fromY) * p;
        const len = 105 * z, dx = (fromX - sx), dy = (fromY - sy), dl = Math.hypot(dx, dy) || 1;
        const tx = x + (dx / dl) * len, ty = y + (dy / dl) * len;
        ctx.lineCap = 'round';
        let g = ctx.createLinearGradient(x, y, tx, ty);
        g.addColorStop(0, 'rgba(255,170,60,.6)'); g.addColorStop(1, 'rgba(255,120,30,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 10 * z;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke();
        g = ctx.createLinearGradient(x, y, tx, ty);
        g.addColorStop(0, 'rgba(255,246,214,.98)'); g.addColorStop(0.5, 'rgba(255,196,96,.5)'); g.addColorStop(1, 'rgba(255,170,60,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 3.5 * z;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke();
        glow(ctx, x, y, 16 * z, [[0, 'rgba(255,250,230,1)'], [0.3, 'rgba(255,190,80,.75)'], [1, 'rgba(255,140,40,0)']]);
        disc(ctx, x, y, 3.8 * z, 'rgba(60,40,28,.95)');
        // 떨어질 자리에 드리우는 그림자
        ctx.beginPath();
        ctx.ellipse(sx, sy, R * 0.4 * p, R * 0.28 * p, 0, 0, TAU);
        ctx.fillStyle = `rgba(20,12,6,${0.3 * p})`;
        ctx.fill();
        return;
      }
      const q = (k - hit) / (1 - hit);
      if (!calm.matches && q < 0.12) { ctx.fillStyle = `rgba(255,244,220,${0.16 * (1 - q / 0.12)})`; ctx.fillRect(0, 0, W, H); }
      const ca = q < 0.72 ? 1 : (1 - q) / 0.28;
      ctx.beginPath();
      ctx.ellipse(sx, sy, R * 0.46, R * 0.33, 0, 0, TAU);
      ctx.fillStyle = `rgba(26,16,10,${0.62 * ca})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(104,70,40,${0.8 * ca})`;
      ctx.lineWidth = Math.max(1.4, 2.2 * z);
      ctx.stroke();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = `rgba(30,18,10,${0.8 * ca})`;
      ctx.lineWidth = Math.max(1.2, 1.8 * z);
      strokeCracks(ctx, f.cracks, sx, sy, R * 1.3, easeOut(q * 4));
      const fb = clamp(q * 2.4, 0, 1);
      if (fb < 1) glow(ctx, sx, sy, R * (0.4 + 1.1 * easeOut(fb)), [[0, `rgba(255,252,236,${(1 - fb)})`], [0.35, `rgba(255,176,70,${(1 - fb) * 0.85})`], [0.75, `rgba(220,80,26,${(1 - fb) * 0.4})`], [1, 'rgba(220,80,26,0)']]);
      const s1 = clamp(q * 1.9, 0, 1);
      if (s1 < 1) ring(ctx, sx, sy, R * 1.9 * easeOut(s1), `rgba(255,232,196,${(1 - s1) * 0.85})`, Math.max(1.3, 3.2 * z * (1 - s1) + 1));
      const s2 = clamp(q * 1.35, 0, 1);
      if (s2 < 1) ring(ctx, sx, sy, R * 1.35 * easeOut(s2), `rgba(126,96,66,${(1 - s2) * 0.5})`, 5.5 * z);
      for (const d of f.debris) {
        const u = clamp(q * 1.6, 0, 1);
        if (u >= 1) continue;
        const e = easeOut(u);
        const px = sx + Math.cos(d.a) * R * d.v * 1.25 * e, py = sy + Math.sin(d.a) * R * d.v * e - Math.sin(u * Math.PI) * 16 * z * d.v + 12 * z * u * u;
        disc(ctx, px, py, Math.max(1, d.s * 0.7 * z * (1 - u * 0.4)), d.hot ? `rgba(255,178,70,${1 - u})` : `rgba(64,44,28,${1 - u})`);
      }
      for (const p of f.smoke) {
        const px = sx + p.ox * R * (0.3 + q), py = sy - q * R * (1 + p.sp * 1.4);
        disc(ctx, px, py, (4 + p.s * 5) * z * (0.6 + q * 1.5), `rgba(60,52,46,${0.34 * Math.min(1, q * 5) * (1 - q)})`);
      }
    },

    // 번개: 하늘에서 내리꽂히는 줄기가 두 번 번쩍인다
    lightning(ctx, f, k, sx, sy, z, t, cam, W, H) {
      const ms = k * f.dur;
      const span = clamp(H * 0.36, 120, 330) * SCALE, wide = span * 0.5; // 줄기의 길이: 화면 높이의 3분의 1쯤
      // 번쩍(0~110ms) – 어둠 – 번쩍(170~300ms) – 어둠 – 마지막 번쩍(360ms~)이 서서히 사라진다
      const which = ms < 150 ? 0 : ms < 340 ? 1 : 2;
      const power = ms < 110 ? 1 : ms < 170 ? 0.12 : ms < 300 ? 1 : ms < 360 ? 0.12 : Math.max(0, 1 - (ms - 360) / 380);
      if (!calm.matches && (ms < 90 || (ms > 170 && ms < 250))) { ctx.fillStyle = 'rgba(214,230,255,.09)'; ctx.fillRect(0, 0, W, H); }
      const sa = 1 - k;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 6.5 * z, 4.4 * z, 0, 0, TAU);
      ctx.fillStyle = `rgba(24,16,12,${0.55 * sa})`;
      ctx.fill();
      if (power > 0.02) {
        const b = f.bolts[which];
        const path = pts => {
          ctx.beginPath();
          pts.forEach((p, i) => { const px = sx + p[0] * wide, py = sy - p[1] * span; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
        };
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(130,180,255,.95)';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = `rgba(150,194,255,${power * 0.9})`;
        ctx.lineWidth = Math.max(4.2, 5 * z);
        path(b.main); ctx.stroke();
        ctx.lineWidth = Math.max(2, 2.4 * z);
        for (const fk of b.forks) { path(fk); ctx.stroke(); }
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(255,255,255,${power})`;
        ctx.lineWidth = Math.max(2, 2.4 * z);
        path(b.main); ctx.stroke();
        ctx.lineWidth = Math.max(0.9, 1 * z);
        for (const fk of b.forks) { path(fk); ctx.stroke(); }
        glow(ctx, sx, sy, 26 * z, [[0, `rgba(255,255,255,${power})`], [0.25, `rgba(180,214,255,${power * 0.8})`], [1, 'rgba(170,208,255,0)']]);
      }
      const u = clamp(ms / 520, 0, 1);
      if (u < 1) {
        ctx.strokeStyle = `rgba(255,236,170,${1 - u})`;
        ctx.lineWidth = Math.max(1.3, 2 * z);
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (const s of f.sparks) {
          const r1 = 5 * z + 15 * z * s.l * easeOut(u), r0 = r1 - 6 * z * (1 - u);
          ctx.moveTo(sx + Math.cos(s.a) * r0, sy + Math.sin(s.a) * r0 * 0.8);
          ctx.lineTo(sx + Math.cos(s.a) * r1, sy + Math.sin(s.a) * r1 * 0.8);
        }
        ctx.stroke();
      }
    },

    // 축복: 금빛 기둥과 솟아오르는 반짝임. opts.label이 있으면 글자도 띄운다.
    bless(ctx, f, k, sx, sy, z, t) {
      const a = Math.sin(clamp(k, 0, 1) * Math.PI);
      const h = 115 * z;
      ctx.save(); // 세로로 길게 늘인 둥근 빛 = 가장자리로 갈수록 옅어지는 빛줄기 (땅 바로 아래에서 사라진다)
      ctx.translate(sx, sy - h * 0.44);
      ctx.scale(0.24, 1);
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, 0, 0, h * 0.52, [[0, `rgba(255,236,160,${0.58 * a})`], [0.5, `rgba(255,224,130,${0.3 * a})`], [1, 'rgba(255,224,130,0)']]);
      ctx.restore();
      glow(ctx, sx, sy, 18 * z, [[0, `rgba(255,246,204,${0.75 * a})`], [1, 'rgba(255,236,160,0)']]);
      const rr = 21 * z * easeOut(k);
      ctx.beginPath();
      ctx.ellipse(sx, sy, rr, rr * 0.45, 0, 0, TAU);
      ctx.strokeStyle = `rgba(255,230,160,${(1 - k) * 0.95})`;
      ctx.lineWidth = Math.max(1.5, 2.6 * z);
      ctx.stroke();
      for (const s of f.sp) {
        const y = sy - easeOut(k) * s.h * z, x = sx + s.x * z + Math.sin(k * 6 + s.ph) * 3 * z;
        ctx.fillStyle = `rgba(255,246,204,${1 - k})`;
        star(ctx, x, y, s.s * z);
      }
      label(ctx, tr(f.label || ''), sx, sy - 30 * z - k * 20 * z, '#c9f7b4', k < 0.75 ? 1 : (1 - k) / 0.25, z);
    },

    // 저주: 붉은 고리가 조여들고 파편이 쏟아진다
    curse(ctx, f, k, sx, sy, z) {
      const r = 24 * z * (1 - easeOut(k) * 0.75);
      disc(ctx, sx, sy, r, `rgba(70,12,30,${0.3 * (1 - k)})`);
      ring(ctx, sx, sy, r, `rgba(214,70,78,${1 - k})`, Math.max(1.5, 3 * z));
      for (const s of f.sp) {
        const u = clamp((k - s.d) * 1.9, 0, 1);
        if (u <= 0 || u >= 1) continue;
        const x = sx + s.x * z * (1 - u * 0.6), y = sy - (1 - easeIn(u)) * s.h * z;
        ctx.fillStyle = `rgba(232,86,80,${0.95 - u * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(x, y + s.s * z * 1.6); ctx.lineTo(x - s.s * z * 0.6, y - s.s * z); ctx.lineTo(x + s.s * z * 0.6, y - s.s * z);
        ctx.closePath();
        ctx.fill();
      }
      label(ctx, tr(f.label || ''), sx, sy - 30 * z - k * 20 * z, '#ffb7a6', k < 0.75 ? 1 : (1 - k) / 0.25, z);
    },

    // 외교: 두 나라를 잇는 선. opts = { x2, y2, tone }
    link(ctx, f, k, sx, sy, z, t, cam) {
      const COLORS = { war: '255,104,72', peace: '160,232,140', ally: '255,224,138', break: '255,150,100', colony: '204,160,255', free: '150,230,214' };
      const c = COLORS[f.tone] || COLORS.ally;
      const ex = cam.x + f.x2 * cam.zoom, ey = cam.y + f.y2 * cam.zoom;
      const dist = Math.hypot(ex - sx, ey - sy) || 1;
      const mx = (sx + ex) / 2, my = (sy + ey) / 2 - Math.min(90, dist * 0.24);
      const a = k < 0.7 ? Math.min(1, k * 10) : (1 - k) / 0.3;
      const reveal = easeOut(k * 2.3);
      const at = u => [(1 - u) * (1 - u) * sx + 2 * (1 - u) * u * mx + u * u * ex, (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * my + u * u * ey];
      const curve = () => {
        ctx.beginPath();
        for (let i = 0; i <= 28; i++) { const u = (i / 28) * reveal, p = at(u); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      };
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(${c},${0.25 * a})`; ctx.lineWidth = 8;
      curve(); ctx.stroke();
      ctx.strokeStyle = `rgba(${c},${a})`; ctx.lineWidth = 2.8;
      ctx.setLineDash([9, 7]); ctx.lineDashOffset = -t / 36;
      curve(); ctx.stroke();
      ctx.setLineDash([]);
      for (const [px, py] of [[sx, sy], at(reveal)]) {
        disc(ctx, px, py, 5, `rgba(${c},${a})`);
        ring(ctx, px, py, 5 + ((t / 500) % 1) * 12, `rgba(${c},${a * (1 - (t / 500) % 1)})`, 2);
      }
      if (reveal > 0.98) { // 가운데 표식
        const [cx, cy] = at(0.5), u = clamp((k - 0.44) * 3.2, 0, 1), s = 9 + 5 * easeOut(u);
        disc(ctx, cx, cy, s + 4, `rgba(20,12,6,${0.8 * a})`);
        ring(ctx, cx, cy, s + 4, `rgba(${c},${a})`, 2);
        ctx.strokeStyle = `rgba(${c},${a})`; ctx.lineWidth = 2.6;
        ctx.beginPath();
        if (f.tone === 'war' || f.tone === 'break') { // 엇갈린 칼
          ctx.moveTo(cx - s * 0.55, cy - s * 0.55); ctx.lineTo(cx + s * 0.55, cy + s * 0.55);
          ctx.moveTo(cx + s * 0.55, cy - s * 0.55); ctx.lineTo(cx - s * 0.55, cy + s * 0.55);
        } else { // 맺어짐
          ctx.moveTo(cx - s * 0.5, cy + s * 0.02); ctx.lineTo(cx - s * 0.12, cy + s * 0.4); ctx.lineTo(cx + s * 0.55, cy - s * 0.38);
        }
        ctx.stroke();
      }
    },

    // 국가 생성: 금빛 햇살이 퍼진다
    spawn(ctx, f, k, sx, sy, z) {
      const e = easeOut(k);
      const R = RADIUS.spawn * z;
      glow(ctx, sx, sy, R * 1.05 * (0.4 + e), [[0, `rgba(255,236,170,${(1 - k) * 0.7})`], [1, 'rgba(255,236,170,0)']]);
      ring(ctx, sx, sy, R * e, `rgba(255,226,150,${(1 - k) * 0.9})`, Math.max(1.3, 2.2 * z * (1 - k) + 1));
      ctx.strokeStyle = `rgba(255,240,196,${1 - k})`;
      ctx.lineWidth = Math.max(1.2, 2 * z);
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (const r of f.rays) {
        const r0 = R * (0.22 + 0.6 * e), r1 = r0 + R * 0.32 * r.l * (1 - k * 0.5);
        ctx.moveTo(sx + Math.cos(r.a) * r0, sy + Math.sin(r.a) * r0);
        ctx.lineTo(sx + Math.cos(r.a) * r1, sy + Math.sin(r.a) * r1);
      }
      ctx.stroke();
    },

    // 국가 붕괴: 금이 가며 안으로 무너진다
    collapse(ctx, f, k, sx, sy, z) {
      const R = RADIUS.collapse * z, a = k < 0.6 ? 1 : (1 - k) / 0.4;
      for (let i = 0; i < 3; i++) {
        const kk = clamp(k * 1.5 - i * 0.16, 0, 1);
        if (kk <= 0 || kk >= 1) continue;
        ring(ctx, sx, sy, R * (1 - easeOut(kk) * 0.85), `rgba(204,60,52,${kk * 0.85})`, Math.max(1.5, 3 * z));
      }
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = `rgba(40,16,12,${a * 0.9})`;
      ctx.lineWidth = Math.max(1.5, 2.4 * z);
      strokeCracks(ctx, f.cracks, sx, sy, R, easeOut(k * 2.6));
      for (const d of f.dust) {
        disc(ctx, sx + Math.cos(d.a) * d.d * R * (1 - k * 0.5), sy + Math.sin(d.a) * d.d * R * 0.8 * (1 - k * 0.5) + 18 * z * k * k, d.s * z, `rgba(150,110,90,${(1 - k) * 0.5})`);
      }
    }
  };

  window.WFFx = { add, draw, shake, clear() { list = []; }, meteorDelay: DUR.meteor * METEOR_HIT, kinds: Object.keys(DRAW) };
})();
