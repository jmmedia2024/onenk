import React, { useState, useEffect } from 'react';
import { Camera, Newspaper, Calendar, ArrowUpRight, Search, Eye, X, Layers, Share2, Link2, MessageCircle } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);

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

  // Dynamically load merged items from central bukmin_posts_v1 with categories 'press', 'news' and 'gallery'
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('bukmin_posts_v1');
    if (saved) {
      try {
        const posts: any[] = JSON.parse(saved);
        const dynamicItems = posts
          .filter(p => p.type === 'press' || p.type === 'news' || p.type === 'gallery')
          .map(p => ({
            id: p.id,
            category: (p.type === 'press' || p.type === 'news') ? 'press' : 'gallery',
            title: p.title,
            date: p.date,
            description: p.content,
            views: p.views || 0,
            tags: p.tags || ['그누보드', '실시간연계'],
            imagePlaceholderColor: p.imagePlaceholderColor || (p.type === 'press' || p.type === 'news' ? 'from-amber-400 to-rose-500' : 'from-blue-400 to-indigo-600')
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
            .filter(p => p.type === 'press' || p.type === 'news' || p.type === 'gallery')
            .map(p => ({
              id: p.id,
              category: (p.type === 'press' || p.type === 'news') ? 'press' : 'gallery',
              title: p.title,
              date: p.date,
              description: p.content,
              views: p.views || 0,
              tags: p.tags || ['그누보드', '실시간연계'],
              imagePlaceholderColor: p.imagePlaceholderColor || (p.type === 'press' || p.type === 'news' ? 'from-amber-400 to-rose-500' : 'from-blue-400 to-indigo-600')
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
    
    // 🌐 HTTP Live GnuBoard5 API Fetcher for news and gallery boards
    const fetchG5Data = async () => {
      const g5ApiUrl = localStorage.getItem('bukmin_g5_api_url') || '';
      const g5ApiKey = localStorage.getItem('bukmin_g5_api_key') || '';
      const g5DbHost = localStorage.getItem('bukmin_g5_db_host') || '';
      const g5DbName = localStorage.getItem('bukmin_g5_db_name') || '';

      if (!g5ApiUrl) return;

      try {
        // 1. Fetch news board posts (공식 보도자료)
        const newsResponse = await fetch(g5ApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${g5ApiKey}`
          },
          body: JSON.stringify({
            action: 'get_latest_posts',
            bo_table: 'news',
            limit: 15,
            db_host: g5DbHost,
            db_name: g5DbName
          })
        });

        // 2. Fetch gallery board posts (활동 갤러리)
        const galleryResponse = await fetch(g5ApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${g5ApiKey}`
          },
          body: JSON.stringify({
            action: 'get_latest_posts',
            bo_table: 'gallery',
            limit: 15,
            db_host: g5DbHost,
            db_name: g5DbName
          })
        });

        let fetchedItems: GalleryItem[] = [];

        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          if (newsData.status === 'success' && Array.isArray(newsData.data)) {
            const mappedNews = newsData.data.map((p: any) => ({
              id: `g5_news_${p.wr_id}`,
              category: 'press' as const,
              title: p.wr_subject,
              date: p.wr_datetime ? p.wr_datetime.substring(0, 10) : '2026-06-14',
              description: p.wr_content,
              views: parseInt(p.wr_hit) || 0,
              tags: ['그누보드', 'news'],
              imagePlaceholderColor: 'from-amber-400 to-rose-500'
            }));
            fetchedItems = [...fetchedItems, ...mappedNews];
          }
        }

        if (galleryResponse.ok) {
          const galleryData = await galleryResponse.json();
          if (galleryData.status === 'success' && Array.isArray(galleryData.data)) {
            const mappedGallery = galleryData.data.map((p: any) => ({
              id: `g5_gallery_${p.wr_id}`,
              category: 'gallery' as const,
              title: p.wr_subject,
              date: p.wr_datetime ? p.wr_datetime.substring(0, 10) : '2026-06-14',
              description: p.wr_content,
              views: parseInt(p.wr_hit) || 0,
              tags: ['그누보드', 'gallery'],
              imagePlaceholderColor: 'from-emerald-400 to-teal-600'
            }));
            fetchedItems = [...fetchedItems, ...mappedGallery];
          }
        }

        if (fetchedItems.length > 0) {
          setGalleryItems(prev => {
            const uniqueTitles = new Set(fetchedItems.map(item => item.title));
            const remaining = prev.filter(item => !uniqueTitles.has(item.title) && !item.id.toString().startsWith('g5_'));
            return [...fetchedItems, ...remaining];
          });
        }
      } catch (err) {
        console.warn('Could not complete GnuBoard live network posts fetch:', err);
      }
    };

    fetchG5Data();
    
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

  // Render full page detail view if selectedItem is truthy, instead of a popup modal
  if (selectedItem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-2 text-left" id="news-detail-container">
        {/* Back and breadcrumb */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setSelectedItem(null)}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-gray-250/60"
          >
            ← 목록으로 돌아가기
          </button>
          
          <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
            {selectedItem.category === 'press' ? '공식 보도자료' : '활동 포토 갤러리'}
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 space-y-6 shadow-xs">
          {/* Cover gradient or banner space */}
          <div className={`h-56 sm:h-72 bg-gradient-to-tr ${selectedItem.imagePlaceholderColor} rounded-2xl relative p-6 flex items-end overflow-hidden shadow-2xs`}>
            <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold text-white bg-black/30 backdrop-blur-md border border-white/20 select-none">
              북민회 알림마당 가동 채널
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center text-xs">
              <span className="text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full">
                게시 일자: {selectedItem.date}
              </span>
              <span className="text-gray-400 font-medium">
                일반 게시판 조회수: {selectedItem.views}회
              </span>
            </div>
            
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug">
              {selectedItem.title}
            </h3>
            
            <hr className="border-gray-100/80" />
            
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans whitespace-pre-line pt-2">
              {selectedItem.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-6 border-t border-gray-100">
            {selectedItem.tags.map((tag) => (
              <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-bold">
                #{tag}
              </span>
            ))}
          </div>

          {/* 공유하기 및 빠른 조치 통합 컨트롤 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/10 border border-amber-200/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="text-left space-y-1">
              <span className="text-[9px] font-black text-amber-600 tracking-wider flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                SHARE THIS ARTICLE
              </span>
              <h4 className="text-xs font-black text-gray-900">본 소식 외부 공유하기</h4>
              <p className="text-[10.5px] text-gray-400">탈북민 사회의 자조와 통합을 카카오톡이나 직접 복제 링크로 널리 알려 소통을 촉진하십시오.</p>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              {/* 카카오톡 공유 버튼 */}
              <button
                type="button"
                onClick={() => {
                  const shareUrl = `${window.location.origin}/#/news?id=${selectedItem.id}`;
                  const text = `[사단법인 북한이탈주민중앙회] 소식: ${selectedItem.title}`;
                  const kakaoShareUrl = `https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
                  window.open(kakaoShareUrl, '_blank');
                }}
                className="px-4 py-2 bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#191919] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-3xs cursor-pointer border border-[#FEE500]/30"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-[#191919] text-[#191919]" />
                <span>카카오톡 공유</span>
              </button>

              {/* 링크 복사 버튼 */}
              <button
                type="button"
                onClick={() => {
                  const shareUrl = `${window.location.origin}/#/news?id=${selectedItem.id}`;
                  navigator.clipboard.writeText(shareUrl).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
                className={`px-4 py-2 border text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs ${
                  copied 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 select-none' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>{copied ? '복사 완료! 🔗' : '링크 복사'}</span>
              </button>
            </div>
          </div>

          <div className="pt-5 flex justify-end gap-2 border-t border-gray-100/50">
            <button
              onClick={() => setSelectedItem(null)}
              className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-black text-xs transition-colors cursor-pointer"
            >
              목록으로 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <Layers className={`w-3.5 h-3.5 ${filter === 'all' ? 'text-blue-600' : 'text-blue-500'}`} />
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
            <Newspaper className={`w-3.5 h-3.5 ${filter === 'press' ? 'text-amber-600' : 'text-amber-500'}`} />
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
            <Camera className={`w-3.5 h-3.5 ${filter === 'gallery' ? 'text-emerald-600' : 'text-emerald-500'}`} />
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
    </div>
  );
}
