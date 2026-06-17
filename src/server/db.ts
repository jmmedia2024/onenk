import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "bukmin.db");
const db = new Database(dbPath);

// Enable WAL for better concurrency and write-safety
db.pragma("journal_mode = WAL");

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    mb_id TEXT PRIMARY KEY,
    mb_password TEXT NOT NULL,
    mb_name TEXT NOT NULL,
    mb_nick TEXT NOT NULL,
    mb_email TEXT NOT NULL,
    mb_tel TEXT NOT NULL,
    mb_level INTEGER NOT NULL DEFAULT 2,
    mb_point INTEGER NOT NULL DEFAULT 0,
    mb_datetime TEXT NOT NULL,
    mb_today_login TEXT
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    board TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    date TEXT NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    donorName TEXT NOT NULL,
    amount INTEGER NOT NULL,
    paymentMethod TEXT NOT NULL,
    date TEXT NOT NULL,
    message TEXT,
    isRegular INTEGER DEFAULT 0,
    isRecognized INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS verifications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    settlementYear INTEGER NOT NULL,
    documentType TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    requestDate TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS slides (
    id INTEGER PRIMARY KEY,
    imageUrl TEXT NOT NULL,
    badge TEXT NOT NULL,
    title TEXT NOT NULL,
    subTitle TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS partners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    engName TEXT NOT NULL,
    desc TEXT NOT NULL,
    color TEXT NOT NULL,
    siteUrl TEXT NOT NULL,
    logoUrl TEXT NOT NULL
  );
`);

// Seed Default Slide Settings if empty
const countSlides = db.prepare("SELECT COUNT(*) as count FROM slides").get() as { count: number };
if (countSlides.count === 0) {
  const insertSlide = db.prepare(`
    INSERT INTO slides (id, imageUrl, badge, title, subTitle)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const defaultSlides = [
    {
      id: 1,
      imageUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1600&h=900&q=80",
      badge: "한반도 평화와 공존 자립 구심점",
      title: "수혜자에서 기여자로,\n당당하게 대한민국의 내일을 엽니다.",
      subTitle: "3만 4천 탈북민의 하나 된 목소리, 사단법인 북한이탈주민중앙회"
    },
    {
      id: 2,
      imageUrl: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1600&h=900&q=80",
      badge: "사회 공헌 실천 네트워크",
      title: "일방적인 지원 대상을 넘어\n당당하게 나누는 ‘기여 공동체’로",
      subTitle: "전국 각지에서 저소득 취약 가구 연료 배급, 연탄 김장 봉사를 자발적으로 앞장섭니다."
    },
    {
      id: 3,
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&h=900&q=80",
      badge: "100% 완전 전산 세무 감사 공시",
      title: "단 1원의 기부 후원금도\n가장 안전하고 정직하게 사용합니다",
      subTitle: "외부 전문 회계 법인을 통한 세무 감사 결과를 전 회원 상시 공개 보존 처리합니다."
    },
    {
      id: 4,
      imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&h=900&q=80",
      badge: "전국 130개 자립 연대 통합",
      title: "탈북 지원 전문 도민 동호인 단체를\n일관성 있게 결집하는 컨트롤타워",
      subTitle: "권익 보호 법률 상담 센터 개소 등 입체적 자립 솔루션을 원클릭 지원합니다."
    },
    {
      id: 5,
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&h=900&q=80",
      badge: "통일 한반도의 평화 리더 양성",
      title: "진정한 사회 통합의\n살아있는 교두보를 세워갑니다",
      subTitle: "북한이탈주민의 고용 정착 성공사례를 확대 발굴하여, 국민들의 열린 통일 인식을 이끌어냅니다."
    }
  ];

  for (const slide of defaultSlides) {
    insertSlide.run(slide.id, slide.imageUrl, slide.badge, slide.title, slide.subTitle);
  }
}

// Seed Default Members if empty
const countMembers = db.prepare("SELECT COUNT(*) as count FROM members").get() as { count: number };
if (countMembers.count === 0) {
  const insertMember = db.prepare(`
    INSERT INTO members (mb_id, mb_password, mb_name, mb_nick, mb_email, mb_tel, mb_level, mb_point, mb_datetime, mb_today_login)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialMembers = [
    { id: "admin", pw: "admin123", name: "최고관리자", nick: "북민회대표", email: "admin@bukmin.org", tel: "02-6498-3133", level: 10, point: 55000, date: "2026-01-01", today: "2026-06-17 11:00:00" },
    { id: "officer", pw: "officer123", name: "복지행정처장", nick: "복지천사", email: "officer@bukmin.org", tel: "010-1234-5678", level: 8, point: 12000, date: "2026-02-15", today: "2026-06-17 09:30:00" },
    { id: "nk_hero", pw: "user123", name: "박상혁", nick: "자유수호가", email: "sanghyuk@gmail.com", tel: "010-8937-1234", level: 3, point: 4200, date: "2026-06-11", today: "2026-06-16 18:20:00" },
    { id: "happy_uni", pw: "user123", name: "이정현", nick: "통일나래", email: "junghyun@naver.com", tel: "010-6575-5678", level: 2, point: 1500, date: "2026-06-12", today: "2026-06-15 14:10:00" },
    { id: "k_sarang", pw: "user123", name: "한은혜", nick: "새삶인", email: "eunhye@daum.net", tel: "010-4461-9012", level: 2, point: 800, date: "2026-06-13", today: "2026-06-14 17:45:00" },
    { id: "young_ref", pw: "user123", name: "최영학", nick: "청년리더", email: "younghak@gmail.com", tel: "010-5732-4567", level: 3, point: 3300, date: "2026-06-13", today: "2026-06-13 13:05:00" }
  ];

  for (const m of initialMembers) {
    insertMember.run(m.id, m.pw, m.name, m.nick, m.email, m.tel, m.level, m.point, m.date, m.today);
  }
}

// Seed Default Posts if empty
const countPosts = db.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
if (countPosts.count === 0) {
  const insertPost = db.prepare(`
    INSERT INTO posts (id, board, title, content, author, date, views, likes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialPosts = [
    {
      id: "post-1",
      board: "notice",
      title: "[공지] 2026 하반기 정착 생활 장학생 선발 모집 규격 안내",
      content: "안녕하십니까, 사단법인 북한이탈주민중앙회 기획재정부입니다.\n본회 가입 회원의 자녀 및 학업을 이행하고 있는 북한이탈주민 청년들을 자조 격려하기 위한 하반기 인재 장학 전형 접수를 시작합니다.\n\n■ 접수 기한: 2026년 7월 15일까지\n■ 제출 서류: 장학 신청원, 북한이탈주민 확인서, 학업 성적 증명서\n많은 지원 바랍니다.",
      author: "중앙회 관리총무처",
      date: "2026-06-11",
      views: 94,
      likes: 21
    },
    {
      id: "post-private-1",
      board: "private",
      title: "[정회원 기밀] 2026 하반기 긴급 정착자금 수혜 특별 배정 현황 공람 (우대배부)",
      content: "안녕하십니까, 중앙회 정회원 심사위원회입니다.\n올해 하반기 영세 보수 가구 및 위기 중독 세대를 자조 격려하고자 지급되는 특별 후원 특별 연대 자금 산정안이 정식 인가되었습니다.\n\n정회원들께서는 지급 영수증과 실명 거주 확인 지침서를 지참하시고 다음 주 금요일 오전까지 중앙회 3층 자력지원실로 신분증 및 사도 도장을 지참하시어 직접 내방해 주십시오.\n\n본 사항은 정회원에 선결 부여되는 안심 기밀 조치이므로 제3자 유포 및 남용 시 자조 혜택 연대가 정지될 수 있음에 유의하십시오.",
      author: "중앙기금운용위",
      date: "2026-06-12",
      views: 18,
      likes: 6
    },
    {
      id: "post-private-2",
      board: "private",
      title: "[취업추천] 현대정보고속 특별 연계 전형 추천서 가접수 공문 (자녀 대조군)",
      content: "사단법인 북한이탈주민중앙회와 현대차그룹 인재연계교류회가 정식 맺은 통일 우대 정주 협정에 의거하여, 본회 소속 정회원 자녀 및 대졸 청년들을 대상으로 한 긴급 교직/특전 사관 채용 직무 상담 추천서를 우선 교부합니다.\n\n접수는 본회 사무처 대표 이메일 및 유선 행정을 통해 선결 6인에 한해 배정 조치되오니 서둘러 상담을 의뢰하십시오.",
      author: "중앙회 자조추천처",
      date: "2026-06-10",
      views: 29,
      likes: 11
    },
    {
      id: "post-2",
      board: "free",
      title: "지난주 주말 수제 오찬 빵 나눔 봉사에 동행했습니다. 정말 감동적이었습니다.",
      content: "처음 만나는 어르신들께서 손을 잡아주시며 \"자유 찾아서 남한에서 열심히 살고, 또 이렇게 봉사까지 하느라 눈물겹도록 기특하다\"고 격려해 주셨을 때 눈시울이 붉어졌습니다.\n\n정부의 양치 지원에만 의존하지 않고 주체적으로 우리 사회의 한 기둥이 되겠다는 다짐을 되새기게 한 하루였습니다. 앞으로도 정기 모임 동아리에 꾸준히 참가하겠습니다.",
      author: "김하나",
      date: "2026-06-08",
      views: 142,
      likes: 38
    },
    {
      id: "post-3",
      board: "qna",
      title: "정착지원금 및 법률 구조 연계 절차가 어떻게 되나요?",
      content: "최근 보증금 관련 분쟁이 터져 골머리를 썩고 있는데, 중앙회에서 변호사 연계 상담을 무료 지원받을 수 있는지 자세히 문의드립니다.",
      author: "박정우",
      date: "2026-06-05",
      views: 89,
      likes: 12
    },
    {
      id: "post-4",
      board: "free",
      title: "신뢰받는 협의회 운영을 촉진하기 위한 건의 드립니다.",
      content: "중앙회 사이트 전면 투명 전산 회계가 전결 처리되어 영수 내역까지 pdf 다운로드 되니 기탁 회원으로서 매우 안심되고 자긍심이 듭니다.\n소수 단체들의 회계 부설 잡음이 통일 운동을 저해하곤 하는데, 북민회가 모범을 보여주어 너무 다행이십니다.",
      author: "윤기탁",
      date: "2026-05-28",
      views: 110,
      likes: 45
    }
  ];

  for (const p of initialPosts) {
    insertPost.run(p.id, p.board, p.title, p.content, p.author, p.date, p.views, p.likes);
  }
}

// Seed Default Comments if empty
const countComments = db.prepare("SELECT COUNT(*) as count FROM comments").get() as { count: number };
if (countComments.count === 0) {
  const insertComment = db.prepare(`
    INSERT INTO comments (id, post_id, author, content, date)
    VALUES (?, ?, ?, ?, ?)
  `);

  const initialComments = [
    { id: "com-1", post_id: "post-1", author: "강철수", content: "좋은 소식 감사합니다! 주변 대학생 탈북 청년들에게도 널리 알리겠습니다.", date: "2026-06-11" },
    { id: "com-2", post_id: "post-2", author: "도우미원", content: "정말 고생 많으셨습니다! 김하나 님의 수기 덕에 봉사단의 기운이 배가 되네요.", date: "2026-06-08" },
    { id: "com-3", post_id: "post-2", author: "이철민", content: "다음 나눔에는 저도 꼭 정식 가입하여 참여하려 합니다. 가입 정보는 어디로 넣나요?", date: "2026-06-09" },
    { id: "com-4", post_id: "post-3", author: "법률보호과", content: "안녕하십니까 박정우 님. 본회에서는 대한법률구조공단 계약을 통해 무상 상담을 연계합니다. 우측 탭이나 전화 02-6498-3133으로 접수하시면 조속히 이민 전문 변호사를 연결 및 구술 조율해 드리겠습니다.", date: "2026-06-05" }
  ];

  for (const c of initialComments) {
    insertComment.run(c.id, c.post_id, c.author, c.content, c.date);
  }
}

// Seed Default Donations if empty
const countDonations = db.prepare("SELECT COUNT(*) as count FROM donations").get() as { count: number };
if (countDonations.count === 0) {
  const insertDonation = db.prepare(`
    INSERT INTO donations (id, donorName, amount, paymentMethod, date, message, isRegular, isRecognized)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialDonations = [
    { id: "d-1", donorName: "김태균", amount: 300000, paymentMethod: "계좌이체 (농협)", date: "2026-06-12", message: "정착 장학생들을 위해 보람되게 쓰였으면 좋겠습니다.", isRegular: 0, isRecognized: 1 },
    { id: "d-2", donorName: "유진우", amount: 150000, paymentMethod: "신용카드", date: "2026-06-12", message: "따뜻한 봉사에 감동하여 동참합니다.", isRegular: 1, isRecognized: 1 },
    { id: "d-3", donorName: "정성수", amount: 1000000, paymentMethod: "계좌이체 (농협)", date: "2026-06-11", message: "북민회 한 사람 한 사람의 든든한 정주에 보탬이 되었으면 합니다.", isRegular: 0, isRecognized: 1 },
    { id: "d-4", donorName: "글로벌하나재단", amount: 5000000, paymentMethod: "해외송금", date: "2026-06-10", message: "사단법인 북한이탈주민중앙회 공식 창립을 열렬히 후원합니다.", isRegular: 0, isRecognized: 1 }
  ];

  for (const d of initialDonations) {
    insertDonation.run(d.id, d.donorName, d.amount, d.paymentMethod, d.date, d.message, d.isRegular, d.isRecognized);
  }
}

// Seed Default Verifications if empty
const countVerifications = db.prepare("SELECT COUNT(*) as count FROM verifications").get() as { count: number };
if (countVerifications.count === 0) {
  const insertVerification = db.prepare(`
    INSERT INTO verifications (id, name, age, settlementYear, documentType, status, requestDate)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const initialVerifications = [
    { id: "v-1", name: "박상혁", age: 29, settlementYear: 2021, documentType: "북한이탈주민 확인서", status: "pending", requestDate: "2026-06-11" },
    { id: "v-2", name: "이정현", age: 34, settlementYear: 2019, documentType: "가족관계증명서 & 북민서", status: "pending", requestDate: "2026-06-12" },
    { id: "v-3", name: "한은혜", age: 25, settlementYear: 2023, documentType: "북한이탈주민 확인서", status: "pending", requestDate: "2026-06-13" },
    { id: "v-4", name: "최영학", age: 41, settlementYear: 2015, documentType: "정착지원금 수급 확인 필증", status: "pending", requestDate: "2026-06-13" }
  ];

  for (const v of initialVerifications) {
    insertVerification.run(v.id, v.name, v.age, v.settlementYear, v.documentType, v.status, v.requestDate);
  }
}

// Seed Default Partners if empty
const countPartners = db.prepare("SELECT COUNT(*) as count FROM partners").get() as { count: number };
if (countPartners.count === 0) {
  const insertPartner = db.prepare(`
    INSERT INTO partners (id, name, engName, desc, color, siteUrl, logoUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const TAX_TAEGEUK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1.5"/><path d="M50,15 A17.5,17.5 0 0,0 50,50 A17.5,17.5 0 0,1 50,85 A35,35 0 0,1 50,15" fill="%23cd2e3a"/><path d="M50,15 A17.5,17.5 0 0,0 50,50 A17.5,17.5 0 0,1 50,85 A35,35 0 0,0 50,15" fill="%230047a0"/></svg>`;
  const TAX_HANA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1.5"/><path d="M32,54 C32,36 45,30 50,44 C55,30 68,36 68,54 C68,68 50,78 50,78 C50,78 32,68 32,54 Z" fill="%2310b981"/><path d="M41,54 C41,44 48,41 50,48 C52,41 59,44 59,54 C59,62 50,69 50,69 C50,69 41,62 41,54 Z" fill="%2334d399"/></svg>`;
  const TAX_SEOUL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1.5"/><circle cx="50" cy="34" r="10" fill="%23e11d48"/><path d="M26,62 Q36,48 46,58 T66,53 Q76,48 80,62 Q70,72 50,72 T26,62 Z" fill="%232563eb"/><path d="M28,68 Q44,53 54,66 T74,58" stroke="%2316a34a" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
  const TAX_RED = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ffffff" stroke="%233b82f6" stroke-width="2.5"/><path d="M41,25 H59 V41 H75 V59 H59 V75 H41 V59 H25 V41 H41 Z" fill="%23dc2626"/></svg>`;
  const TAX_EYE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1.5"/><path d="M25,50 Q50,22 75,50 Q50,78 25,50 Z" fill="none" stroke="%23d97706" stroke-width="3"/><circle cx="50" cy="50" r="13" fill="%231e3a8a"/></svg>`;
  const TAX_GRID = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1.5"/><circle cx="50" cy="50" r="26" fill="none" stroke="%230d9488" stroke-width="2.5"/><line x1="22" y1="50" x2="78" y2="50" stroke="%230d9488" stroke-width="1.5"/><line x1="50" y1="22" x2="50" y2="78" stroke="%230d9488" stroke-width="1.5"/></svg>`;

  const initialPartners = [
    { id: "p-1", name: "통일부", engName: "Ministry of Unification", desc: "평화 체제 구축 및 남북 대화와 교류 협력 총괄", color: "bg-blue-50 text-blue-600 border-blue-200", siteUrl: "https://www.unikorea.go.kr", logoUrl: TAX_TAEGEUK },
    { id: "p-2", name: "남북하나재단", engName: "Korea Hana Foundation", desc: "탈북민의 정착 생활 정착 안전망 및 취업·장학 지원", color: "bg-emerald-50 text-emerald-600 border-emerald-200", siteUrl: "https://www.koreahana.or.kr", logoUrl: TAX_HANA },
    { id: "p-3", name: "민주평화통일자문회의", engName: "NUAC", desc: "평화통일 정책의 수립에 관한 대통령 직속 헌법자문기구", color: "bg-indigo-50 text-indigo-600 border-indigo-200", siteUrl: "https://www.nuac.go.kr", logoUrl: TAX_TAEGEUK },
    { id: "p-4", name: "서울특별시청", engName: "Seoul Metropolitan Gov", desc: "수도권 거주 이탈주민 지자체 동행 맞춤 긴급정착 보살핌", color: "bg-rose-50 text-rose-600 border-rose-200", siteUrl: "https://www.seoul.go.kr", logoUrl: TAX_SEOUL },
    { id: "p-5", name: "대한적십자사", engName: "Korean Red Cross", desc: "남북 이산가족 상봉 인도적 교류 및 긴급 생태계 재건 지원", color: "bg-red-50 text-red-600 border-red-200", siteUrl: "https://www.redcross.or.kr", logoUrl: TAX_RED },
    { id: "p-6", name: "북한인권정보센터 (NKDB)", engName: "Database Center for NK Human Rights", desc: "북한 인권 침해 사례 아카이빙 및 피해자 트라우마 치유", color: "bg-amber-50 text-amber-600 border-amber-200", siteUrl: "https://www.nkdb.org", logoUrl: TAX_EYE },
    { id: "p-7", name: "통일연구원", engName: "KINU", desc: "남북한 관계의 구조적 분석과 통일 미래 비전 설계 씽크탱크", color: "bg-teal-50 text-teal-600 border-teal-200", siteUrl: "https://www.kinu.or.kr", logoUrl: TAX_GRID },
    { id: "p-8", name: "행정안전부 이북5도위원회", engName: "Committee for the 5 Provinces of North Korea", desc: "미수복 영토에 관한 정체성 전수 및 실향민 복리 증진 실현", color: "bg-sky-50 text-sky-600 border-sky-200", siteUrl: "https://www.ibuk5do.go.kr", logoUrl: TAX_TAEGEUK }
  ];

  for (const p of initialPartners) {
    insertPartner.run(p.id, p.name, p.engName, p.desc, p.color, p.siteUrl, p.logoUrl);
  }
}

console.log("[NATIVE DATABASE SYSTEM] SQLite Database initialized successfully at:", dbPath);

export default db;
