// 서비스 이용약관 · 개인정보 처리방침 창 + 회원가입 동의 절차.
// 출시 전에 아래 OPERATOR 값을 실제 정보로 채우고, 내용을 바꾸면 VERSION을 올리세요(가입 시 동의한 버전이 계정에 기록됩니다).
(() => {
  const $ = id => document.getElementById(id);

  const OPERATOR = {
    name: 'Mojaran_studio',
    email: 'keomteo123@gmail.com',
    address: ''
  };
  const VERSION = '2026-10-10';
  const MIN_AGE = 14;

  // ---------- 한국어 ----------
  const KO = `
<h4>제1부 서비스 이용약관</h4>
<p class="tmDate">버전 ${VERSION} · 시행일 ${VERSION}</p>

<h5>제1조 (목적)</h5>
<p>이 약관은 ${OPERATOR.name}(이하 "운영자")가 제공하는 웹 게임 "World Fate"(이하 "서비스")의 이용과 관련해 운영자와 이용자의 권리·의무 및 책임사항을 정함을 목적으로 합니다.</p>

<h5>제2조 (약관의 효력과 변경)</h5>
<p>① 이 약관은 이용자가 가입 화면에서 동의함으로써 효력이 생깁니다.<br>
② 운영자는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 시행일 최소 7일 전(이용자에게 불리하거나 중요한 변경은 30일 전)에 서비스 화면 또는 이메일로 알립니다.<br>
③ 이용자가 변경 약관의 시행일까지 거부 의사를 밝히지 않고 서비스를 계속 이용하면 동의한 것으로 봅니다. 동의하지 않으면 탈퇴할 수 있습니다.</p>

<h5>제3조 (이용 자격)</h5>
<p>① 계정은 만 ${MIN_AGE}세 이상만 만들 수 있습니다. 만 ${MIN_AGE}세 미만은 계정을 만들 수 없습니다.<br>
② 게임의 기본 기능(로컬 플레이)은 계정 없이 <b>나이 제한 없이</b> 누구나 이용할 수 있으며, 이 경우 운영자는 개인정보를 수집하지 않습니다. 클라우드 저장 등 일부 기능만 계정이 필요합니다.</p>

<h5>제4조 (계정 관리)</h5>
<p>① 로그인은 Discord 계정으로만 할 수 있습니다. 이용자는 해당 계정을 스스로 안전하게 관리할 책임이 있으며, 각 제공자의 이용약관도 함께 적용됩니다.<br>
② 타인의 정보를 도용하거나, 계정을 양도·판매·대여할 수 없습니다.<br>
③ 계정 도용이 의심되면 즉시 운영자에게 알려야 합니다.</p>

<h5>제5조 (서비스의 내용)</h5>
<p>서비스는 가상의 세계에서 국가의 흥망을 시뮬레이션하는 게임으로, 로컬 플레이와 로그인한 이용자를 위한 클라우드 저장 기능을 제공합니다. 현재 서비스는 무료이며 유료 결제 기능이 없습니다. 유료 기능을 도입할 경우 결제·환불 조건을 사전에 고지하고 별도 동의를 받으며, 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령을 따릅니다.</p>

<h5>제6조 (서비스의 변경·중단)</h5>
<p>① 운영자는 운영상·기술상 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있으며, 이용자에게 불리한 중요한 변경이나 서비스 종료는 사전에 공지합니다.<br>
② 천재지변, 설비 장애 등 불가피한 사유는 사전 공지 없이 서비스가 중단될 수 있으며, 이 경우 사후에 지체 없이 알립니다.</p>

<h5>제7조 (이용자의 금지행위)</h5>
<p>이용자는 다음 행위를 해서는 안 됩니다.<br>
1. 서비스·서버·계정 시스템에 대한 무단 접근, 해킹, 과도한 요청(디도스 등), 취약점 악용<br>
2. 서비스의 소스 코드·데이터를 법령이 허용하는 범위를 넘어 복제·배포하거나 역설계하는 행위<br>
3. 타인의 개인정보 도용, 허위 정보 등록, 계정의 거래<br>
4. 법령 또는 공공질서에 위반되거나 타인의 권리(저작권, 명예, 사생활 등)를 침해하는 행위<br>
5. 서비스의 정상적인 운영을 방해하는 그 밖의 행위</p>

<h5>제8조 (지식재산권과 이용자 데이터)</h5>
<p>① 서비스와 그에 포함된 프로그램, 디자인, 음원, 지도 데이터 등에 대한 권리는 운영자 또는 정당한 권리자에게 있으며, 이용자는 개인적·비상업적 목적으로 서비스를 이용할 권한만 가집니다. 일부 구성요소는 제3자의 공개 라이선스에 따를 수 있습니다.<br>
② 이용자가 클라우드에 저장한 게임 저장 데이터는 이용자의 것이며, 운영자는 서비스 제공(저장·불러오기·백업·장애 대응)에 필요한 범위에서만 이를 처리합니다.</p>

<h5>제9조 (이용 제한과 계약 해지)</h5>
<p>① 이용자는 언제든지 탈퇴할 수 있습니다. 탈퇴를 원하면 ${OPERATOR.email}로 요청하세요. 요청을 확인한 뒤 지체 없이(늦어도 30일 이내) 계정과 클라우드 저장 데이터를 삭제합니다.<br>
② 운영자는 이용자가 제7조를 위반하면 경고, 일시 정지, 계정 해지 등의 조치를 할 수 있으며, 사전에 사유를 알리고 소명 기회를 줍니다. 다만 긴급한 보안 위협 등은 먼저 조치한 뒤 알릴 수 있습니다.</p>

<h5>제10조 (면책과 책임의 제한)</h5>
<p>① 서비스는 현재 상태 그대로 무료로 제공되며, 운영자는 법령이 허용하는 범위에서 서비스의 무중단·무오류를 보증하지 않습니다.<br>
② 게임에 등장하는 국가, 지도, 역사적 사건, 지도자는 오락을 위한 시뮬레이션이며 현실의 사실·정치적 입장·영토 주권에 대한 운영자의 견해를 나타내지 않습니다.<br>
③ 운영자는 이용자의 귀책사유로 인한 손해, 천재지변 등 불가항력으로 인한 손해에 대해 책임지지 않습니다. 또한 로컬 저장(브라우저 저장소) 데이터는 브라우저 삭제 등으로 사라질 수 있으니 중요한 진행은 클라우드에 저장하시기 바랍니다.<br>
④ 위 면책 조항은 운영자의 고의 또는 중대한 과실로 인한 손해, 그리고 소비자 보호 관련 법령상 배제할 수 없는 책임에는 적용되지 않습니다.</p>

<h5>제11조 (준거법과 분쟁 해결)</h5>
<p>이 약관은 대한민국 법률에 따라 해석됩니다. 다만 이용자가 거주 국가의 강행 소비자 보호 법령상 권리를 가지는 경우, 이 조항은 그 권리를 제한하지 않습니다. 서비스와 관련한 분쟁은 우선 당사자 간 성실한 협의로 해결하며, 해결되지 않을 경우 민사소송법상 관할 법원에 제기합니다.</p>

<h5>제12조 (문의)</h5>
<p>운영자: ${OPERATOR.name} · 이메일: ${OPERATOR.email}</p>

<h4>제2부 개인정보 처리방침</h4>
<p>운영자는 「개인정보 보호법」(대한민국), EU 일반개인정보보호법(GDPR), 미국 캘리포니아 소비자 프라이버시법(CCPA/CPRA) 등 이용자가 속한 지역의 개인정보 보호 법령을 준수하며, 이용자의 개인정보를 필요한 최소한으로만 처리합니다.</p>

<h5>1. 처리하는 개인정보 항목과 목적</h5>
<table>
<tr><th>구분</th><th>항목</th><th>목적</th><th>필수</th></tr>
<tr><td>회원가입·로그인</td><td>소셜 로그인 제공자(Discord), 제공자의 계정 고유 ID, 이메일 주소. 제공자가 함께 전달하는 경우 표시 이름·프로필 이미지(운영자는 게임에서 사용하지 않음)</td><td>본인 식별, 계정 생성·유지, 로그인, 공지·민원 응대</td><td>필수</td></tr>
<tr><td>클라우드 저장</td><td>게임 저장 데이터(진행 상황, 저장 슬롯 이름, 저장 시각)</td><td>저장·불러오기 기능 제공</td><td>이 기능 이용 시</td></tr>
<tr><td>가입 동의 기록</td><td>동의한 약관 버전, 동의 시각</td><td>동의 사실의 증빙, 법적 분쟁 대응</td><td>필수</td></tr>
<tr><td>서비스 이용 중 자동 생성</td><td>접속 IP, 접속 시각, 브라우저·기기 정보(인증 서버 로그)</td><td>부정 이용 방지, 보안, 장애 대응</td><td>자동 수집</td></tr>
</table>
<p>운영자는 이름, 전화번호, 주민등록번호, 결제정보, 위치정보, 민감정보를 수집하지 않으며, 광고·행태분석 목적의 추적 도구를 사용하지 않습니다.</p>

<h5>2. 보유 및 이용 기간</h5>
<p>① 소셜 계정 정보·이메일·클라우드 저장 데이터: <b>회원 탈퇴 시까지</b> 보유하고 탈퇴 즉시(늦어도 30일 이내) 파기합니다.<br>
② 동의 기록: 탈퇴 후에도 분쟁 대응을 위해 <b>최대 3년</b> 보관할 수 있으며, 이 경우 다른 정보와 분리하여 보관합니다.<br>
③ 접속 로그: 관련 법령(통신비밀보호법 등) 및 보안 목적상 필요한 기간(최대 1년) 보관 후 파기합니다.<br>
④ 다른 법령이 보존을 요구하는 경우 그 기간 동안 별도 보관합니다.</p>

<h5>3. 처리의 법적 근거 (EU/EEA·영국 이용자)</h5>
<p>계약 이행(계정 및 저장 기능 제공, GDPR 제6조 1항 b호), 정당한 이익(보안·부정 이용 방지, 동 f호), 법적 의무 준수(동 c호), 그리고 동의(가입 시 약관 및 개인정보 처리 동의, 동 a호)입니다. 동의는 언제든 철회할 수 있으며, 철회 전의 처리에는 영향이 없습니다.</p>

<h5>4. 개인정보 처리의 위탁 및 국외 이전</h5>
<table>
<tr><th>수탁자</th><th>위탁 업무</th><th>이전 국가·방법</th></tr>
<tr><td>Supabase, Inc. (및 그 인프라 제공업체)</td><td>회원 인증, 데이터베이스(클라우드 저장) 운영·보관</td><td>서비스 이용 시 네트워크를 통해 전송, 서버 소재 국가의 해외 데이터센터에 저장. 보유·이용 기간은 위 2항과 같음</td></tr>
<tr><td>Discord Inc. (소셜 로그인 제공자)</td><td>이용자가 선택한 계정으로 로그인 인증. 이용자가 로그인할 때 제공자가 운영자에게 위 항목을 전달함</td><td>미국 등 제공자 소재국. 제공자의 개인정보 처리는 각 제공자의 개인정보 처리방침을 따름</td></tr>
</table>
<p>이용자가 가입하면 위와 같이 개인정보가 국외로 이전될 수 있습니다. 이전을 원하지 않으면 계정을 만들지 않고 로컬 플레이만 이용할 수 있습니다. EU/EEA·영국 이용자의 정보가 해당 지역 밖으로 이전될 때에는 표준계약조항(SCC) 등 법령이 정한 적절한 보호조치를 적용하는 수탁자를 이용합니다. 운영자는 이용자의 개인정보를 판매하지 않으며, 광고·마케팅 목적으로 제3자에게 제공하거나 공유하지 않습니다. 법령에 근거한 수사기관의 적법한 요청이 있는 경우에만 예외적으로 제공할 수 있습니다.</p>

<h5>5. 이용자의 권리와 행사 방법</h5>
<p>이용자는 언제든지 자신의 개인정보에 대해 <b>열람, 정정, 삭제, 처리정지, 동의 철회, 전송(이동)을 요구</b>할 수 있고, EU/EEA·영국 이용자는 추가로 처리 제한 및 이의 제기 권리를, 캘리포니아 거주자는 수집 항목 확인·삭제·정정 요구 및 차별받지 않을 권리를 가집니다. ${OPERATOR.email}로 요청하면 지체 없이(법령상 늦어도 10일~30일 이내) 조치하고 결과를 알립니다. 만 ${MIN_AGE}세 미만 이용자의 정보가 확인되면 즉시 삭제합니다. 대리인을 통해서도 요청할 수 있습니다.</p>
<p>동의를 거부할 권리가 있으나, 필수 항목에 동의하지 않으면 계정을 만들 수 없습니다(로컬 플레이는 가능).</p>

<h5>6. 쿠키와 브라우저 저장소</h5>
<p>서비스는 광고·분석 쿠키를 사용하지 않습니다. 다만 서비스 제공에 꼭 필요한 목적으로 브라우저 저장소(localStorage)에 로그인 세션 토큰, 게임 저장 슬롯 정보, 소리 설정을 저장합니다. 이는 이용자 기기에만 저장되며 브라우저 설정에서 삭제할 수 있습니다(삭제 시 로그아웃되고 로컬 저장이 사라집니다).</p>

<h5>7. 안전성 확보 조치</h5>
<p>운영자는 비밀번호를 저장하지 않으며, 로그인 인증은 Discord가 처리합니다. 모든 통신은 HTTPS로 암호화하고, 클라우드 저장 데이터는 행 단위 접근 제어(본인만 조회·수정 가능)로 보호합니다. 접근 권한은 최소한으로 제한합니다.</p>

<h5>8. 개인정보 유출 시 대응</h5>
<p>유출 사실을 알게 되면 지체 없이(GDPR은 72시간 이내 감독기관에, 한국은 72시간 이내 이용자 통지 및 필요 시 신고) 유출 항목, 시점, 경위, 피해 최소화 방법 및 대응 조치를 해당 이용자와 관계 기관에 알립니다.</p>

<h5>9. 개인정보 보호책임자 및 권리 구제</h5>
<p>개인정보 보호책임자: ${OPERATOR.name} · ${OPERATOR.email}<br>
문제가 해결되지 않으면 다음 기관에 문의·신고할 수 있습니다: 개인정보침해신고센터(privacy.kisa.or.kr, 118), 개인정보분쟁조정위원회(kopico.go.kr, 1833-6972), 대검찰청(spo.go.kr, 1301), 경찰청 사이버수사국(ecrm.police.go.kr, 182). EU/EEA·영국 이용자는 거주지 감독기관에, 캘리포니아 거주자는 캘리포니아 개인정보 보호청에 민원을 제기할 수 있습니다.</p>

<h5>10. 방침의 변경</h5>
<p>이 방침을 변경하는 경우 시행 7일 전(수집 항목·목적 등 중요한 변경은 30일 전)에 서비스 내 또는 이메일로 알리고, 필요하면 다시 동의를 받습니다.</p>

<h4>제3부 데이터 출처 및 라이선스</h4>
<ul>
<li><b>현대 지도·국경 (현실 지도)</b>: <a href="https://www.naturalearthdata.com" target="_blank" rel="noopener">Natural Earth</a> 1:50m 데이터 (퍼블릭 도메인). <a href="https://github.com/topojson/world-atlas" target="_blank" rel="noopener">world-atlas</a> TopoJSON(ISC 라이선스)을 통해 사용했습니다.</li>
<li><b>역사 시나리오 국경</b>: <a href="https://github.com/aourednik/historical-basemaps" target="_blank" rel="noopener">Historical Basemaps</a> (aourednik), <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. 게임에 맞게 단순화·가공했습니다.</li>
<li><b>배경음악</b>: Google Gemini의 음악 생성 기능으로 만든 AI 생성 음악입니다. 서비스에 추가되는 음악도 같은 방식으로 만들 수 있습니다.</li>
</ul>
<p>위 데이터가 보여 주는 국경과 지명은 게임 표현을 위한 것이며 특정 국가의 공식 입장을 나타내지 않습니다.</p>
`;

  // ---------- English ----------
  const EN = `
<h4>Part 1 · Terms of Service</h4>
<p class="tmDate">Version ${VERSION} · Effective ${VERSION}</p>

<h5>1. Who we are and what this covers</h5>
<p>"World Fate" (the "Service") is a web game operated by ${OPERATOR.name} (the "Operator"). By creating an account you agree to these Terms and to the Privacy Policy in Part 2. If you do not agree, do not create an account; you can still play locally without one.</p>

<h5>2. Eligibility</h5>
<p>You must be at least ${MIN_AGE} years old to create an account. If we learn that an account belongs to someone under ${MIN_AGE}, we will delete it and its data. Local play without an account has no age limit and does not send us any personal data.</p>

<h5>3. Your account</h5>
<p>You can log in only with a Discord account, and the provider's own terms also apply. Keep that account secure. You are responsible for activity on your account. Do not share, sell or transfer it. Tell us promptly if you suspect unauthorized access.</p>

<h5>4. The Service</h5>
<p>The Service is a simulation game about the rise and fall of nations. Local play works without an account; cloud saves require one. The Service is currently free and has no paid features. If paid features are introduced, we will disclose prices, billing and refund terms beforehand and ask for separate consent, in line with applicable consumer-protection law (including mandatory withdrawal rights).</p>

<h5>5. Acceptable use</h5>
<p>You must not: (a) hack, attack, overload or gain unauthorized access to the Service or its servers, or exploit vulnerabilities; (b) copy, distribute or reverse engineer the Service beyond what law permits; (c) impersonate others or provide false information; (d) violate laws or the rights of others; or (e) otherwise interfere with the Service.</p>

<h5>6. Intellectual property and your data</h5>
<p>The Service, including its code, design, audio and map data, belongs to the Operator or its licensors (some components are under third-party open licenses). You get a personal, non-commercial, non-transferable right to use it. Your cloud save data remains yours; we process it only to provide, back up and secure the Service.</p>

<h5>7. Changes, suspension and termination</h5>
<p>We may change or discontinue the Service and will give advance notice of material changes or shutdown where possible. You may delete your account at any time by emailing ${OPERATOR.email}; we will delete your account and cloud saves without undue delay and within 30 days. We may warn, suspend or terminate accounts that breach these Terms, normally giving notice and a chance to respond, except where urgent security action is needed.</p>

<h5>8. Disclaimers and limits of liability</h5>
<p>The Service is provided "as is" and free of charge, and, to the extent permitted by law, without warranty of uninterrupted or error-free operation. Countries, maps, events and leaders in the game are fictional simulation for entertainment and do not express any position on real-world facts, politics or territorial sovereignty. Local (browser) saves can be lost if you clear your browser data. Nothing in these Terms excludes or limits liability for intent, gross negligence, death or personal injury, or any liability that cannot be excluded under mandatory law, and nothing limits your statutory consumer rights.</p>

<h5>9. Changes to these Terms</h5>
<p>We will give at least 7 days' notice before changes take effect (30 days for changes that are material or adverse to you), in the Service or by email. If you do not agree you may delete your account.</p>

<h5>10. Governing law</h5>
<p>These Terms are governed by the laws of the Republic of Korea, without depriving you of the mandatory consumer-protection rights of the country where you live. We aim to resolve disputes through good-faith discussion first.</p>

<h5>11. Contact</h5>
<p>${OPERATOR.name} · ${OPERATOR.email}</p>

<h4>Part 2 · Privacy Policy</h4>
<p>We process personal data in line with applicable privacy law, including Korea's Personal Information Protection Act, the EU/UK GDPR and the California CCPA/CPRA, and we collect only what we need. The Operator is the data controller.</p>

<h5>1. What we collect and why</h5>
<table>
<tr><th>Category</th><th>Data</th><th>Purpose</th><th>Required</th></tr>
<tr><td>Account</td><td>Login provider (Discord), the provider's unique account ID, email address. Display name and profile picture if the provider sends them (we do not use them in the game)</td><td>Create and secure your account, log in, respond to requests</td><td>Yes</td></tr>
<tr><td>Cloud saves</td><td>Game save data, slot names, save times</td><td>Provide save/load</td><td>If you use cloud saves</td></tr>
<tr><td>Consent record</td><td>Terms version accepted, time of acceptance</td><td>Prove consent, handle disputes</td><td>Yes</td></tr>
<tr><td>Automatic logs</td><td>IP address, timestamps, browser/device information (authentication server logs)</td><td>Security, abuse prevention, troubleshooting</td><td>Automatic</td></tr>
</table>
<p>We do not collect your name, phone number, national ID, payment data, precise location or sensitive data, and we do not use advertising or behavioral-tracking tools.</p>

<h5>2. Retention</h5>
<p>Social account details, email and cloud saves are kept until you delete your account, then erased (within 30 days). A consent record may be kept up to 3 years after deletion, separated from other data, to defend against legal claims. Access logs are kept for the period needed for security and legal requirements (up to 1 year). Data that the law requires us to keep is retained separately for that period.</p>

<h5>3. Legal bases (EU/EEA/UK)</h5>
<p>Performance of a contract (providing your account and saves, Art. 6(1)(b)); legitimate interests (security and abuse prevention, 6(1)(f)); legal obligations (6(1)(c)); and consent (your acceptance at sign-up, 6(1)(a)), which you can withdraw at any time without affecting earlier processing.</p>

<h5>4. Processors and international transfers</h5>
<p>We use Supabase, Inc. (and its infrastructure providers) for authentication and database hosting. Your data is therefore transferred to and stored on servers outside your country. Logging in also involves Discord Inc., which sends us the data listed above; its own privacy policy governs its processing. Where required, transfers rely on safeguards such as Standard Contractual Clauses. If you do not want this, do not create an account; local play does not send personal data to us. We do not sell or share your personal data for advertising or marketing, and we disclose it to authorities only where legally required.</p>

<h5>5. Your rights</h5>
<p>You may request access, correction, deletion, restriction, objection, withdrawal of consent and portability of your data. California residents may also request disclosure and deletion and are protected from discrimination for exercising rights. Email ${OPERATOR.email}; we respond without undue delay and within the legal deadline (generally within 30 days). You may also use an authorized agent. You may refuse consent, but without the required items we cannot create your account (local play remains available). If we learn that a user is under ${MIN_AGE}, we delete their data.</p>

<h5>6. Cookies and browser storage</h5>
<p>We use no advertising or analytics cookies. We store only what is strictly necessary in your browser's localStorage: your login session token, save-slot information and audio settings. You can clear it in your browser (this logs you out and removes local saves).</p>

<h5>7. Security and breaches</h5>
<p>We do not store passwords (sign-in is handled by Discord), traffic is encrypted over HTTPS, and cloud saves are protected by row-level access control so only you can read or change them. If a breach affecting you occurs, we will notify you and the relevant authorities within the legal deadlines (e.g. 72 hours under GDPR) with the details required by law.</p>

<h5>8. Complaints</h5>
<p>Contact us first at ${OPERATOR.email}. You may also complain to your local data-protection authority (EU/EEA/UK), the California Privacy Protection Agency, or Korea's Personal Information Protection Commission / KISA Privacy Infringement Report Center (privacy.kisa.or.kr, 118).</p>

<h5>9. Changes</h5>
<p>We will notify you at least 7 days before changes take effect (30 days for material changes) and ask for renewed consent where required.</p>

<h4>Part 3 · Data sources and licenses</h4>
<ul>
<li><b>Modern map and borders (real-world map)</b>: <a href="https://www.naturalearthdata.com" target="_blank" rel="noopener">Natural Earth</a> 1:50m data (public domain), used via <a href="https://github.com/topojson/world-atlas" target="_blank" rel="noopener">world-atlas</a> TopoJSON (ISC license).</li>
<li><b>Historical scenario borders</b>: <a href="https://github.com/aourednik/historical-basemaps" target="_blank" rel="noopener">Historical Basemaps</a> by aourednik, licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. Simplified and modified for this game.</li>
<li><b>Background music</b>: AI-generated music created with Google Gemini's music generation. Music added to the Service later may be created the same way.</li>
</ul>
<p>Borders and place names shown are for gameplay and do not express any official position of any state.</p>
`;

  const TEXT = { ko: KO, en: EN };
  let lang = (navigator.language || '').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  let resolver = null;

  const L = {
    ko: { title: '서비스 이용약관 · 개인정보 처리방침', agreeAll: '아래 항목에 모두 동의합니다',
      c1: `(필수) 서비스 이용약관에 동의합니다.`, c2: '(필수) 개인정보 수집·이용에 동의합니다. (소셜 계정 정보, 이메일, 저장 데이터 / 탈퇴 시까지 보관)',
      c3: '(필수) 개인정보의 국외 처리 위탁(Supabase)에 동의합니다.', c4: `(필수) 만 ${MIN_AGE}세 이상입니다.`,
      ok: '동의하고 계속', cancel: '취소', close: '닫기', note: '필수 항목에 동의하지 않으면 계정을 만들 수 없습니다. (계정 없이 로컬 플레이는 가능합니다)' },
    en: { title: 'Terms of Service · Privacy Policy', agreeAll: 'Agree to all of the following',
      c1: '(Required) I agree to the Terms of Service.', c2: '(Required) I consent to the collection and use of my personal data (social account details, email, save data; kept until I delete my account).',
      c3: '(Required) I consent to processing by Supabase on servers outside my country.', c4: `(Required) I am at least ${MIN_AGE} years old.`,
      ok: 'Agree and continue', cancel: 'Cancel', close: 'Close', note: 'Without the required consents we cannot create an account. (Local play without an account stays available.)' }
  };

  function render(consentMode) {
    const t = L[lang];
    $('tmTitle').textContent = t.title;
    $('tmBody').innerHTML = TEXT[lang];
    $('tmLangKo').classList.toggle('primary', lang === 'ko');
    $('tmLangEn').classList.toggle('primary', lang === 'en');
    $('tmConsent').style.display = consentMode ? '' : 'none';
    $('tmAll').nextElementSibling.textContent = t.agreeAll;
    ['c1', 'c2', 'c3', 'c4'].forEach(k => { $('tm_' + k).nextElementSibling.textContent = t[k]; });
    $('tmNote').textContent = consentMode ? t.note : '';
    $('tmOk').textContent = t.ok; $('tmCancel').textContent = consentMode ? t.cancel : t.close;
    $('tmOk').style.display = consentMode ? '' : 'none';
    $('tmBody').scrollTop = 0;
  }

  const boxes = () => ['tm_c1', 'tm_c2', 'tm_c3', 'tm_c4'].map($);
  const sync = () => {
    const b = boxes();
    $('tmAll').checked = b.every(x => x.checked);
    $('tmOk').disabled = !b.every(x => x.checked);
  };

  function show(consentMode) {
    boxes().forEach(x => { x.checked = false; }); $('tmAll').checked = false; sync();
    render(consentMode);
    $('termsDlg').classList.add('open');
  }
  function hide(result) {
    $('termsDlg').classList.remove('open');
    if (resolver) { const r = resolver; resolver = null; r(result); }
  }

  $('tmLangKo').onclick = () => { lang = 'ko'; render(!!resolver); };
  $('tmLangEn').onclick = () => { lang = 'en'; render(!!resolver); };
  $('tmAll').onchange = () => { boxes().forEach(x => { x.checked = $('tmAll').checked; }); sync(); };
  boxes().forEach(x => { x.onchange = sync; });
  $('tmOk').onclick = () => hide(true);
  $('tmCancel').onclick = () => hide(false);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('termsDlg').classList.contains('open') && !document.body.hasAttribute('data-terms-page')) { e.stopImmediatePropagation(); hide(false); }
  }, true);

  // 약관 보기만 (동의 절차 없음)
  document.querySelectorAll('[data-open-terms]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); show(false); });
  });

  // terms.html 단독 페이지: 열자마자 약관을 보여 주고, 닫기는 게임으로 이동
  if (document.body.hasAttribute('data-terms-page')) {
    show(false);
    $('tmCancel').onclick = () => { location.href = 'index.html'; };
    $('tmCancel').textContent = lang === 'ko' ? '게임으로' : 'To the game';
  }

  window.WFTerms = {
    version: VERSION,
    // 회원가입 동의 창. 모두 동의하면 true.
    ask() { return new Promise(res => { resolver = res; show(true); }); },
    consentData() { return { terms_version: VERSION, privacy_version: VERSION, min_age_confirmed: MIN_AGE, consented_at: new Date().toISOString() }; }
  };
})();
