import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Pause, Globe, Heart, Shield, Users, Award, Sparkles } from 'lucide-react';

interface Slide {
  id: number;
  tag: string;
  title: string;
  desc: string;
  gradient: string;
  icon: React.ReactNode;
  bgDecorative: string;
  image: string;
}

export default function MainSlideBanner() {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});

  const slides: Slide[] = [
    {
      id: 1,
      tag: "공동체 비전",
      title: "자유를 넘어 정착으로,\n따뜻한 희망의 동행",
      desc: "3만 4천 북한이탈주민의 든든한 정착 울타리가 되어, 당당한 대한민국 시민으로서 상호 협력과 안정적인 자립 성장을 견인합니다.",
      gradient: "from-blue-600 to-indigo-500",
      icon: <Globe className="w-5 h-5 text-white" />,
      bgDecorative: "bg-blue-50/40",
      image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=480&q=80"
    },
    {
      id: 2,
      tag: "사회 공헌",
      title: "수혜자의 입장을 넘어\n대한민국 국가 '기여자'로",
      desc: "더 이상 일방적인 혜택의 대상에 머무르지 않고, 적극적인 정기 자원봉사 및 사회공헌 활동을 선도하며 대한민국 발전의 주역이 됩니다.",
      gradient: "from-teal-500 to-emerald-500",
      icon: <Heart className="w-5 h-5 text-white" />,
      bgDecorative: "bg-teal-50/40",
      image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=480&q=80"
    },
    {
      id: 3,
      tag: "신뢰와 투명성",
      title: "100% 완벽한 전산 회계 공시와\n외부 정기 세무감사 보존",
      desc: "단 1원의 기부금도 투명하게 집행되도록 최신 전산 관리 시스템을 가동하며, 정기적인 외부 감사 영수 파일을 전원 상시 열람 가능하게 보존합니다.",
      gradient: "from-violet-600 to-fuchsia-500",
      icon: <Shield className="w-5 h-5 text-white" />,
      bgDecorative: "bg-violet-50/40",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=480&q=80"
    },
    {
      id: 4,
      tag: "대연합 네트워크",
      title: "전국 산하 130여 개\n탈북 단체의 유기적 구심점",
      desc: "각 도민회, 청년회, 전문 지원 단체 등 전국 각지에 산재하는 130개 이상의 상호교류 연대를 하나로 일관성 있게 결집하여 통합 리더십을 세웁니다.",
      gradient: "from-amber-500 to-orange-500",
      icon: <Users className="w-5 h-5 text-white" />,
      bgDecorative: "bg-amber-50/40",
      image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=480&q=80"
    },
    {
      id: 5,
      tag: "권익 보호 구제",
      title: "무상 법률상담 및\n불공정 피해 상설 해결 지원",
      desc: "지방자치단체 및 민간 법본부와 공식 협약을 통해, 정착 과정 중 겪는 임금 체불, 사기 등 각종 법률 피해를 위해 소송 지원과 전문 자문을 지원합니다.",
      gradient: "from-rose-500 to-pink-500",
      icon: <Award className="w-5 h-5 text-white" />,
      bgDecorative: "bg-rose-50/40",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=480&q=80"
    }
  ];

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="w-full space-y-4" id="main-slide-banner-wrapper">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>북민회 핵심 활동 &amp; 보도 연혁</span>
        </h3>
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 p-1 rounded-xl">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 transition-colors shadow-xs"
            aria-label="이전 슬라이드"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 transition-colors shadow-xs"
            aria-label={isPlaying ? "일시정지" : "자동재생"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 transition-colors shadow-xs"
            aria-label="다음 슬라이드"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide Canvas */}
      <div 
        className={`relative overflow-hidden rounded-3xl min-h-[300px] md:min-h-[260px] flex items-center transition-all duration-500 bg-white border ${
          current === 2 
            ? 'border-violet-300 ring-3 ring-violet-500/10 shadow-[0_20px_45px_-5px_rgba(124,58,237,0.15)] bg-slate-50/10' 
            : 'border-gray-200/85 shadow-[0_12px_36px_rgba(0,0,0,0.04)]'
        }`}
        id="main-hero-carousel"
      >
        {/* Dynamic decorative backdrop circles */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${current}`}
            className={`absolute inset-0 w-full h-full pointer-events-none opacity-25 blur-3xl rounded-3xl ${slides[current].bgDecorative}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>

        <div className="w-full p-6 md:p-10 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center"
            >
              {/* Left visual stamp / Glassmorphic Photo Frame with Shimmer Skeleton */}
              <div className="col-span-1 md:col-span-3 flex justify-center">
                <div 
                  className="w-24 h-24 md:w-32 md:h-32 relative rounded-3xl overflow-hidden border border-slate-200/80 bg-slate-50 shadow-md shrink-0 transform hover:scale-103 transition-transform duration-300 select-none"
                  id={`slide-media-frame-${slides[current].id}`}
                >
                  <img
                    src={slides[current].image}
                    alt={slides[current].tag}
                    referrerPolicy="no-referrer"
                    onLoad={() => handleImageLoad(slides[current].id)}
                    className={`w-full h-full object-cover transition-all duration-700 ease-out select-none ${
                      loadedImages[slides[current].id] 
                        ? 'opacity-100 scale-100 blur-0' 
                        : 'opacity-0 scale-95 blur-xs'
                    }`}
                  />

                  {/* High fidelity shimmer skeleton loader */}
                  {!loadedImages[slides[current].id] && (
                    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center" id="skeleton-container">
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-150 via-slate-50 to-slate-150 animate-pulse opacity-70" />
                      <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin relative z-10" />
                    </div>
                  )}

                  {/* Corner Accent Badge indicating the slide's role / identity */}
                  <div 
                    className={`absolute bottom-2 right-2 w-8 h-8 rounded-xl bg-gradient-to-tr ${slides[current].gradient} flex items-center justify-center shadow-md border border-white/50 backdrop-blur-xs select-none`}
                    id="carousel-mini-badge"
                  >
                    {slides[current].icon}
                  </div>
                </div>
              </div>

              {/* Right Descriptions */}
              <div className="col-span-1 md:col-span-9 space-y-4 text-center md:text-left">
                <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className={`inline-block text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase border shadow-2xs bg-white text-gray-700 border-gray-200/80`}>
                      {slides[current].tag}
                    </span>
                    {current === 2 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full shadow-2xs animate-pulse">
                        🛡️ 세무 정기감사 완료
                      </span>
                    )}
                    {current === 1 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                        🤝 사회공헌 선도단
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-xl md:text-2xl font-black text-gray-950 mt-3 tracking-tight leading-tight whitespace-pre-line">
                    {slides[current].title}
                  </h4>
                </div>

                <p className="text-gray-500 text-xs md:text-sm font-medium leading-relaxed max-w-2xl">
                  {slides[current].desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating numbering stamp in the frame corners */}
        <div className="absolute bottom-4 right-6 text-[10px] font-mono font-bold text-gray-400 bg-gray-50 border border-gray-200/50 px-2 py-1 rounded-lg">
          {current + 1} / {slides.length}
        </div>
      </div>

      {/* Bullet Dot Indicators */}
      <div className="flex gap-2 justify-center pt-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrent(idx);
              setIsPlaying(false); // Stop autoplay when clicked
            }}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              current === idx 
                ? 'w-8 bg-blue-600' 
                : 'w-2.5 bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label={`슬라이드 ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
