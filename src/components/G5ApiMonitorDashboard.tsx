import React, { useState, useEffect } from 'react';
import { safeG5Fetch } from '../utils/g5Api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Layers, 
  TrendingUp, 
  Database, 
  HelpCircle, 
  Copy, 
  Check, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Server,
  Code2,
  Trash2,
  Wifi,
  Radio,
  Sliders,
  Maximize2
} from 'lucide-react';

interface G5ApiMonitorDashboardProps {
  g5ApiUrl: string;
  g5ApiKey: string;
  g5DbHost: string;
  g5DbName: string;
  g5DbUser: string;
}

interface TrafficLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST';
  endpoint: string;
  action: string;
  status: number;
  statusText: string;
  latency: number;
  size: number; // in bytes
  mode: 'Live (Remote)' | 'Sandbox (Local)';
  params: {
    page: number;
    limit: number;
    search?: string;
  };
}

// Pre-defined realistic mock lists to support paging simulations in the Sandbox Mode
const VIRTUAL_G5_MEMBERS = Array.from({ length: 32 }, (_, i) => {
  const names = ['김철수', '이영희', '박지성', '최동훈', '정미경', '한지우', '강현우', '윤아라', '조민수', '배수지', '임재범', '황선홍', '안정환', '설기현', '차두리', '송혜교', '전지현', '현빈', '공유', '손예진', '박보검', '김고은', '조인성', '송중기', '한효주', '유재석', '강호동', '신동엽', '이광수', '지석진', '김종국', '하동훈'];
  const ids = ['member_user', 'north_one', 'chollima_99', 'freedom_bell', 'hangang_star', 'tongil_flag', 'baekdu_peak', 'hallasan_9', 'dmz_peace', 'bukmin_34', 'pioneer_88', 'dream_runner', 'sincerity_k', 'oneness_kr', 'paju_guide', 'unification_h', 'saetomi_1', 'hope_carrier', 'new_hope_00', 'reunion_dawn', 'blue_bird', 'green_valley', 'river_flow', 'mt_geumgang', 'daedong_gang', 'pyongyang_cold', 'gwangju_life', 'daegu_apple', 'busan_seagull', 'incheon_sea', 'jeju_wind', 'seoul_sunrise'];
  const levels = [2, 2, 3, 3, 4, 3, 2, 5, 2, 3, 2, 2, 4, 2, 2, 3, 3, 3, 4, 2, 3, 2, 3, 4, 2, 2, 3, 2, 3, 2, 2, 10];
  
  return {
    mb_no: i + 1,
    mb_id: ids[i % ids.length],
    mb_name: names[i % names.length],
    mb_nick: `${names[i % names.length]}대표`,
    mb_level: levels[i % levels.length],
    mb_email: `${ids[i % ids.length]}@bukmin.org`,
    mb_tel: `010-${(1000 + i * 277).toString().padStart(4, '0')}-${(5000 + i * 149).toString().padStart(4, '0')}`,
    mb_datetime: `2026-06-${(1 + i % 14).toString().padStart(2, '0')} 15:30:22`,
    mb_open: true
  };
});

const VIRTUAL_G5_POSTS = Array.from({ length: 48 }, (_, i) => {
  const subjects = [
    '사단법인 북한이탈주민중앙회 정식 2분기 정주 지원금 교부 완료 공지',
    '탈북민 청년 기술 사관 3기 특혜 전문 채용 공고 (상담 신청)',
    '남북 동행 오케스트라 가을 연합 자선 음악회 패널 정회원 초대권 안내',
    '강제북송피해자가족 실태 연약 진정 조사 및 법률 원조 상담 신청 안내',
    '경주 지부 탈북 정착 실태 전수 조사 대표단 워크숍 현장 스케치',
    '2026년도 통일 연합 장학회 대상 청소년 전장 정기 후원자 명록 공개',
    '하나원 수료 대상자 영유아 긴급 정찰 복지 물품 6차 탁송 기록',
    '이은택 사무총장 외 대표단 행안부 정주의무 정책 자문 회무 기록 안내',
    '자유아고라 자유 배정 토론게시판 임시 분쟁 규제 규칙 제정 공고',
    '통일 기수단 자조회 정례 세미나 개최 일정 회견 및 공청 요청'
  ];
  
  const writers = ['최고관리자', '이은택', '지명희 위원장', '김재원 대표', '채신아 감사', '김형수', '이시영', '우리ONE운영', '평양조력국', '홍길동'];

  return {
    wr_id: i + 1,
    wr_num: -(i + 1),
    wr_subject: `[${i % 2 === 0 ? '공지사항' : '자유게시판'}] ${subjects[i % subjects.length]} (가용 회차 #${i + 1})`,
    wr_content: 'JM 연동 스토리지 테스트 데이터 필드가 정상적으로 프론트바와 연계 가동 중입니다. 페징 덤프 쿼리가 올바르게 처리되고 있는지 응답 상태를 확인하십시오.',
    wr_name: writers[i % writers.length],
    wr_datetime: `2026-06-${(1 + i % 14).toString().padStart(2, '0')} 12:45:10`,
    wr_hit: 12 + (i * 9) % 350
  };
});

const VIRTUAL_G5_DONATIONS = Array.from({ length: 25 }, (_, i) => {
  const names = ['장동건', '김희선', '박사랑 대표', '이우일 회장', '김원희', '강남조력회', '한우리통일', '지우엔터', '정정당당', '평화나눔'];
  return {
    spon_id: i + 100,
    spon_name: names[i % names.length],
    spon_phone: `010-8924-${(2000 + i * 51).toString()}`,
    spon_amount: (10000 + i * 5000) * (1 + (i % 5)),
    spon_type: i % 3 === 0 ? '정기후원' : '일시후원',
    spon_message: '우리 탈북민 가족분들이 당당한 통일 한국의 기둥으로 자립하길 온 힘을 다해 응원합니다.',
    spon_date: `2026-06-${(10 + i % 4).toString().padStart(2, '0')}`
  };
});

export default function G5ApiMonitorDashboard({
  g5ApiUrl,
  g5ApiKey,
  g5DbHost,
  g5DbName,
  g5DbUser
}: G5ApiMonitorDashboardProps) {
  // Input parameters
  const [activeEndpoint, setActiveEndpoint] = useState<'get_members' | 'get_posts' | 'sync_donations' | 'test_db_connection'>('get_members');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchFilter, setSearchFilter] = useState('');
  
  // Monitoring Output States
  const [isSimulating, setIsSimulating] = useState(false);
  const [responseCode, setResponseCode] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState<string>('');
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [responseSize, setResponseSize] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<any>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [executionMode, setExecutionMode] = useState<'Live (Remote)' | 'Sandbox (Local)'>('Sandbox (Local)');
  
  // Traffic Logs State
  const [trafficLogs, setTrafficLogs] = useState<TrafficLog[]>(() => {
    try {
      const saved = localStorage.getItem('bukmin_g5_traffic_logs');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    
    // Default system seed traffic logs for aesthetic realism
    return [
      {
        id: 'seed-1',
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString('ko-KR'),
        method: 'POST',
        endpoint: 'sync_bridge.php',
        action: 'test_db_connection',
        status: 200,
        statusText: 'OK',
        latency: 89,
        size: 320,
        mode: 'Sandbox (Local)',
        params: { page: 1, limit: 5 }
      },
      {
        id: 'seed-2',
        timestamp: new Date(Date.now() - 1800000).toLocaleTimeString('ko-KR'),
        method: 'POST',
        endpoint: 'sync_bridge.php',
        action: 'get_members',
        status: 200,
        statusText: 'OK',
        latency: 145,
        size: 2450,
        mode: 'Sandbox (Local)',
        params: { page: 1, limit: 5 }
      }
    ];
  });

  const [copiedResponse, setCopiedResponse] = useState(false);

  // Sync state limits when params change
  useEffect(() => {
    setPage(1); // Reset page on action change
  }, [activeEndpoint]);

  // Execute Simulated or Real API Call
  const handleTriggerRequest = async () => {
    setIsSimulating(true);
    setResponseCode(null);
    setResponseBody(null);
    setResponseLatency(null);
    setResponseSize(null);
    
    const startTime = performance.now();
    const timestampStr = new Date().toLocaleTimeString('ko-KR');
    
    const requestPayload = {
      action: activeEndpoint,
      page,
      limit,
      search: searchFilter || undefined,
      db_config: {
        host: g5DbHost,
        name: g5DbName,
        user: g5DbUser
      }
    };

    // If an API URL is specified, try a real endpoint call inside the sandboxed iframe
    let executedMode: 'Live (Remote)' | 'Sandbox (Local)' = 'Sandbox (Local)';
    let httpStatus = 200;
    let httpStatusText = 'OK';
    let resJson: any = null;
    let fallbackToSandbox = false;
    let resHeaders: Record<string, string> = {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'cache-control': 'no-store, no-cache, must-revalidate',
      'x-powered-by': 'PHP/8.1-GnuBoard5-Bridge'
    };

    if (g5ApiUrl) {
      try {
        executedMode = 'Live (Remote)';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await safeG5Fetch(g5ApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${g5ApiKey || ''}`
          },
          body: JSON.stringify(requestPayload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        httpStatus = res.status;
        httpStatusText = res.statusText || (res.status === 200 ? 'OK' : 'Unknown');
        
        // Grab headers
        res.headers.forEach((val, key) => {
          resHeaders[key] = val;
        });

        if (res.ok) {
          resJson = await res.json();
          // If server successfully replied, we take their JSON. If they replied error JSON, we display it.
        } else {
          fallbackToSandbox = true;
        }
      } catch (err) {
        // Network error, probably CORS or Offline. Let's gracefully fallback to the virtual GnuBoard5 engine
        fallbackToSandbox = true;
      }
    } else {
      fallbackToSandbox = true;
    }

    // Delay a bit to create a luxurious, authentic feeling of packet transmission
    await new Promise((r) => setTimeout(r, Math.max(300, Math.floor(Math.random() * 600))));

    const latency = Math.round(performance.now() - startTime);

    if (fallbackToSandbox) {
      executedMode = 'Sandbox (Local)';
      httpStatus = 200;
      httpStatusText = 'OK';
      
      // Calculate Pagination details on Virtual DB
      if (activeEndpoint === 'get_members') {
        const filtered = VIRTUAL_G5_MEMBERS.filter(m => 
          !searchFilter || 
          m.mb_name.includes(searchFilter) || 
          m.mb_id.includes(searchFilter) || 
          m.mb_nick.includes(searchFilter)
        );
        const totalCount = filtered.length;
        const totalPages = Math.ceil(totalCount / limit) || 1;
        const currentPage = Math.min(page, totalPages);
        const startIndex = (currentPage - 1) * limit;
        const paginatedData = filtered.slice(startIndex, startIndex + limit);

        resJson = {
          success: true,
          action: 'get_members',
          timestamp: new Date().toISOString(),
          version: 'GnuBoard5 Standard PHP Bridge 1.2.0',
          paging: {
            page: currentPage,
            limit: limit,
            total_count: totalCount,
            total_pages: totalPages,
            has_next: currentPage < totalPages,
            has_prev: currentPage > 1
          },
          data: paginatedData
        };
      } else if (activeEndpoint === 'get_posts') {
        const filtered = VIRTUAL_G5_POSTS.filter(p => 
          !searchFilter || 
          p.wr_subject.includes(searchFilter) || 
          p.wr_name.includes(searchFilter)
        );
        const totalCount = filtered.length;
        const totalPages = Math.ceil(totalCount / limit) || 1;
        const currentPage = Math.min(page, totalPages);
        const startIndex = (currentPage - 1) * limit;
        const paginatedData = filtered.slice(startIndex, startIndex + limit);

        resJson = {
          success: true,
          action: 'get_posts',
          timestamp: new Date().toISOString(),
          paging: {
            page: currentPage,
            limit: limit,
            total_count: totalCount,
            total_pages: totalPages,
            has_next: currentPage < totalPages,
            has_prev: currentPage > 1
          },
          data: paginatedData
        };
      } else if (activeEndpoint === 'sync_donations') {
        const totalCount = VIRTUAL_G5_DONATIONS.length;
        const totalPages = Math.ceil(totalCount / limit) || 1;
        const currentPage = Math.min(page, totalPages);
        const startIndex = (currentPage - 1) * limit;
        const paginatedData = VIRTUAL_G5_DONATIONS.slice(startIndex, startIndex + limit);

        resJson = {
          success: true,
          action: 'sync_donations',
          timestamp: new Date().toISOString(),
          paging: {
            page: currentPage,
            limit: limit,
            total_count: totalCount,
            total_pages: totalPages,
            has_next: currentPage < totalPages,
            has_prev: currentPage > 1
          },
          data: paginatedData
        };
      } else if (activeEndpoint === 'test_db_connection') {
        resJson = {
          success: true,
          action: 'test_db_connection',
          version: 'GnuBoard5 Standard API SDK v1.2.0',
          db_connection: 'CONNECTED',
          db_host: g5DbHost || '127.0.0.1',
          db_schema: g5DbName || 'g5_database',
          member_count: VIRTUAL_G5_MEMBERS.length,
          posts_count: VIRTUAL_G5_POSTS.length
        };
      }
    }

    const calculatedSize = JSON.stringify(resJson || {}).length;

    // Set view results
    setResponseCode(httpStatus);
    setResponseStatusText(httpStatusText);
    setResponseLatency(latency);
    setResponseSize(calculatedSize);
    setResponseBody(resJson);
    setResponseHeaders(resHeaders);
    setExecutionMode(executedMode);

    // Append to Traffic Logs
    const newLog: TrafficLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: timestampStr,
      method: 'POST',
      endpoint: g5ApiUrl ? g5ApiUrl.split('/').pop() || 'sync_bridge.php' : 'sync_bridge.php',
      action: activeEndpoint,
      status: httpStatus,
      statusText: httpStatusText,
      latency,
      size: calculatedSize,
      mode: executedMode,
      params: { page, limit, search: searchFilter || undefined }
    };

    setTrafficLogs(prev => {
      const next = [newLog, ...prev].slice(0, 30); // Keep last 30 logs
      localStorage.setItem('bukmin_g5_traffic_logs', JSON.stringify(next));
      return next;
    });

    setIsSimulating(false);
  };

  const handleClearLogs = () => {
    setTrafficLogs([]);
    localStorage.removeItem('bukmin_g5_traffic_logs');
  };

  const handleCopyJSON = () => {
    if (!responseBody) return;
    navigator.clipboard.writeText(JSON.stringify(responseBody, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  // Helper colors for HTTP status
  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (code >= 300 && code < 400) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (code >= 400 && code < 500) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  return (
    <div className="bg-white border border-gray-150 rounded-2xl p-5 space-y-6 text-left" id="g5-realtime-api-monitor-dashboard">
      
      {/* Title & Headline metadata */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">RESTful JSON Transceiver Monitor</span>
          </div>
          <h4 className="text-sm font-black text-gray-950 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-blue-500" />
            <span>JM 실시간 API 모니터링 &amp; 페이징 대시보드</span>
          </h4>
          <p className="text-[11px] text-gray-400 font-medium">
            원격 PHP 스크립트와의 실시간 HTTP 응답 수배 및 데이터 페이징(Offset, Limit, Total) 정밀도를 시뮬레이션 감시합니다.
          </p>
        </div>
        
        {/* Connection mode badges */}
        <div className="flex items-center gap-2">
          <div className={`p-1.5 px-3 rounded-lg text-[10px] font-[800] border flex items-center gap-1 ${
            g5ApiUrl 
              ? 'bg-blue-50 border-blue-100 text-blue-700' 
              : 'bg-amber-50 border-amber-100 text-amber-700'
          }`}>
            <Wifi className="w-3.5 h-3.5" />
            <span>{g5ApiUrl ? '원격 엔드포인트 수립' : '로컬 가상 모드 자동 우회'}</span>
          </div>
        </div>
      </div>

      {/* Grid Settings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Column Left: Controls & Paging Settings (4 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-4 bg-slate-50/50 border border-gray-150 rounded-xl space-y-4">
            <h5 className="font-extrabold text-gray-900 text-[11px] flex items-center gap-1 border-b border-gray-200 pb-2">
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              <span>API 파라미터 구성 (Pagination Tuning)</span>
            </h5>

            {/* Selector: Action Enpoints */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 block block text-left">호출 타겟 액션 (Action Endpoints)</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'get_members', label: 'g5_member 리스트', icon: Database },
                  { id: 'get_posts', label: 'g5_board_new 최신글', icon: Layers },
                  { id: 'sync_donations', label: 'g5_sponsorship 후원', icon: TrendingUp },
                  { id: 'test_db_connection', label: 'DB 가용 회선 검사', icon: Server },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveEndpoint(item.id as any);
                        setResponseBody(null);
                        setResponseCode(null);
                      }}
                      className={`p-2.5 rounded-lg text-[10.5px] font-bold text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeEndpoint === item.id 
                          ? 'bg-blue-600 text-white shadow-3xs hover:bg-blue-700' 
                          : 'bg-white border border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeEndpoint !== 'test_db_connection' && (
              <>
                {/* Selector: Paging parameters (Page and Limit) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 block text-left">현재 페이지 (Page No)</label>
                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1 text-gray-500 hover:text-black hover:bg-slate-50 disabled:opacity-30 rounded cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black font-mono flex-1 text-center">{page}</span>
                      <button
                        type="button"
                        onClick={() => setPage(p => p + 1)}
                        className="p-1 text-gray-500 hover:text-black hover:bg-slate-50 rounded cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 block text-left">노출 개수 (Limit Count)</label>
                    <select
                      className="w-full bg-white border border-gray-200 text-xs px-2 py-1.5 rounded-lg font-bold font-mono focus:outline-none cursor-pointer"
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                    >
                      <option value="3">3개씩 (Paging Heavy)</option>
                      <option value="5">5개씩 (Standard)</option>
                      <option value="10">10개씩 (Compact)</option>
                      <option value="20">20개씩 (Bulk Page)</option>
                    </select>
                  </div>
                </div>

                {/* Filter Search */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gray-400 block text-left">검색어 쿼리 필터 (where query)</label>
                    {searchFilter && (
                      <button 
                        onClick={() => setSearchFilter('')}
                        className="text-[9px] text-blue-600 font-extrabold cursor-pointer"
                      >
                        지우기
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 text-xs px-3 py-2 rounded-lg transition-all focus:outline-none"
                    placeholder="이름, 회원 아이디 또는 보드 제목 기재..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                  />
                  <span className="text-[9.5px] text-gray-400 font-medium block">
                    * 원격/가상 데이터베이스 내의 매칭된 필드만 추출 적용합니다.
                  </span>
                </div>
              </>
            )}

            {/* Execute Button */}
            <button
              type="button"
              onClick={handleTriggerRequest}
              disabled={isSimulating}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-3xs flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-ping' : ''}`} />
              <span>{isSimulating ? 'API 응답 신호 전송 해독 중...' : 'API 데이터 송수신 테스트'}</span>
            </button>
          </div>

          {/* Pagination Interactive Controller Visual Blueprint */}
          {responseBody && responseBody.paging && (
            <div className="p-4 border border-blue-100 bg-blue-50/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-700 uppercase">페이징 연동 가용 지표 (Paging Meta)</span>
                <span className="text-[9.5px] text-gray-400 font-mono font-bold">
                  Page {responseBody.paging.page} / {responseBody.paging.total_pages}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-[10.5px] text-gray-600 font-semibold font-mono bg-white p-2.5 rounded-lg border border-gray-100">
                <div className="flex justify-between border-r border-gray-50 pr-2">
                  <span>가입/글 총 누적:</span>
                  <span className="font-bold text-gray-800">{responseBody.paging.total_count}개</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>전체 페이지수:</span>
                  <span className="font-bold text-gray-800">{responseBody.paging.total_pages}장</span>
                </div>
              </div>

              {/* Interactive buttons */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={!responseBody.paging.has_prev || isSimulating}
                  onClick={() => {
                    setPage(p => Math.max(1, p - 1));
                    setTimeout(() => handleTriggerRequest(), 10);
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-gray-700 border border-gray-200 rounded-lg text-[10.5px] font-bold flex items-center gap-0.5 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>이전 페이지</span>
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, responseBody.paging.total_pages) }, (_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => {
                          setPage(pageNum);
                          setTimeout(() => handleTriggerRequest(), 10);
                        }}
                        className={`w-6 h-6 rounded-md text-[10.5px] font-mono font-bold ${
                          responseBody.paging.page === pageNum 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white hover:bg-slate-50 text-gray-600 border border-gray-150'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={!responseBody.paging.has_next || isSimulating}
                  onClick={() => {
                    setPage(p => p + 1);
                    setTimeout(() => handleTriggerRequest(), 10);
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-gray-700 border border-gray-200 rounded-lg text-[10.5px] font-bold flex items-center gap-0.5 disabled:opacity-30 cursor-pointer"
                >
                  <span>다음</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Column Right: Live REST Dashboard JSON Printer (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[400px]">
          
          {/* Output Headers info bar */}
          <div className="bg-slate-900 rounded-t-xl p-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-slate-800 rounded text-slate-400">
                <Code2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] text-slate-300 font-mono font-bold">HTTP TRANSACTION RESPONSE BODY DETAILED</span>
            </div>

            {responseCode && (
              <div className="flex items-center gap-2">
                <div className={`px-2 py-0.5 rounded text-[10px] font-black font-sans border ${getStatusColor(responseCode)}`}>
                  HTTP {responseCode} {responseStatusText}
                </div>
                <div className="text-[10px] text-gray-400 font-mono font-bold">
                  {responseLatency}ms | {(responseSize ? responseSize / 1024 : 0).toFixed(2)} KB
                </div>
              </div>
            )}
          </div>

          {/* JSON Printer Screen */}
          <div className="bg-slate-950 p-4 font-mono text-[10.5px] text-slate-300 rounded-b-xl flex-1 overflow-auto max-h-[350px] border border-slate-900 relative">
            <AnimatePresence mode="wait">
              {isSimulating ? (
                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center space-y-2 text-blue-400">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                  <span className="text-[11px] font-extrabold animate-pulse">원격 브릿지 및 디스크 소켓 패킷 검사 중...</span>
                </div>
              ) : null}
            </AnimatePresence>

            {!responseBody ? (
              <div className="text-gray-600 text-center py-28 flex flex-col items-center justify-center space-y-2 font-sans font-bold">
                <Terminal className="w-8 h-8 text-slate-800 animate-pulse" />
                <div>API 검인 신호 대기 상태</div>
                <p className="text-[10px] text-slate-700 max-w-[300px] font-normal leading-relaxed">
                  좌측의 파라미터(현재 페이지, 표시 데이터 종류)를 적치 구성한 다음, <strong>[API 데이터 송수신 테스트]</strong> 버튼을 기어 넣으십시오.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Headers visualization toggle optional block */}
                <div className="border border-slate-800/80 bg-slate-900/50 p-2.5 rounded-lg space-y-1">
                  <div className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block border-b border-slate-800 pb-1">Response Headers</div>
                  <div className="grid grid-cols-2 gap-x-2 text-[9px] text-slate-400">
                    <div><span className="text-slate-600">Access-Control-Allow-Origin:</span> <span className="text-emerald-400">{responseHeaders['access-control-allow-origin'] || '*'}</span></div>
                    <div><span className="text-slate-600">Content-Type:</span> <span className="text-blue-400">{responseHeaders['content-type'] || 'application/json'}</span></div>
                    <div><span className="text-slate-600">Sync-Source-Mode:</span> <span className="text-purple-400 font-bold">{executionMode}</span></div>
                    <div><span className="text-slate-600">Server:</span> <span className="text-slate-500">Nginx/PHP (G5)</span></div>
                  </div>
                </div>

                {/* Body Printout */}
                <div className="relative">
                  <div className="absolute top-0 right-0 z-10 flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopyJSON}
                      className="p-1 px-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[9.5px] font-sans"
                    >
                      {copiedResponse ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedResponse ? '복사 성공' : '코드 복사'}</span>
                    </button>
                  </div>
                  <pre className="whitespace-pre overflow-x-auto text-[10.5px] font-mono leading-relaxed text-blue-300 pr-12 pt-2 text-left">
                    {JSON.stringify(responseBody, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Footer Area: Traffic Log Histoy Tracker (Real-time monitoring logs) */}
      <div className="space-y-2 border-t border-gray-100 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black text-gray-800 uppercase font-sans">실시간 API 패킷 가용성 순번 트래커 (Live API Traffic Ledger)</span>
            <span className="text-[9.5px] text-gray-400 font-bold font-mono">가장 최근 호출 트랜잭션 30건 이력 기록</span>
          </div>

          {trafficLogs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="text-[10px] text-gray-400 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>로그 전체 초기화</span>
            </button>
          )}
        </div>

        {/* Scrollable list */}
        <div className="border border-gray-150 rounded-xl overflow-hidden bg-slate-50/20 max-h-[150px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-[10.5px] font-sans">
            <thead>
              <tr className="bg-slate-100 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-250 select-none">
                <th className="p-2 pl-3">시간</th>
                <th className="p-2">요청방식</th>
                <th className="p-2">호출 엔드포인트 파일</th>
                <th className="p-2">타겟 기동액션</th>
                <th className="p-2">파라미터 변형값</th>
                <th className="p-2">통신 동기모드</th>
                <th className="p-2 text-right">패킷 크기</th>
                <th className="p-2 text-right">지연속도</th>
                <th className="p-2 pr-3 text-center">응답 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {trafficLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400 font-bold font-sans">
                    현재 모니터링 로그 대장에 기록된 API 통신 내역이 존재하지 않습니다. 상단 조작기를 동작해 주십시오.
                  </td>
                </tr>
              ) : (
                trafficLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2 pl-3 text-gray-400 font-mono text-[9.5px]">{log.timestamp}</td>
                    <td className="p-2">
                      <span className="p-0.5 px-1.5 bg-slate-900 text-slate-300 rounded text-[9px] font-bold font-mono">{log.method}</span>
                    </td>
                    <td className="p-2 font-mono text-[10px] text-gray-600 truncate max-w-[120px]" title={log.endpoint}>
                      {log.endpoint}
                    </td>
                    <td className="p-2 font-bold text-gray-800">
                      <code className="text-blue-700 bg-blue-50/50 px-1 rounded font-mono text-[9.5px]">{log.action}</code>
                    </td>
                    <td className="p-2 text-gray-500 font-mono text-[10px]" title={JSON.stringify(log.params)}>
                      p: {log.params.page} | l: {log.params.limit} {log.params.search ? `| q: ${log.params.search}` : ''}
                    </td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                        log.mode === 'Live (Remote)' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                          : 'bg-amber-100 text-amber-700 border border-amber-200/50'
                      }`}>
                        {log.mode}
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono text-gray-400">
                      {(log.size / 1024).toFixed(3)} KB
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-gray-700">
                      {log.latency}ms
                    </td>
                    <td className="p-2 pr-3 text-center">
                      <span className={`p-1 px-2 rounded-lg text-[9.5px] font-mono font-bold border ${getStatusColor(log.status)}`}>
                        {log.status} {log.statusText}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
