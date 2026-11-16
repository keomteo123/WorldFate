// UI 배율: 화면 크기에 맞춰 --ui 값을 정한다 (styles.css 끝의 '화면 배율' 구역이 이 값을 씀).
// 지도 캔버스는 건드리지 않고 메뉴 · 패널 · 대화상자만 키운다.
// 900px 이하(휴대폰 · 좁은 창)는 배율 1로 두고 CSS 미디어 쿼리가 터치용 크기를 맡는다.
(() => {
  const root = document.documentElement;
  const supported = window.CSS && CSS.supports && CSS.supports('zoom', '1');
  function apply() {
    const w = window.innerWidth, h = window.innerHeight;
    let ui = 1;
    if (supported && w > 900) {
      // 1366×768을 기준(1배)으로, 가로·세로 중 작은 쪽 비율에 맞춘다. 너무 커지지 않게 상한을 둔다.
      ui = Math.min(w / 1366, h / 768);
      ui = Math.max(1, Math.min(2.4, ui));
      // 태블릿(터치 화면)을 가로로 쓸 때: 데스크톱 배치 그대로면 버튼이 너무 작으니 손가락에 맞게 키운다.
      // 단, 키운 뒤에도 상단 바가 들어갈 너비(920px 상당)는 남긴다. (터치 화면에서는 상단 바의 로고를 숨겨 자리를 번다 — styles.css)
      if (window.matchMedia && matchMedia('(pointer: coarse)').matches) ui = Math.max(ui, Math.min(1.3, w / 920));
      ui = Math.round(ui * 20) / 20; // 0.05 단위로 맞춰 흔들림 방지
    }
    root.style.setProperty('--ui', ui);
  }
  apply();
  window.addEventListener('resize', apply);
  window.addEventListener('orientationchange', apply);
})();
