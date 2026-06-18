import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { supabase } from '../supabase';

interface Partner {
  id: string;
  name: string;
  engName: string;
  desc: string;
  color: string;
  siteUrl: string;
  logoUrl: string; // Real image-compatible source
}

// Custom-crafted precise high-resolution vector emblem image sources
const TAEGEUK_EMBLEM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1.5"/><path d="M50,15 A17.5,17.5 0 0,0 50,50 A17.5,17.5 0 0,1 50,85 A35,35 0 0,1 50,15" fill="%23cd2e3a"/><path d="M50,15 A17.5,17.5 0 0,0 50,50 A17.5,17.5 0 0,1 50,85 A35,35 0 0,0 50,15" fill="%230047a0"/></svg>`;

const HANA_LEAF_EMBLEM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1.5"/><path d="M32,54 C32,36 45,30 50,44 C55,30 68,36 68,54 C68,68 50,78 50,78 C50,78 32,68 32,54 Z" fill="%2310b981"/><path d="M41,54 C41,44 48,41 50,48 C52,41 59,44 59,54 C59,62 50,69 50,69 C50,69 41,62 41,54 Z" fill="%2334d399"/></svg>`;

const SEOUL_TRI_EMBLEM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1.5"/><circle cx="50" cy="34" r="10" fill="%23e11d48"/><path d="M26,62 Q36,48 46,58 T66,53 Q76,48 80,62 Q70,72 50,72 T26,62 Z" fill="%232563eb"/><path d="M28,68 Q44,53 54,66 T74,58" stroke="%2316a34a" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;

const REDCROSS_EMBLEM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ffffff" stroke="%233b82f6" stroke-width="2.5"/><path d="M41,25 H59 V41 H75 V59 H59 V75 H41 V59 H25 V41 H41 Z" fill="%23dc2626"/></svg>`;

const NKDB_EYE_EMBLEM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1.5"/><path d="M25,50 Q50,22 75,50 Q50,78 25,50 Z" fill="none" stroke="%23d97706" stroke-width="3"/><circle cx="50" cy="50" r="13" fill="%231e3a8a"/></svg>`;

const KINU_GRID_EMBLEM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1.5"/><circle cx="50" cy="50" r="26" fill="none" stroke="%230d9488" stroke-width="2.5"/><line x1="22" y1="50" x2="78" y2="50" stroke="%230d9488" stroke-width="1.5"/><line x1="50" y1="22" x2="50" y2="78" stroke="%230d9488" stroke-width="1.5"/></svg>`;


const PARTNERS_DATA: Partner[] = [
  {
    id: 'p-1',
    name: '통일부',
    engName: 'Ministry of Unification',
    desc: '평화 체제 구축 및 남북 대화와 교류 협력 총괄',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    siteUrl: 'https://www.unikorea.go.kr',
    logoUrl: TAEGEUK_EMBLEM
  },
  {
    id: 'p-2',
    name: '남북하나재단',
    engName: 'Korea Hana Foundation',
    desc: '탈북민의 정착 생활 정착 안전망 및 취업·장학 지원',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    siteUrl: 'https://www.koreahana.or.kr',
    logoUrl: HANA_LEAF_EMBLEM
  },
  {
    id: 'p-3',
    name: '민주평화통일자문회의',
    engName: 'NUAC',
    desc: '평화통일 정책의 수립에 관한 대통령 직속 헌법자문기구',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    siteUrl: 'https://www.nuac.go.kr',
    logoUrl: TAEGEUK_EMBLEM
  },
  {
    id: 'p-4',
    name: '서울특별시청',
    engName: 'Seoul Metropolitan Gov',
    desc: '수도권 거주 이탈주민 지자체 동행 맞춤 긴급정착 보살핌',
    color: 'bg-rose-50 text-rose-600 border-rose-200',
    siteUrl: 'https://www.seoul.go.kr',
    logoUrl: SEOUL_TRI_EMBLEM
  },
  {
    id: 'p-5',
    name: '대한적십자사',
    engName: 'Korean Red Cross',
    desc: '남북 이산가족 상봉 인도적 교류 및 긴급 생태계 재건 지원',
    color: 'bg-red-50 text-red-600 border-red-200',
    siteUrl: 'https://www.redcross.or.kr',
    logoUrl: REDCROSS_EMBLEM
  },
  {
    id: 'p-6',
    name: '북한인권정보센터 (NKDB)',
    engName: 'Database Center for NK Human Rights',
    desc: '북한 인권 침해 사례 아카이빙 및 피해자 트라우마 치유',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    siteUrl: 'https://www.nkdb.org',
    logoUrl: NKDB_EYE_EMBLEM
  },
  {
    id: 'p-7',
    name: '통일연구원',
    engName: 'KINU',
    desc: '남북한 관계의 구조적 분석과 통일 미래 비전 설계 씽크탱크',
    color: 'bg-teal-50 text-teal-600 border-teal-200',
    siteUrl: 'https://www.kinu.or.kr',
    logoUrl: KINU_GRID_EMBLEM
  },
  {
    id: 'p-8',
    name: '행정안전부 이북5도위원회',
    engName: 'Committee for the 5 Provinces of North Korea',
    desc: '미수복 영토에 관한 정체성 전수 및 실향민 복리 증진 실현',
    color: 'bg-sky-50 text-sky-600 border-sky-200',
    siteUrl: 'https://www.ibuk5do.go.kr',
    logoUrl: TAEGEUK_EMBLEM
  }
];

export const PartnerSlide: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>(PARTNERS_DATA);

  // Poll real backend partners database list live
  const fetchPartners = async () => {
    try {
      // First try to fetch directly from Supabase for real-time live synchronization
      const { data: sbData, error: sbError } = await supabase.from('partners').select('*').order('name', { ascending: true });
      if (!sbError && sbData && sbData.length > 0) {
        setPartners(sbData);
        return;
      }
    } catch (sbErr) {
      console.warn("[Partners Supabase Fetch Warn] Fallback to SQLite:", sbErr);
    }

    try {
      const res = await fetch("/api/partners");
      const data = await res.json();
      if (data && data.success && Array.isArray(data.partners) && data.partners.length > 0) {
        setPartners(data.partners);
      }
    } catch (e) {
      console.warn("[Partners Network Fetch Warn]: Fallback used", e);
    }
  };

  useEffect(() => {
    fetchPartners();

    // Listen to custom custom-event on the window to dynamically refresh partners slider
    const handleRefresh = () => {
      fetchPartners();
    };
    window.addEventListener("refresh-partners", handleRefresh);
    return () => {
      window.removeEventListener("refresh-partners", handleRefresh);
    };
  }, []);

  // Clear double elements list to achieve seamless loop scrolling marquee
  const doublePartners = [...partners, ...partners];

  return (
    <section className="py-10 bg-white overflow-hidden relative" id="partner-logos-viewport">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div className="border-l-4 border-l-slate-900 pl-3">
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#1e293b]/70 block uppercase font-mono">
              SOLIDARITY & PARTNERSHIP
            </span>
            <h3 className="text-lg sm:text-xl font-black text-gray-950 tracking-tight mt-1">
              정착 협력 및 유관 정책 파트너
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">
              북한이탈주민중앙회와 함께 당당한 내일을 열어가는 협력 단체 및 유관 정부 기관입니다.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full shrink-0 self-start md:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            마우스 오버 시 일시 정지
          </div>
        </div>
      </div>

      {/* Marquee Container outer hidden boundary */}
      <div className="relative w-full overflow-hidden py-2 select-none">
        {/* Left shade gradient cover - transitioned perfectly to white background */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white via-white/70 to-transparent z-40 pointer-events-none" />
        
        {/* Right shade gradient cover - transitioned perfectly to white background */}
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white via-white/70 to-transparent z-40 pointer-events-none" />

        {/* The Scrolling Row */}
        <div className="flex animate-marquee hover:[animation-play-state:paused] pointer-events-auto">
          {doublePartners.map((p, idx) => {
            return (
              <a
                key={`${p.id}-${idx}`}
                href={p.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`${p.name} 공식 홈페이지 이동 (새창)`}
                className="mx-2 flex-shrink-0 px-4 py-2 rounded-full border border-gray-100 hover:border-blue-400 hover:shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2 group cursor-pointer bg-white"
              >
                {/* Real Image Tag representation of the official agency logo */}
                <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  <img 
                    src={p.logoUrl} 
                    alt={`${p.name} 공식 로고`}
                    className="w-full h-full object-contain pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <span className="font-extrabold text-xs text-gray-700 tracking-tight group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </span>
                </div>
                <ExternalLink className="w-2.5 h-2.5 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
