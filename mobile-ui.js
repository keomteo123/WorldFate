// 좁은 화면(900px 이하)의 좌우 패널: 도구 막대 양 끝의 '시야' · '역사' 버튼으로 아래 서랍처럼 열고 닫는다.
// 모양은 styles.css의 '모바일 레이아웃' 구역이 맡고, 여기서는 body의 mp-left / mp-right 클래스만 바꾼다.
(() => {
  const body = document.body;
  const tabs = [...document.querySelectorAll('#dockTabs [data-mp]')];
  const narrow = window.matchMedia('(max-width: 900px)');

  const current = () => body.classList.contains('mp-left') ? 'left' : body.classList.contains('mp-right') ? 'right' : null;
  function set(side) { // 'left' | 'right' | null(닫기). 한 번에 하나만 연다.
    body.classList.toggle('mp-left', side === 'left');
    body.classList.toggle('mp-right', side === 'right');
    tabs.forEach(b => b.classList.toggle('active', b.dataset.mp === side));
    if (side) window.dispatchEvent(new Event('wf:panel-open')); // 권능 칸과 자리가 겹치므로 닫게 한다 (powers.js)
  }
  window.WFPanels = { close: () => set(null) };

  tabs.forEach(b => b.addEventListener('click', () => set(current() === b.dataset.mp ? null : b.dataset.mp)));

  // 지도에서 국가를 누르면(살펴보기) 그 나라 정보가 있는 패널을 바로 보여 준다.
  window.addEventListener('wf:select', () => {
    if (!narrow.matches) return;
    set('left');
    const panel = document.getElementById('left');
    const head = document.getElementById('selectedBox').previousElementSibling; // '선택한 국가' 제목
    requestAnimationFrame(() => { panel.scrollTop = head.offsetTop - 8; });
  });
})();
