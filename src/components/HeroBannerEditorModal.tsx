import React, { useState } from 'react';
import { X, Sparkles, Image as ImageIcon, Check, ArrowUp, ArrowDown, Plus, Trash2, ArrowLeftRight, Heart, ExternalLink, HelpCircle } from 'lucide-react';

export interface HeroSlide {
  id: number;
  imageUrl: string;
  badge: string;
  title: string;
  subTitle: string;
}

interface HeroBannerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: HeroSlide[];
  onSaveSlides: (updated: HeroSlide[]) => void;
}

const PRESET_IMAGES = [
  {
    name: "한반도 협동 평화 (학습/토의)",
    url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1600&h=900&q=80",
    tag: "기여 공동체"
  },
  {
    name: "사회 공헌 파트너십 (미팅/협력)",
    url: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1600&h=900&q=80",
    tag: "행복 실천"
  },
  {
    name: "투명 공시 전문 빌딩 (세무/신뢰)",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&h=900&q=80",
    tag: "완전 공시"
  },
  {
    name: "성공 수혜자 워크샵 (인적 자립)",
    url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&h=900&q=80",
    tag: "자립 구심점"
  },
  {
    name: "평화 동행 리더 자조 (멘토링)",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&h=900&q=80",
    tag: "인식 개선"
  },
  {
    name: "따뜻한 통일 벌판 (자연/공존)",
    url: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=1600&h=900&q=80",
    tag: "감동 치유"
  },
  {
    name: "정밀 미래 회관 (자산/투자교류)",
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&h=900&q=80",
    tag: "혁신 컨트롤"
  }
];

export default function HeroBannerEditorModal({
  isOpen,
  onClose,
  slides,
  onSaveSlides
}: HeroBannerEditorModalProps) {
  const [localSlides, setLocalSlides] = useState<HeroSlide[]>(() => [...slides]);
  const [selectedSlideId, setSelectedSlideId] = useState<number>(slides[0]?.id || 1);
  const [isSavedNotify, setIsSavedNotify] = useState(false);

  if (!isOpen) return null;

  const currentSlide = localSlides.find(s => s.id === selectedSlideId) || localSlides[0];

  const handleUpdateField = (field: keyof HeroSlide, value: string | number) => {
    setLocalSlides(prev =>
      prev.map(s => (s.id === selectedSlideId ? { ...s, [field]: value } : s))
    );
  };

  const handleSelectPreset = (url: string) => {
    handleUpdateField('imageUrl', url);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const nextSlides = [...localSlides];
    const target = nextSlides[index];
    nextSlides[index] = nextSlides[index - 1];
    nextSlides[index - 1] = target;
    setLocalSlides(nextSlides);
  };

  const handleMoveDown = (index: number) => {
    if (index === localSlides.length - 1) return;
    const nextSlides = [...localSlides];
    const target = nextSlides[index];
    nextSlides[index] = nextSlides[index + 1];
    nextSlides[index + 1] = target;
    setLocalSlides(nextSlides);
  };

  const handleDeleteSlide = (id: number) => {
    if (localSlides.length <= 1) {
      alert("최소 1개의 메인 배너 슬라이드는 유지되어야 합니다.");
      return;
    }
    const filtered = localSlides.filter(s => s.id !== id);
    setLocalSlides(filtered);
    if (selectedSlideId === id) {
      setSelectedSlideId(filtered[0]?.id || 1);
    }
  };

  const handleAddSlide = () => {
    const nextId = Math.max(...localSlides.map(s => s.id), 0) + 1;
    const newSlide: HeroSlide = {
      id: nextId,
      imageUrl: PRESET_IMAGES[0].url,
      badge: "새로운 통일 기여 프로젝트",
      title: "대한민국의 내일을 여는\n희망찬 자립 연대를 전수합니다.",
      subTitle: "사단법인 북한이탈주민중앙회가 정직하게 선봉 기획하는 공식 사업단"
    };
    setLocalSlides([...localSlides, newSlide]);
    setSelectedSlideId(nextId);
  };

  const handleCommitSave = () => {
    onSaveSlides(localSlides);
    setIsSavedNotify(true);
    setTimeout(() => {
      setIsSavedNotify(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200" id="hero-banner-editor-overlay">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl relative border border-slate-100 overflow-hidden text-slate-800" id="hero-banner-editor-window">
        
        {/* Top visual brand line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-teal-500 to-indigo-600"></div>

        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 shrink-0" id="hero-editor-header">
          <div className="text-left">
            <h3 className="text-base font-extrabold text-gray-950 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
              홈페이지 메인 롤링 배너 자율 교체기
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              프린트 잉크 절약형 백색 오버레이가 가미된 롤링 슬라이드의 문구, 뱃지, 배경 고화질 아키텍처를 교정 수립합니다.
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-slate-50 rounded-full transition-all cursor-pointer"
            id="hero-banner-editor-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inner Context Split layout */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0" id="hero-editor-split-body">
          
          {/* LEFT COLUMN: Slide List and Sequencing */}
          <div className="w-full md:w-80 border-r border-gray-100 bg-slate-50/50 p-5 overflow-y-auto flex flex-col justify-between shrink-0" id="hero-left-nav">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">배너 슬라이드 리스트 ({localSlides.length})</span>
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="px-2 py-1 text-[10px] font-extrabold bg-blue-55 text-blue-600 bg-blue-50/70 border border-blue-100 hover:bg-blue-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer select-none"
                >
                  <Plus className="w-3 h-3" />
                  <span>배너 추가</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {localSlides.map((slide, sIdx) => {
                  const isCur = slide.id === selectedSlideId;
                  return (
                    <div 
                      key={slide.id}
                      onClick={() => setSelectedSlideId(slide.id)}
                      className={`group p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-1.5 ${
                        isCur 
                          ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-50' 
                          : 'bg-transparent border-gray-200/60 hover:bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-black text-[10px] ${
                          isCur ? 'bg-blue-600 text-white' : 'bg-gray-150 text-gray-500'
                        }`}>
                          {sIdx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-extrabold text-gray-800 truncate leading-tight">{slide.badge}</p>
                          <p className="text-[9.5px] text-gray-400 truncate mt-0.5">{slide.title.replace(/\n/g, ' ')}</p>
                        </div>
                      </div>

                      {/* Control keys for reordering / deletion */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveUp(sIdx);
                          }}
                          disabled={sIdx === 0}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-md hover:bg-slate-100"
                          title="위로 이동"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveDown(sIdx);
                          }}
                          disabled={sIdx === localSlides.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-md hover:bg-slate-100"
                          title="아래로 이동"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlide(slide.id);
                          }}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-150 text-[10px] text-gray-400 leading-relaxed space-y-1.5 select-none" id="ordering-nav-footer">
              <span className="font-extrabold text-gray-500 block">💡 롤링 조작 도움말</span>
              <p>배너 순서를 바꾸려면 화살표 아이콘을 클릭하세요. 순서대로 정면에 동정 롤링 노출됩니다.</p>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Editor & Preset Picker */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left" id="hero-right-dashboard">
            
            {/* Live Interactive Preview block matching Actual Slider design */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block select-none">실시간 적용 레이아웃 시뮬레이터</span>
              <div className="relative rounded-2xl overflow-hidden border border-gray-200/80 bg-gray-50 h-[190px] flex items-center justify-start p-6" id="hero-mini-sim-bg">
                <div className="absolute inset-0 z-0 select-none">
                  <img 
                    src={currentSlide.imageUrl} 
                    alt="" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                  {/* Glass tint overlay matching client requirement */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/50 backdrop-blur-[0.5px]" />
                </div>

                <div className="relative z-10 max-w-lg space-y-2 text-left">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-600 text-white font-bold text-[9.5px] rounded-full uppercase tracking-wider shadow-2xs select-none">
                    {currentSlide.badge || '뱃지 텍스트를 입력해주세요'}
                  </span>
                  <p className="text-gray-900 font-black text-base sm:text-lg leading-tight whitespace-pre-line tracking-tight">
                    {currentSlide.title || '메인 타이틀 문구를 적어보세요'}
                  </p>
                  <p className="text-gray-600 text-[10.5px] font-semibold font-sans truncate">
                    {currentSlide.subTitle || '상세 구체 세부 사유를 채워주세요'}
                  </p>
                </div>
              </div>
            </div>

            {/* Editing Inputs Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="hero-inputs-container">
              
              <div className="space-y-1.5 flex flex-col items-start">
                <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">상단 뱃지 텍스트</label>
                <input 
                  type="text" 
                  placeholder="예: 사회 공헌 실천 네트워크"
                  className="w-full text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-bold bg-white text-gray-800 shadow-3xs"
                  value={currentSlide.badge}
                  onChange={(e) => handleUpdateField('badge', e.target.value)}
                />
              </div>

              <div className="space-y-1.5 flex flex-col items-start">
                <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">세부 설명 상세 문구</label>
                <input 
                  type="text" 
                  placeholder="서브 슬레이트 텍스트"
                  className="w-full text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-semibold bg-white text-gray-800 shadow-3xs"
                  value={currentSlide.subTitle}
                  onChange={(e) => handleUpdateField('subTitle', e.target.value)}
                />
              </div>

              <div className="space-y-1.5 flex flex-col items-start md:col-span-2">
                <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">
                  메인 타이틀 개방형 문구 (줄바꿈이 필요한 위치에 직접 <span className="text-blue-600 font-black">\n</span> 대신 개치식 줄바꿈 하셔도 됩니다)
                </label>
                <textarea 
                  rows={2}
                  placeholder="수혜자에서 기여자로,&#13;당당하게 대한민국의 내일을 엽니다."
                  className="w-full text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-black bg-white text-gray-800 shadow-3xs font-sans leading-snug"
                  value={currentSlide.title}
                  onChange={(e) => handleUpdateField('title', e.target.value)}
                />
              </div>

              <div className="space-y-1.5 flex flex-col items-start md:col-span-2">
                <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                  배경 고해상도 이미지 인터넷 Link (URL) 주소 권장
                </label>
                <div className="flex gap-2 w-full">
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/...' 또는 원하는 이미지 절대 주소"
                    className="flex-1 text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono bg-white text-gray-700 shadow-3xs"
                    value={currentSlide.imageUrl}
                    onChange={(e) => handleUpdateField('imageUrl', e.target.value)}
                  />
                  {currentSlide.imageUrl.startsWith('http') && (
                    <a 
                      href={currentSlide.imageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-gray-200 rounded-xl transition-colors text-slate-600"
                      title="원본 이미지 새탭에서 보기"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

            </div>

            {/* Curated Preset Background Grid */}
            <div className="space-y-2.5" id="hero-presets-selector-panel">
              <div className="flex items-center justify-between select-none">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-500" />
                  북민회 안심 통일배경 엄선 프리셋 라이브러리
                </span>
                <span className="text-[9.5px] text-gray-400 font-bold">클릭시 즉시 배경 교체</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_IMAGES.map((preset, pIdx) => {
                  const isChosen = currentSlide.imageUrl === preset.url;
                  return (
                    <div 
                      key={pIdx}
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`group relative rounded-xl overflow-hidden h-[74px] border cursor-pointer transition-all duration-200 ${
                        isChosen 
                          ? 'border-indigo-600 ring-2 ring-indigo-50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={preset.url} 
                        alt="" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/30 transition-colors" />
                      
                      {/* Presets absolute metadata tags */}
                      <div className="absolute inset-x-2 bottom-1.5 flex flex-col items-start text-left select-none pointer-events-none">
                        <span className="text-[7.5px] uppercase font-extrabold bg-indigo-600/90 text-white px-1 ml-0.5 rounded-sm mb-0.5">
                          {preset.tag}
                        </span>
                        <span className="text-[9.5px] font-black text-white line-clamp-1 truncate w-full drop-shadow-md">
                          {preset.name}
                        </span>
                      </div>

                      {isChosen && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center border border-white shadow-3xs select-none">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Action Footer buttons */}
        <div className="px-6 py-4 border-t border-gray-100 bg-slate-50 flex items-center justify-between shrink-0 select-none" id="hero-editor-footer">
          <div className="text-[10px] text-gray-400 text-left font-sans flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-gray-300 shrink-0" />
            <span>임시 적용된 상태입니다. 오른쪽 버튼을 눌러 확정 저장해 주세요.</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-bold bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              취소 후 개별 보존
            </button>
            <button
              type="button"
              onClick={handleCommitSave}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              {isSavedNotify ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white shrink-0 animate-bounce" />
                  <span>실시간 JM 연계 저장 완료!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>메인 슬라이드 최종 설정 저장</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
