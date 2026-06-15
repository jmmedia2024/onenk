import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Calendar, MapPin, X, Flame, Eye, Tv, ListCollapse, Volume2, ShieldCheck, HeartHandshake } from 'lucide-react';

interface VideoItem {
  id: string;
  category: '봉사활동' | '대외행사' | '대담공청';
  title: string;
  duration: string;
  views: string;
  date: string;
  location: string;
  speaker: string;
  desc: string;
  thumbnailColor: string; // Tailwind bg color representing beautiful gradients of the simulated visual
  badgeColor: string;
  highlights: string[];
}

export default function VideoShowcase() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(35); // simulated progress bar

  const videos: VideoItem[] = [
    {
      id: "v1",
      category: "봉사활동",
      title: "2026 정기 연탄 쉼터 배달 배급 & 사랑의 김장 봉사 현장",
      duration: "04:22",
      views: "1,520회",
      date: "2026-04-12",
      location: "서울 성북구 난곡길 일대",
      speaker: "북민회 한사랑봉사단 45명",
      desc: "수혜의 시선을 넘어 나눔의 당당한 기여자로 거듭나기 위한 북민회 자원봉사단원들의 뜨거운 김장김치 버무림과 저소득 난방 취약가구 연료 전달 전 과정을 모은 스케치 프레임입니다.",
      thumbnailColor: "from-amber-100 to-orange-100 border-amber-200/50 text-amber-800",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200/50",
      highlights: ["배달용 리어카 6대 기증", "김치 400포기 독거노인 직송", "취약층 12가구 정규 연료 제공"]
    },
    {
      id: "v2",
      category: "대외행사",
      title: "제2회 한반도 소통·공존 연제 대토론회 & 정착 성공 수기 공유회",
      duration: "12:05",
      views: "890회",
      date: "2026-03-24",
      location: "서울 세종대로 프레스센터 20층",
      speaker: "북한이탈주민 정착자 대표단 및 행안부 자문관",
      desc: "대한민국 내의 3만 4천 명 북한이탈주민들이 겪는 실제적인 구직 고용 정체, 무상 정착 자금의 적절성 배분 및 소외 청년층들의 심리 보호 문제를 심층 공론화하고 해법을 개혁 제언한 세미나입니다.",
      thumbnailColor: "from-blue-100 to-indigo-100 border-blue-200/50 text-blue-800",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200/50",
      highlights: ["성공 수기 3편 우수시상식", "정부 지원 규정 보완 건의서 전달", "전국 지자체 대연대 포럼 공동 결의"]
    },
    {
      id: "v3",
      category: "대담공청",
      title: "KBS 특집 다큐멘터리 '대한민국의 일원으로, 자립의 땀방울'",
      duration: "08:45",
      views: "3,210회",
      date: "2026-05-02",
      location: "북민회 기획협력처 세종본실",
      speaker: "북한이탈주민중앙회 위원회 합동 제작",
      desc: "방송사와 기획 제휴를 맺고 자립의 역사를 일구어가는 북민회 회원들의 공장 창업, 미디어 크리에이션, 학술 전공 심화 이수 현장을 동행 밀착 취재하여 방영된 보도 기록물입니다.",
      thumbnailColor: "from-emerald-100 to-teal-100 border-emerald-200/50 text-emerald-800",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200/50",
      highlights: ["자립 벤처기업인 집중 조명", "탈북 청년 학술 장학금 전달", "공영 미디어 상생 인터뷰 발췌"]
    }
  ];

  const handlePlaySimulatedVideo = () => {
    setIsVideoPlaying(true);
    const interval = setInterval(() => {
      setVideoProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsVideoPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 300);
  };

  return (
    <div className="w-full space-y-6" id="video-showcase-wrapper">
      
      {/* Section Title */}
      <div className="space-y-1.5 text-center md:text-left">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
          <Tv className="w-3.5 h-3.5" /> 미디어 아카이브 공시
        </span>
        <h3 className="text-xl font-extrabold text-gray-950">활동 소식 &amp; 현장 영상 스케치</h3>
        <p className="text-xs text-gray-500 max-w-xl">
          북한이탈주민중앙회가 활발히 전개하는 사회공헌 실천 및 공청회 담론 현장을 비디오 클립으로 직접 증명합니다.
        </p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="video-grid-panel">
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => {
              setSelectedVideo(video);
              setVideoProgress(35);
              setIsVideoPlaying(false);
            }}
            className="glass-card rounded-2xl overflow-hidden border border-gray-100/90 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-300/60 hover:ring-2 hover:ring-indigo-500/5 group flex flex-col justify-between"
            id={`video-card-${video.id}`}
          >
            {/* Aspect Video Placeholder with rich interactive hover glow and brightness adjustment */}
            <div className={`relative h-44 bg-gradient-to-tr ${video.thumbnailColor} border-b flex flex-col items-center justify-center p-4 overflow-hidden transition-all duration-350 group-hover:shadow-[inset_0_0_30px_rgba(99,102,241,0.15)] group-hover:brightness-[1.03]`}>
              {/* Grid Background Lines for 3D Technical Feel */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>
              
              {/* Round Glass Play Button Icon - elevated & glowing on group hover */}
              <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md border border-white/50 group-hover:scale-115 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:border-indigo-300 transition-all duration-300 z-10">
                <Play className="w-5 h-5 text-indigo-600 fill-indigo-600 ml-0.5" />
              </div>

              {/* category label */}
              <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md border ${video.badgeColor} z-10`}>
                {video.category}
              </span>

              {/* length banner */}
              <span className="absolute bottom-3 right-3 text-[10px] font-mono font-bold bg-slate-900/85 text-white px-1.5 py-0.5 rounded">
                {video.duration}
              </span>

              {/* Watermark in bg */}
              <div className="absolute -bottom-4 -left-4 text-slate-900/[0.03] font-black text-6xl select-none font-mono tracking-tighter leading-none pointer-events-none">
                BUKMIN
              </div>
            </div>

            {/* Explanations */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {video.title}
                </h4>
                <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-2 font-sans">
                  {video.desc}
                </p>
              </div>

              {/* info metrics */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-300" /> {video.date}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Eye className="w-3.5 h-3.5 text-gray-300" /> {video.views}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Popup Mock Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="video-modal-viewport">
            {/* dimmer backdrop closer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVideo(null)}
              className="absolute inset-0 bg-gray-950/40 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl border border-gray-100 relative max-w-2xl w-full overflow-hidden shadow-2xl z-10 flex flex-col"
            >
              
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${selectedVideo.badgeColor}`}>
                    {selectedVideo.category}
                  </span>
                  <span className="text-xs font-bold text-gray-400">북민회 공식 미디어 공시</span>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
                  aria-label="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Simulated Screen Player visualizer */}
              <div className="relative aspect-video bg-neutral-950 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
                
                {/* Horizontal dynamic lines for CCTV/Broadcast aesthetic */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-40"></div>
                
                {isVideoPlaying ? (
                  /* Playing State: visual waveform or pulsing nodes */
                  <div className="space-y-4 z-10">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                      <span className="text-xs font-mono font-bold tracking-wider text-rose-500">LIVE MOCK FEED PLAY...</span>
                    </div>

                    <div className="flex items-end justify-center gap-1 h-12">
                      {[1, 2, 3, 4, 5, 4, 3, 2, 3, 4, 5, 6, 7, 5, 3, 2, 1, 4, 6, 5, 2].map((val, idx) => (
                        <motion.div
                          key={idx}
                          animate={{ height: isVideoPlaying ? [val * 3, val * 8, val * 3] : 4 }}
                          transition={{ repeat: Infinity, duration: 1.2 + (idx % 3) * 0.2, ease: "easeInOut" }}
                          className="w-1.5 bg-indigo-500 rounded-t"
                        />
                      ))}
                    </div>

                    <p className="text-[11px] text-gray-400 font-mono">가상 플레이어 진행률: {videoProgress}%</p>
                  </div>
                ) : (
                  /* Idle/Paused State */
                  <div className="space-y-4 z-10">
                    <button
                      onClick={handlePlaySimulatedVideo}
                      className="w-16 h-16 rounded-full bg-white text-indigo-600 hover:scale-110 active:scale-95 flex items-center justify-center shadow-lg mx-auto transition-transform"
                    >
                      <Play className="w-7 h-7 fill-indigo-600 ml-1" />
                    </button>
                    <p className="text-xs text-gray-400 font-semibold tracking-wide">
                      재생 단추를 클릭해 모의 시청 플레이어를 구동하세요.
                    </p>
                  </div>
                )}

                {/* Bottom Control Bar overlays */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-2 z-20">
                  {/* Progress bar */}
                  <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = Math.floor((clickX / rect.width) * 100);
                    setVideoProgress(percent);
                  }}>
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${videoProgress}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-white text-[10px] font-mono">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-indigo-400">PLAYBACK: MOCK_FEED</span>
                      <span>{Math.floor((selectedVideo.duration.split(':')[0] as any) * (videoProgress / 100))}:{String(Math.floor(60 * (videoProgress / 100))).padStart(2, '0')} / {selectedVideo.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-80">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>100% VOLUME</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informative description below mock player */}
              <div className="p-6 space-y-4 overflow-y-auto max-h-[220px]">
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-gray-950 leading-snug">
                    {selectedVideo.title}
                  </h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-300" /> <strong>장소:</strong> {selectedVideo.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-300" /> <strong>공시일:</strong> {selectedVideo.date}</span>
                    <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5 text-gray-300" /> <strong>주요 패널:</strong> {selectedVideo.speaker}</span>
                  </div>
                </div>

                <p className="text-gray-500 text-xs leading-relaxed font-sans bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                  {selectedVideo.desc}
                </p>

                {/* Key volunteer summaries / bullet points */}
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-gray-900 block flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 정착 자립 지표 및 요약
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedVideo.highlights.map((hlt, idx) => (
                      <div key={idx} className="bg-emerald-50/40 border border-emerald-100 p-2.5 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-emerald-800 leading-tight">
                          {hlt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm Close Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white font-bold text-xs shadow-xs"
                  >
                    공시 내용 확인 완료
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
