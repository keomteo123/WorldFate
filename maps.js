// 지도 선택 모듈: 랜덤 지도 설정 + 현실 지도(Natural Earth 육지 데이터를 메르카토르로 투영해 래스터화)
(() => {
  const DEFS = [
    { id: 'random', name: '랜덤 대륙', kind: 'procedural', style: 'continents', icon: '🎲', nations: 14, desc: '큰 대륙 몇 개와 소수의 섬. 매번 새로운 세계.' },
    { id: 'pangaea', name: '랜덤 판게아', kind: 'procedural', style: 'pangaea', icon: '🌋', nations: 18, desc: '하나의 거대한 초대륙. 모든 나라가 땅으로 맞닿아 있다.' },
    { id: 'archipelago', name: '랜덤 군도', kind: 'procedural', style: 'archipelago', icon: '🏝️', nations: 12, desc: '수많은 섬과 작은 대륙. 바다를 건너는 전쟁.' },

    { id: 'world', name: '세계지도', kind: 'real', bbox: [-180, -58, 180, 80], nations: 20, desc: '현실의 전 세계.' },
    { id: 'eurasia', name: '유라시아', kind: 'real', bbox: [-12, -10, 180, 78], nations: 20, desc: '대서양에서 태평양까지 이어진 거대 대륙.' },
    { id: 'europe', name: '유럽', kind: 'real', bbox: [-12, 34, 75, 71], nations: 16, desc: '이베리아에서 우랄까지.' },
    { id: 'mediterranean', name: '지중해', kind: 'real', bbox: [-12, 27, 45, 48], nations: 14, desc: '지중해를 둘러싼 유럽·북아프리카·중동.' },
    { id: 'britain', name: '영국·아일랜드', kind: 'real', bbox: [-14, 46, 14, 62], nations: 7, desc: '브리튼 제도와 북해 주변.' },
    { id: 'africa', name: '아프리카', kind: 'real', bbox: [-20, -37, 55, 38], nations: 16, desc: '사하라에서 희망봉까지.' },
    { id: 'middleeast', name: '중동·서아시아', kind: 'real', bbox: [24, 10, 76, 46], nations: 12, desc: '아라비아, 페르시아, 아나톨리아, 중앙아시아 서부.' },
    { id: 'southasia', name: '남아시아', kind: 'real', bbox: [58, 3, 100, 38], nations: 10, desc: '인도 아대륙과 주변.' },
    { id: 'eastasia', name: '동아시아', kind: 'real', bbox: [90, 10, 155, 56], nations: 14, desc: '중국, 한반도, 일본, 동남아 북부.' },
    { id: 'koreajapan', name: '한반도·일본', kind: 'real', bbox: [120, 30, 150, 47], nations: 8, desc: '동북아의 섬과 반도.' },
    { id: 'southeastasia', name: '동남아시아', kind: 'real', bbox: [90, -12, 145, 28], nations: 12, desc: '인도차이나와 말레이 제도.' },
    { id: 'northasia', name: '북아시아', kind: 'real', bbox: [25, 40, 180, 78], nations: 10, desc: '러시아와 시베리아.' },
    { id: 'northamerica', name: '북아메리카', kind: 'real', bbox: [-170, 6, -50, 74], clip: true, nations: 14, desc: '알래스카에서 중앙아메리카까지.' },
    { id: 'southamerica', name: '남아메리카', kind: 'real', bbox: [-84, -57, -32, 14], clip: true, nations: 12, desc: '안데스와 아마존.' },
    { id: 'americas', name: '아메리카 전체', kind: 'real', bbox: [-170, -57, -30, 75], clip: true, nations: 18, desc: '북미와 남미를 한 번에.' },
    { id: 'oceania', name: '오세아니아', kind: 'real', bbox: [105, -48, 180, -2], clip: true, nations: 10, desc: '호주, 뉴질랜드, 파푸아.' }
  ];

  let polys = null;

  // TopoJSON → [{ bbox:[lon0,lat0,lon1,lat1], rings:[[ [lon,lat], ... ], ...] }, ...]
  function decode() {
    if (polys) return polys;
    const topo = window.WF_LAND_TOPO;
    polys = [];
    if (!topo) return polys;
    const t = topo.transform || { scale: [1, 1], translate: [0, 0] };
    const arcs = topo.arcs.map(a => {
      let x = 0, y = 0;
      return a.map(p => { x += p[0]; y += p[1]; return [x * t.scale[0] + t.translate[0], y * t.scale[1] + t.translate[1]]; });
    });
    const arcPts = i => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
    const ringOf = ids => {
      const pts = [];
      for (const i of ids) {
        const a = arcPts(i);
        for (let k = pts.length ? 1 : 0; k < a.length; k++) pts.push(a[k]);
      }
      return pts;
    };
    // 날짜 변경선을 넘는 고리는 경도를 연속되게 펴서(±360) 줄무늬가 생기지 않게 한다
    const unwrap = ring => {
      let off = 0;
      const out = [];
      for (let i = 0; i < ring.length; i++) {
        if (i) {
          const d = ring[i][0] - ring[i - 1][0];
          if (d > 180) off -= 360; else if (d < -180) off += 360;
        }
        out.push([ring[i][0] + off, ring[i][1]]);
      }
      return out;
    };
    const addPoly = polyArcs => {
      const rings = polyArcs.map(ringOf).map(unwrap);
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const p of rings[0]) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
      if (y1 < -60) return; // 남극 제외 (고리가 극점을 감싸 평면 투영에 맞지 않음)
      polys.push({ bbox: [x0, y0, x1, y1], rings });
    };
    for (const obj of Object.values(topo.objects)) {
      const geoms = obj.type === 'GeometryCollection' ? obj.geometries : [obj];
      for (const g of geoms) {
        if (g.type === 'Polygon') addPoly(g.arcs);
        else if (g.type === 'MultiPolygon') g.arcs.forEach(addPoly);
      }
    }
    return polys;
  }

  const clampLat = p => Math.max(-84, Math.min(84, p));
  const mx = lon => lon * Math.PI / 180;
  const my = lat => Math.log(Math.tan(Math.PI / 4 + clampLat(lat) * Math.PI / 360));

  // bbox를 w×h에 비율을 유지해 맞추는 메르카토르 투영
  function projection(def, w, h) {
    const [lon0, lat0, lon1, lat1] = def.bbox;
    const x0 = mx(lon0), x1 = mx(lon1), y0 = my(lat0), y1 = my(lat1);
    const s = Math.min(w / (x1 - x0), h / (y1 - y0));
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    return {
      x: lon => w / 2 + (mx(lon) - cx) * s,
      y: lat => h / 2 - (my(lat) - cy) * s,
      // 화면 y → 위도(도). 지형(사막/숲) 분포에 사용
      latAt: py => Math.atan(Math.sinh(cy - (py - h / 2) / s)) * 180 / Math.PI,
      view: [
        (cx - w / 2 / s) * 180 / Math.PI, Math.atan(Math.sinh(cy - h / 2 / s)) * 180 / Math.PI,
        (cx + w / 2 / s) * 180 / Math.PI, Math.atan(Math.sinh(cy + h / 2 / s)) * 180 / Math.PI
      ]
    };
  }

  // 육지 마스크(Uint8Array w*h)와 위도 함수를 돌려준다
  function rasterize(def, w, h) {
    const P = projection(def, w, h);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#fff';
    if (def.clip) { // bbox 밖의 다른 대륙 조각은 지운다
      const [lon0, lat0, lon1, lat1] = def.bbox;
      g.beginPath();
      g.rect(P.x(lon0), P.y(lat1), P.x(lon1) - P.x(lon0), P.y(lat0) - P.y(lat1));
      g.clip();
    }
    const [vx0, vy1, vx1, vy0] = [P.view[0], P.view[1], P.view[2], P.view[3]];
    for (const poly of decode()) {
      const b = poly.bbox;
      if (b[3] < vy1 - 2 || b[1] > vy0 + 2) continue;
      for (const shift of [0, 360, -360]) { // 변경선에 걸친 땅은 양쪽에 한 번씩
        if (b[2] + shift < vx0 - 2 || b[0] + shift > vx1 + 2) continue;
        g.beginPath();
        for (const ring of poly.rings) {
          for (let i = 0; i < ring.length; i++) {
            const px = P.x(ring[i][0] + shift), py = P.y(ring[i][1]);
            if (i) g.lineTo(px, py); else g.moveTo(px, py);
          }
          g.closePath();
        }
        g.fill('evenodd');
      }
    }
    const d = g.getImageData(0, 0, w, h).data;
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < mask.length; i++) mask[i] = d[i * 4 + 3] > 110 ? 1 : 0;
    return { mask, latAt: P.latAt };
  }

  // 지도 선택 화면용 썸네일 (현실 지도는 실제 윤곽, 랜덤 지도는 모양 암시 그림)
  function thumbnail(def, w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.fillStyle = '#8fb4b6';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#d8c79a';
    g.strokeStyle = '#4a321e';
    g.lineWidth = 0.8;
    if (def.kind === 'real') {
      const { mask } = rasterize(def, w, h);
      const img = g.getImageData(0, 0, w, h);
      for (let i = 0; i < mask.length; i++) {
        if (!mask[i]) continue;
        img.data[i * 4] = 216; img.data[i * 4 + 1] = 199; img.data[i * 4 + 2] = 154;
      }
      g.putImageData(img, 0, 0);
    } else {
      const blobs = def.style === 'pangaea' ? [[0.5, 0.5, 0.32, 0.3], [0.62, 0.4, 0.2, 0.16], [0.38, 0.62, 0.2, 0.14]]
        : def.style === 'archipelago' ? [[0.2, 0.3, 0.1, 0.12], [0.45, 0.55, 0.12, 0.1], [0.7, 0.3, 0.12, 0.13], [0.82, 0.65, 0.09, 0.09], [0.3, 0.72, 0.08, 0.07], [0.58, 0.2, 0.07, 0.06], [0.15, 0.6, 0.06, 0.06]]
        : [[0.3, 0.45, 0.2, 0.26], [0.7, 0.5, 0.18, 0.22], [0.5, 0.8, 0.07, 0.06]];
      for (const [bx, by, rx, ry] of blobs) {
        g.beginPath();
        g.ellipse(bx * w, by * h, rx * w, ry * h, 0.4, 0, Math.PI * 2);
        g.fill(); g.stroke();
      }
    }
    return c;
  }

  // ===== 현대 국경: 나라별 폴리곤을 칸 단위로 채워 "칸 → 나라 번호" 배열을 만든다 =====
  let countryPolys = null;
  function decodeCountries() {
    if (countryPolys) return countryPolys;
    const topo = window.WF_COUNTRIES_TOPO;
    countryPolys = { names: [], polys: [] };
    if (!topo) return countryPolys;
    const t = topo.transform || { scale: [1, 1], translate: [0, 0] };
    const arcs = topo.arcs.map(a => {
      let x = 0, y = 0;
      return a.map(p => { x += p[0]; y += p[1]; return [x * t.scale[0] + t.translate[0], y * t.scale[1] + t.translate[1]]; });
    });
    const arcPts = i => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
    const ringOf = ids => {
      const pts = [];
      for (const i of ids) {
        const a = arcPts(i);
        for (let k = pts.length ? 1 : 0; k < a.length; k++) pts.push(a[k]);
      }
      let off = 0;
      return pts.map((p, i) => {
        if (i) {
          const d = p[0] - pts[i - 1][0];
          if (d > 180) off -= 360; else if (d < -180) off += 360;
        }
        return [p[0] + off, p[1]];
      });
    };
    const add = (ci, polyArcs) => {
      const rings = polyArcs.map(ringOf);
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const p of rings[0]) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
      if (y1 < -60) return; // 남극 제외
      countryPolys.polys.push({ ci, bbox: [x0, y0, x1, y1], rings });
    };
    for (const g of topo.objects.countries.geometries) {
      const ci = countryPolys.names.length;
      countryPolys.names.push(g.properties.name);
      if (g.type === 'Polygon') add(ci, g.arcs);
      else if (g.type === 'MultiPolygon') g.arcs.forEach(a => add(ci, a));
    }
    return countryPolys;
  }

  // 반환: { ids: Int16Array(w*h, 나라 번호 / 없으면 -1), names: [영문 국가명] }
  // 역사 국경(historic-data.js)을 같은 형태로 바꾼다
  const histCache = {};
  function histPolys(key) {
    if (histCache[key]) return histCache[key];
    const out = { names: [], polys: [] };
    for (const [name, polys] of (window.WF_HIST && window.WF_HIST[key]) || []) {
      const ci = out.names.length;
      out.names.push(name);
      for (const rings of polys) {
        const rr = rings.map(flat => { const r = []; for (let i = 0; i < flat.length; i += 2) r.push([flat[i], flat[i + 1]]); return r; });
        let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        for (const p of rr[0]) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
        out.polys.push({ ci, bbox: [x0, y0, x1, y1], rings: rr });
      }
    }
    return (histCache[key] = out);
  }

  function rasterizeCountries(def, w, h, landMask, histKey) {
    const P = projection(def, w, h);
    const { names, polys } = histKey ? histPolys(histKey) : decodeCountries();
    const ids = new Int16Array(w * h).fill(-1);
    const [vx0, vy1, vx1, vy0] = P.view;
    for (const poly of polys) {
      const b = poly.bbox;
      if (b[3] < vy1 - 2 || b[1] > vy0 + 2) continue;
      for (const shift of [0, 360, -360]) {
        if (b[2] + shift < vx0 - 2 || b[0] + shift > vx1 + 2) continue;
        const rows = new Map();
        for (const ring of poly.rings) {
          let px0 = P.x(ring[0][0] + shift), py0 = P.y(ring[0][1]);
          for (let i = 1; i <= ring.length; i++) {
            const q = ring[i % ring.length];
            const px1 = P.x(q[0] + shift), py1 = P.y(q[1]);
            if (py0 !== py1) {
              const lo = Math.min(py0, py1), hi = Math.max(py0, py1);
              const yStart = Math.max(0, Math.ceil(lo - 0.5)), yEnd = Math.min(h - 1, Math.ceil(hi - 0.5) - 1);
              for (let y = yStart; y <= yEnd; y++) {
                const yc = y + 0.5;
                const x = px0 + (yc - py0) * (px1 - px0) / (py1 - py0);
                let arr = rows.get(y);
                if (!arr) { arr = []; rows.set(y, arr); }
                arr.push(x);
              }
            }
            px0 = px1; py0 = py1;
          }
        }
        for (const [y, xs] of rows) {
          xs.sort((a, c) => a - c);
          for (let k = 0; k + 1 < xs.length; k += 2) {
            const xa = Math.max(0, Math.ceil(xs[k] - 0.5)), xb = Math.min(w - 1, Math.ceil(xs[k + 1] - 0.5) - 1);
            for (let x = xa; x <= xb; x++) ids[y * w + x] = poly.ci;
          }
        }
      }
    }
    // 육지인데 국경 데이터에 비어 있는 칸(해안선 오차)은 가까운 나라로 채운다. 3칸 안쪽만 — 데이터가 없는 땅까지 번지면 안 된다.
    if (landMask) {
      const depth = new Uint8Array(ids.length);
      const q = [];
      for (let i = 0; i < ids.length; i++) if (ids[i] >= 0) q.push(i);
      for (let qi = 0; qi < q.length; qi++) {
        const i = q[qi], x = i % w, y = (i / w) | 0;
        if (depth[i] >= 3) continue;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const ni = ny * w + nx;
          if (ids[ni] < 0 && landMask[ni]) { ids[ni] = ids[i]; depth[ni] = depth[i] + 1; q.push(ni); }
        }
      }
    }
    return { ids, names };
  }

  window.WFMaps = {
    list: DEFS,
    get: id => DEFS.find(d => d.id === id) || DEFS[0],
    rasterize,
    rasterizeCountries,
    projection,
    thumbnail
  };
})();
