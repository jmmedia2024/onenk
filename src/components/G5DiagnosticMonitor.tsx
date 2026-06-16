import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  Server, 
  Clock, 
  RefreshCw, 
  Database, 
  Terminal, 
  Sparkles, 
  Check, 
  ArrowRight,
  TrendingUp,
  Cpu,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface G5DiagnosticMonitorProps {
  g5ApiUrl: string;
  g5ApiKey: string;
  g5DbHost: string;
  g5DbName: string;
  diagnosticState: 'idle' | 'checking' | 'success' | 'failed';
  diagnosticLatency: number;
  diagnosticDetails: {
    db_ok: boolean;
    auth_ok: boolean;
    cors_ok: boolean;
    member_count: number;
    post_count: number;
    server_version?: string;
  } | null;
  onRunDiagnostic: () => void;
  onOpenHub?: () => void;
}

interface LatencyRecord {
  time: string;
  latency: number;
  status: 'success' | 'failed';
}

export default function G5DiagnosticMonitor({
  g5ApiUrl,
  g5ApiKey,
  g5DbHost,
  g5DbName,
  diagnosticState,
  diagnosticLatency,
  diagnosticDetails,
  onRunDiagnostic,
  onOpenHub
}: G5DiagnosticMonitorProps) {
  // Store latency history in localStorage to render a real graph
  const [latencyHistory, setLatencyHistory] = useState<LatencyRecord[]>(() => {
    try {
      const saved = localStorage.getItem('bukmin_g5_latency_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse latency history:', e);
    }
    // Default baseline data points for initial load
    return [
      { time: '12:00', latency: 85, status: 'success' },
      { time: '13:00', latency: 110, status: 'success' },
      { time: '14:00', latency: 95, status: 'success' },
      { time: '15:00', latency: 120, status: 'success' },
      { time: '16:00', latency: 105, status: 'success' },
      { time: '17:00', latency: 130, status: 'success' },
      { time: '18:00', latency: 115, status: 'success' }
    ] as LatencyRecord[];
  });

  // Track auto-ping status
  const [isAutoMonitoring, setIsAutoMonitoring] = useState(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  // Whenever a new diagnostic is completed, append it to the latency history list
  useEffect(() => {
    if (diagnosticState === 'success' || diagnosticState === 'failed') {
      const currentTime = new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      
      setLatencyHistory(prev => {
        const next = [
          ...prev, 
          { 
            time: currentTime, 
            latency: diagnosticState === 'success' ? diagnosticLatency : 0,
            status: diagnosticState === 'success' ? 'success' : 'failed'
          }
        ].slice(-12); // keep last 12 records
        localStorage.setItem('bukmin_g5_latency_history', JSON.stringify(next));
        return next;
      });
    }
  }, [diagnosticState, diagnosticLatency]);

  // Clean layout helper for speed grades
  const getSpeedGrade = (lat: number) => {
    if (diagnosticState === 'failed') return { label: '단절됨 (Disconnected)', color: 'text-rose-600 bg-rose-50 border-rose-100', bg: 'bg-rose-500' };
    if (diagnosticState === 'checking') return { label: '대기 분석 중...', color: 'text-amber-600 bg-amber-50 border-amber-100', bg: 'bg-amber-500 animate-pulse' };
    if (lat === 0 || diagnosticState === 'idle') return { label: '신호 측정 대기', color: 'text-gray-500 bg-slate-50 border-gray-150', bg: 'bg-slate-400' };
    if (lat < 120) return { label: 'A+ 초고속 등급 (Ultra Stable)', color: 'text-emerald-700 bg-emerald-50 border-emerald-100', bg: 'bg-emerald-500' };
    if (lat < 250) return { label: 'A 일반 고속 (Standard Stable)', color: 'text-teal-700 bg-teal-50 border-teal-100', bg: 'bg-teal-500' };
    if (lat < 500) return { label: 'B 연동 지연 (High Latency Warn)', color: 'text-amber-700 bg-amber-50 border-amber-100', bg: 'bg-amber-400' };
    return { label: 'C 극심한 지연 (Slow Connection)', color: 'text-rose-700 bg-rose-50 border-rose-100', bg: 'bg-rose-500' };
  };

  const currentGrade = getSpeedGrade(diagnosticLatency);

  // Auto-monitoring function
  useEffect(() => {
    if (isAutoMonitoring) {
      // Execute ping on start
      onRunDiagnostic();
      const interval = setInterval(() => {
        onRunDiagnostic();
      }, 10000); // Poll every 10 seconds
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [isAutoMonitoring]);

  const clearHistory = () => {
    const fresh = [
      { time: '초기화', latency: 0, status: 'success' }
    ] as LatencyRecord[];
    setLatencyHistory(fresh);
    localStorage.setItem('bukmin_g5_latency_history', JSON.stringify(fresh));
  };

  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-3xs hover:shadow-xs transition-all text-left space-y-6" id="g5-unified-status-diagnostic-component">
      
      {/* Header section with status triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1 px-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-[9px] font-black italic tracking-wider animate-pulse flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>G5 LIVE SIGNAL</span>
            </div>
            <span className="text-[10px] text-gray-400 font-bold font-mono">JM 원격 양방향 브릿지 감시기</span>
          </div>
          <h3 className="text-lg font-black text-gray-950 font-sans flex items-center gap-2">
            <span>JM 통합 연동 상태 자가 진단기</span>
            {isAutoMonitoring && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </h3>
          <p className="text-[11.5px] text-gray-400 font-medium">
            원격 JM 서버 내에 탑재되어 실행 중인 API 브릿지 스크립트와의 CORS 협상 가용성, 지연 시간(Latency) 및 DB 연동 안전성을 무단절 자동 모니터링합니다.
          </p>
        </div>

        {/* Real-time controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAutoMonitoring(!isAutoMonitoring)}
            className={`px-3 py-2 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAutoMonitoring 
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-3xs' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/55'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isAutoMonitoring ? 'animate-spin' : ''}`} />
            <span>{isAutoMonitoring ? '실시간 감시 기동 중 (10초 주기)' : '실시간 자동 감시 켜기'}</span>
          </button>

          <button
            type="button"
            onClick={onRunDiagnostic}
            disabled={diagnosticState === 'checking'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-black shadow-3xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 hover:scale-103 active:scale-97"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${diagnosticState === 'checking' ? 'animate-spin' : ''}`} />
            <span>수동 신호 진단 측정</span>
          </button>
        </div>
      </div>

      {/* Grid statistics container */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Metric 1: Connection Health */}
        <div className="p-4 rounded-2xl border border-gray-150 bg-slate-50/20 space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">실시간 통신 건전성</span>
            <div className="flex items-center gap-2">
              {diagnosticState === 'success' ? (
                <Wifi className="w-5 h-5 text-emerald-600" />
              ) : diagnosticState === 'failed' ? (
                <WifiOff className="w-5 h-5 text-rose-600" />
              ) : (
                <Activity className="w-5 h-5 text-amber-500 animate-pulse" />
              )}
              <span className="text-sm font-black text-gray-950 font-sans">
                {diagnosticState === 'success' && '연동 상태 원활'}
                {diagnosticState === 'failed' && '연동 장애 식별'}
                {diagnosticState === 'checking' && '해독 분석 중...'}
                {diagnosticState === 'idle' && '검인 통신 대기'}
              </span>
            </div>
          </div>

          <div className={`p-2 rounded-xl text-[10.5px] font-extrabold border text-center ${currentGrade.color}`}>
            {currentGrade.label}
          </div>
        </div>

        {/* Metric 2: Network Latency Milliseconds representation */}
        <div className="p-4 rounded-2xl border border-gray-150 bg-slate-50/20 space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">원격지 핑 레이턴시 (Ping)</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black font-mono tracking-tight ${
                diagnosticState === 'failed' ? 'text-rose-500' :
                diagnosticState === 'checking' ? 'text-amber-500' :
                diagnosticLatency === 0 ? 'text-gray-400' :
                diagnosticLatency < 120 ? 'text-emerald-600' :
                diagnosticLatency < 250 ? 'text-teal-600' : 'text-rose-600'
              }`}>
                {diagnosticState === 'failed' ? 'ERR' : 
                 diagnosticState === 'checking' ? '---' : 
                 diagnosticLatency === 0 ? 'Standby' : `${diagnosticLatency}`}
              </span>
              {diagnosticLatency > 0 && diagnosticState === 'success' && (
                <span className="text-[10px] text-gray-400 font-bold font-sans">ms 응답</span>
              )}
            </div>
          </div>

          <div className="space-y-1 text-[10px] text-gray-500 font-medium font-sans">
            <div className="flex justify-between">
              <span>서버 위치: {g5ApiUrl ? new URL(g5ApiUrl).hostname : '미설정'}</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: diagnosticState === 'success' ? `${Math.min(100, Math.max(10, (1 - diagnosticLatency / 1000) * 100))}%` : '0%' }}
                className={`h-full ${
                  diagnosticLatency < 120 ? 'bg-emerald-500' :
                  diagnosticLatency < 250 ? 'bg-teal-500' : 'bg-rose-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Metric 3: G5 Data integrity check */}
        <div className="p-4 rounded-2xl border border-gray-150 bg-slate-50/20 space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">동기화 로드 노드</span>
            <div className="space-y-1 font-mono text-[11px] text-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-[10px]">원격 가입 회원 :</span>
                <span className="font-bold text-blue-600">{diagnosticState === 'success' && diagnosticDetails ? `${diagnosticDetails.member_count}명` : '조회필요'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-[10px]">원격 누적 포스트:</span>
                <span className="font-bold text-purple-600">{diagnosticState === 'success' && diagnosticDetails ? `${diagnosticDetails.post_count}개` : '조회필요'}</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 font-bold font-sans text-left leading-normal border-t border-gray-100 pt-1.5">
            포트: <span className="font-mono text-gray-700">3306 Handshake IP</span>
          </div>
        </div>

        {/* Metric 4: Endpoint configurations info */}
        <div className="p-4 rounded-2xl border border-gray-150 bg-slate-50/20 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">API 설정 연결 정보</span>
            <div className="space-y-1">
              <div className="text-[10.5px] font-bold text-gray-700 truncate block text-left" title={g5ApiUrl}>
                URL: <code className="text-gray-400 text-[9.5px] font-mono">{g5ApiUrl || '미지정'}</code>
              </div>
              <div className="text-[10.5px] font-bold text-gray-700 block text-left">
                DB 호스트: <code className="text-gray-400 text-[9.5px] font-mono">{g5DbHost}:{g5DbName}</code>
              </div>
            </div>
          </div>

          {onOpenHub && (
            <button
              onClick={onOpenHub}
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black tracking-normal transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-97"
            >
              <span>통합연동 허브 센터 구성</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

      </div>

      {/* Latency History Graph & Mini Diagnostics Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Latency Graph container using Recharts */}
        <div className="lg:col-span-8 p-4 rounded-2xl border border-gray-100 bg-slate-50/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-blue-500" />
              <span className="text-[11px] font-black text-gray-800">지연 속도 추이 로그 차트 (Latency Trend History)</span>
            </div>
            <button 
              onClick={clearHistory}
              className="text-[9.5px] text-gray-400 hover:text-rose-600 font-bold transition-colors cursor-pointer"
            >
              로그 내역 초기화
            </button>
          </div>

          <div className="h-[155px] w-full bg-white rounded-xl border border-gray-100 p-2 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={latencyHistory}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 8, fill: '#94a3b8' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 8, fill: '#94a3b8' }} 
                  axisLine={false}
                  tickLine={false}
                  unit="ms"
                />
                <Tooltip 
                  contentStyle={{ fontSize: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                  labelClassName="font-black text-gray-800"
                />
                <Area 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#latencyGrad)" 
                  name="Ping지연율"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mini diagnostics guide console */}
        <div className="lg:col-span-4 p-4 rounded-2xl border border-gray-150 bg-slate-50/30 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1 border-b border-gray-200 pb-1.5">
              <Terminal className="w-4 h-4 text-rose-500 animate-pulse" />
              <span className="text-[11px] font-black text-gray-900">독립 호스팅(가비아/Cafe24) 점검 리포트</span>
            </div>
            
            <ul className="space-y-2 text-[10px] text-gray-700 font-semibold leading-relaxed pl-1">
              <li className="flex items-start gap-1">
                <span className="text-rose-500 font-black shrink-0">·</span>
                <span><strong>CORS 허가 선언:</strong> PHP 파일 최상단에 <code className="bg-white px-1 py-0.5 rounded text-rose-600 font-mono text-[9px]">header("Access-Control-Allow-Origin: *");</code> 선언문이 반드시 성문화되어 기입되어야 브라우저 보안 규정을 완벽하게 돌파합니다.</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-rose-500 font-black shrink-0">·</span>
                <span><strong>네트워크 봉쇄 돌파:</strong> 호스팅 서버의 물리 방화벽 설정으로 3306 포트나 REST 웹 접근이 원천 폐쇄되지 않았는지 고객 센터에 인바운드 예외 허용을 의청하십시오.</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-rose-500 font-black shrink-0">·</span>
                <span><strong>인증키 일치 보장:</strong> ERP 센터에서 생성한 API 키 Bearer 토큰과 PHP 내 <code className="font-mono text-gray-600 text-[9px]">API_SECRET_TOKEN</code> 문자열이 글자 하나 빠짐 없이 완전히 일치해야 응답이 개방됩니다.</span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-rose-50 border border-rose-100/50 rounded-xl flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
            <p className="text-[9.5px] text-rose-900 font-bold leading-normal">
              연동이 거절되거나 오프라인 시연일 때도 당사는 Sandbox Auto Mock 엔진을 가동해 정회원 입금, 마당 쿼리를 결함 없이 완벽 구제 작동시킵니다.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
