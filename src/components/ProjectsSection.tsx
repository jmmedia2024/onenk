import React, { useState } from 'react';
import { ShieldAlert, Landmark, Sparkles, GraduationCap, HeartHandshake, Smile, CheckCircle } from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectsSectionProps {
  projects?: ProjectItem[];
}

export default function ProjectsSection({ projects: externalProjects }: ProjectsSectionProps) {
  const [activeProject, setActiveProject] = useState<number>(0);

  const defaultLocalProjects: ProjectItem[] = [
    {
      title: '권익 보호 사업',
      subtitle: '탈북민의 권익을 당당히 대변하고 보호합니다.',
      achievements: [
        '정부 부처 및 국회 보훈/통일 복지 협의 창구 역할 수행',
        '무료 법률 지원 전문자문인단 연계 (변호사 15인 상시 대기)',
        '사라지는 소외 세대를 구제하기 위한 위기 탈북 가구 상시 전수조사',
        '인권 침해 유발 규정 모니터링 및 시정 권고안 건의'
      ],
      detail: '생명을 건 자유의 여정 이후에도 여러 규정과 제도로 어려움을 겪는 탈북민들을 위해 굳건한 옹호막이 됩니다. 전문적 자문과 발 빠른 구조망을 결합해 한 분도 외면받지 않도록 법률 및 인권 지원을 적극 지원합니다.'
    },
    {
      title: '정착 지원 사업',
      subtitle: '수혜의 시선을 넘어, 사회의 자립한 일원으로 통일 인재 성장을 돕습니다.',
      achievements: [
        '대학 진학 청년 및 청소년 특별 장학 지원 프로그램 도입 (연 100명 수혜)',
        '주요 상주 업종 채용 연계형 정착 인턴십 과정 주최',
        '선후배 정주 멘토링 결성으로 지역사회 고립 예방 및 정서 안착 지원',
        '창업 자금 우대 조치 연계 및 세무 멘토링 컨설팅'
      ],
      detail: '경제적 고비를 온전히 독립적인 터전으로 변혁하는 평생 정주 매니지먼트입니다. 인성 장학생 선발 및 차세대 커리어 조율을 통해 대한민국의 소중한 인적 자산을 지속적으로 도출하고 있습니다.'
    },
    {
      title: '자원봉사 활동',
      subtitle: '받았던 도움을 더 큰 나눔으로, 든든한 사회 기여자 정체성을 실현합니다.',
      achievements: [
        '중앙회 소속 "통일 하나눔 봉사단" 월 2회 결성 활동',
        '취약 계층 밀집 단지 배식 지원 및 연탄 보급 희망 봉사',
        '지역 주민과의 소통 증진 및 다문화 교배 행사 주최',
        '수재민 복구 및 환경 정화 등 공동체 공헌 프로그램 기획'
      ],
      detail: '통일 하나눔 봉사단은 우리 탈북민이 "도움을 받는 대상"에서 벗어나 "우리의 힘으로 우리 사회를 지킨다"는 나눔의 주체 정체성을 갖게 만드는 소중한 등대입니다. 매달 실천적인 구제 활동을 통해 주체적인 사랑을 돌려드립니다.'
    }
  ];

  const projects = externalProjects || defaultLocalProjects;

  const getIconForProject = (title: string, index: number) => {
    if (title.includes('권익') || index === 0) return <ShieldAlert className="w-6 h-6 text-blue-600" />;
    if (title.includes('정착') || title.includes('교육') || index === 1) return <GraduationCap className="w-6 h-6 text-teal-600" />;
    if (title.includes('봉사') || title.includes('나눔') || index === 2) return <HeartHandshake className="w-6 h-6 text-emerald-600" />;
    return <Sparkles className="w-6 h-6 text-indigo-600" />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4" id="projects-section-container">
      {/* Top Description */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="max-w-xl">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full">
            주요 사업 영역 (Core Programs)
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mt-2.5">
            자조를 넘어 나눔의 주역으로 서다
          </h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            탈북민들은 더 이상 일방적 수혜의 상징이 아닙니다. 사단법인 북한이탈주민중앙회는 권익을 다지는 한편, 
            지역사회 정착과 기여 지향 봉사로 건강하고 당당한 통일 미래의 일원을 일구어 나갑니다.
          </p>
        </div>

        {/* Counter Widget */}
        <div className="glass-card px-6 py-4 rounded-2xl flex items-center gap-4 border border-blue-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Smile className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold tracking-wider">누적 총 나눔 시간</div>
            <div className="text-xl font-black text-gray-950 font-mono">12,480 시간+</div>
          </div>
        </div>
      </div>

      {/* Grid of Projects Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Project Picker Column */}
        <div className="lg:col-span-4 space-y-3">
          {projects.map((proj, idx) => (
            <button
              key={idx}
              id={`project-btn-${idx}`}
              onClick={() => setActiveProject(idx)}
              className={`w-full text-left p-5 rounded-2xl transition-all border ${
                activeProject === idx
                  ? 'bg-white border-blue-400 shadow-md translate-x-1'
                  : 'bg-white/40 border-gray-100 hover:border-gray-300 hover:bg-white/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  activeProject === idx 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {getIconForProject(proj.title, idx)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{proj.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{proj.subtitle}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Detailed Canvas */}
        <div className="lg:col-span-8">
          <div className="glass-card p-6 md:p-8 rounded-2xl border border-gray-100 relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-gray-400">DETAIL VIEW</span>
            
            <div className="mt-4">
              <h3 className="text-xl font-extrabold text-blue-900">
                {projects[activeProject].title}
              </h3>
              <p className="text-xs text-blue-600 font-semibold mt-1">
                {projects[activeProject].subtitle}
              </p>
              
              <p className="text-xs text-gray-600 leading-relaxed mt-4 pt-4 border-t border-gray-100 font-sans">
                {projects[activeProject].detail}
              </p>
            </div>

            {/* List Achievements */}
            <div className="mt-6 space-y-3.5">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">주요 이행 / 성과 지표</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projects[activeProject].achievements.map((item, index) => (
                  <div key={index} className="flex gap-2.5 items-start p-3 rounded-lg bg-gray-50/70 border border-gray-100/40">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-600 leading-relaxed font-sans">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
              <span className="text-gray-400">사단법인 북한이탈주민중앙회 주요 실적 기준</span>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">상시 추진 과제</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
