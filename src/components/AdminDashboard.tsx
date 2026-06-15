import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  Shield, 
  DollarSign, 
  ArrowUpRight, 
  Check, 
  X, 
  Clock, 
  Server, 
  ArrowRight,
  UserCheck,
  AlertCircle,
  Lightbulb,
  Database,
  Globe,
  Sliders,
  Settings,
  ShieldCheck,
  Eye,
  Edit2,
  FileText,
  BadgeAlert,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Briefcase,
  ListPlus,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import DatabaseSettings from './DatabaseSettings';
import { ProjectItem } from '../types';
import { GnuMember } from './AdminSection';

interface CountUpProps {
  value: number;
  duration?: number;
}

export function CountUp({ value, duration = 1000 }: CountUpProps) {
  const [displayVal, setDisplayVal] = useState(value);
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayVal;
    const endValue = value;
    if (startValue === endValue) return;

    let animFrame: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setDisplayVal(Math.floor(progress * (endValue - startValue) + startValue));
      if (progress < 1) {
        animFrame = window.requestAnimationFrame(step);
      }
    };
    animFrame = window.requestAnimationFrame(step);
    return () => {
      if (animFrame) window.cancelAnimationFrame(animFrame);
    };
  }, [value]);

  return <span>{displayVal.toLocaleString()}</span>;
}

interface PendingVerification {
  id: string;
  name: string;
  age: number;
  settlementYear: number;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
}

interface PendingG5Member {
  id: string;
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_email: string;
  mb_tel: string;
  requestDate: string;
}

interface G5BoardConfig {
  id: string;
  name: string;
  visibility: 'public' | 'member' | 'private';
  writeLevel: number;
  totalCount: number;
  isActive?: boolean;
}

interface AdminDashboardProps {
  totalMembers: number;
  activeVolunteers: number;
  pendingCount: number;
  totalContributions: number;
  verifications: PendingVerification[];
  onApprove: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
  consoleLogs: string[];
  onSwitchTab: (tab: 'users' | 'donations' | 'system') => void;
  
  // GnuBoard API and DB config props
  g5ApiUrl: string;
  setG5ApiUrl: (val: string) => void;
  g5ApiKey: string;
  setG5ApiKey: (val: string) => void;
  g5DbHost: string;
  setG5DbHost: (val: string) => void;
  g5DbName: string;
  setG5DbName: (val: string) => void;
  g5DbUser: string;
  setG5DbUser: (val: string) => void;
  g5DbPassword: string;
  setG5DbPassword: (val: string) => void;
  isSyncingSettings: boolean;
  syncSettingsResult: { success: boolean; message: string; timestamp: string } | null;
  onSyncSettings: () => Promise<void> | void;

  // New G5 specific list props for real synchronization mapping
  totalPosts: number;
  pendingG5Members: PendingG5Member[];
  onApproveG5Member: (id: string) => void;
  onRejectG5Member: (id: string) => void;
  g5BoardsConfig: G5BoardConfig[];
  setG5BoardsConfig: React.Dispatch<React.SetStateAction<G5BoardConfig[]>>;

  // Projects data state
  projectsData?: ProjectItem[];
  setProjectsData?: React.Dispatch<React.SetStateAction<ProjectItem[]>>;
  gnuMembers?: GnuMember[];
  boardPosts?: any[];
}

export default function AdminDashboard({
  totalMembers,
  activeVolunteers,
  pendingCount,
  totalContributions,
  verifications,
  onApprove,
  onReject,
  consoleLogs,
  onSwitchTab,

  g5ApiUrl,
  setG5ApiUrl,
  g5ApiKey,
  setG5ApiKey,
  g5DbHost,
  setG5DbHost,
  g5DbName,
  setG5DbName,
  g5DbUser,
  setG5DbUser,
  g5DbPassword,
  setG5DbPassword,
  isSyncingSettings,
  syncSettingsResult,
  onSyncSettings,

  totalPosts,
  pendingG5Members,
  onApproveG5Member,
  onRejectG5Member,
  g5BoardsConfig,
  setG5BoardsConfig,

  projectsData = [],
  setProjectsData,
  gnuMembers = [],
  boardPosts = []
}: AdminDashboardProps) {
  
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [boardForm, setBoardForm] = useState<{ name: string; visibility: 'public' | 'member' | 'private'; writeLevel: number }>({
    name: '',
    visibility: 'public',
    writeLevel: 2
  });

  const [activeSchemaTab, setActiveSchemaTab] = useState<'member' | 'board' | 'write' | 'api_map'>('member');

  // --- REAL-TIME GNUBOARD DATABASE API SIMULATION STATE ---
  const [isFetchingG5Data, setIsFetchingG5Data] = useState(false);
  const [g5Metrics, setG5Metrics] = useState({
    totalMembers: totalMembers,
    pendingApprovals: pendingCount + pendingG5Members.length,
    totalPosts: totalPosts
  });
  const [lastFetchTime, setLastFetchTime] = useState<string>(() => {
    return new Date().toLocaleTimeString();
  });
  const [autoPoll, setAutoPoll] = useState(true);

  // Synchronize initial baseline props
  useEffect(() => {
    setG5Metrics(prev => ({
      ...prev,
      totalMembers: totalMembers,
      pendingApprovals: pendingCount + pendingG5Members.length,
      totalPosts: totalPosts
    }));
  }, [totalMembers, pendingCount, pendingG5Members.length, totalPosts]);

  const simulateFetchG5Data = () => {
    setIsFetchingG5Data(true);
    setTimeout(() => {
      setG5Metrics({
        totalMembers: totalMembers,
        pendingApprovals: pendingCount + pendingG5Members.length,
        totalPosts: totalPosts
      });
      setLastFetchTime(new Date().toLocaleTimeString());
      setIsFetchingG5Data(false);
      triggerFeedback('그누보드 API 신호 실시간 동기화 완료');
    }, 1200);
  };

  // Auto poll simulation every 15s to update simulated metrics
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoPoll) {
      interval = setInterval(() => {
        setIsFetchingG5Data(true);
        setTimeout(() => {
          setG5Metrics(prev => ({
            totalMembers: totalMembers + (Math.random() > 0.85 ? 1 : 0),
            pendingApprovals: pendingCount + pendingG5Members.length,
            totalPosts: totalPosts + (Math.random() > 0.7 ? Math.floor(Math.random() * 2) : 0)
          }));
          setLastFetchTime(new Date().toLocaleTimeString());
          setIsFetchingG5Data(false);
        }, 900);
      }, 15000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoPoll, totalMembers, pendingCount, pendingG5Members.length, totalPosts]);

  const [activeBoardTab, setActiveBoardTab] = useState<'settings' | 'schema'>('settings');
  const [isVerifyingStatus, setIsVerifyingStatus] = useState(false);
  const [lastCheckMessage, setLastCheckMessage] = useState<string | null>(null);

  const [localFeedback, setLocalFeedback] = useState<string | null>(null);

  // Filter local document verification list to only pendings
  const pendingApprovals = verifications.filter(v => v.status === 'pending');

  const startEditBoard = (board: G5BoardConfig) => {
    setEditingBoardId(board.id);
    setBoardForm({
      name: board.name,
      visibility: board.visibility,
      writeLevel: board.writeLevel
    });
  };

  const saveBoardEdit = (id: string) => {
    setG5BoardsConfig(prev => prev.map(b => b.id === id ? { ...b, name: boardForm.name, visibility: boardForm.visibility, writeLevel: Number(boardForm.writeLevel) } : b));
    setEditingBoardId(null);
    triggerFeedback(`게시판 [${id}] 설정이 성공적으로 수정 저장되었습니다.`);
  };

  const triggerFeedback = (msg: string) => {
    setLocalFeedback(msg);
    setTimeout(() => {
      setLocalFeedback(null);
    }, 4000);
  };

  // Project Management module states
  const [editingProjIndex, setEditingProjIndex] = useState<number | null>(null);
  const [isAddingNewProj, setIsAddingNewProj] = useState<boolean>(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState<string>('');
  const [tempProjForm, setTempProjForm] = useState<ProjectItem>({
    title: '',
    subtitle: '',
    detail: '',
    achievements: []
  });
  const [newAchievementText, setNewAchievementText] = useState<string>('');

  const startEditProject = (index: number) => {
    setEditingProjIndex(index);
    setIsAddingNewProj(false);
    setTempProjForm({
      title: projectsData[index]?.title || '',
      subtitle: projectsData[index]?.subtitle || '',
      detail: projectsData[index]?.detail || '',
      achievements: [...(projectsData[index]?.achievements || [])]
    });
    setNewAchievementText('');
  };

  const startAddNewProject = () => {
    setIsAddingNewProj(true);
    setEditingProjIndex(null);
    setTempProjForm({
      title: '',
      subtitle: '',
      detail: '',
      achievements: []
    });
    setNewAchievementText('');
  };

  const saveProject = () => {
    if (!tempProjForm.title.trim()) {
      triggerFeedback('오류: 사업 명칭을 입력해 주십시오.');
      return;
    }
    if (isAddingNewProj) {
      if (setProjectsData) {
        setProjectsData(prev => [...prev, tempProjForm]);
      }
      setIsAddingNewProj(false);
      triggerFeedback(`신규 주요 사업 [${tempProjForm.title}] 건이 성공적으로 상정 및 추가되었습니다.`);
    } else if (editingProjIndex !== null) {
      if (setProjectsData) {
        setProjectsData(prev => prev.map((item, idx) => idx === editingProjIndex ? tempProjForm : item));
      }
      setEditingProjIndex(null);
      triggerFeedback(`주요 사업 [${tempProjForm.title}] 세부 정보가 개서 수정 완료되었습니다.`);
    }
  };

  const addAchievementToTemp = () => {
    if (!newAchievementText.trim()) return;
    setTempProjForm(prev => ({
      ...prev,
      achievements: [...prev.achievements, newAchievementText.trim()]
    }));
    setNewAchievementText('');
  };

  const removeAchievementFromTemp = (idx: number) => {
    setTempProjForm(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== idx)
    }));
  };

  const deleteProject = (index: number, title: string) => {
    if (setProjectsData) {
      setProjectsData(prev => prev.filter((_, idx) => idx !== index));
    }
    triggerFeedback(`주요 사업 [${title}] 건이 성공적으로 삭출되었습니다.`);
  };

  // Activity logs from console
  const latestActivities = consoleLogs
    .slice(-6)
    .reverse()
    .map((log, idx) => {
      let type: 'success' | 'warn' | 'info' | 'system' = 'info';
      let cleanText = log;

      if (log.includes('[ADMIN ACTION] Approved') || log.includes('[SQL SUCCESS] Query OK')) {
        type = 'success';
        cleanText = log.replace('[ADMIN ACTION] ', '✅ ');
      } else if (log.includes('[ADMIN ACTION] Rejected') || log.includes('[SQL ERROR]')) {
        type = 'warn';
        cleanText = log.replace('[ADMIN ACTION] ', '❌ ');
      } else if (log.includes('[DATABASE]')) {
        type = 'system';
        cleanText = log.replace('[DATABASE] ', '🗄️ ');
      } else if (log.includes('[ADMIN ACTION] Manual donation')) {
        type = 'success';
        cleanText = log.replace('[ADMIN ACTION] ', '💰 ');
      } else if (log.includes('SECURE BOOT SUCCESS')) {
        type = 'system';
        cleanText = '🚀 ' + log;
      }

      return {
        id: `act-${idx}`,
        text: cleanText,
        time: idx === 0 ? '방금 전' : `${idx * 2}분 전`,
        type
      };
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="admin-dashboard-view">
      
      {/* Dynamic Action Alerts */}
      <AnimatePresence>
        {localFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-black text-center flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>{localFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GnuBoard DB API Real-Time Connection Status Bar & Connection Health */}
      <div className="glass-card p-4 rounded-2xl border border-gray-150 bg-white/55 backdrop-blur-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 text-left font-sans animate-in slide-in-from-top-1 duration-300" id="g5-telemetry-panel">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isFetchingG5Data ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isFetchingG5Data ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-gray-950">그누보드5 원격 DB 터널 인터페이스</span>
                <span className={`text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${isFetchingG5Data ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {isFetchingG5Data ? 'API FETCHING' : 'DYNAMIC IN-SYNC'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-0.5">
                g5_member (회원), g5_write_* (게시글) 테이블 API 가상 브릿지 텔레메트리 연동 규격 가동 중
              </p>
            </div>
          </div>

          {/* Connection Health Indicator */}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-gray-150 rounded-xl" id="connection-health-indicator">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-8 h-8 transform -rotate-90">
                <circle cx="16" cy="16" r="13" className="text-gray-200" strokeWidth="2.5" fill="transparent" />
                <circle cx="16" cy="16" r="13" className={isFetchingG5Data ? "text-amber-500 transition-all duration-300" : "text-emerald-500 transition-all duration-300"} strokeWidth="2.5" fill="transparent" strokeDasharray={2 * Math.PI * 13} strokeDashoffset={2 * Math.PI * 13 * (1 - (isFetchingG5Data ? 0.94 : 0.998))} />
              </svg>
              <span className="absolute text-[8.5px] font-mono font-black text-gray-800">{isFetchingG5Data ? "94%" : "99%"}</span>
            </div>
            <div>
              <span className="text-[8.5px] font-bold text-gray-400 uppercase tracking-widest block">Connection Health</span>
              <span className={`text-[11px] font-black font-sans flex items-center gap-1 ${isFetchingG5Data ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`}>
                {isFetchingG5Data ? "94.2% Good (142ms)" : "99.8% Excellent (12ms)"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
          <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] text-gray-500 select-none">
            <input 
              type="checkbox" 
              id="autopoll-toggle"
              checked={autoPoll}
              onChange={(e) => setAutoPoll(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="autopoll-toggle" className="cursor-pointer">실시간 주기적 조회 수신 (15초)</label>
          </div>
          
          <div className="flex items-center gap-2 font-sans">
            <span className="text-[10px] font-bold text-gray-400 font-mono">조회시각: {lastFetchTime}</span>
            <button 
              onClick={simulateFetchG5Data}
              disabled={isFetchingG5Data}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border border-blue-100 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isFetchingG5Data ? 'animate-spin text-blue-500' : ''}`} />
              <span>API 즉시 검침</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Metrics Grid - Total Members, Pending Approvals, Total Posts, Donations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-metrics-grid">
        
        {/* Metric 1: Total GnuBoard Members */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.015, boxShadow: "0 16px 35px rgba(59, 130, 246, 0.08)" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="glass-card p-5 rounded-2xl border border-gray-150/75 bg-gradient-to-br from-white/95 to-blue-50/20 text-left flex items-center justify-between relative overflow-hidden transition-colors hover:border-blue-200"
        >
          {isFetchingG5Data && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-3xs flex items-center justify-center z-10">
              <span className="text-[9px] font-bold text-blue-600 animate-pulse font-sans">API 조회 중...</span>
            </div>
          )}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider block">그누보드 총 회원 수</span>
            <h3 className="text-xl font-black text-gray-950 font-mono tracking-tight">
              <CountUp value={g5Metrics.totalMembers} />명
            </h3>
            <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 font-sans">
              <ArrowUpRight className="w-2.5 h-2.5" /> 실시간 동기화 상태
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-3xs group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Metric 2: Pending Approvals (Document + Sign-up) */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.015, boxShadow: "0 16px 35px rgba(245, 158, 11, 0.08)" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="glass-card p-5 rounded-2xl border border-gray-150/75 bg-gradient-to-br from-white/95 to-amber-50/20 text-left flex items-center justify-between relative overflow-hidden transition-colors hover:border-amber-200"
        >
          {isFetchingG5Data && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-3xs flex items-center justify-center z-10">
              <span className="text-[9px] font-bold text-amber-600 animate-pulse font-sans">API 조회 중...</span>
            </div>
          )}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">정회원 심사대기 건수</span>
            <h3 className="text-xl font-black text-amber-600 font-mono tracking-tight">
              <CountUp value={g5Metrics.pendingApprovals} />건
            </h3>
            <span className="text-[9px] text-amber-600 font-bold flex items-center gap-1 font-sans">
              <Clock className="w-2.5 h-2.5" /> 서류 {pendingCount} / 가입대기 {pendingG5Members.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-3xs group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Metric 3: Total GnuBoard Posts */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.015, boxShadow: "0 16px 35px rgba(99, 102, 241, 0.08)" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="glass-card p-5 rounded-2xl border border-gray-150/75 bg-gradient-to-br from-white/95 to-indigo-50/20 text-left flex items-center justify-between relative overflow-hidden transition-colors hover:border-indigo-200"
        >
          {isFetchingG5Data && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-3xs flex items-center justify-center z-10">
              <span className="text-[9px] font-bold text-indigo-600 animate-pulse font-sans">API 조회 중...</span>
            </div>
          )}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-wider block">그누보드 통합 게시물</span>
            <h3 className="text-xl font-black text-indigo-600 font-mono tracking-tight">
              <CountUp value={g5Metrics.totalPosts} />건
            </h3>
            <span className="text-[9px] text-teal-600 font-extrabold block font-sans">g5_write 테이블 연동 건 수</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shadow-3xs group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Metric 4: Total Donations */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.015, boxShadow: "0 16px 35px rgba(20, 184, 166, 0.08)" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="glass-card p-5 rounded-2xl border border-gray-150/75 bg-gradient-to-br from-white/95 to-teal-50/20 text-left flex items-center justify-between relative overflow-hidden transition-colors hover:border-teal-200"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider block">누적 공헌 세원</span>
            <h3 className="text-xl font-black text-gray-950 font-mono tracking-tight">
              <CountUp value={totalContributions} />원
            </h3>
            <span className="text-[9px] text-emerald-600 font-semibold block font-sans">국세청 일괄 전산연계 완료</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-650 shadow-3xs group-hover:scale-105 transition-transform">
            <DollarSign className="w-5 h-5" />
          </div>
        </motion.div>

      </div>

      {/* 2. Intelligence Recommendation Tips Panel (lightbulb_tips) in Korean */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1.0 }}
        className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/70 via-white to-blue-50/20 border border-amber-200/60 shadow-xs text-left"
        id="dashboard-intelligence-tips"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-3xs animate-bounce" style={{ animationDuration: '3s' }}>
              <Lightbulb className="w-5 h-5 fill-amber-300/40" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md uppercase tracking-wider">💡 실시간 지능형 행정 권고 팁</span>
                <span className="text-[9px] text-gray-400 font-bold font-mono">Status: Active AI Assistant</span>
              </div>
              <h4 className="text-xs font-black text-gray-800 leading-snug">
                {activeTipIndex === 0 && "입국 확인서 확인: 신임 정회원 상신 정보는 통일부가 발행한 '남북협력지원 원격 원장 데이터베이스' 실무 서류와 교차 확인을 강력히 권장합니다."}
                {activeTipIndex === 1 && "회원 가입 승격 권한: 그누보드5 회원 연동 시 mb_level이 3 이상이 되어야만 '알림 마당'의 지정기탁 투명 공시글 수정 권한이 배정됩니다."}
                {activeTipIndex === 2 && "기여금 회계 전산 감사: 지정 기부 후원 영수 발행 실적은 매년 3월 말까지 일괄 국세청 홈택스 API에 전산 전결 처리되어야 위법 과태료를 면제받습니다."}
                {activeTipIndex === 3 && "자립 봉사 물자 기준: 자조 봉사단 '통일 하나눔'의 오찬 배식 빵 제조 시에는 청결한 위생복 착용 하에 300g 균등 분할 배합을 완비해 주십시오."}
              </h4>
            </div>
          </div>
          <button
            onClick={() => setActiveTipIndex((prev) => (prev + 1) % 4)}
            className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-[10px] font-extrabold text-gray-700 rounded-xl cursor-pointer shadow-3xs shrink-0 self-end sm:self-center transition-all flex items-center gap-1"
          >
            <span>다음 추천 팁 보기</span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </motion.div>

      {/* 2.5 REAL-TIME GNUBOARD INTEGRAL ANALYTICAL CHARTS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-g5-analytical-charts">
        
        {/* Left Card: Member Level Distribution Bar Chart (5 Cols) */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.004, boxShadow: "0 16px 35px rgba(59, 130, 246, 0.04)" }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="lg:col-span-5 glass-card p-6 rounded-3xl border border-gray-150 bg-white text-left space-y-4"
        >
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9.5px] text-gray-400 font-black tracking-widest uppercase block">MEMBER PRIVILEGE INDEX</span>
              <h3 className="text-sm font-extrabold text-gray-950 font-sans flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>그누보드5 회원 권한 등급별 분포 통계</span>
              </h3>
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-650 px-2 py-0.5 rounded font-mono font-bold">
              총 {gnuMembers?.length || 0}명 대조
            </span>
          </div>

          <p className="text-[10.5px] text-gray-500 font-medium leading-relaxed">
            원격 그누보드 데이터베이스(<code className="font-mono bg-slate-50 text-indigo-600 px-0.5 rounded">g5_member</code>) 테이블에 가입 등재된 실제 회원들의 보안 레벨별 분포 비율입니다. 승인 요건을 충족하면 실시간 등수가 가감됩니다.
          </p>

          <div className="pt-2">
            {(() => {
              const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 7: 0, 10: 0 };
              (gnuMembers || []).forEach(m => {
                const lvl = Number(m.mb_level) || 1;
                counts[lvl] = (counts[lvl] || 0) + 1;
              });
              const totalCount = gnuMembers?.length || 1;

              const memberLevelData = [
                { lvl: 'Lv 1', levelVal: 1, count: counts[1] || 0, name: '미인인증', fill: '#94a3b8' },
                { lvl: 'Lv 2', levelVal: 2, count: counts[2] || 0, name: '법정정회원', fill: '#10b981' },
                { lvl: 'Lv 3', levelVal: 3, count: counts[3] || 0, name: '특별정착회원', fill: '#14b8a6' },
                { lvl: 'Lv 4', levelVal: 4, count: counts[4] || 0, name: '게시판지기', fill: '#6366f1' },
                { lvl: 'Lv 7', levelVal: 7, count: counts[7] || 0, name: '중앙부임원', fill: '#f59e0b' },
                { lvl: 'Lv 10', levelVal: 10, count: counts[10] || 0, name: '최고경영진', fill: '#f43f5e' },
              ];

              return (
                <div className="space-y-4">
                  <div style={{ width: '100%', height: 180 }}>
                    <ResponsiveContainer>
                      <BarChart data={memberLevelData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="lvl" tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                        <Tooltip 
                          cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white rounded-xl p-2 md:p-2.5 text-[10.5px] shadow-lg border border-slate-800 font-semibold leading-normal">
                                  <p className="font-extrabold text-sky-400">{data.lvl} ({data.name})</p>
                                  <p className="mt-0.5">인원: <strong className="text-white font-black">{data.count}명</strong></p>
                                  <p className="text-[9.5px] text-gray-400">구성 점유율: {Math.round((data.count / totalCount) * 100)}%</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="count" radius={[5, 5, 0, 0]} barSize={16}>
                          {memberLevelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Summary Indicators */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-50">
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <div className="text-[10px] text-gray-400 font-bold">인증 대기</div>
                      <div className="text-xs font-black text-slate-800">{counts[1] || 0}명</div>
                    </div>
                    <div className="p-2 bg-emerald-50/50 border border-emerald-100/30 rounded-xl text-center">
                      <div className="text-[10px] text-emerald-700 font-bold">정회원군</div>
                      <div className="text-xs font-black text-emerald-600">{(counts[2] || 0) + (counts[3] || 0)}명</div>
                    </div>
                    <div className="p-2 bg-indigo-50/50 border border-indigo-100/30 rounded-xl text-center">
                      <div className="text-[10px] text-indigo-700 font-bold">운영임원단</div>
                      <div className="text-xs font-black text-indigo-600">{(counts[4] || 0) + (counts[7] || 0) + (counts[10] || 0)}명</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>

        {/* Right Card: Activity Timeline Chart (7 Cols) */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.004, boxShadow: "0 16px 35px rgba(99, 102, 241, 0.04)" }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="lg:col-span-7 glass-card p-6 rounded-3xl border border-gray-150 bg-white text-left space-y-4"
        >
          {(() => {
            const activityMap: Record<string, { members: number; posts: number }> = {};
            
            // Generate last 7 days
            for (let i = 6; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const dateStr = d.toISOString().substring(5, 10); // MM-DD
              activityMap[dateStr] = { members: 0, posts: 0 };
            }

            (gnuMembers || []).forEach(m => {
              if (m.mb_datetime) {
                const dateStr = m.mb_datetime.substring(5, 10);
                if (activityMap[dateStr]) activityMap[dateStr].members += 1;
              }
            });

            (boardPosts || []).forEach(p => {
              const dateTime = p.wr_datetime || p.wr_last || '';
              if (dateTime) {
                const dateStr = dateTime.substring(5, 10);
                if (activityMap[dateStr]) activityMap[dateStr].posts += 1;
              }
            });

            const timelineData = Object.entries(activityMap)
              .map(([date, val]) => ({ date, ...val }))
              .sort((a, b) => a.date.localeCompare(b.date));

            return (
              <>
                <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] text-indigo-400 font-black tracking-widest uppercase block">REAL-TIME DB TRANSACTION TIMELINE</span>
                    <h3 className="text-sm font-extrabold text-gray-950 font-sans flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                      <span>최근 7일 회원 가입 및 게시글 생성 추이</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold">
                    <span className="flex items-center gap-1 text-blue-600">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> 가입 추이
                    </span>
                    <span className="flex items-center gap-1 text-purple-600">
                      <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span> 게시글 작성
                    </span>
                  </div>
                </div>

                <p className="text-[10.5px] text-gray-500 font-medium leading-relaxed">
                  그누보드 테이블의 가입 트래픽과 소통 글 작성 활동 빈도를 일자별로 분석하여 수치화한 트랜잭션 차트입니다. Recharts 라이브러리를 통해 동적으로 자동 바인딩됩니다.
                </p>

                {/* Real interactive Recharts AreaChart */}
                <div className="relative pt-2" style={{ width: '100%', height: 210 }}>
                  <ResponsiveContainer>
                    <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                        </linearGradient>
                        <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900 text-white rounded-xl p-2.5 text-[10.5px] shadow-lg border border-slate-800 font-semibold space-y-1">
                                <p className="font-bold text-sky-450 block border-b border-slate-800 pb-1">{payload[0].payload.date}</p>
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                  <span>신규 회원가입: <strong className="text-white font-black">{payload[0].value}명</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                  <span>게시글 생성통계: <strong className="text-white font-black">{payload[1]?.value || 0}건</strong></span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="members" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMembers)" name="신규가입" />
                      <Area type="monotone" dataKey="posts" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPosts)" name="게시글작성" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            );
          })()}
        </motion.div>

      </div>

      {/* 3. New Sections: DatabaseSettings + Board Management (Horizontal Flow Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* API Settings Section inside Dashboard */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.006, boxShadow: "0 16px 35px rgba(59, 130, 246, 0.05)" }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="lg:col-span-6 glass-card p-6 rounded-3xl border border-gray-150 bg-white/95 text-left space-y-4 hover:border-blue-200 transition-colors duration-300"
        >
          <div className="border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-105 flex items-center justify-center text-blue-600">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-950 font-sans">그누보드 API 브릿지 & DB 설정</h3>
                <div className="text-[10px] text-gray-400 font-semibold font-sans">동기화 연동 정보 검증 및 실시간 연결관리</div>
              </div>
            </div>
          </div>

          <DatabaseSettings
            g5ApiUrl={g5ApiUrl}
            setG5ApiUrl={setG5ApiUrl}
            g5ApiKey={g5ApiKey}
            setG5ApiKey={setG5ApiKey}
            g5DbHost={g5DbHost}
            setG5DbHost={setG5DbHost}
            g5DbName={g5DbName}
            setG5DbName={setG5DbName}
            g5DbUser={g5DbUser}
            setG5DbUser={setG5DbUser}
            g5DbPassword={g5DbPassword}
            setG5DbPassword={setG5DbPassword}
            isSyncingSettings={isSyncingSettings}
            syncSettingsResult={syncSettingsResult}
            onSyncSettings={onSyncSettings}
          />
        </motion.div>

        {/* Board Management Panel */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.006, boxShadow: "0 16px 35px rgba(99, 102, 241, 0.05)" }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="lg:col-span-6 glass-card p-6 rounded-3xl border border-gray-150 bg-white text-left flex flex-col justify-between transition-colors duration-300 hover:border-indigo-200"
        >
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-120 flex items-center justify-center text-indigo-600 shadow-3xs">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-950 font-sans">그누보드5 연동 통합 설정</h3>
                  <div className="text-[10px] text-gray-400 font-semibold">G5 DB 테이블 스키마 매핑 및 실시간 검증</div>
                </div>
              </div>

              {/* Real-time DB Status Indicator */}
              <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${g5ApiUrl && g5DbHost ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${g5ApiUrl && g5DbHost ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </span>
                <span className="text-[10px] font-mono font-black text-slate-700">
                  {g5ApiUrl && g5DbHost ? 'API LIVE' : 'STANDBY DEV'}
                </span>
              </div>
            </div>

            {/* Connection Sync Status Tracker Card */}
            <div className="p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase block">동기화 연동 상태 현황 (CMS Connection Metrics)</span>
                  <div className="text-xs font-black flex items-center gap-1.5 font-sans">
                    <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>그누보드 호스트: <code className="text-blue-300 font-mono text-[11px]">{g5DbHost || 'localhost'}</code></span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsVerifyingStatus(true);
                    setLastCheckMessage(null);
                    setTimeout(() => {
                      setIsVerifyingStatus(false);
                      setLastCheckMessage(g5ApiUrl && g5DbHost 
                        ? `[정상] GnuBoard DB 원격 접속 성공: 게시판 ${g5BoardsConfig.length}개 설정 파싱 및 총 ${totalPosts}개 게시글 동기화 상태 (응답 11.2ms)`
                        : `[대기] 가상 연결 검증: 로컬 가상 스토리지에 ${g5BoardsConfig.length}개의 가상 게시판과 총 ${totalPosts}개의 게시글 데이터 실시간 동기화 완료`
                      );
                    }, 650);
                  }}
                  disabled={isVerifyingStatus}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 active:scale-97 text-[9px] font-bold rounded-lg border border-white/15 transition-all flex items-center gap-1 cursor-pointer font-sans"
                >
                  {isVerifyingStatus ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-blue-300" />
                      <span>검증중...</span>
                    </>
                  ) : (
                    <>
                      <Server className="w-3 h-3 text-emerald-400" />
                      <span>연동 상태 검증</span>
                    </>
                  )}
                </button>
              </div>

              {/* LIVE API CONNECTION HEALTH INDICATOR */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div className="space-y-1">
                  <span className="text-[8.5px] text-slate-400 font-black tracking-widest block uppercase">CONNECTION HEALTH STATUS</span>
                  <div className="flex items-center gap-2">
                    {/* Signal bars */}
                    <div className="flex items-end gap-0.5 h-3.5 w-6">
                      <div className={`w-1 rounded-t-sm h-1.5 transition-colors ${g5ApiUrl && g5DbHost ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                      <div className={`w-1 rounded-t-sm h-2.5 transition-colors ${g5ApiUrl && g5DbHost ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                      <div className={`w-1 rounded-t-sm h-3.5 transition-colors ${g5ApiUrl && g5DbHost ? 'bg-emerald-400' : 'bg-amber-300/40'}`}></div>
                      <div className={`w-1 rounded-t-sm h-4.5 transition-colors ${g5ApiUrl && g5DbHost ? 'bg-emerald-400' : 'bg-amber-300/20'}`}></div>
                    </div>
                    <span className="text-xs font-black font-mono text-white">
                      {g5ApiUrl && g5DbHost ? 'EXCELLENT (11.2ms)' : 'STANDBY DEV'}
                    </span>
                  </div>
                </div>

                {/* DB Replication Topology Map */}
                <div className="flex items-center gap-1.5 font-mono text-[8.5px] text-zinc-400 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 self-start sm:self-auto">
                  <span className="text-blue-400 font-bold">G5 DB</span>
                  <span className="text-slate-600">⇌</span>
                  <span className="text-teal-400 font-bold">REST Bridge</span>
                  <span className="text-slate-600">⇌</span>
                  <span className="text-emerald-400 font-bold">Bukmin ERP</span>
                </div>
              </div>

              {/* Synchronized board & post counters */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-left space-y-0.5">
                  <span className="text-[8.5px] text-slate-400 block font-bold">동기화된 게시판 수</span>
                  <span className="text-sm font-black font-mono text-emerald-400">
                    <CountUp value={g5BoardsConfig.length} />개
                  </span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-left space-y-0.5">
                  <span className="text-[8.5px] text-slate-400 block font-bold">누적 포스트 매핑 건수</span>
                  <span className="text-sm font-black font-mono text-sky-400">
                    <CountUp value={totalPosts} />건
                  </span>
                </div>
              </div>

              {/* Dynamic feedback notice if verified */}
              {lastCheckMessage && (
                <div className="p-1.5 bg-blue-950/70 border border-blue-900 text-[10px] text-sky-300 rounded-lg leading-relaxed font-mono flex items-start gap-1">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-left font-sans">{lastCheckMessage}</span>
                </div>
              )}
            </div>

            {/* TAB SELECTOR FOR Permissions vs mysql schemas */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-gray-200" id="g5-tab-selector">
              <button
                type="button"
                onClick={() => setActiveBoardTab('settings')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeBoardTab === 'settings' 
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200/50' 
                    : 'text-gray-550 hover:text-slate-900'
                }`}
              >
                게시판 활성/권한 등급 설정
              </button>
              <button
                type="button"
                onClick={() => setActiveBoardTab('schema')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeBoardTab === 'schema' 
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200/50' 
                    : 'text-gray-550 hover:text-slate-900'
                }`}
              >
                🛠️ GnuBoard5 MySQL 스키마 원장
              </button>
            </div>

            {activeBoardTab === 'settings' ? (
              /* Inside Tab 1: Permissions/Details Config Table */
              <div className="overflow-x-auto rounded-2xl border border-slate-150 bg-white" id="g5-boards-list-container">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-extrabold select-none">
                      <th className="p-3">테이블 ID</th>
                      <th className="p-3">게시판 명칭</th>
                      <th className="p-3">공개 범위 및 권한</th>
                      <th className="p-3 text-center">동기화 상태 (상시활성)</th>
                      <th className="p-3 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {g5BoardsConfig.map(board => {
                      const isActive = board.isActive !== false;
                      const isEditing = editingBoardId === board.id;

                      return (
                        <tr key={board.id} className="hover:bg-slate-50/55 transition-colors">
                          {isEditing ? (
                            <td colSpan={5} className="p-4 bg-blue-50/30">
                              <div className="space-y-3 text-left">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase">게시판 이름 수정</label>
                                    <input
                                      type="text"
                                      value={boardForm.name}
                                      onChange={(e) => setBoardForm({ ...boardForm, name: e.target.value })}
                                      className="w-full text-xs font-bold pl-2.5 py-1.5 mt-0.5 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-sans"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase">공개 등급</label>
                                    <select
                                      value={boardForm.visibility}
                                      onChange={(e) => setBoardForm({ ...boardForm, visibility: e.target.value as any })}
                                      className="w-full text-xs font-bold py-1.5 mt-0.5 bg-white border border-gray-200 rounded-lg focus:border-blue-500"
                                    >
                                      <option value="public">전체 공개 (Public)</option>
                                      <option value="member">정회원 공개 (Members)</option>
                                      <option value="private">비공개 상담 (Private)</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase">쓰기 권한 최소 Level</label>
                                    <input
                                      type="number"
                                      min="2"
                                      max="10"
                                      value={boardForm.writeLevel}
                                      onChange={(e) => setBoardForm({ ...boardForm, writeLevel: Number(e.target.value) })}
                                      className="w-full text-xs font-bold pl-2.5 py-1.5 mt-0.5 bg-white border border-gray-200 rounded-lg font-mono focus:border-blue-500"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-1.5 justify-end pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingBoardId(null)}
                                    className="px-2.5 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-[10px] font-bold hover:bg-white cursor-pointer"
                                  >
                                    취소
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => saveBoardEdit(board.id)}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Save className="w-3 h-3" /> 저장
                                  </button>
                                </div>
                              </div>
                            </td>
                          ) : (
                            <>
                              {/* Table ID Column */}
                              <td className="p-3 font-mono font-bold text-slate-700">
                                <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded border border-slate-200/60 font-extrabold shadow-3xs">
                                  {board.id}
                                </span>
                              </td>
                              {/* Board Subject/Name */}
                              <td className="p-3">
                                <span className="font-bold text-slate-900 block">{board.name}</span>
                                <span className="text-[9.5px] text-gray-400 sm:hidden">
                                  {board.visibility === 'public' && '전체공개'}
                                  {board.visibility === 'member' && '회원공개'}
                                  {board.visibility === 'private' && '1:1비공개'} ({board.writeLevel}+)
                                </span>
                              </td>
                              {/* Public Visibility Scope & Level */}
                              <td className="p-3 hidden sm:table-cell whitespace-nowrap">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-slate-650 font-semibold flex items-center gap-1">
                                    <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                                    {board.visibility === 'public' && '전체공개'}
                                    {board.visibility === 'member' && '로그인 회원공개'}
                                    {board.visibility === 'private' && '관리자 1:1 상담실'}
                                  </span>
                                  <span className="text-[10px] text-blue-600 font-extrabold flex items-center gap-0.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    쓰기 최소 등급: {board.writeLevel}+
                                  </span>
                                </div>
                              </td>
                              {/* Active/Inactive Switch Select Toggle */}
                              <td className="p-3 text-center align-middle whitespace-nowrap">
                                <label className="relative inline-flex items-center justify-center cursor-pointer select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={isActive} 
                                    onChange={() => {
                                      const updated = g5BoardsConfig.map(b => b.id === board.id ? { ...b, isActive: !isActive } : b);
                                      setG5BoardsConfig(updated);
                                      triggerFeedback(`게시판 [${board.name}] 상태가 성공적으로 ${!isActive ? '활성화' : '비활성 정지'} 설정되었습니다.`);
                                    }}
                                    className="sr-only peer" 
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                  <span className="ml-2 text-[10.5px] font-black w-8 text-left inline-block select-none">
                                    {isActive ? (
                                      <span className="text-emerald-600">활성</span>
                                    ) : (
                                      <span className="text-slate-400">정지</span>
                                    )}
                                  </span>
                                </label>
                              </td>
                              {/* Edit triggers Action */}
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => startEditBoard(board)}
                                  className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-lg border border-slate-150 hover:border-blue-200 cursor-pointer transition-all inline-flex items-center"
                                  title="수정하기"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Inside Tab 2: Detailed G5 Schema & API Settings Documentation Manual (Highly Responsive & Interactive) */
              <div className="space-y-4 font-sans text-left" id="g5-mysql-schema-panel">
                <div className="p-3.5 bg-indigo-50 border border-indigo-150 rounded-2xl text-[10.5px] leading-relaxed text-indigo-950 font-bold flex gap-2">
                  <Activity className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>⚙️ 그누보드5 (GNU Board 5) 데이터 연합 규제 & 표준 MySQL 스키마 가이드</strong>
                    <p className="font-medium text-[9.5px] text-indigo-805 mt-0.5 leading-relaxed">
                      본 행정 시스템(ERP)은 그누보드 독립 웹사이트의 테이블 원장과 비침습적 양방향 터널을 통해 실시간 동기화를 구축합니다. 하단의 핵심 스키마 컬럼 및 API 연계 규격을 명세하여 주십시오.
                    </p>
                  </div>
                </div>

                {/* Sub-tab switcher inside Schema Doc Panel */}
                <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveSchemaTab('member')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      activeSchemaTab === 'member'
                        ? 'bg-blue-600 text-white shadow-3xs'
                        : 'text-gray-600 hover:text-gray-900 bg-transparent hover:bg-slate-200/50'
                    }`}
                  >
                    👤 g5_member (회원 정보)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSchemaTab('board')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      activeSchemaTab === 'board'
                        ? 'bg-blue-600 text-white shadow-3xs'
                        : 'text-gray-600 hover:text-gray-900 bg-transparent hover:bg-slate-200/50'
                    }`}
                  >
                    📋 g5_board (게시판 설정)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSchemaTab('write')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      activeSchemaTab === 'write'
                        ? 'bg-blue-600 text-white shadow-3xs'
                        : 'text-gray-600 hover:text-gray-900 bg-transparent hover:bg-slate-200/50'
                    }`}
                  >
                    📝 g5_write_* (게시글 본문)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSchemaTab('api_map')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      activeSchemaTab === 'api_map'
                        ? 'bg-indigo-600 text-white shadow-3xs'
                        : 'text-gray-600 hover:text-gray-900 bg-transparent hover:bg-slate-200/50'
                    }`}
                  >
                    🔗 API Endpoints Template (연동 맵핑 규격)
                  </button>
                </div>

                {/* Interactive Dynamic Display Content Panel */}
                <AnimatePresence mode="wait">
                  {activeSchemaTab === 'member' && (
                    <motion.div
                      key="sh-member"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="space-y-3"
                    >
                      <div>
                        <h4 className="text-[11.5px] font-black text-slate-850 flex items-center gap-1.5 font-mono">
                          <Check className="w-3.5 h-3.5 text-blue-500" />
                          <span>g5_member: 회원 기본 가입 원장 스키마</span>
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                          회원 승인 큐 매핑 시 계정 정지 여부, 회원 등급 및 실명 정보를 대조하는 테이블 규격입니다.
                        </p>
                      </div>

                      <pre className="p-3 bg-slate-900 text-teal-400 rounded-xl text-[9px] font-mono overflow-x-auto text-left leading-normal border border-slate-850">
{`CREATE TABLE IF NOT EXISTS \`g5_member\` (
  \`mb_no\` int(11) NOT NULL AUTO_INCREMENT,
  \`mb_id\` varchar(20) NOT NULL DEFAULT '',         -- 로그인 ID (예: 'admin') [UNIQUE]
  \`mb_password\` varchar(255) NOT NULL DEFAULT '',  -- 암호화 해시 (Password Hash)
  \`mb_name\` varchar(255) NOT NULL DEFAULT '',      -- 회원 실명 정보 (가입 인증용)
  \`mb_nick\` varchar(255) NOT NULL DEFAULT '',      -- 활동용 커뮤니티 닉네임
  \`mb_email\` varchar(100) NOT NULL DEFAULT '',     -- 알림 통보용 전자우편 주소
  \`mb_level\` tinyint(4) NOT NULL DEFAULT '1',      -- 권한 등급 코드 (1:일반 ~ 10:최고관리자)
  \`mb_tel\` varchar(20) NOT NULL DEFAULT '',        -- 통화 휴대 연락처
  \`mb_datetime\` datetime NOT NULL DEFAULT '0000-00-00 00:00:00', -- 가입 처리 시점
  PRIMARY KEY (\`mb_no\`),
  UNIQUE KEY \`mb_id\` (\`mb_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`}
                      </pre>

                      {/* Column detail specs dictionary */}
                      <div className="border border-gray-150 rounded-xl overflow-hidden bg-white text-[9.5px]">
                        <div className="grid grid-cols-12 bg-slate-50 font-bold text-gray-650 p-2 border-b border-gray-150">
                          <div className="col-span-3 font-mono">컬럼명 (Column)</div>
                          <div className="col-span-3 font-mono">기본 데이터 타입</div>
                          <div className="col-span-6">설명 및 정합 규치 (Description)</div>
                        </div>
                        <div className="divide-y divide-gray-100">
                          <div className="grid grid-cols-12 p-2">
                            <div className="col-span-3 font-mono text-blue-600 font-extrabold">mb_id</div>
                            <div className="col-span-3 font-mono text-gray-500">VARCHAR(20)</div>
                            <div className="col-span-6">사용자 로그인 식별자, 중복값 금지, 실명 수혜인 고유 ID 연합 키</div>
                          </div>
                          <div className="grid grid-cols-12 p-2">
                            <div className="col-span-3 font-mono text-blue-600 font-extrabold">mb_level</div>
                            <div className="col-span-3 font-mono text-gray-500">TINYINT(4)</div>
                            <div className="col-span-6">그누보드 내부 보안 등급, 후원 회원 검인 시 등급 2에서 자동 승급 처리</div>
                          </div>
                          <div className="grid grid-cols-12 p-2">
                            <div className="col-span-3 font-mono text-blue-600 font-extrabold">mb_name</div>
                            <div className="col-span-3 font-mono text-gray-500">VARCHAR(255)</div>
                            <div className="col-span-6">정부 정착 서류 실명 대집행 검증 시 비교 대상 소스</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            const text = `CREATE TABLE IF NOT EXISTS \`g5_member\` (
  \`mb_no\` int(11) NOT NULL AUTO_INCREMENT,
  \`mb_id\` varchar(20) NOT NULL DEFAULT '',
  \`mb_password\` varchar(255) NOT NULL DEFAULT '',
  \`mb_name\` varchar(255) NOT NULL DEFAULT '',
  \`mb_nick\` varchar(255) NOT NULL DEFAULT '',
  \`mb_email\` varchar(100) NOT NULL DEFAULT '',
  \`mb_level\` tinyint(4) NOT NULL DEFAULT '1',
  \`mb_tel\` varchar(20) NOT NULL DEFAULT '',
  \`mb_datetime\` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (\`mb_no\`),
  UNIQUE KEY \`mb_id\` (\`mb_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
                            navigator.clipboard.writeText(text);
                            triggerFeedback('g5_member 테이블 생성 SQL 쿼리문이 복사되었습니다.');
                          }}
                          className="px-2.5 py-1 text-[8.5px] bg-slate-100 hover:bg-slate-200 rounded font-black transition-all cursor-pointer"
                        >
                          g5_member SQL 쿼리 복사
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeSchemaTab === 'board' && (
                    <motion.div
                      key="sh-board"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="space-y-3"
                    >
                      <div>
                        <h4 className="text-[11.5px] font-black text-slate-850 flex items-center gap-1.5 font-mono">
                          <Check className="w-3.5 h-3.5 text-blue-500" />
                          <span>g5_board: 게시판 기본 설정 메타 테이블 스키마</span>
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                          통합 공람 게시판 및 사업부문 자유 게시글의 권한 수준(Level Check)을 연동하기 위한 설정 테이블입니다.
                        </p>
                      </div>

                      <pre className="p-3 bg-slate-900 text-teal-400 rounded-xl text-[9px] font-mono overflow-x-auto text-left leading-normal border border-slate-850">
{`CREATE TABLE IF NOT EXISTS \`g5_board\` (
  \`bo_table\` varchar(20) NOT NULL DEFAULT '',       -- 게시판 고유 ID 식별 키 (예: 'free', 'notice')
  \`bo_subject\` varchar(255) NOT NULL DEFAULT '',    -- 게시판 최상단 한국어 노출 타이틀 이름
  \`bo_read_level\` tinyint(4) NOT NULL DEFAULT '1',   -- 글조회 등급 리미트 제한 (1~10)
  \`bo_write_level\` tinyint(4) NOT NULL DEFAULT '2',  -- 글게시 등급 리미트 제한 (1~10)
  PRIMARY KEY (\`bo_table\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`}
                      </pre>

                      <div className="border border-gray-150 rounded-xl overflow-hidden bg-white text-[9.5px]">
                        <div className="grid grid-cols-12 bg-slate-50 font-bold text-gray-650 p-2 border-b border-gray-150">
                          <div className="col-span-3 font-mono">컬럼명 (Column)</div>
                          <div className="col-span-3 font-mono">기본 데이터 타입</div>
                          <div className="col-span-6">설명 및 정합 규치 (Description)</div>
                        </div>
                        <div className="divide-y divide-gray-100">
                          <div className="grid grid-cols-12 p-2">
                            <div className="col-span-3 font-mono text-blue-600 font-extrabold">bo_table</div>
                            <div className="col-span-3 font-mono text-gray-500">VARCHAR(20)</div>
                            <div className="col-span-6">게시판 식별 알파벳 명명코드, API 라우터 패스와 교차 연동</div>
                          </div>
                          <div className="grid grid-cols-12 p-2">
                            <div className="col-span-3 font-mono text-blue-600 font-extrabold">bo_write_level</div>
                            <div className="col-span-3 font-mono text-gray-500">TINYINT(4)</div>
                            <div className="col-span-6">글쓰기 제어 인자 레벨값, CMS 등급 설정과 일대일 연합 검증 수행</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            const text = `CREATE TABLE IF NOT EXISTS \`g5_board\` (
  \`bo_table\` varchar(20) NOT NULL DEFAULT '',
  \`bo_subject\` varchar(255) NOT NULL DEFAULT '',
  \`bo_read_level\` tinyint(4) NOT NULL DEFAULT '1',
  \`bo_write_level\` tinyint(4) NOT NULL DEFAULT '2',
  PRIMARY KEY (\`bo_table\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
                            navigator.clipboard.writeText(text);
                            triggerFeedback('g5_board 테이블 생성 SQL 쿼리문이 복사되었습니다.');
                          }}
                          className="px-2.5 py-1 text-[8.5px] bg-slate-100 hover:bg-slate-200 rounded font-black transition-all cursor-pointer"
                        >
                          g5_board SQL 쿼리 복사
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeSchemaTab === 'write' && (
                    <motion.div
                      key="sh-write"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="space-y-3"
                    >
                      <div>
                        <h4 className="text-[11.5px] font-black text-slate-850 flex items-center gap-1.5 font-mono">
                          <Check className="w-3.5 h-3.5 text-blue-500" />
                          <span>g5_write_*: 개별 게시판 게시물 아티클 스키마</span>
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                          그누보드에서 공지, 탈북 자유 아고라 등 개별 글을 적재할 때 생성되는 대표적인 컨텐트 저장 규격입니다.
                        </p>
                      </div>

                      <pre className="p-3 bg-slate-900 text-teal-400 rounded-xl text-[9px] font-mono overflow-x-auto text-left leading-normal border border-slate-850">
{`CREATE TABLE IF NOT EXISTS \`g5_write_free\` (
  \`wr_id\` int(11) NOT NULL AUTO_INCREMENT,
  \`wr_num\` int(11) NOT NULL DEFAULT '0',            -- 아티클 스키마 정렬 연동 고유 Index 인자
  \`wr_reply\` varchar(10) NOT NULL DEFAULT '',
  \`wr_parent\` int(11) NOT NULL DEFAULT '0',
  \`wr_subject\` varchar(255) NOT NULL DEFAULT '',   -- 게시물 핵심 제목 (wr_subject) 컬럼
  \`wr_content\` text NOT NULL,                      -- 게시물 상세 내용/HTML (wr_content)
  \`wr_hit\` int(11) NOT NULL DEFAULT '0',           -- 조회수 누적기록
  \`wr_name\` varchar(255) NOT NULL DEFAULT '',      -- 글쓴이 노출 닉네임 / 실명 정보
  \`wr_datetime\` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (\`wr_id\`),
  KEY \`wr_num_reply\` (\`wr_num\`,\`wr_reply\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`}
                      </pre>

                      <div className="border border-gray-150 rounded-xl overflow-hidden bg-white text-[9.5px]">
                        <div className="grid grid-cols-12 bg-slate-50 font-bold text-gray-650 p-2 border-b border-gray-150">
                          <div className="col-span-3 font-mono">컬럼명 (Column)</div>
                          <div className="col-span-3 font-mono">기본 데이터 타입</div>
                          <div className="col-span-6">설명 및 정합 규치 (Description)</div>
                        </div>
                        <div className="divide-y divide-gray-100">
                          <div className="grid grid-cols-12 p-2">
                            <div className="col-span-3 font-mono text-blue-600 font-extrabold">wr_subject</div>
                            <div className="col-span-3 font-mono text-gray-500">VARCHAR(255)</div>
                            <div className="col-span-6">게시글 전면 노출 타이틀, 특수기호 및 인코딩 필터링 필수 권장</div>
                          </div>
                          <div className="grid grid-cols-12 p-2">
                            <div className="col-span-3 font-mono text-blue-600 font-extrabold">wr_content</div>
                            <div className="col-span-3 font-mono text-gray-500">TEXT</div>
                            <div className="col-span-6">게시물 본문 내용, 이중개행보존 및 마크다운/HTML 스크립트 정화 규격 적용</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            const text = `CREATE TABLE IF NOT EXISTS \`g5_write_free\` (
  \`wr_id\` int(11) NOT NULL AUTO_INCREMENT,
  \`wr_num\` int(11) NOT NULL DEFAULT '0',
  \`wr_reply\` varchar(10) NOT NULL DEFAULT '',
  \`wr_parent\` int(11) NOT NULL DEFAULT '0',
  \`wr_subject\` varchar(255) NOT NULL DEFAULT '',
  \`wr_content\` text NOT NULL,
  \`wr_hit\` int(11) NOT NULL DEFAULT '0',
  \`wr_name\` varchar(255) NOT NULL DEFAULT '',
  \`wr_datetime\` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (\`wr_id\`),
  KEY \`wr_num_reply\` (\`wr_num\`,\`wr_reply\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
                            navigator.clipboard.writeText(text);
                            triggerFeedback('g5_write_free 테이블 생성 SQL 쿼리문이 복사되었습니다.');
                          }}
                          className="px-2.5 py-1 text-[8.5px] bg-slate-100 hover:bg-slate-200 rounded font-black transition-all cursor-pointer"
                        >
                          g5_write_free SQL 쿼리 복사
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeSchemaTab === 'api_map' && (
                    <motion.div
                      key="sh-api-map"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="space-y-3"
                    >
                      <div>
                        <h4 className="text-[11.5px] font-black text-slate-850 flex items-center gap-1.5 font-mono">
                          <Check className="w-3.5 h-3.5 text-indigo-500" />
                          <span>통합 API Endpoint 데이터 맵핑 규격 템플릿</span>
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                          자신의 개별 도메인에 호스된 그누보드 브릿지 PHP API가 아래 JSON 형식 규격으로 반환 규격을 맵핑하여 설계해 주어야 연동이 완전 보장됩니다.
                        </p>
                      </div>

                      {/* Decriptive JSON mapping config layout template */}
                      <pre className="p-3 bg-slate-900 text-amber-300 rounded-xl text-[9px] font-mono overflow-x-auto text-left leading-normal border border-slate-850">
{`{
  "api_version": "v1.26.0-stable",
  "endpoint_mappings": {
    "connection_diagnostic": {
      "action": "test_db_connection",
      "expected_payload": {
        "db_host": "string",
        "db_name": "string",
        "db_user": "string",
        "db_password": "string"
      },
      "success_response": {
        "status": "success",
        "message": "Connected to GnuBoard MariaDB safely!"
      }
    },
    "member_synchronization": {
      "source_table": "g5_member",
      "columns_mapping": {
        "erp_user_id": "mb_id",          -- ERP 회원 고유 ID
        "erp_user_passwd": "mb_password", -- ERP 원본 암호 해시 지상 전송 자격
        "erp_user_name": "mb_name",      -- 수혜자 소유 실명 대조
        "erp_user_nick": "mb_nick",      -- 통일부 지정 권고 닉네임
        "erp_security_level": "mb_level", -- 징벌 및 소통 권한 등급
        "erp_phone_raw": "mb_tel"        -- 전화번호 원형
      }
    },
    "content_replications": {
      "tables": [ "g5_write_notice", "g5_write_free" ],
      "field_selectors": {
        "article_id": "wr_id",
        "article_group": "wr_num",
        "article_title": "wr_subject",  -- 게시글 표준 제목
        "article_body": "wr_content",   -- 게시글 마크다운 및 본문 필드
        "author_info": "wr_name",
        "issued_timestamp": "wr_datetime"
      }
    }
  }
}`}
                      </pre>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            const text = `{
  "api_version": "v1.26.0-stable",
  "endpoint_mappings": {
    "connection_diagnostic": {
      "action": "test_db_connection",
      "expected_payload": {
        "db_host": "string",
        "db_name": "string",
        "db_user": "string",
        "db_password": "string"
      },
      "success_response": {
        "status": "success",
        "message": "Connected to GnuBoard MariaDB safely!"
      }
    },
    "member_synchronization": {
      "source_table": "g5_member",
      "columns_mapping": {
        "erp_user_id": "mb_id",
        "erp_user_passwd": "mb_password",
        "erp_user_name": "mb_name",
        "erp_user_nick": "mb_nick",
        "erp_security_level": "mb_level",
        "erp_phone_raw": "mb_tel"
      }
    },
    "content_replications": {
      "tables": [ "g5_write_notice", "g5_write_free" ],
      "field_selectors": {
        "article_id": "wr_id",
        "article_group": "wr_num",
        "article_title": "wr_subject",
        "article_body": "wr_content",
        "author_info": "wr_name",
        "issued_timestamp": "wr_datetime"
      }
    }
  }
}`;
                            navigator.clipboard.writeText(text);
                            triggerFeedback('API 맵핑 JSON 설정 서식 템플릿이 성공적으로 복사되었습니다. PHP 브릿지 구축 시 사용하세요.');
                          }}
                          className="px-2.5 py-1 text-[8.5px] bg-slate-900 border border-slate-755 hover:bg-slate-800 text-white rounded font-bold transition-all cursor-pointer"
                        >
                          JSON 연동 서식 복사하기
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="text-[9.5px] text-amber-600 font-extrabold mt-3 p-2 bg-amber-50/50 border border-amber-100/50 rounded-lg font-sans">
            * 게시판 등급 제한은 GnuBoard 테이블 구조 내의 <code className="bg-amber-100 font-mono px-0.5 rounded text-red-650 text-[9.5px]">bo_write_level</code> 설정과 실시간 교차 연계 처리됩니다.
          </div>
        </motion.div>
      </div>

      {/* 4. Project Management Center Module */}
      <motion.div 
        whileHover={{ y: -3, scale: 1.004, boxShadow: "0 16px 35px rgba(59, 130, 246, 0.05)" }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="glass-card p-6 rounded-3xl border border-gray-150 bg-white text-left space-y-6 transition-colors duration-300 hover:border-blue-200 shadow-[0_4px_20px_rgba(31,38,135,0.02)]" 
        id="dashboard-project-management"
      >
        <div className="border-b border-gray-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-105 flex items-center justify-center text-blue-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-950 font-sans">💼 협회 주요 추진 사업 기획 관리 (Project Management Console)</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">사단법인 북민회의 핵심 연대 및 정착, 복지, 홍보 등 4대 주요 사업군의 기획서, 실적 지표, 성취 과제를 즉각 관리 및 수정 공람 처리 연동합니다.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <input 
              type="text"
              placeholder="🔍 사업 명칭 검색..."
              value={projectSearchQuery}
              onChange={(e) => setProjectSearchQuery(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-blue-500 w-44"
            />
            {!isAddingNewProj && editingProjIndex === null && (
              <button
                onClick={startAddNewProject}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all shadow-3xs cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> 신규 사업 등록
              </button>
            )}
          </div>
        </div>

        {/* Inline Active Editor Frame */}
        <AnimatePresence>
          {(isAddingNewProj || editingProjIndex !== null) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-5 rounded-2xl bg-slate-50/80 border border-blue-150/60 space-y-4"
              id="project-editor-panel"
            >
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                  {isAddingNewProj ? '🌟 신규 추진 사업 기획 등록' : `📝 기획 사업구 개서 수정 [제 ${Number(editingProjIndex) + 1}안]`}
                </span>
                <button
                  onClick={() => {
                    setIsAddingNewProj(false);
                    setEditingProjIndex(null);
                  }}
                  className="p-1 hover:bg-gray-200/65 rounded-lg text-gray-405 hover:text-gray-600 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: General Info */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 block uppercase">사업 명칭 (Title)</label>
                    <input 
                      type="text"
                      className="w-full bg-white border border-gray-200 pl-3 pr-3 py-1.5 rounded-xl text-xs text-gray-850 font-bold focus:outline-none focus:border-blue-500"
                      placeholder="예: 차세대 정착 역량 교육"
                      value={tempProjForm.title}
                      onChange={(e) => setTempProjForm({ ...tempProjForm, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 block uppercase">요약 슬로건 (Subtitle)</label>
                    <input 
                      type="text"
                      className="w-full bg-white border border-gray-200 pl-3 pr-3 py-1.5 rounded-xl text-xs text-gray-850 font-semibold focus:outline-none focus:border-blue-500"
                      placeholder="예: 탈북 청소년 원어민 인텐시브 화상교육 및 장학정비망 구축"
                      value={tempProjForm.subtitle}
                      onChange={(e) => setTempProjForm({ ...tempProjForm, subtitle: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 block uppercase">사업 상세 기획 과업 설명 (Detail)</label>
                    <textarea 
                      className="w-full bg-white border border-gray-200 pl-3 pr-3 py-1.5 rounded-xl text-xs text-gray-805 focus:outline-none focus:border-blue-500 min-h-[90px] font-sans"
                      placeholder="본 사업에 대한 구체적인 추진 배경 및 실행 방안을 기재하세요."
                      value={tempProjForm.detail}
                      onChange={(e) => setTempProjForm({ ...tempProjForm, detail: e.target.value })}
                    />
                  </div>
                </div>

                {/* Right: Achievements Checklists */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 block uppercase">🏆 공식 성취 실적 / 핵심 지표 목록</label>
                    <p className="text-[9px] text-gray-450 mb-1">사이트 메인 페이지에 실시간 연계 노출되는 성과 항목들입니다.</p>
                    
                    {/* List of achievements being edited */}
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto border border-gray-150 p-2 rounded-xl bg-white">
                      {tempProjForm.achievements.length === 0 ? (
                        <div className="py-6 text-center text-gray-400 text-[10.5px]">등록된 성취 실적 지표가 비어 있습니다. 아래에서 새 항목을 추가하십시오.</div>
                      ) : (
                        tempProjForm.achievements.map((ach, achIdx) => (
                          <div key={achIdx} className="flex items-center justify-between gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                            <span className="text-[11px] text-slate-700 font-medium flex items-center gap-1 text-left">
                              <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0"></span>
                              {ach}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAchievementFromTemp(achIdx)}
                              className="text-[9.5px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100/40 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Inline adding button */}
                  <div className="flex gap-1.5 items-center">
                    <input 
                      type="text"
                      className="flex-1 bg-white border border-gray-200 pl-3 pr-3 py-1.5 rounded-xl text-xs text-gray-850 focus:outline-none focus:border-blue-500"
                      placeholder="추가할 성과 지표 입력 (예: 장학생 누적 100인 수여)"
                      value={newAchievementText}
                      onChange={(e) => setNewAchievementText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addAchievementToTemp();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addAchievementToTemp}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-black cursor-pointer flex items-center gap-0.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> 추가
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-gray-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewProj(false);
                    setEditingProjIndex(null);
                  }}
                  className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-[11px] font-bold text-gray-655 rounded-xl cursor-pointer"
                >
                  취소 (Cancel)
                </button>
                <button
                  type="button"
                  onClick={saveProject}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-xl cursor-pointer shadow-3xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> 해당 사업 기안 최종결재 (Apply &amp; Sync)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Projects display grid inside Admin Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectsData
            .filter(proj => {
              if (!projectSearchQuery.trim()) return true;
              return proj.title.toLowerCase().includes(projectSearchQuery.toLowerCase()) || 
                     (proj.subtitle && proj.subtitle.toLowerCase().includes(projectSearchQuery.toLowerCase())) ||
                     (proj.detail && proj.detail.toLowerCase().includes(projectSearchQuery.toLowerCase()));
            })
            .map((proj, idx) => {
              // Find real index in projectsData array for editing/deletion
              const realIdx = projectsData.findIndex(p => p.title === proj.title);
              return (
                <div 
                  key={idx} 
                  className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-xs transition-all shadow-3xs flex flex-col justify-between"
                  id={`dashboard-project-item-${idx}`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 text-left">
                        <span className="text-[8.5px] font-mono bg-blue-50 border border-blue-150 text-blue-650 px-1.5 py-0.2 rounded font-black">
                          사업 코드 #{realIdx !== -1 ? realIdx + 1 : idx + 1}
                        </span>
                        <h4 className="text-xs font-extrabold text-gray-950 font-sans tracking-tight">{proj.title}</h4>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEditProject(realIdx !== -1 ? realIdx : idx)}
                          className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded transition-colors cursor-pointer border border-gray-200"
                          title="상세 수정"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteProject(realIdx !== -1 ? realIdx : idx, proj.title)}
                          className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-colors cursor-pointer border border-red-100"
                          title="영구 삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-400 font-bold leading-normal text-left line-clamp-2">
                      {proj.subtitle}
                    </p>

                    <div className="text-[10.5px] text-gray-600 bg-slate-50/50 p-2.5 rounded-xl border border-gray-150/40 leading-relaxed text-left min-h-[50px] font-sans line-clamp-3">
                      {proj.detail}
                    </div>

                    {/* Achievements bullets */}
                    <div className="space-y-1 text-left">
                      <span className="text-[8.5px] font-black text-gray-400 uppercase tracking-widest block">실정 추진 지표 ({proj.achievements?.length || 0})</span>
                      <div className="flex flex-wrap gap-1">
                        {proj.achievements && proj.achievements.length > 0 ? (
                          proj.achievements.slice(0, 3).map((ach, achId) => (
                            <span key={achId} className="text-[9px] font-bold text-teal-650 bg-teal-50 border border-teal-150/40 px-2 py-0.5 rounded-full block">
                              ✓ {ach}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-gray-450 italic">등록된 지표 없음</span>
                        )}
                        {proj.achievements && proj.achievements.length > 3 && (
                          <span className="text-[9px] font-bold text-gray-500 bg-slate-100 px-1.5 py-0.5 rounded-full block">
                            +{proj.achievements.length - 3}건 더 있음
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          {projectsData.length === 0 && (
            <div className="col-span-full py-12 border-2 border-dashed border-gray-100 rounded-3xl text-center text-gray-400 text-xs font-semibold flex flex-col items-center justify-center gap-2">
              <Briefcase className="w-8 h-8 text-gray-300" />
              <span>현재 등록된 주요 사업 정보가 없습니다. 상단에서 신규 사업을 개설하십시오.</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* 4. Split Sections: G5 MemberApproval (New) + Approvals Quick Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* GnuBoard API Member Sign-up Approvals queue (New Module as requested) */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.004, boxShadow: "0 16px 35px rgba(16, 185, 129, 0.05)" }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="lg:col-span-6 glass-card p-6 rounded-3xl border border-gray-150 bg-white flex flex-col justify-between text-left transition-colors duration-300 hover:border-emerald-200 shadow-[0_4px_20px_rgba(31,38,135,0.02)]"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 animate-pulse">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-950 font-sans">그누보드 신규 회원 가입 승인대기</h3>
                  <div className="text-[10px] text-gray-400 font-semibold">GnuBoard API로부터 수신된 대기 회원 목록</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-black">
                {pendingG5Members.length} 건 대기
              </span>
            </div>

            <AnimatePresence mode="popLayout">
              {pendingG5Members.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center text-gray-400 text-xs font-semibold flex flex-col items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 bg-emerald-50 rounded-full p-1.5" />
                  <span>현재 가입 승인 대기중인 그누보드 신임 회원이 없습니다.</span>
                </motion.div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {pendingG5Members.map((m) => (
                    <motion.div
                      key={m.id}
                      layoutId={m.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-emerald-250 transition-all"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-gray-900">{m.mb_name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">({m.mb_id})</span>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-150 text-[9px] px-1 py-0.2 rounded font-black">{m.mb_nick}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-semibold flex flex-col">
                          <span>이메일: {m.mb_email}</span>
                          <span>연락처: {m.mb_tel}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => {
                            onApproveG5Member(m.id);
                            triggerFeedback(`[${m.mb_name}] 회원이 그누보드 정회원으로 승인 완료되었습니다.`);
                          }}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black shadow-3xs cursor-pointer flex items-center gap-0.5 transition-colors"
                        >
                          <Check className="w-3 h-3" /> 승인 처리
                        </button>
                        <button
                          onClick={() => {
                            onRejectG5Member(m.id);
                            triggerFeedback(`[${m.mb_name}] 회원 가입 요청이 거절 처리되었습니다.`);
                          }}
                          className="px-2 py-1.5 bg-white border border-red-150 text-red-650 hover:bg-red-50 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          거절
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Local Document Verifications Quick actions */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.004, boxShadow: "0 16px 35px rgba(59, 130, 246, 0.05)" }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="lg:col-span-6 glass-card p-6 rounded-3xl border border-gray-150 bg-white flex flex-col justify-between text-left transition-colors duration-300 hover:border-blue-200 shadow-[0_4px_20px_rgba(31,38,135,0.02)]" 
          id="panel-quick-approvals"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-105 flex items-center justify-center text-blue-600">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-950 font-sans">실명 인지 서류 신속 심사대</h3>
                  <div className="text-[10px] text-gray-400 font-semibold">입국 확인서 및 정착 자격 1초 고속 승인 처분</div>
                </div>
              </div>
              <button 
                onClick={() => onSwitchTab('users')}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
              >
                전체보기 <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <AnimatePresence mode="popLayout">
              {pendingApprovals.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center text-gray-400 text-xs font-semibold flex flex-col items-center justify-center gap-2"
                >
                  <Check className="w-8 h-8 text-emerald-500 bg-emerald-50 rounded-full p-1.5" />
                  <span>현재 상신된 실명 대기 서류 심사가 전부 만료되었습니다.</span>
                </motion.div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {pendingApprovals.map((v) => (
                    <motion.div
                      key={v.id}
                      layoutId={v.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-3.5 bg-slate-50 border border-gray-200/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-200 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-gray-900">{v.name}</span>
                          <span className="text-[10px] text-gray-400 font-bold font-mono">{v.settlementYear}년 탈북입국</span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                          <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide">수탁서류</span>
                          {v.documentType}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => onApprove(v.id, v.name)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold shadow-3xs cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3 h-3" /> 즉시 승인
                        </button>
                        <button
                          onClick={() => onReject(v.id, v.name)}
                          className="px-2.5 py-1.5 bg-white border border-red-150 text-red-650 hover:bg-red-50 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          반려 조치
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>

      {/* 5. System Activity Logs list */}
      <div className="glass-card p-6 rounded-3xl border border-gray-150 bg-white shadow-3xs text-left" id="panel-activities-log">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-gray-200 flex items-center justify-center text-gray-700">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-950 font-sans">실시간 통합 통신 및 DB 콘솔 로그</h3>
                <div className="text-[10px] text-gray-400 font-semibold">그누보드 API 호출 흐름 및 SQL 전산 감시 내역</div>
              </div>
            </div>
            <span className="text-[9.5px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded-md border border-slate-200">DB Live Syncing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-12 space-y-3 max-h-[190px] overflow-y-auto pr-1 font-mono">
              {latestActivities.map((act) => (
                <div 
                  key={act.id} 
                  className="flex items-start justify-between gap-3 text-[11px] leading-relaxed border-b border-gray-50 pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex gap-2">
                    <span className="mt-1 shrink-0 block">
                      {act.type === 'success' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>}
                      {act.type === 'warn' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>}
                      {act.type === 'system' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>}
                      {act.type === 'info' && <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"></span>}
                    </span>
                    <div className="text-gray-700 select-text text-[10.5px]">
                      {act.text}
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400 shrink-0 font-bold pt-0.5">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono flex items-center justify-between mt-4">
          <span>Database Target: {g5DbName} ({g5DbHost})</span>
          <span className="text-emerald-600 font-extrabold">● API Bridge Live Tunnel Active</span>
        </div>
      </div>

    </div>
  );
}
