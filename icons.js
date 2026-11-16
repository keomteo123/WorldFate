// 게임 전용 아이콘 (24×24 선 그림). 이모지와 달리 어느 기기에서나 같은 모양으로 보인다.
//  - WFIcons.svg('quake') → <svg> 문자열.  HTML에서는 <i data-ic="quake"></i>처럼 쓰면 자동으로 채워진다.
//  - 선은 글자색(currentColor)을 따르고, 클래스 f = 옅게 채움 · a = 강조색 선 · af = 강조색 채움 · s = 글자색 점.
//  - 강조색은 아이콘마다 다르다(ac). 모양은 styles.css의 .ic 규칙이 맡는다.
(() => {
  const BLUE = '#7fc4ea', RED = '#f0764a', GREEN = '#8fd07a', GOLD = '#ffd766', BONE = '#efe6cf', SAND = '#e9b96a';
  const ICONS = {
    // ----- 탭 -----
    map: { ac: BLUE, d: '<path class="f" d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/><path class="a" d="M5.2 10.5c1 .9 1.6 1.7 1.6 3M17 9.5c.9.6 1.7.7 2.3.4"/>' },
    inspect: { ac: BLUE, d: '<circle class="af" cx="10.5" cy="10.5" r="6.3" style="fill-opacity:.28"/><circle cx="10.5" cy="10.5" r="6.3"/><path d="M15.2 15.2 21 21" stroke-width="2.4"/><path class="a" d="M7.4 9.6a3.4 3.4 0 0 1 2.4-2.3"/>' },
    disaster: { ac: RED, d: '<path class="f" d="M7 15.5a4.5 4.5 0 0 1-.6-8.96A5.5 5.5 0 0 1 17 7.6a4 4 0 0 1 .5 7.9"/><path d="M7 15.5a4.5 4.5 0 0 1-.6-8.96A5.5 5.5 0 0 1 17 7.6a4 4 0 0 1 .5 7.9"/><path class="af" d="M13 10.5 9.3 16h2.9l-1 5.2 4.5-6.4h-3z"/>' },
    bless: { ac: GOLD, d: '<path class="af" d="M10.5 2.5c.7 5 2.5 6.8 7.5 7.5-5 .7-6.8 2.5-7.5 7.5-.7-5-2.5-6.8-7.5-7.5 5-.7 6.8-2.5 7.5-7.5z"/><path class="f" d="M18.2 14.5c.3 2.2 1.1 3 3.3 3.3-2.2.3-3 1.1-3.3 3.3-.3-2.2-1.1-3-3.3-3.3 2.2-.3 3-1.1 3.3-3.3z"/><path d="M18.2 14.5c.3 2.2 1.1 3 3.3 3.3-2.2.3-3 1.1-3.3 3.3-.3-2.2-1.1-3-3.3-3.3 2.2-.3 3-1.1 3.3-3.3z"/><path d="M19 3.5v3M17.5 5h3"/>' },
    curse: { ac: BONE, d: '<path class="af" style="fill-opacity:.9" d="M12 3a7.6 7.6 0 0 0-4.6 13.65V19.5a1 1 0 0 0 1 1h7.2a1 1 0 0 0 1-1v-2.85A7.6 7.6 0 0 0 12 3z"/><circle class="k" cx="9.1" cy="11.3" r="1.9"/><circle class="k" cx="14.9" cy="11.3" r="1.9"/><path class="k" d="M12 13.6l-1 2h2z"/><path class="kl" d="M10.4 20.3v-2.2M13.6 20.3v-2.2"/>' },
    fate: { ac: GOLD, d: '<path class="af" d="M3.5 8.5l4.2 3.7L12 5.5l4.3 6.7 4.2-3.7-1.6 9H5.1z"/><path d="M5 20.5h14"/><circle class="s" cx="12" cy="14.6" r="1.2"/><circle class="a" cx="3.5" cy="7.5" r="1"/><circle class="a" cx="12" cy="4.3" r="1"/><circle class="a" cx="20.5" cy="7.5" r="1"/>' },
    history: { ac: SAND, d: '<path class="af" style="fill-opacity:.3" d="M12 6.6C10 5.1 7 4.6 3.5 5.1v13c3.500-.5 6.500 0 8.500 1.500 2-1.500 5-2 8.500-1.500v-13C17 4.600 14 5.100 12 6.600z"/><path d="M12 6.600C10 5.100 7 4.600 3.500 5.100v13c3.500-.500 6.500 0 8.500 1.500 2-1.500 5-2 8.500-1.500v-13C17 4.600 14 5.100 12 6.600zM12 6.600v13"/><path class="a" d="M6.300 9c1.300 0 2.400.2 3.300.6M6.300 12.200c1.300 0 2.400.2 3.300.6M17.700 9c-1.300 0-2.400.2-3.300.6M17.700 12.200c-1.300 0-2.400.2-3.300.6"/>' },
    // ----- 재해 -----
    quake: { ac: RED, d: '<path class="a" d="M2.500 8h3.500l1.500-3.500 2.400 7 2.400-9 2.400 8L16.500 8h5"/><path class="f" d="M2.500 14.500h19v6h-19z"/><path d="M2.500 14.500h19v6h-19z"/><path class="a" d="M12.500 14.500l-1.800 2.300 2.600 1.300-1.300 2.400"/>' },
    storm: { ac: BLUE, d: '<path class="a" d="M3 5c4 1.400 14 1.400 18 0" stroke-width="2.200"/><path d="M5 8.800c3.500 1.200 10 1.200 13.500 0" stroke-width="2.200"/><path class="a" d="M7.500 12.500c2.500 1 7 1 9 0" stroke-width="2.200"/><path d="M10 16c1.700.700 4.300.700 6 0" stroke-width="2.200"/><path class="a" d="M12.300 19.500c1 .4 2.200.4 3.200 0" stroke-width="2.200"/>' },
    flood: { ac: BLUE, d: '<path class="f" d="M5 11.500V7.500L10 3.500l5 4v4"/><path d="M5 11.500V7.500L10 3.500l5 4v4"/><path class="a" stroke-width="2" d="M2.500 13.500c2.200-1.900 4.200-1.900 6.300 0s4.200 1.900 6.400 0 4.200-1.900 6.300 0M2.500 18c2.200-1.900 4.200-1.900 6.300 0s4.200 1.900 6.400 0 4.200-1.900 6.300 0"/>' },
    drought: { ac: GOLD, d: '<circle class="af" cx="12" cy="8.500" r="3.600"/><path class="a" d="M12 2.300v1.600M5.800 8.500H4.200M19.800 8.500h-1.600M7.600 4.100l1.100 1.100M16.400 4.100l-1.100 1.100"/><path class="f" d="M2.500 16h19v5h-19z"/><path d="M2.500 16h19M8 16l1.300 2.300-1.300 2.700M14.500 16l-1.200 2 2.200 1.200-.8 1.800M19 16l-.8 1.800"/>' },
    volcano: { ac: RED, d: '<path class="f" d="M2.500 20.500 9 10h6l6.500 10.500z"/><path d="M2.500 20.500 9 10h6l6.500 10.500z"/><path class="af" d="M9 10l1.300 2.600L12 11l1.700 1.600L15 10z"/><path class="a" stroke-width="2" d="M12 7V3.500M8.300 6.800 6.800 4.300M15.700 6.800l1.500-2.500"/>' },
    plague: { ac: GREEN, d: '<path class="a" d="M12 4.800V2.500M12 21.500v-2.300M4.800 12H2.500M21.500 12h-2.300M6.900 6.900 5.300 5.300M18.700 18.700l-1.600-1.600M6.900 17.100l-1.600 1.600M18.700 5.300l-1.600 1.600"/><circle class="af" style="fill-opacity:.35" cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="6"/><circle class="af" cx="10" cy="10.300" r="1.300"/><circle class="af" cx="14.300" cy="12.300" r="1"/><circle class="af" cx="11" cy="14.600" r=".9"/>' },
    // ----- 축복 · 저주 -----
    pop: { ac: SAND, d: '<circle class="af" cx="9" cy="7.500" r="3.200"/><path class="af" d="M3 20.500v-1.300A6 6 0 0 1 9 13.200a6 6 0 0 1 6 6v1.300z"/><circle class="f" cx="17" cy="9" r="2.500"/><circle cx="17" cy="9" r="2.500"/><path d="M16.800 14.300a4.700 4.700 0 0 1 4.700 4.700v1.500H18"/>' },
    army: { ac: BONE, d: '<path class="a" stroke-width="2.200" d="M4.500 3.500l10.500 10.500"/><path class="a" stroke-width="2.200" d="M19.500 3.500 9 14"/><path stroke-width="2" d="M12.800 17.200l4.400-4.400M11.200 17.200 6.800 12.800"/><path stroke-width="2.400" d="M16 16l3.500 3.500M8 16l-3.500 3.500"/>' },
    gold: { ac: GOLD, d: '<path class="f" d="M5 7.500v9c0 1.900 3.100 3.500 7 3.500s7-1.600 7-3.500v-9"/><path d="M5 7.500v9c0 1.900 3.100 3.500 7 3.500s7-1.600 7-3.500v-9M5 12c0 1.900 3.100 3.500 7 3.500s7-1.600 7-3.500"/><ellipse class="af" cx="12" cy="7.500" rx="7" ry="3.500"/><path class="k" d="M12 5.800v3.400" style="stroke:#6b4a12;fill:none;stroke-width:1.400"/>' },
    tech: { ac: BLUE, d: '<circle cx="12" cy="12" r="7.600" stroke-width="3.200" stroke-dasharray="2.980 2.980" stroke-linecap="butt"/><circle class="f" cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="6"/><circle class="af" cx="12" cy="12" r="2.300"/>' },
    // ----- 운명 -----
    spawn: { ac: RED, d: '<path class="f" d="M4 20.500V8.500h2.700v2.200h2.600V8.500h5.400v2.200h2.600V8.500H20v12z"/><path d="M4 20.500V8.500h2.700v2.200h2.600V8.500h5.400v2.200h2.600V8.500H20v12z"/><path class="s" d="M10 20.500v-3.800a2 2 0 0 1 4 0v3.800z"/><path d="M12 8.500V2.800"/><path class="af" d="M12 2.800l4.200 1.500L12 5.800z"/>' },
    war: { ac: RED, d: '<path class="af" d="M12 2.500c.8 3.300 5.700 5.700 5.700 11.200a5.700 5.700 0 0 1-11.400 0c0-2.200 1-3.700 2.300-4.900.2 1.600.9 2.600 1.900 3C10 8.700 10.700 5 12 2.500z"/><path class="af" style="fill:#ffd766;stroke:none;fill-opacity:1" d="M12 19.300a2.500 2.500 0 0 1-2.500-2.500c0-1.500 1.200-2.300 2.500-4 1.300 1.700 2.500 2.500 2.500 4a2.500 2.500 0 0 1-2.500 2.500z"/>' },
    peace: { ac: GREEN, d: '<path d="M3.500 20.500C7.500 14.500 13 9 21 4"/><path class="af" d="M7.200 15.300c-2.400-.4-3.500-1.900-3.400-4.200 2.300 0 3.600 1.300 3.400 4.200zM11 11.500c-2.300-.7-3.100-2.300-2.700-4.500 2.200.3 3.300 1.800 2.700 4.500zM15.300 8c-2-1.200-2.400-2.900-1.500-4.900 2 .8 2.700 2.500 1.500 4.900zM9.500 16.200c1.300-2 3.100-2.500 5.200-1.600-.9 2-2.600 2.600-5.200 1.600zM13.500 12.300c1.600-1.700 3.400-1.900 5.300-.7-1.200 1.800-3 2.100-5.300.7z"/>' },
    collapse: { ac: RED, d: '<path class="f" d="M5.500 3.500h13v3h-13zM7.500 6.500v6l2.300-1.500 2.200 2.500 2.200-2 2.300 1.500V6.500z"/><path d="M5.500 3.500h13v3h-13zM7.500 6.500v6l2.300-1.500 2.200 2.500 2.200-2 2.300 1.500V6.500"/><path class="a" d="M10.500 6.500v2.700M13.500 6.500v3.500"/><path class="f" d="M7.500 20.500v-3.200l2.300 1.200 2.200-2 2.200 1.800 2.300-1.300v3.500z"/><path d="M7.500 20.500v-3.200l2.300 1.200 2.200-2 2.200 1.800 2.300-1.300v3.500M4.500 20.500h15"/>' }
  };

  function svg(name) {
    const ic = ICONS[name];
    if (!ic) return '';
    return `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="--ac:${ic.ac}">${ic.d}</svg>`;
  }
  function fill(root) {
    for (const el of (root || document).querySelectorAll('[data-ic]')) el.innerHTML = svg(el.dataset.ic);
  }
  window.WFIcons = { svg, fill, names: Object.keys(ICONS) };
  fill();
})();
