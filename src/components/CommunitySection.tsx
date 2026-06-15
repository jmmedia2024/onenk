import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Eye, Search, PlusCircle, PenTool, CheckCircle, Info, Calendar, Lock, HelpCircle, Bell, ChevronRight, Sparkles } from 'lucide-react';
import { Post, Comment } from '../types';

interface CommunitySectionProps {
  isLoggedIn?: boolean;
  onTriggerLogin?: () => void;
}

export default function CommunitySection({ 
  isLoggedIn = false, 
  onTriggerLogin 
}: CommunitySectionProps) {
  const [activeBoard, setActiveBoard] = useState<'free' | 'qna' | 'notice' | 'private'>('free');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  // New post draft
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  // New Comment Draft
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Prepopulate standard database in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bukmin_posts_v1');
    if (saved) {
      setPosts(JSON.parse(saved));
    } else {
      const initialPosts: Post[] = [
        {
          id: 'post-1',
          type: 'notice',
          title: '[공지] 2026 하반기 정착 생활 장학생 선발 모집 규격 안내',
          content: '안녕하십니까, 사단법인 북한이탈주민중앙회 기획재정부입니다.\n본회 가입 회원의 자녀 및 학업을 이행하고 있는 북한이탈주민 청년들을 자조 격려하기 위한 하반기 인재 장학 전형 접수를 시작합니다.\n\n■ 접수 기한: 2026년 7월 15일까지\n■ 제출 서류: 장학 신청원, 북한이탈주민 확인서, 학업 성적 증명서\n많은 지원 바랍니다.',
          author: '중앙회 관리총무처',
          date: '2026-06-11',
          views: 94,
          likes: 21,
          comments: [
            { id: 'com-1', author: '강철수', content: '좋은 소식 감사합니다! 주변 대학생 탈북 청년들에게도 널리 알리겠습니다.', date: '2026-06-11' }
          ]
        },
        {
          id: 'post-private-1',
          type: 'private',
          title: '[정회원 기밀] 2026 하반기 긴급 정착자금 수혜 특별 배정 현황 공람 (우대배부)',
          content: '안녕하십니까, 중앙회 정회원 심사위원회입니다.\n올해 하반기 영세 보수 가구 및 위기 중독 세대를 자조 격려하고자 지급되는 특별 후원 특별 연대 자금 산정안이 정식 인가되었습니다.\n\n정회원들께서는 지급 영수증과 실명 거주 확인 지침서를 지참하시고 다음 주 금요일 오전까지 중앙회 3층 자력지원실로 신분증 및 사도 도장을 지참하시어 직접 내방해 주십시오.\n\n본 사항은 정회원에 선결 부여되는 안심 기밀 조치이므로 제3자 유포 및 남용 시 자조 혜택 연대가 정지될 수 있음에 유의하십시오.',
          author: '중앙기금운용위',
          date: '2026-06-12',
          views: 18,
          likes: 6,
          comments: []
        },
        {
          id: 'post-private-2',
          type: 'private',
          title: '[취업추천] 현대정보고속 특별 연계 전형 추천서 가접수 공문 (자녀 대조군)',
          content: '사단법인 북한이탈주민중앙회와 현대차그룹 인재연계교류회가 정식 맺은 통일 우대 정주 협정에 의거하여, 본회 소속 정회원 자녀 및 대졸 청년들을 대상으로 한 긴급 교직/특전 사관 채용 직무 상담 추천서를 우선 교부합니다.\n\n접수는 본회 사무처 대표 이메일 및 유선 행정을 통해 선결 6인에 한해 배정 조치되오니 서둘러 상담을 의뢰하십시오.',
          author: '중앙회 자조추천처',
          date: '2026-06-10',
          views: 29,
          likes: 11,
          comments: []
        },
        {
          id: 'post-2',
          type: 'free',
          title: '지난주 주말 수제 오찬 빵 나눔 봉사에 동행했습니다. 정말 감동적이었습니다.',
          content: '처음 만나는 어르신들께서 손을 잡아주시며 "자유 찾아서 남한에서 열심히 살고, 또 이렇게 봉사까지 하느라 눈물겹도록 기특하다"고 격려해 주셨을 때 눈시울이 붉어졌습니다.\n\n정부의 양치 지원에만 의존하지 않고 주체적으로 우리 사회의 한 기둥이 되겠다는 다짐을 되새기게 한 하루였습니다. 앞으로도 정기 모임 동아리에 꾸준히 참가하겠습니다.',
          author: '김하나',
          date: '2026-06-08',
          views: 142,
          likes: 38,
          comments: [
            { id: 'com-2', author: '도우미원', content: '정말 고생 많으셨습니다! 김하나 님의 수기 덕에 봉사단의 기운이 배가 되네요.', date: '2026-06-08' },
            { id: 'com-3', author: '이철민', content: '다음 나눔에는 저도 꼭 정식 가입하여 참여하려 합니다. 가입 정보는 어디로 넣나요?', date: '2026-06-09' }
          ]
        },
        {
          id: 'post-3',
          type: 'qna',
          title: '정착지원금 및 법률 구조 연계 절차가 어떻게 되나요?',
          content: '최근 보증금 관련 분쟁이 터져 골머리를 썩고 있는데, 중앙회에서 변호사 연계 상담을 무료 지원받을 수 있는지 자세히 문의드립니다.',
          author: '박정우',
          date: '2026-06-05',
          views: 89,
          likes: 12,
          comments: [
            { id: 'com-4', author: '법률보호과', content: '안녕하십니까 박정우 님. 본회에서는 대한법률구조공단 계약을 통해 무상 상담을 연계합니다. 우측 탭이나 전화 02-720-3400으로 접수하시면 조속히 이민 전문 변호사를 연결 및 구술 조율해 드리겠습니다.', date: '2026-06-05' }
          ]
        },
        {
          id: 'post-4',
          type: 'free',
          title: '신뢰받는 협의회 운영을 촉진하기 위한 건의 드립니다.',
          content: '중앙회 사이트 전면 투명 전산 회계가 전결 처리되어 영수 내역까지 pdf 다운로드 되니 기탁 회원으로서 매우 안심되고 자긍심이 듭니다.\n소수 단체들의 회계 부설 잡음이 통일 운동을 저해하곤 하는데, 북민회가 모범을 보여주어 너무 다행이십니다.',
          author: '윤기탁',
          date: '2026-05-28',
          views: 110,
          likes: 45,
          comments: []
        }
      ];
      localStorage.setItem('bukmin_posts_v1', JSON.stringify(initialPosts));
      setPosts(initialPosts);
    }
  }, []);

  const savePosts = (newPosts: Post[]) => {
    localStorage.setItem('bukmin_posts_v1', JSON.stringify(newPosts));
    setPosts(newPosts);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !newAuthor.trim()) return;

    const draft: Post = {
      id: `post-${Date.now()}`,
      type: activeBoard,
      title: newTitle,
      content: newContent,
      author: newAuthor,
      date: new Date().toISOString().split('T')[0],
      views: 1,
      likes: 0,
      comments: []
    };

    const updated = [draft, ...posts];
    savePosts(updated);

    // Reset draft fields
    setNewTitle('');
    setNewContent('');
    setNewAuthor('');
    setIsCreating(false);
  };

  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!newCommentAuthor.trim() || !newCommentText.trim()) return;

    const updated = posts.map((p) => {
      if (p.id === postId) {
        const freshComment: Comment = {
          id: `com-${Date.now()}`,
          author: newCommentAuthor,
          content: newCommentText,
          date: new Date().toISOString().split('T')[0]
        };
        const updatedPost = {
          ...p,
          comments: [...p.comments, freshComment]
        };
        // also sync visual selected active post details
        if (selectedPost?.id === postId) {
          setSelectedPost(updatedPost);
        }
        return updatedPost;
      }
      return p;
    });

    savePosts(updated);
    setNewCommentAuthor('');
    setNewCommentText('');
  };

  const handleLikePost = (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const u = { ...p, likes: p.likes + 1 };
        if (selectedPost?.id === postId) {
          setSelectedPost(u);
        }
        return u;
      }
      return p;
    });
    savePosts(updated);
  };

  const incrementView = (post: Post) => {
    const updated = posts.map((p) => {
      if (p.id === post.id) {
        return { ...p, views: p.views + 1 };
      }
      return p;
    });
    savePosts(updated);
    setSelectedPost({ ...post, views: post.views + 1 });
  };

  const filteredPosts = posts.filter((p) => {
    return p.type === activeBoard && (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="max-w-6xl mx-auto px-4" id="community-section-container">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Forums Filter & Quick Info */}
        <div className="lg:col-span-4 space-y-5">
          <div className="glass-card p-5 rounded-2xl border border-gray-150 shadow-3xs bg-white text-left">
            <div className="border-b border-gray-100 pb-3 flex flex-col gap-0.5">
              <span className="text-[9px] font-black text-blue-600 tracking-widest uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                COMMUNICATION HUB
              </span>
              <h3 className="font-extrabold text-gray-950 text-sm flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>소통 게시판 채널</span>
              </h3>
            </div>
            
            <div className="flex flex-col gap-2.5 mt-3.5">
              {/* 1. Free Board Tab */}
              <button
                id="board-tab-free"
                onClick={() => { setActiveBoard('free'); setSelectedPost(null); setIsCreating(false); }}
                className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 border cursor-pointer flex items-center justify-between gap-3 group hover:-translate-y-0.5 active:scale-[0.985] active:translate-y-0 ${
                  activeBoard === 'free'
                    ? 'bg-gradient-to-r from-blue-50/80 to-blue-50/20 border-blue-200 shadow-[0_4px_12px_rgba(59,130,246,0.06),inset_0_1.5px_0_rgba(255,255,255,0.9)]'
                    : 'bg-slate-50/40 border-gray-150 hover:border-gray-250 hover:bg-white shadow-[0_1px_2px_rgba(0,0,0,0.01),inset_0_1px_0_rgba(255,255,255,0.8)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8.5 h-8.5 rounded-lg shrink-0 flex items-center justify-center border transition-all duration-200 ${
                    activeBoard === 'free' ? 'bg-blue-600 border-blue-600 text-white shadow-3xs' : 'bg-blue-50 border-blue-100 text-blue-600 group-hover:bg-blue-100/50'
                  }`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-black truncate transition-colors duration-200 ${activeBoard === 'free' ? 'text-blue-900 font-extrabold' : 'text-gray-800'}`}>
                      자유 토론 자유게시판
                    </div>
                    <div className="text-[10px] text-gray-400 truncate mt-0.5 font-medium">
                      회원간 자유로운 소통과 정보 교류
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold transition-colors ${
                    activeBoard === 'free' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100/80 border border-gray-150 text-gray-450'
                  }`}>
                    {posts.filter(p => p.type === 'free').length}
                  </span>
                  {activeBoard === 'free' && <ChevronRight className="w-3.5 h-3.5 text-blue-600 animate-in fade-in" />}
                </div>
              </button>

              {/* 2. QnA Q&A Board Tab */}
              <button
                id="board-tab-qna"
                onClick={() => { setActiveBoard('qna'); setSelectedPost(null); setIsCreating(false); }}
                className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 border cursor-pointer flex items-center justify-between gap-3 group hover:-translate-y-0.5 active:scale-[0.985] active:translate-y-0 ${
                  activeBoard === 'qna'
                    ? 'bg-gradient-to-r from-teal-50/80 to-teal-50/20 border-teal-200 shadow-[0_4px_12px_rgba(20,184,166,0.06),inset_0_1.5px_0_rgba(255,255,255,0.9)]'
                    : 'bg-slate-50/40 border-gray-150 hover:border-gray-250 hover:bg-white shadow-[0_1px_2px_rgba(0,0,0,0.01),inset_0_1px_0_rgba(255,255,255,0.8)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8.5 h-8.5 rounded-lg shrink-0 flex items-center justify-center border transition-all duration-200 ${
                    activeBoard === 'qna' ? 'bg-teal-600 border-teal-600 text-white shadow-3xs' : 'bg-teal-50 border-teal-100 text-teal-600 group-hover:bg-teal-100/50'
                  }`}>
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-black truncate transition-colors duration-200 ${activeBoard === 'qna' ? 'text-teal-900 font-extrabold' : 'text-gray-800'}`}>
                      1:1 빠른 민원 Q&amp;A
                    </div>
                    <div className="text-[10px] text-gray-400 truncate mt-0.5 font-medium">
                      맞춤형 정착 고충 행정 민원 상담
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold transition-colors ${
                    activeBoard === 'qna' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100/80 border border-gray-150 text-gray-450'
                  }`}>
                    {posts.filter(p => p.type === 'qna').length}
                  </span>
                  {activeBoard === 'qna' && <ChevronRight className="w-3.5 h-3.5 text-teal-600 animate-in fade-in" />}
                </div>
              </button>

              {/* 3. Notice Board Tab */}
              <button
                id="board-tab-notice"
                onClick={() => { setActiveBoard('notice'); setSelectedPost(null); setIsCreating(false); }}
                className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 border cursor-pointer flex items-center justify-between gap-3 group hover:-translate-y-0.5 active:scale-[0.985] active:translate-y-0 ${
                  activeBoard === 'notice'
                    ? 'bg-gradient-to-r from-amber-50/80 to-amber-50/20 border-amber-200 shadow-[0_4px_12px_rgba(245,158,11,0.06),inset_0_1.5px_0_rgba(255,255,255,0.9)]'
                    : 'bg-slate-50/40 border-gray-150 hover:border-gray-250 hover:bg-white shadow-[0_1px_2px_rgba(0,0,0,0.01),inset_0_1px_0_rgba(255,255,255,0.8)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8.5 h-8.5 rounded-lg shrink-0 flex items-center justify-center border transition-all duration-200 ${
                    activeBoard === 'notice' ? 'bg-amber-600 border-amber-600 text-white shadow-3xs' : 'bg-amber-50 border-amber-100 text-amber-600 group-hover:bg-amber-100/50'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-black truncate transition-colors duration-200 ${activeBoard === 'notice' ? 'text-amber-900 font-extrabold' : 'text-gray-800'}`}>
                      중앙회 긴급 공지사항
                    </div>
                    <div className="text-[10px] text-gray-400 truncate mt-0.5 font-medium">
                      주요 행정 공고 및 공식 일정 알림
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold transition-colors ${
                    activeBoard === 'notice' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100/80 border border-gray-150 text-gray-450'
                  }`}>
                    {posts.filter(p => p.type === 'notice').length}
                  </span>
                  {activeBoard === 'notice' && <ChevronRight className="w-3.5 h-3.5 text-amber-600 animate-in fade-in" />}
                </div>
              </button>

              {/* 4. Private Board Tab */}
              <button
                id="board-tab-private"
                onClick={() => { setActiveBoard('private'); setSelectedPost(null); setIsCreating(false); }}
                className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 border cursor-pointer flex items-center justify-between gap-3 group hover:-translate-y-0.5 active:scale-[0.985] active:translate-y-0 ${
                  activeBoard === 'private'
                    ? 'bg-gradient-to-r from-purple-50/80 to-purple-50/20 border-purple-200 shadow-[0_4px_12px_rgba(168,85,247,0.06),inset_0_1.5px_0_rgba(255,255,255,0.9)]'
                    : 'bg-slate-50/40 border-gray-150 hover:border-gray-250 hover:bg-white shadow-[0_1px_2px_rgba(0,0,0,0.01),inset_0_1px_0_rgba(255,255,255,0.8)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8.5 h-8.5 rounded-lg shrink-0 flex items-center justify-center border transition-all duration-200 ${
                    activeBoard === 'private' ? 'bg-purple-600 border-purple-600 text-white shadow-3xs' : 'bg-purple-50 border-purple-100 text-purple-600 group-hover:bg-purple-100/50'
                  }`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-black flex items-center gap-1 truncate transition-colors duration-200 ${activeBoard === 'private' ? 'text-purple-900 font-extrabold' : 'text-gray-800'}`}>
                      3만 4천 통일기수 자조회
                      {!isLoggedIn && <Sparkles className="w-3 h-3 text-amber-500 shrink-0 fill-amber-500 animate-pulse" />}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate mt-0.5 font-medium">
                      인증받은 정회원 전용 비공개 채널
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold transition-colors ${
                    activeBoard === 'private' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100/80 border border-gray-150 text-gray-400'
                  }`}>
                    {posts.filter(p => p.type === 'private').length}
                  </span>
                  {activeBoard === 'private' && <ChevronRight className="w-3.5 h-3.5 text-purple-600 animate-in fade-in" />}
                </div>
              </button>
            </div>
          </div>

          {/* Quick Informational Box for Membership */}
          <div className="glass-card p-5 rounded-2xl bg-amber-50/20 border-teal-100 space-y-4">
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-600 animate-pulse" /> 회원 가입 및 정회가입 안내
            </h4>
            <div className="text-[11px] text-gray-500 leading-relaxed space-y-2">
              <p>
                사단법인 북한이탈주민중앙회는 온/오프라인 정회원 승인 요건을 철저히 검증해 통일 기수단의 인화를 수탁합니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong className="text-gray-700">실명 주민 승인:</strong> 본민 확인 인증서 지참 제출</li>
                <li><strong className="text-gray-700">정회원 복지:</strong> 법률 무료 연계, 장학 자금 우대</li>
              </ul>
            </div>
            <button
              onClick={() => alert('회원가입 서식 발송 및 문의처(02-720-3400)로 친절 안내드립니다.')}
              className="w-full text-center py-2 text-[11px] font-bold bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              우편 가입 신청원 수령하기
            </button>
          </div>
        </div>

        {/* Right Side: Active Board Content / Details & Creating Forms */}
        <div className="lg:col-span-8">
          {activeBoard === 'private' && !isLoggedIn ? (
            /* Beautiful Gated Locked State */
            <div className="glass-card p-8 md:p-12 rounded-3xl border border-blue-100 text-center space-y-6 bg-slate-50/50 shadow-3xs animate-in fade-in zoom-in-95" id="private-locked-gate">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-50/80 flex items-center justify-center border border-blue-150 text-blue-600 shadow-3xs mb-2">
                <Lock className="w-7 h-7" />
              </div>
              
              <div className="space-y-2 max-w-md mx-auto">
                <div className="text-[10px] text-blue-600 font-extrabold tracking-widest uppercase">Secured Regular Intranet</div>
                <h3 className="text-base font-black text-gray-950">정회원 비공개 소통채널</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                  본 민감 소통 채널은 정착 지위를 공인받고 본 위주의 실주민 검증을 마친 정회원만 열람 가능한 전용망입니다. 외부 오용을 사전에 조치하고 안전한 협력을 보위하기 위해 로그인이 요구됩니다.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  type="button"
                  onClick={onTriggerLogin}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" /> 정회원 간편 로그인하기
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBoard('free')}
                  className="px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  일반 자유게시판 이동
                </button>
              </div>
              
              <div className="text-[10px] text-gray-400 font-semibold pt-4">
                상담 문의: 사단법인 북한이탈주민중앙회 사무국 (전화 02-720-3400)
              </div>
            </div>
          ) : selectedPost ? (
            /* Post Detail Screen */
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-gray-100 space-y-6" id="post-view-canvas">
              <button
                onClick={() => setSelectedPost(null)}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                &larr; 게시판 목록 목록으로 가기
              </button>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase font-mono">
                  {selectedPost.type === 'notice' ? '공지사항' : selectedPost.type === 'qna' ? '질문/답변' : selectedPost.type === 'private' ? '자조회 비공개' : '자유게시판'}
                </span>
                <h3 className="text-xl font-bold text-gray-900 leading-snug">{selectedPost.title}</h3>
                
                <div className="flex items-center justify-between text-xs text-gray-400 pt-1 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <span>작성자: <strong className="text-gray-700 font-semibold">{selectedPost.author}</strong></span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {selectedPost.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {selectedPost.views}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {selectedPost.likes}</span>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <p className="text-sm text-gray-600 leading-relaxed font-sans whitespace-pre-wrap py-2">
                {selectedPost.content}
              </p>

              {/* Like trigger */}
              <div className="flex justify-center pb-6 border-b border-gray-100">
                <button
                  id="btn-like-post"
                  onClick={() => handleLikePost(selectedPost.id)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-blue-200 text-blue-600 text-xs font-bold hover:bg-blue-50 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" /> 유익한 정보로 추천 ({selectedPost.likes})
                </button>
              </div>

              {/* Comments list */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <MessageSquare className="w-4 h-4 text-gray-400" /> 댓글 피드백 ({selectedPost.comments.length})
                </h4>

                <div className="space-y-3">
                  {selectedPost.comments.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">등록된 댓글이 없습니다. 첫 의견을 작성해 주세요.</p>
                  ) : (
                    selectedPost.comments.map((com) => (
                      <div key={com.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1 max-w-full">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-gray-800 font-bold">{com.author}</strong>
                          <span className="text-gray-400 font-sans">{com.date}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed font-sans">{com.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Insertion form */}
                <form
                  onSubmit={(e) => handleAddComment(e, selectedPost.id)}
                  className="bg-gray-50/50 border border-gray-100 p-4 rounded-xl space-y-3 mt-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="댓글 닉네임"
                      value={newCommentAuthor}
                      onChange={(e) => setNewCommentAuthor(e.target.value)}
                      required
                      className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="투명하고 열린 소통을 환영합니다. 예의를 지켜 소견을 자유롭게 남겨보세요..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    required
                    className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-blue-500"
                  ></textarea>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-gray-900 text-white text-[11px] font-bold px-4 py-2 rounded-lg"
                    >
                      의견 등록 완료
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : isCreating ? (
            /* Creating Form Screen */
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-gray-100 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-blue-600" /> 
                  {activeBoard === 'free' ? '자유게시판 글 게시' : '1:1 친절 Q&A 접수'}
                </h3>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-gray-400 hover:text-gray-900"
                >
                  취소하기
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">작성자 명의</label>
                    <input
                      type="text"
                      placeholder="예시: 김우회, 익명회원"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      required
                      className="w-full text-xs bg-white border border-gray-200 focus:border-blue-500 focus:outline-none px-3.5 py-2.5 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">글 제목</label>
                  <input
                    type="text"
                    placeholder="작성하고자 하는 핵심 주제를 요약해 명시하세요..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="w-full text-xs bg-white border border-gray-200 focus:border-blue-500 focus:outline-none px-3.5 py-2.5 rounded-xl transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">상세 진술 본문</label>
                  <textarea
                    rows={6}
                    placeholder="건강한 커뮤니티 공간을 위해 정주 애로사항, 지혜, 제언을 자유롭게 남겨보세요..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    required
                    className="w-full text-xs bg-white border border-gray-200 focus:border-blue-500 focus:outline-none px-3.5 py-2.5 rounded-xl transition-all font-sans"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50"
                  >
                    이전으로
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm"
                  >
                    글 작성 완료
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Post Listing Grid */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-2">
                {/* Search in listings */}
                <div className="relative flex-1 max-w-sm">
                  <input
                    id="board-search-input"
                    type="text"
                    placeholder="현재 게시판 제목 및 구술 내용 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-200 focus:border-blue-500 focus:outline-none pl-9 pr-3 py-2 rounded-xl transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                </div>

                {/* Create post action */}
                <button
                  id="btn-trigger-write"
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 border border-gray-800 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition-colors shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> 새로운 글쓰기
                </button>
              </div>

              {/* Feed items */}
              <div className="space-y-3">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100/60">
                    <p className="text-xs text-gray-400">게시판에 등록된 글이 존재하지 않습니다.</p>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => incrementView(post)}
                      className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between space-y-3"
                      id={`board-item-${post.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {post.type === 'notice' && (
                              <span className="text-[9px] font-extrabold bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded">
                                긴급 공지
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 font-bold tracking-wider">{post.author}</span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-xs leading-snug hover:text-blue-600 transition-colors">
                            {post.title}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 shrink-0">{post.date}</span>
                      </div>

                      <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.views}회 조회</span>
                          <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {post.likes}</span>
                        </div>
                        <span className="flex items-center gap-1 text-blue-600 font-extrabold text-[10px] bg-blue-50/70 px-2 py-0.5 rounded">
                          <MessageSquare className="w-3 h-3" /> 댓글 {post.comments.length}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
