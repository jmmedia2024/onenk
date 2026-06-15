import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight, Heart, Globe, Sparkles } from 'lucide-react';

interface HeroSlide {
  id: number;
  imageUrl: string;
  badge: string;
  title: string;
  subTitle: string;
}

interface MainHeroSliderProps {
  onNavigateTo: (tab: 'about' | 'donation') => void;
  slides?: HeroSlide[];
  onOpenG5Settings?: () => void;
}

export default function MainHeroSlider({ onNavigateTo, slides: externalSlides, onOpenG5Settings }: MainHeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const localSlides: HeroSlide[] = [
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
      subTitle: "북한이탈주민 of 고용 정착 성공사례를 확대 발굴하여, 국민들의 열린 통일 인식을 이끌어냅니다."
    }
  ];

  const slides = externalSlides || localSlides;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full overflow-hidden border-b border-gray-100 bg-gray-50 min-h-[480px] md:min-h-[520px] lg:min-h-[560px] flex items-center" id="main-hero-slider-canvas">
      
      {/* Background Slideshow Layer */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none bg-slide-image">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1.0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={slides[current].imageUrl}
              alt={slides[current].title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover brightness-[0.93] select-none"
            />
            {/* Elegant overlay to maintain a very bright and white appearance for printing as well */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/60 backdrop-blur-[1.5px]" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Centered layout bounding box to align perfectly with the header of the site */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 flex flex-col justify-between min-h-[480px] md:min-h-[520px] lg:min-h-[560px]">
        
        {/* Top bar indicators inside bounds */}
        <div className="flex items-center justify-between w-full no-print">
          {/* Floating Sparkle Decoration */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full border border-gray-200 text-xs font-semibold text-blue-600 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
            <span>실시간 정착 공헌 지수 공시 활성</span>
          </div>

          {/* Slide Navigation Overlay Controls on the Top Right */}
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-gray-200 shadow-sm">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              title="이전 슬라이드"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              title={isPlaying ? "자동 전환 일시 정지" : "자동 전환 시작"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              title="다음 슬라이드"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Content Wrapper */}
        <div className="max-w-3xl my-6 sm:my-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Slogan pill badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold font-sans tracking-wide shadow-sm">
                <Globe className="w-3.5 h-3.5 animate-pulse" />
                <span>{slides[current].badge}</span>
              </div>

              {/* Core user requested headings */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-950 tracking-tight leading-[1.2] whitespace-pre-line">
                {slides[current].title}
              </h2>

              {/* Descriptive slogan text */}
              <p className="text-gray-600 text-sm sm:text-base md:text-lg font-semibold leading-relaxed font-sans mt-2">
                {slides[current].subTitle}
              </p>

              {/* Call To Actions */}
              <div className="flex flex-wrap gap-3 pt-2 no-print">
                <button
                  onClick={() => onNavigateTo('about')}
                  className="px-5 py-3 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white font-bold text-xs shadow-sm transition-transform hover:-translate-y-0.5 flex items-center gap-1.5"
                >
                  중앙회 설립선언문 전문 <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigateTo('donation')}
                  className="px-5 py-3 rounded-xl bg-blue-50/90 backdrop-blur-xs hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-transform hover:-translate-y-0.5 flex items-center gap-1.5"
                >
                  정직한 투명 후원하기 <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating numbering indicator & Indicator Dots at Bottom Left */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-gray-200/60 shadow-xs max-w-max no-print">
          <span className="text-[11px] font-mono font-bold text-gray-500">
            {current + 1} / {slides.length}
          </span>
          <div className="h-2 w-[1px] bg-gray-300" />
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrent(idx);
                  setIsPlaying(false);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  current === idx ? 'w-5 bg-blue-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                title={`${idx + 1}번 슬라이드 보기`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
