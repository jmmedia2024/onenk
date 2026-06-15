import React, { useState, useEffect } from 'react';
import { Camera, Newspaper, Calendar, ArrowUpRight, Search, Eye, X, Layers } from 'lucide-react';

interface GalleryItem {
  id: string;
  category: 'press' | 'gallery';
  title: string;
  date: string;
  description: string;
  views: number;
  tags: string[];
  imagePlaceholderColor: string;
}

export default function NewsSection() {
  const [filter, setFilter] = useState<'all' | 'press' | 'gallery'>('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const defaultGalleryItems: GalleryItem[] = [
    {
      id: 'n-g-1',
      category: 'gallery',
      title: '통일 하나눔 봉사단 - 마포 노인복지관 무료 급식 보급',
      date: '2026-05-18',
      description: '중앙회 임직원과 30명의 청년 봉사팀이 밀접 위기세대를 위해 300인분의 손수 제조한 오찬 빵과 양질의 찬을 공급 배부하였습니다.',
      views: 245,
      tags: ['하나눔봉사단', '마포복지관', '급식나눔'],
      imagePlaceholderColor: 'from-blue-400 to-indigo-600'
    },
    {
      id: 'n-p-2',
      category: 'press',
      title: '[보도] 3만 4천 탈북민 정착 지원 강화를 위한 통일부 정책 간담회 개최',
      date: '2026-05-12',
      description: '본사 5층 대강의실에서 통일부 관계 실무진들과 탈북 연대 회장단이 배석하여 생활지원금 인상 및 자격 교육 기회 확충에 대해 열띈 대안을 건의 및 교환하였습니다.',
      views: 310,
      tags: ['정책개발', '통일부협정', '보도자료'],
      imagePlaceholderColor: 'from-amber-400 to-rose-500'
    },
    {
      id: 'n-g-3',
      category: 'gallery',
      title: '2026 상반기 영남 지부 영호남 전수 실태조사 워크숍 실시',
      date: '2026-04-29',
      description: '정밀 소외 위기 가구 파악을 목표로 경주 일관서 각 지부장 및 실사단 40여 가구가 모여 설문 작성 심화 지도 요령을 숙달하고 토론하는 자리를 마련하였습니다.',
      views: 189,
      tags: ['지부역량강화', '경주실태조사', '대표단워크숍'],
      imagePlaceholderColor: 'from-teal-400 to-blue-500'
    },
    {
      id: 'n-p-4',
      category: 'press',
      title: '[기부뉴스] 북한이탈주민중앙회 투명성 인증 획득 등급 세부 개방',
      date: '2026-04-15',
      description: '회비 및 정기/일시 기탁 후원금에 대한 회계 법인 안진의 2개년 기예 결산 전결 감사 결과를 외부 전면 오픈 승인하였습니다. 투명 회계를 성실히 이행하겠습니다.',
      views: 420,
      tags: ['투명회계 감사', '윤리경영', '기부인증'],
      imagePlaceholderColor: 'from-purple-500 to-pink-500'
    },
    {
      id: 'n-g-5',
      category: 'gallery',
      title: '새싹 꿈나무 아동 장학증서 수여식 현장',
      date: '2026-04-02',
      description: '대한민국 한 일원에 뿌리내려 헌신하고 있는 초등, 중등 우수 장학생 20명에게 든든한 정주 후학 발전 장학 증서 및 부상을 수여하였습니다.',
      views: 220,
      tags: ['새싹장학금', '통일인재육성', '수여식갤러리'],
      imagePlaceholderColor: 'from-emerald-400 to-teal-600'
    },
    {
      id: 'n-p-6',
      category: 'press',
      title: '[보도] 사단법인 북한이탈주민중앙회-대한법률구조공단 실무 연계 MOU 체결',
      date: '2026-03-24',
      description: '법의 경계를 이해하기 어려워 불이익을 겪거나 보호 조치가 필요한 탈북민들에게 직접 전문 법률 변론과 소송 보전을 무상 지원 통로를 확보하였습니다.',
      views: 512,
      tags: ['법률연계', 'MOU협약', '권익생활'],
      imagePlaceholderColor: 'from-sky-400 to-indigo-500'
    }
  ];

  // Dynamically load merged items from central bukmin_posts_v1 with categories 'press' and 'gallery'
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('bukmin_posts_v1');
    if (saved) {
      try {
        const posts: any[] = JSON.parse(saved);
        const dynamicItems = posts
          .filter(p => p.type === 'press' || p.type === 'gallery')
          .map(p => ({
            id: p.id,
            category: p.type as 'press' | 'gallery',
            title: p.title,
            date: p.date,
            description: p.content,
            views: p.views || 0,
            tags: p.tags || ['그누보드', '실시간연계'],
            imagePlaceholderColor: p.imagePlaceholderColor || (p.type === 'press' ? 'from-amber-400 to-rose-500' : 'from-blue-400 to-indigo-600')
          }));

        if (dynamicItems.length > 0) {
          // Merge default ones that aren't overwritten
          const uniqueIds = new Set(dynamicItems.map(item => item.title));
          const remainingDefaults = defaultGalleryItems.filter(item => !uniqueIds.has(item.title));
          return [...dynamicItems, ...remainingDefaults];
        }
      } catch (e) {
        console.error(e);
      }
    }
    return defaultGalleryItems;
  });

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('bukmin_posts_v1');
      if (saved) {
        try {
          const posts: any[] = JSON.parse(saved);
          const dynamicItems = posts
            .filter(p => p.type === 'press' || p.type === 'gallery')
            .map(p => ({
              id: p.id,
              category: p.type as 'press' | 'gallery',
              title: p.title,
              date: p.date,
              description: p.content,
              views: p.views || 0,
              tags: p.tags || ['그누보드', '실시간연계'],
              imagePlaceholderColor: p.imagePlaceholderColor || (p.type === 'press' ? 'from-amber-400 to-rose-500' : 'from-blue-400 to-indigo-600')
            }));
          const uniqueTitles = new Set(dynamicItems.map(item => item.title));
          const remainingDefaults = defaultGalleryItems.filter(item => !uniqueTitles.has(item.title));
          setGalleryItems([...dynamicItems, ...remainingDefaults]);
        } catch (e) {
          console.error(e);
        }
      }
    };
    handleSync();
    
    // Listen for custom trigger or storage sync
    window.addEventListener('storage', handleSync);
    window.addEventListener('bukmin_posts_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('bukmin_posts_updated', handleSync);
    };
  }, []);

  const filteredItems = galleryItems.filter((item) => {
    const matchesFilter = filter === 'all' ? true : item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4" id="news-section-container">
      {/* Search and Filters Layout */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        {/* Category triggers */}
        <div className="flex gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100 max-w-full overflow-x-auto shrink-0">
          <button
            id="news-filter-all"
            onClick={() => setFilter('all')}
            className={`px-2.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              filter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">전체 보기</span>
            <span className="sm:hidden text-[10px]">전체</span>
          </button>
          <button
            id="news-filter-press"
            onClick={() => setFilter('press')}
            className={`px-2.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              filter === 'press' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">공식 보도자료</span>
            <span className="sm:hidden text-[10px]">보도자료</span>
          </button>
          <button
            id="news-filter-gallery"
            onClick={() => setFilter('gallery')}
            className={`px-2.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              filter === 'gallery' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">활동 갤러리</span>
            <span className="sm:hidden text-[10px]">갤러리</span>
          </button>
        </div>

        {/* Input box */}
        <div className="relative w-full md:w-72">
          <input
            id="news-search-input"
            type="text"
            placeholder="알림 마당 검색어 입력..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-white border border-gray-200 focus:border-blue-500 focus:outline-none pl-9 pr-4 py-2.5 rounded-xl transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Grid List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100/50">
          <p className="text-sm text-gray-400">검색 조건에 일치하는 보도 / 활동 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="glass-card rounded-2xl glass-card-hover overflow-hidden cursor-pointer flex flex-col justify-between"
              id={`news-card-${item.id}`}
            >
              {/* Animated 3D Glass Accent Visualizer Top bar */}
              <div className={`h-40 bg-gradient-to-tr ${item.imagePlaceholderColor} relative p-4 flex flex-col justify-between`}>
                <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
                <span className={`self-start px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md bg-white/20 border border-white/20`}>
                  {item.category === 'press' ? '공식 보도자료' : '활동 포토'}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-white font-mono opacity-90">
                  <Calendar className="w-3 h-3" /> {item.date}
                </span>
              </div>

              {/* Text info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100/70 flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-3.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {item.views} 회 조회
                </span>
                <span className="text-blue-600 font-bold flex items-center gap-0.5">
                  자세히 보기 <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Read detail dialog */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-6 relative animate-in fade-in duration-200">
            {/* Close */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Simulated Banner */}
            <div className={`h-48 bg-gradient-to-tr ${selectedItem.imagePlaceholderColor} rounded-2xl relative p-5 flex items-end`}>
              <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-black/20 backdrop-blur-md border border-white/20 select-none">
                {selectedItem.category === 'press' ? '보도 기사' : '현장 사진 갤러리'}
              </span>
            </div>

            <div className="space-y-4">
              <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full inline-block">
                일시: {selectedItem.date}
              </span>
              <h3 className="text-lg font-extrabold text-gray-900 leading-snug">
                {selectedItem.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-sans whitespace-pre-line">
                {selectedItem.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-4 border-t border-gray-100">
              {selectedItem.tags.map((tag) => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-xl">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-gray-400">
              <span>누적 조회수: {selectedItem.views}회</span>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
