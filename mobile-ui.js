// 좁은 화면(900px 이하)의 서랍 관리. 아래에서 올라오는 것이 셋이라 서로 겹치지 않게 한 번에 하나만 연다:
//   국가 정보(#left, 나라를 누르면 열림) · 세계의 역사(#right, 도구 막대의 '역사' 탭) · 도구 칸(#dockTray, powers.js)
// 모양은 styles.css의 '모바일 레이아웃' 구역이 맡고, 여기서는 body의 mp-right 클래스와 도구 막대 높이(--dock-h)만 다룬다.
(() => {
  const body = document.body;
  const tab = document.querySelector('#dockTabs [data-mp="right"]');
  const narrow = window.matchMedia('(max-width: 900px), (max-height: 520px)');

  function setHistory(open) {
    body.classList.toggle('mp-right', open);
    tab.classList.toggle('active', open);
    if (open) {
      if (narrow.matches) window.WFGame.select(-1);      // 국가 정보와 자리가 겹친다
      window.dispatchEvent(new Event('wf:panel-open')); // 도구 칸을 닫게 한다 (powers.js)
    }
  }
  // 도구 칸을 열 때 powers.js가 부른다: 좁은 화면에서는 서랍을 모두 닫아 지도를 비운다
  window.WFPanels = {
    close() {
      setHistory(false);
      if (narrow.matches) window.WFGame.select(-1);
    }
  };

  tab.addEventListener('click', () => setHistory(!body.classList.contains('mp-right')));

  // 나라를 눌러 국가 정보가 열리면 역사 서랍은 닫는다
  window.addEventListener('wf:select', e => { if (e.detail && e.detail.id >= 0 && narrow.matches) setHistory(false); });

  // 서랍은 도구 막대 바로 위에 붙는다. 도구 칸이 열리고 닫히면 높이가 바뀌므로 그때마다 알려 준다.
  const dock = document.getElementById('dock');
  const measure = () => document.documentElement.style.setProperty('--dock-h', dock.offsetHeight + 'px');
  if (window.ResizeObserver) new ResizeObserver(measure).observe(dock);
  window.addEventListener('resize', measure);
  measure();
})();
