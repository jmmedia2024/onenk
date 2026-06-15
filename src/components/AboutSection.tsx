import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  Users, 
  Shield, 
  Target, 
  Compass, 
  Navigation,
  Search,
  Filter,
  Calendar,
  Smartphone,
  Building,
  ShieldCheck,
  HeartHandshake,
  Briefcase,
  Info,
  FileText,
  Printer
} from 'lucide-react';
import AssociationLogo from './AssociationLogo';
import { AboutGreeting, AboutPurpose, AboutOrgCustom, AboutLocation } from '../types';
import { bylawsData, bylawsAttachments } from '../data/bylaws';

interface OrgMember {
  orgName: string;
  leaderName: string;
  leaderRole: string;
  contact: string;
  isOfficer: boolean;
}

const orgMembersList: OrgMember[] = [
  { orgName: "북한인민해방전선", leaderName: "최정훈", leaderRole: "사령관 & 중앙회 회장", contact: "010-2214-5259", isOfficer: true },
  { orgName: "통일을 위한 환경과 인권", leaderName: "이은택", leaderRole: "대표 & 중앙회 사무총장 및 이사", contact: "010-6575-6698", isOfficer: true },
  { orgName: "북한민주화 위원회", leaderName: "허광일", leaderRole: "위원장 & 중앙회 고문", contact: "010-7770-0269", isOfficer: true },
  { orgName: "세계북한연구센터", leaderName: "안찬일 박사", leaderRole: "소장 & 중앙회 고문", contact: "010-4056-8149", isOfficer: true },
  { orgName: "큰샘", leaderName: "박정오", leaderRole: "대표 & 중앙회 고문", contact: "010-9140-0821", isOfficer: true },
  { orgName: "자유통일문화연대", leaderName: "도명학", leaderRole: "대표 & 중앙회 고문", contact: "010-4461-2328", isOfficer: true },
  { orgName: "북한전략정보센터", leaderName: "강철환", leaderRole: "대표 & 중앙회 고문", contact: "010-3733-7558", isOfficer: true },
  { orgName: "대전 백두한라협회", leaderName: "강순희", leaderRole: "대표 & 대전지역위원회 위원장", contact: "010-5787-6569", isOfficer: true },
  { orgName: "경북탈북민연합회", leaderName: "윤광남", leaderRole: "회장 & 경북지역위원회 위원장", contact: "010-8840-0410", isOfficer: true },
  { orgName: "부산 새삶인협회", leaderName: "이장열", leaderRole: "회장 & 부산지역위원회 위원장", contact: "010-8013-2180", isOfficer: true },
  { orgName: "남북우정사랑회", leaderName: "최서정", leaderRole: "회장 & 대구지역위원회 위원장", contact: "010-9736-8387", isOfficer: true },
  { orgName: "탈북자동지회", leaderName: "서재평", leaderRole: "회장 & 수도권지역위원회 위원장", contact: "010-8937-7888", isOfficer: true },
  { orgName: "충북새삶인협회", leaderName: "김금옥", leaderRole: "회장 & 중앙회 이사", contact: "010-9327-9024", isOfficer: true },
  { orgName: "탈북민 정당 공화당", leaderName: "김재원", leaderRole: "대표 & 중앙회 이사", contact: "010-5732-0048", isOfficer: true },
  { orgName: "자유북한방송", leaderName: "이시영", leaderRole: "대표 & 중앙회 이사", contact: "010-8258-8821", isOfficer: true },
  { orgName: "한국새터민행복협회", leaderName: "강유진", leaderRole: "회장 & 중앙회 이사", contact: "010-3247-1116", isOfficer: true },
  { orgName: "통일나루터", leaderName: "김선녀", leaderRole: "회장 & 봉사활동위원회 위원장", contact: "010-5737-0689", isOfficer: true },
  { orgName: "강제북송피해자연대", leaderName: "지명희", leaderRole: "대표 & 복지관리위원회 위원장", contact: "010-6586-9906", isOfficer: true },
  { orgName: "북한감금피해자가족회", leaderName: "최민경", leaderRole: "회장 & 인권위원회 위원장", contact: "010-6603-3138", isOfficer: true },
  { orgName: "북방연구회", leaderName: "김형수", leaderRole: "대표 & 인재관리위원회 위원장", contact: "010-3069-9850", isOfficer: true },
  { orgName: "기독교 종교합동", leaderName: "주경배 목사", leaderRole: "목사 & 종교위원회 위원장", contact: "연락처 협정중", isOfficer: true },
  { orgName: "평양예술단", leaderName: "정팔용", leaderRole: "단장 & 문화예술위원회 위원장", contact: "연락처 협정중", isOfficer: true },
  { orgName: "우리 ONE", leaderName: "채신아", leaderRole: "대표 & 중앙회 감사", contact: "010-8256-2978", isOfficer: true },
  { orgName: "탈북민 정당 공화당 서울시당", leaderName: "전주영 대리", leaderRole: "서울시당위원장 & 중앙회 감사", contact: "010-3925-7230", isOfficer: true },
  { orgName: "중앙회 총무국", leaderName: "연경옥", leaderRole: "중앙회 총무", contact: "010-5550-8092", isOfficer: true },
  { orgName: "숭의동지회", leaderName: "강진", leaderRole: "회장 & 회원 단체", contact: "010-4850-2518", isOfficer: false },
  { orgName: "자유북한운동연합", leaderName: "박상학", leaderRole: "대표 & 회원 단체", contact: "010-9197-0216", isOfficer: false },
  { orgName: "서울사이버대학교 북한학", leaderName: "이지영", leaderRole: "교수 겸 학과장", contact: "010-6382-1066", isOfficer: false }
];

interface AboutSectionProps {
  greeting?: AboutGreeting;
  purpose?: AboutPurpose;
  orgCustom?: AboutOrgCustom;
  location?: AboutLocation;
}

export default function AboutSection({ greeting, purpose, orgCustom, location }: AboutSectionProps) {
  const [activeTab, setActiveTab] = useState<'greet' | 'purpose' | 'org' | 'location' | 'bylaws'>('greet');
  const [searchQuery, setSearchQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState<'all' | 'officer' | 'general'>('all');
  
  // Bylaws tab state
  const [bylawSearchQuery, setBylawSearchQuery] = useState('');
  const [selectedBylawChapterId, setSelectedBylawChapterId] = useState('ch1');

  const defaultGreeting: AboutGreeting = {
    title: "자유를 향한 용기, 이제는 대한민국의 희망으로",
    subTitle: "자유를 지키는 힘, 따뜻한 동행",
    boldPara: "존경하는 3만 4천여 북한이탈주민 여러분, 그리고 함께해 주시는 국민 여러분. 사단법인 북한이탈주민중앙회 홈페이지를 찾아주셔서 진심으로 환영합니다.",
    paras: [
      "우리는 목숨을 건 여정 끝에 자유를 찾았습니다. 그동안 대한민국 사회의 따뜻한 배려와 지원 속에서 우리 탈북민들은 각자의 자리에 뿌리를 내리며 성장해 왔습니다. 이제 우리는 정부의 지원에만 기대는 수동적인 존재가 아닙니다.",
      "북한이탈주민중앙회는 흩어져 있던 우리의 목소리를 하나로 모으는 든든한 구심점이 되겠습니다. 탈북민의 권익을 당당히 대변하고, 더 나아가 우리 사회에 봉사하고 공헌하는 '기여자'로서의 새로운 정체성을 확립하겠습니다.",
      "투명한 운영과 열린 소통으로 탈북민 사회의 진정한 통합을 이뤄내고, 한반도 평화와 통일의 마중물이 되겠습니다. 우리가 함께 만들어갈 당당한 미래에 아낌없는 지지와 성원을 부탁드립니다. 감사합니다."
    ],
    signerOrg: "사단법인 북한이탈주민중앙회",
    signerRole: "회장 및 임직원 일동"
  };

  const defaultPurpose: AboutPurpose = {
    missionTitle: "사단법인 북한이탈주민중앙회(북민회) 창립 취지문",
    missionText: "단순히 또 하나의 이탈단체들을 점진 추가하여 분산시키는 것이 아닙니다. 과거 연합 단체들의 체계적이지 못한 한계와 분산된 조언의 한계를 뼈저리게 인식하고, 전체 역량을 일관성 있게 규합하여 탈북민 스스로의 목소리를 대한민국 사회와 세계만방에 당당히 독립적으로 대변하는 공식 대표 교리 단체를 확립하는 데 창립 목적이 있습니다.",
    foundingDate: "3월 31일",
    foundingNotes: "창립 창구 간담회: 2월 16일 (국회의원회관 제9간담회의실)",
    val1Title: "수평적 자조 통합 (Integration)",
    val1Desc: "전국 산재하는 전문 탈북 단체들의 연대 수혈망을 일체 집약하여 내부 오해와 비토 갈등을 억제하고 상호 조율에 앞장섭니다.",
    val2Title: "당당한 자주 자립 (Independence)",
    val2Desc: "교육, 주거, 채용 교섭을 주도하여 임금 체불 등 법률 피해와 사기로부터 가정을 안정적으로 안전 보존 구제 해결합니다.",
    val3Title: "전산화 투명 회계 (Transparency)",
    val3Desc: "회원들의 아까운 기부금 단 1원도 헛되이 낭비되지 않도록 완벽에 가까운 전산 공시제와 외부 상설 세무 감사를 상시 보류합니다.",
    agendas: [
      "탈북민 스스로 돕는 '마중물' 활약 (생계 구원에 기대지 않는 일관된 능력 배양 및 세무 투명성 보존 확립)",
      "지역 및 분야별 단체 네트워크의 완전 통합 (분산된 창구를 하나로 통합하여 불통을 막고 내부 소모성 갈등 조율)",
      "정부·국회·국제사회 협력 창구 일원화 (탈북민 정착, 취업, 주거, 통일 구상 실효성 제안)",
      "미래 청년·차세대 리더십 양성 확보 (글로벌 인재와 화상 영어 등 첨단 정주 교육망을 구축하여 한반도 통일의 마중물 가동)",
      "북한 인권 실상 대변 및 안보 구상 조율 (정착 피해 구조와 강제북송 구제, 북한 실상을 직접 알리는 대변체 확립)"
    ]
  };

  const defaultOrgCustom: AboutOrgCustom = {
    mainDecisionOrg: "총회 (General Assembly)",
    auditorNames: "채신아 감사, 전주영 감사",
    boardNames: "이사회 (Board of Directors)",
    advisorNames: "허광일·도명학·박정오·안찬일·강철환",
    presidentName: "최정훈 (사령관)",
    secretaryName: "이은택 (대표)",
    dept1Name: "💼 조직본부",
    dept1Desc: "지회 연락망 & 회원 명부",
    dept2Name: "💰 기획재정부",
    dept2Desc: "회계 전산화 & 세무 실사",
    dept3Name: "🌐 대외협력부",
    dept3Desc: "지자체 협력 & 국제 외교",
    dept4Name: "🩹 복지지원부",
    dept4Desc: "일자리 상설 & 고충 제소"
  };

  const defaultLocation: AboutLocation = {
    address: "서울특별시 종로구 세종대로 209 (중앙회 빌딩 503호)",
    phone: "02-720-3400 (내선 1번: 사무국, 2번: 후원보호과)",
    email: "contact@bukmin.or.kr (회신 24시간 이내)",
    subwayLine3: "경복궁역 6번 출구에서 세종문화회관 방면 가로수길 도보 5분",
    subwayLine5: "광화문역 2번 출구 앞 주안대로 방면 횡단보도로 2분 이동",
    lat: "37.5759° N",
    lng: "126.9768° E"
  };

  const currentGreeting = greeting || defaultGreeting;
  const currentPurpose = purpose || defaultPurpose;
  const currentOrgCustom = orgCustom || defaultOrgCustom;
  const currentLocation = location || defaultLocation;

  const historyPoints = [
    { year: '2025', title: '사단법인 공식 출범 및 인가 완료' },
    { year: '2025', title: '전국 130여 개 탈북 단체 연합 협약 체결' },
    { year: '2026', title: '정착 지원 종합 포털 개설 및 정기 자원봉사 개시' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4" id="about-section-container">
      {/* Sub menu controls */}
      <div className="flex gap-1.5 justify-center mb-8 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 max-w-2xl mx-auto" id="about-tabs-container">
        {(['greet', 'purpose', 'org', 'location', 'bylaws'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              id={`about-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 md:py-2.5 px-1.5 md:px-4 rounded-xl text-xs sm:text-xs md:text-sm font-bold transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-100 font-extrabold'
                  : 'text-gray-500 hover:text-gray-950 hover:bg-gray-100/50'
              }`}
            >
              {tab === 'greet' && (
                <>
                  <Users className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-sky-600' : 'text-sky-400'}`} />
                  <span className="text-[10px] md:text-xs tracking-tight">인사말</span>
                </>
              )}
              {tab === 'purpose' && (
                <>
                  <Target className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-rose-600' : 'text-rose-400'}`} />
                  <span className="text-[10px] md:text-xs tracking-tight">비전/목적</span>
                </>
              )}
              {tab === 'org' && (
                <>
                  <Compass className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  <span className="text-[10px] md:text-xs tracking-tight">조직도</span>
                </>
              )}
              {tab === 'location' && (
                <>
                  <MapPin className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-amber-600' : 'text-amber-500'}`} />
                  <span className="text-[10px] md:text-xs tracking-tight">오시는길</span>
                </>
              )}
              {tab === 'bylaws' && (
                <>
                  <FileText className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-purple-600' : 'text-purple-400'}`} />
                  <span className="text-[10px] md:text-xs tracking-tight">단체정관</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Tabs display */}
      {activeTab === 'greet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 relative">
            <div className="glass-card p-4 rounded-2xl aspect-square flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute inset-0 bg-blue-50/10 mix-blend-overlay group-hover:scale-105 transition-transform duration-500"></div>
              {/* Decorative Glass Graphic */}
              <div className="text-[120px] font-black text-blue-100/30 select-none leading-none absolute -top-8 -left-2 font-mono">
                VISION
              </div>
              
              <div className="z-10 mt-auto bg-white/80 backdrop-blur-md p-6 rounded-xl border border-white/40 shadow-sm">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">
                  사단법인 북한이탈주민중앙회
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  자유를 지키는 힘, 따뜻한 동행
                </h3>
                <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                  존엄한 시민으로서 대한민국 사회 전반에 걸쳐 영향력을 발휘하고 신뢰받는 통일 평화 리더십을 육성합니다.
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/60 border border-gray-100 p-4 rounded-xl shadow-xs">
                <div className="text-2xl font-extrabold text-blue-600">34,000+</div>
                <div className="text-xs text-gray-400 font-medium">국내 탈북민 인구</div>
              </div>
              <div className="bg-white/60 border border-gray-100 p-4 rounded-xl shadow-xs">
                <div className="text-2xl font-extrabold text-teal-600">130+</div>
                <div className="text-xs text-gray-400 font-medium font-sans">협력 단체 네트워크</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/40 border border-gray-100/80 p-6 md:p-8 rounded-2xl shadow-xs space-y-6">
              <div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">인사말</span>
                <h3 className="text-2xl font-bold text-gray-900 mt-2.5">
                  {currentGreeting.title}
                </h3>
              </div>

              <div className="text-gray-600 text-sm leading-relaxed space-y-4">
                {currentGreeting.boldPara && (
                  <p className="font-bold text-gray-800">
                    {currentGreeting.boldPara}
                  </p>
                )}
                {currentGreeting.paras.map((p, pIdx) => (
                  <p key={pIdx}>
                    {p}
                  </p>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    북민
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">{currentGreeting.signerOrg}</div>
                    <div className="text-sm font-bold text-gray-950">{currentGreeting.signerRole}</div>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-gray-400 italic">
                  Bukminhoe Association &copy; 2026
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'purpose' && (
        <div className="space-y-10">
          {/* Mission Description with Beautiful Styling */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-8 md:p-10 rounded-3xl text-white relative overflow-hidden shadow-lg border border-blue-600/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent)]"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
            <div className="relative z-10 max-w-4xl space-y-4">
              <span className="text-[10px] uppercase font-black tracking-widest bg-white/20 px-3 py-1 rounded-full text-white">FOUNDING PRINCIPLE</span>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-snug font-sans">
                {currentPurpose.missionTitle}
              </h3>
              <p className="text-blue-50 text-xs md:text-sm leading-relaxed font-medium">
                "{currentPurpose.missionText}"
              </p>
              <div className="pt-2 flex flex-wrap gap-3.5 text-xs font-bold text-white/95">
                <span className="flex items-center gap-1.5 bg-black/20 px-3.5 py-2 rounded-xl border border-white/10">📅 공식 창립일: {currentPurpose.foundingDate}</span>
                <span className="flex items-center gap-1.5 bg-black/20 px-3.5 py-2 rounded-xl border border-white/10">🏛️ {currentPurpose.foundingNotes}</span>
              </div>
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto space-y-2 mt-4">
            <h3 className="text-xl font-bold text-gray-900">3대 가치 이행 체계</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              우리는 사회적 수급권자인 '생계형 일탈민'의 정체성을 탈피하고, 스스로 돕는 상생적 '기여자'로서 자랑스럽게 비상합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-center space-y-4 relative overflow-hidden transition-all hover:scale-[1.01] hover:shadow-md">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto border border-blue-100/50">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900">{currentPurpose.val1Title}</h4>
              <p className="text-gray-500 text-xs leading-relaxed">
                {currentPurpose.val1Desc}
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-center space-y-4 relative overflow-hidden transition-all hover:scale-[1.01] hover:shadow-md">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mx-auto border border-teal-100/50">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900">{currentPurpose.val2Title}</h4>
              <p className="text-gray-500 text-xs leading-relaxed">
                {currentPurpose.val2Desc}
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-center space-y-4 relative overflow-hidden transition-all hover:scale-[1.01] hover:shadow-md">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto border border-emerald-100/50">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900">{currentPurpose.val3Title}</h4>
              <p className="text-gray-500 text-xs leading-relaxed">
                {currentPurpose.val3Desc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Mission Statements Panel with User-requested values */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-bold text-gray-950 font-sans">중앙회 입지적 5대 실천 과제</h4>
              </div>

              <div className="space-y-4 text-xs">
                {currentPurpose.agendas.map((agenda, index) => {
                  const colors = ["bg-blue-100 text-blue-700", "bg-teal-100 text-teal-700", "bg-indigo-100 text-indigo-700", "bg-amber-100 text-amber-700", "bg-violet-100 text-violet-700"];
                  const color = colors[index % colors.length];
                  const titleAndDesc = agenda.split("(");
                  const titleStr = titleAndDesc[0].trim();
                  const descStr = titleAndDesc[1] ? titleAndDesc[1].replace(")", "").trim() : "";

                  return (
                    <div key={index} className="flex items-start gap-3 bg-slate-50/70 p-3 rounded-xl border border-gray-100">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] italic ${color}`}>0{index + 1}</span>
                      <div>
                        <div className="font-bold text-gray-900">{titleStr}</div>
                        {descStr && <p className="text-gray-500 mt-0.5 leading-relaxed">{descStr}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logo CI Symbol Meaning */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Award className="w-5 h-5 text-teal-600" /> 북민회 공식 상징(CI) 휘장의 의미
                </h4>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50 p-4 rounded-xl border border-gray-100 mb-6">
                  <AssociationLogo className="w-20 h-20 shrink-0" theme="color" showText={false} />
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest leading-none">Official Logo Identity</div>
                    <div className="text-sm font-bold text-gray-950 font-sans">사단법인 북한이탈주민중앙회 휘장</div>
                    <p className="text-[11px] text-gray-500 leading-normal">
                      모두가 주인이 되어 서로 돕고 화합하는 의지를 현대적 미학으로 형상화했습니다.
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-2.5 pb-2.5 border-b border-gray-100">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
                    <div>
                      <div className="text-xs font-bold text-gray-950">배경의 태양 (Sun)</div>
                      <p className="text-[11px] text-gray-400 leading-normal mt-0.5">
                        따뜻하게 길을 비추는 안정적인 등대를 상징하며, 미래 통일 한국의 번영을 의미합니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pb-2.5 border-b border-gray-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                    <div>
                      <div className="text-xs font-bold text-gray-950">초록색 인물 (Helper)</div>
                      <p className="text-[11px] text-gray-400 leading-normal mt-0.5">
                        먼저 자립에 확실히 성공한 선배 정착인을 상징하며 용기를 불어넣어 줍니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-stone-800 shrink-0 mt-1.5"></span>
                    <div>
                      <div className="text-xs font-bold text-gray-950">검은색 인물 (Climber)</div>
                      <p className="text-[11px] text-gray-400 leading-normal mt-0.5">
                        자유의 요람에 귀순하여 자립하고자 용기 내어 동행하는 신규 전입 탈북 동포를 의미합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'org' && (
        <div className="space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/50">Bukminhoe Secretariat</span>
            <h3 className="text-xl font-bold text-gray-900 mt-1">임원 및 조직 구조도</h3>
            <p className="text-gray-500 text-xs">수평적 피드백과 완전한 투명 분배를 실천하기 위한 민주적 이사회 사무 조직망입니다.</p>
          </div>

          <div className="flex flex-col items-center space-y-4 font-sans text-sm bg-white p-8 rounded-3xl border border-gray-200/80 shadow-[0_4px_22px_rgba(0,0,0,0.015)]">
            {/* Board / President Layer */}
            <div className="glass-card px-8 py-3 rounded-2xl border border-blue-300 bg-blue-50/50 shadow-xs text-center">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-blue-600">최고 의사 결정 상임 기구</div>
              <div className="font-extrabold text-gray-900 text-sm">{currentOrgCustom.mainDecisionOrg}</div>
            </div>

            <div className="w-0.5 h-6 bg-gray-200"></div>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-8 items-center">
              <div className="bg-slate-50 border border-gray-200 px-5 py-2.5 rounded-xl text-center text-xs text-gray-600 font-bold">
                감사 (Auditor)
                <div className="text-[9px] text-gray-400 mt-0.5 font-normal">{currentOrgCustom.auditorNames}</div>
              </div>
              <div className="w-0.5 h-4 sm:w-10 sm:h-0.5 bg-gray-200"></div>
              <div className="bg-white px-7 py-3 rounded-xl border border-gray-300 text-center font-extrabold text-gray-900 shadow-3xs">
                {currentOrgCustom.boardNames}
              </div>
              <div className="w-0.5 h-4 sm:w-10 sm:h-0.5 bg-gray-200"></div>
              <div className="bg-slate-50 border border-gray-200 px-5 py-2.5 rounded-xl text-center text-xs text-gray-600 font-bold">
                상임 고문 (Advisors)
                <div className="text-[9px] text-gray-400 mt-0.5 font-normal">{currentOrgCustom.advisorNames}</div>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-gray-200"></div>

            <div className="bg-white px-10 py-4.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 text-center shadow-xs">
              <div className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest mb-1">상임임원회 의장</div>
              <div className="font-black text-gray-950 text-base">중앙회 회장 {currentOrgCustom.presidentName}</div>
            </div>

            <div className="w-0.5 h-6 bg-gray-200"></div>

            <div className="bg-slate-50 border border-slate-200 px-8 py-3 rounded-xl text-center text-xs font-extrabold text-gray-800">
              사무총장 {currentOrgCustom.secretaryName}
            </div>

            <div className="w-full max-w-3xl border-t border-dashed border-gray-200 pt-6 mt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50/50 border border-gray-200/50 p-3.5 rounded-2xl text-center">
                  <div className="text-xs font-bold text-gray-900 flex items-center justify-center gap-1">{currentOrgCustom.dept1Name}</div>
                  <div className="text-[9px] text-gray-400 mt-1">{currentOrgCustom.dept1Desc}</div>
                </div>
                <div className="bg-slate-50/50 border border-gray-200/50 p-3.5 rounded-2xl text-center">
                  <div className="text-xs font-bold text-gray-900 flex items-center justify-center gap-1">{currentOrgCustom.dept2Name}</div>
                  <div className="text-[9px] text-gray-400 mt-1">{currentOrgCustom.dept2Desc}</div>
                </div>
                <div className="bg-slate-50/50 border border-gray-200/50 p-3.5 rounded-2xl text-center">
                  <div className="text-xs font-bold text-gray-900 flex items-center justify-center gap-1">{currentOrgCustom.dept3Name}</div>
                  <div className="text-[9px] text-gray-400 mt-1">{currentOrgCustom.dept3Desc}</div>
                </div>
                <div className="bg-slate-50/50 border border-gray-200/50 p-3.5 rounded-2xl text-center">
                  <div className="text-xs font-bold text-gray-900 flex items-center justify-center gap-1">{currentOrgCustom.dept4Name}</div>
                  <div className="text-[9px] text-gray-400 mt-1">{currentOrgCustom.dept4Desc}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Searchable Member Directory */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-[0_4px_22px_rgba(0,0,0,0.015)] space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h4 className="text-base font-extrabold text-gray-950 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>중앙회 참여 단체명 및 임원진 명부</span>
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">전국 지부 및 28개 통합 참여 단체장과 상임 직책 상시 통신 데이터입니다.</p>
              </div>

              {/* Segmented control filters */}
              <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-center">
                <button
                  type="button"
                  onClick={() => setOrgFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    orgFilter === 'all' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  전체보기
                </button>
                <button
                  type="button"
                  onClick={() => setOrgFilter('officer')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    orgFilter === 'officer' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  중앙회 임직원 / 고문
                </button>
                <button
                  type="button"
                  onClick={() => setOrgFilter('general')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    orgFilter === 'general' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  기타 통합 단체
                </button>
              </div>
            </div>

            {/* Quick Search Panel */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 font-bold focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400"
                placeholder="찾으시는 단체 명칭, 대표 위원의 성명, 또는 직책 키워드를 기입해 주십시오..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Directory Cards Output */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgMembersList
                .filter(m => {
                  const matchesSearch = 
                    m.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.leaderRole.toLowerCase().includes(searchQuery.toLowerCase());
                  if (orgFilter === 'officer') return matchesSearch && m.isOfficer;
                  if (orgFilter === 'general') return matchesSearch && !m.isOfficer;
                  return matchesSearch;
                })
                .map((member, idx) => {
                  const isTelEmpty = member.contact.includes('협정');
                  return (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all hover:-translate-y-0.5 hover:shadow-xs hover:border-gray-300 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-1.5">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            member.isOfficer ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-500 border border-gray-150'
                          }`}>
                            {member.isOfficer ? '중앙회 관리진' : '참여 단체'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">ID: B-{(101+idx)}</span>
                        </div>

                        <div>
                          <h5 className="text-xs font-black text-gray-950 font-sans line-clamp-1">{member.orgName}</h5>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs font-extrabold text-blue-700">{member.leaderName}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">{member.leaderRole}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                        <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1 font-semibold">
                          📞 {member.contact}
                        </div>
                        
                        {!isTelEmpty ? (
                          <a 
                            href={`tel:${member.contact}`}
                            className="bg-teal-50 hover:bg-teal-100/70 border border-teal-200/55 p-1.5 rounded-lg text-teal-700 transition-colors flex items-center gap-1 text-[10px] font-extrabold cursor-pointer"
                            title={`${member.leaderName} 대표에게 바로 다이얼 연결`}
                          >
                            <Smartphone className="w-3.5 h-3.5" /> 통화
                          </a>
                        ) : (
                          <span className="text-[9px] text-gray-400 italic">협의중</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Empty lookup state */}
            {orgMembersList.filter(m => {
              const matchesSearch = 
                m.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.leaderRole.toLowerCase().includes(searchQuery.toLowerCase());
              if (orgFilter === 'officer') return matchesSearch && m.isOfficer;
              if (orgFilter === 'general') return matchesSearch && !m.isOfficer;
              return matchesSearch;
            }).length === 0 && (
              <div className="py-12 text-center text-gray-400 text-xs">
                검색 질의어에 매칭되는 조직 단체 또는 대표 성명이 존재하지 않습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'location' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between">
            {/* Beautiful Graphic Map Simulation since it is an IFrame without standard Google Map Keys */}
            <div className="glass-card p-4 rounded-2xl bg-white border border-gray-100 flex-1 min-h-[300px] flex flex-col relative overflow-hidden bg-dot-pattern">
              <div className="absolute inset-0 bg-transparent flex flex-col justify-center items-center pointer-events-none">
                {/* Visualizing 3D looking clean map simulation */}
                <div className="w-72 h-72 rounded-full bg-blue-100/30 blur-2xl absolute -top-10 -left-10"></div>
                <div className="w-80 h-80 rounded-full bg-teal-100/20 blur-3xl absolute -bottom-10 -right-10"></div>
              </div>

              {/* simulated map grids */}
              <div className="relative z-10 flex-1 border border-gray-100/70 rounded-xl bg-slate-50/60 p-6 flex flex-col justify-between overflow-hidden">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-200/50"></div>
                <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-blue-200/50"></div>
                <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-emerald-200/40"></div>

                {/* Park / river simulated layout */}
                <div className="absolute bottom-4 left-6 right-6 h-12 bg-cyan-100/50 rounded-xl border border-cyan-200/40 flex items-center justify-center font-bold text-[10px] text-cyan-600 tracking-widest font-mono">
                  HAN RIVER PARKWAY
                </div>

                <div className="relative z-20 mx-auto my-auto text-center space-y-3">
                  <div className="w-12 h-12 bg-white/90 rounded-full shadow-md border border-red-200 flex items-center justify-center mx-auto animate-pulse">
                    <MapPin className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">HQ LOCATION</span>
                    <h5 className="text-sm font-bold text-gray-900">사단법인 북한이탈주민중앙회</h5>
                    <p className="text-[11px] text-gray-500 mt-1">{currentLocation.address}</p>
                  </div>
                </div>

                <div className="relative z-10 flex justify-between items-center bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-gray-100 shadow-xs mt-auto">
                  <span className="text-[11px] text-gray-500 font-medium font-sans">좌표: {currentLocation.lat}, {currentLocation.lng}</span>
                  <a
                    href="https://map.kakao.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    <Navigation className="w-3.5 h-3.5" /> 외부맵으로 보기
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="bg-white/40 border border-gray-100 p-6 rounded-2xl shadow-xs space-y-6 flex-1">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" /> 중앙 사무소 기본 정보
              </h4>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gray-50 text-gray-500 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-semibold">도로명 주소</div>
                    <div className="text-gray-800 font-medium text-xs mt-0.5">{currentLocation.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gray-50 text-gray-500 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-semibold">대표 전화번호</div>
                    <div className="text-gray-800 font-medium text-xs mt-0.5">{currentLocation.phone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gray-50 text-gray-500 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-semibold">공식 이메일</div>
                    <div className="text-gray-800 font-medium text-xs mt-0.5">{currentLocation.email}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 space-y-4">
                <h5 className="text-xs font-bold text-gray-900">교통 이용 수단 상세안내</h5>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-sans font-extrabold mt-0.5">3</span>
                    <div>
                      <div className="text-xs font-bold text-gray-900">지하철 3호선 연계</div>
                      <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">{currentLocation.subwayLine3}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-blue-500 text-white text-[10px] font-sans font-extrabold mt-0.5">5</span>
                    <div>
                      <div className="text-xs font-bold text-gray-900">지하철 5호선 연계</div>
                      <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">{currentLocation.subwayLine5}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bylaws' && (
        <div className="space-y-6 text-left" id="bylaws-tab-wrapper">
          {/* Header Banner - White Base, Accent Blue, glass border */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-gray-200/80 bg-white/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] sm:text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-widest leading-none block w-max mb-2">
                Articles of Association
              </span>
              <h3 className="text-xl md:text-2xl font-extrabold text-gray-950 font-sans tracking-tight">
                사단법인 북한이탈주민중앙회 정관 (정관 전문)
              </h3>
              <p className="text-xs text-gray-400 mt-1 font-medium font-sans">
                자유민주적 기본질서 확립과 공익 보호를 지향하는 사단법인 북민회의 투명하고 투철한 자치 규약 전문 공시입니다.
              </p>
            </div>
            
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-205 border border-gray-200 text-gray-700 hover:text-gray-950 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 self-start md:self-center"
              title="정관 인쇄 미리보기 및 PDF 저장"
            >
              <Printer className="w-4 h-4" /> 정관 인쇄 / PDF 저장
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Interactive Navigation Rail */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-3xs space-y-4 sticky top-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black tracking-widest text-gray-400 block uppercase">조문 내용 검색</span>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400"
                      placeholder="정관 조문 검색 (예: 회원, 감사, 총회)..."
                      value={bylawSearchQuery}
                      onChange={(e) => setBylawSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-black tracking-widest text-gray-400 block uppercase mb-2">장별 바로가기 목차</span>
                  <div className="space-y-1">
                    {bylawsData.map((chapter) => {
                      const isSelected = selectedBylawChapterId === chapter.id && !bylawSearchQuery;
                      return (
                        <button
                          key={chapter.id}
                          onClick={() => {
                            setSelectedBylawChapterId(chapter.id);
                            setBylawSearchQuery(''); // clear search when clicking a chapter
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 text-blue-700 border border-blue-100 font-extrabold'
                              : 'text-gray-500 hover:text-gray-900 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{chapter.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 shrink-0 select-none">
                            {chapter.articles.length}개 조문
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Attachments card */}
                <div className="border-t border-slate-105 pt-3.5 bg-slate-50/50 -mx-5 -mb-5 p-5 rounded-b-2xl border-b border-gray-100">
                  <div className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">
                    {bylawsAttachments.title}
                  </div>
                  <div className="space-y-2">
                    {bylawsAttachments.properties.map((prop, pId) => (
                      <div key={pId} className="flex justify-between items-center text-[10.5px]">
                        <span className="text-gray-500 font-medium">{prop.label}</span>
                        <span className="text-gray-900 font-bold bg-white px-2 py-0.5 border border-slate-200 rounded text-[9.5px]">
                          {prop.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Selected Chapter / Search Results Panel */}
            <div className="lg:col-span-8 space-y-4">
              {bylawSearchQuery.trim() ? (
                // SEARCH RESULTS RENDER
                <div className="space-y-4">
                  <div className="bg-blue-50 text-blue-700 border border-blue-100/50 p-4 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-bold">
                      🔍 정관 내부 키워드 <strong>"{bylawSearchQuery}"</strong> 검색 결과입니다.
                    </span>
                    <button
                      onClick={() => setBylawSearchQuery('')}
                      className="text-xs text-blue-700 underline font-extrabold cursor-pointer hover:text-blue-900"
                    >
                      검색 해제
                    </button>
                  </div>

                  {bylawsData.flatMap(ch => ch.articles.map(art => ({ ...art, chapterTitle: ch.title })))
                    .filter(art => art.title.includes(bylawSearchQuery) || art.content.includes(bylawSearchQuery))
                    .length === 0 ? (
                      <div className="py-20 text-center bg-white border border-gray-200 rounded-3xl text-gray-400 text-xs">
                        입력된 검색어와 부비 일치하는 조약 또는 한자가 정관 전문에 기록되어 있지 않습니다.
                      </div>
                    ) : (
                      bylawsData.flatMap(ch => ch.articles.map(art => ({ ...art, chapterTitle: ch.title })))
                        .filter(art => art.title.includes(bylawSearchQuery) || art.content.includes(bylawSearchQuery))
                        .map((art, idx) => (
                          <div 
                            key={idx}
                            className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200/80 hover:border-gray-300 transition-all shadow-3xs"
                          >
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                              <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-black">
                                {art.chapterTitle} &gt; {art.num}
                              </span>
                              <span className="text-xs font-extrabold text-blue-700">
                                {art.title}
                              </span>
                            </div>
                            <p className="text-xs text-gray-800 leading-relaxed font-sans whitespace-pre-line text-left">
                              {art.content}
                            </p>
                          </div>
                        ))
                    )}
                </div>
              ) : (
                // REGULAR CHAPTER RENDER
                <div className="space-y-4">
                  {bylawsData
                    .filter(ch => ch.id === selectedBylawChapterId)
                    .map((chapter) => (
                      <div key={chapter.id} className="space-y-4">
                        <div className="bg-slate-100/60 border border-slate-200 px-5 py-3 rounded-2xl flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 font-sans tracking-wide">
                            {chapter.title} (Articles and Provisions)
                          </span>
                          <span className="text-[10.5px] font-bold text-gray-450 font-mono">
                            사단법인 북한이탈주민중앙회
                          </span>
                        </div>

                        {chapter.articles.map((art, artId) => (
                          <div 
                            key={artId}
                            className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200/80 hover:border-gray-200 hover:shadow-xs transition-all shadow-3xs"
                          >
                            <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-3">
                              <span className="text-xs font-black text-blue-900 flex items-center gap-1.5 font-sans">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                {art.num} 【{art.title}】
                              </span>
                              <span className="text-[10px] text-gray-400 font-semibold font-sans uppercase">
                                Bukminhoe bylaws
                              </span>
                            </div>
                            <p className="text-xs text-gray-800 leading-relaxed font-sans whitespace-pre-line text-left">
                              {art.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
