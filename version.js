// 버전과 업데이트 내역. 배포할 때 여기만 고치세요(화면의 버전 표시 두 곳과 업데이트 내역 창이 모두 이 값을 씁니다).
// CHANGELOG의 맨 위 항목이 현재 버전입니다. 새 배포는 맨 위에 항목을 추가하세요.
(() => {
  const CHANGELOG = [
    { v: '1.7.6', date: '2026-10-10', items: [
      '설정 · 계정 창에서 글자가 세로로 쌓이거나 위치가 어긋나던 문제 수정',
      '모바일에서 두 번 터치하면 화면이 확대되던 문제 수정',
      '아직 연동되지 않은 Google 로그인 버튼 제거 (Discord만 사용)'
    ] },
    { v: '1.7.5', date: '2026-10-10', items: [
      '기기 배율 최적화, 모바일 화면에서 UI가 잘리는 문제 수정',
      '단, Firefox는 126 버전 이상이어야 배율이 적용됩니다. (이전 버전은 배율이 적용되지 않음)',
    ] },
    { v: '1.7.4', date: '2026-10-10', items: [
      'Discord 계정으로 로그인 (이메일/비밀번호 가입 제거)',
      '이용약관 · 개인정보 처리방침 정비, 계정 만들기는 만 14세 이상 (로컬 플레이는 나이 제한 없음)',
      '지도 · 역사 국경 데이터와 배경음악 출처 표기 추가',
      '버전 표시 통합, 업데이트 내역 창 추가'
    ] },
    { v: '1.7.3 이전', date: '2026-10-10', items: [
      '기초적인 게임 플레이 구축',
      '설정과 저장 추가'
    ] }
  ];

  window.WF_VERSION = CHANGELOG[0].v;
  window.WF_CHANGELOG = CHANGELOG;

  const $ = id => document.getElementById(id);
  const tag = 'v' + window.WF_VERSION;
  $('verTop').textContent = tag;
  $('verFoot').textContent = tag;

  const show = () => {
    $('chBody').innerHTML = CHANGELOG.map(c =>
      `<h5>v${c.v} <span class="chDate">${c.date}</span></h5><ul>${c.items.map(i => `<li>${i}</li>`).join('')}</ul>`).join('');
    $('changeDlg').classList.add('open');
  };
  const hide = () => $('changeDlg').classList.remove('open');

  $('verTop').onclick = show;
  $('verFoot').onclick = e => { e.preventDefault(); show(); };
  $('chClose').onclick = hide;
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('changeDlg').classList.contains('open')) { e.stopImmediatePropagation(); hide(); }
  }, true);
})();
