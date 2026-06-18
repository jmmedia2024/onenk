import React, { useState, useEffect } from 'react';
import { supabase, supabaseDb, getSupabaseConfig, updateSupabaseClient } from '../supabase';
import { 
  Lock, 
  Unlock, 
  Shield, 
  Users, 
  Database, 
  DollarSign, 
  Activity, 
  Settings, 
  Check, 
  X, 
  RefreshCw, 
  Search, 
  Trash2, 
  ArrowUpRight, 
  BarChart3, 
  AlertCircle,
  FileSpreadsheet,
  Edit3,
  Plus,
  Save,
  Image,
  Sparkles,
  Globe,
  Sliders,
  Download,
  Code,
  Layers,
  PlusCircle,
  ShieldAlert,
  Terminal,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminDashboard from './AdminDashboard';
import { HeroSlide, AboutGreeting, ProjectItem, AboutPurpose, AboutOrgCustom, AboutLocation } from '../types';

interface PendingVerification {
  id: string;
  name: string;
  age: number;
  settlementYear: number;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
}

interface AdminDonation {
  id: string;
  donorName: string;
  amount: number;
  paymentMethod: string;
  date: string;
  isRecognized: boolean;
}

export interface GnuMember {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_level: number;
  mb_email: string;
  mb_tel: string;
  mb_datetime: string;
  mb_open: boolean;
}

interface AdminSectionProps {
  heroSlides?: HeroSlide[];
  setHeroSlides?: React.Dispatch<React.SetStateAction<HeroSlide[]>>;
  aboutGreeting?: AboutGreeting;
  setAboutGreeting?: React.Dispatch<React.SetStateAction<AboutGreeting>>;
  projectsData?: ProjectItem[];
  setProjectsData?: React.Dispatch<React.SetStateAction<ProjectItem[]>>;
  aboutPurpose?: AboutPurpose;
  setAboutPurpose?: React.Dispatch<React.SetStateAction<AboutPurpose>>;
  aboutOrgCustom?: AboutOrgCustom;
  setAboutOrgCustom?: React.Dispatch<React.SetStateAction<AboutOrgCustom>>;
  aboutLocation?: AboutLocation;
  setAboutLocation?: React.Dispatch<React.SetStateAction<AboutLocation>>;
  onOpenBannerEditor?: () => void;
}

export default function AdminSection({
  heroSlides = [],
  setHeroSlides,
  aboutGreeting,
  setAboutGreeting,
  projectsData = [],
  setProjectsData,
  aboutPurpose,
  setAboutPurpose,
  aboutOrgCustom,
  setAboutOrgCustom,
  aboutLocation,
  setAboutLocation,
  onOpenBannerEditor
}: AdminSectionProps) {
  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('bukmin_admin_authenticated') === 'true';
  });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showSuccessCheck, setShowSuccessCheck] = useState(false);

  // Core administrative states from true DB
  const [totalMembers, setTotalMembers] = useState(1450);
  const [activeVolunteers, setActiveVolunteers] = useState(384);
  const [pendingCount, setPendingCount] = useState(4);
  const [totalContributions, setTotalContributions] = useState(89200000); // 89.2M KRW

  // Real-time verification queue
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);

  // Sponsorship Ledger records
  const [donations, setDonations] = useState<AdminDonation[]>([]);

  // Manual donation registration states
  const [newDonorName, setNewDonorName] = useState('');
  const [newDonorAmount, setNewDonorAmount] = useState('');
  const [newDonorMethod, setNewDonorMethod] = useState('계좌이체 (농협)');

  // Selected administrative view subtab
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'dashboard' | 'users' | 'donations' | 'system' | 'homepage'>('dashboard');

  // Interactive Database Terminal states
  const [dbQuery, setDbQuery] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<any[]>(() => [
    { type: 'system', text: '북민회 통합 ERP SQL 데이터베이스 터미널 인터페이스 (SQLite 3.45.1)' },
    { type: 'info', text: '명령어 가이드: "SELECT * FROM members", "SELECT * FROM donations" 또는 오른쪽 사전 목록 항목 기동 완료' }
  ]);

  // Hidden GnuBoard configurations kept purely as dummy props to ensure AdminDashboard builds perfectly
  const [g5ApiUrl, setG5ApiUrl] = useState('http://localhost/g5_sync_bridge.php');
  const [g5ApiKey, setG5ApiKey] = useState('bukmin_g5_secure_token');
  const [g5DbHost, setG5DbHost] = useState('127.0.0.1');
  const [g5DbName, setG5DbName] = useState('g5_db');
  const [g5DbUser, setG5DbUser] = useState('g5_user');
  const [g5DbPassword, setG5DbPassword] = useState('password123');
  const [g5BoardsConfig, setG5BoardsConfig] = useState<any[]>([
    { id: 'notice', name: '공지사항', visibility: 'public', writeLevel: 10, totalCount: 15 },
    { id: 'free', name: '자유게시판', visibility: 'public', writeLevel: 2, totalCount: 42 }
  ]);

  // Partners state for live DB interactions
  const [partners, setPartners] = useState<any[]>([]);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerEng, setNewPartnerEng] = useState('');
  const [newPartnerDesc, setNewPartnerDesc] = useState('');
  const [newPartnerUrl, setNewPartnerUrl] = useState('');
  const [newPartnerColor, setNewPartnerColor] = useState('bg-blue-50 text-blue-600 border-blue-200');
  const [newPartnerLogo, setNewPartnerLogo] = useState('');
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);

  const fetchPartnersList = async () => {
    try {
      // Fetch directly from Supabase first for absolute live real-time sync in Admin view
      const { data: sbData, error: sbError } = await supabase.from('partners').select('*').order('name', { ascending: true });
      if (!sbError && sbData && sbData.length > 0) {
        setPartners(sbData);
        return;
      }
    } catch (sbErr) {
      console.warn("[AdminSection partners load] Supabase failed, fallback to local SQLite:", sbErr);
    }

    try {
      const res = await fetch("/api/partners");
      const data = await res.json();
      if (data && data.success) {
        setPartners(data.partners || []);
      }
    } catch (err) {
      console.error("[Partners Fetch App Error]:", err);
    }
  };

  const handleApplyPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName || !newPartnerUrl) {
      alert("파트너 단체명과 공식 웹 주소는 필수입니다.");
      return;
    }

    try {
      const res = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPartnerId,
          name: newPartnerName,
          engName: newPartnerEng,
          desc: newPartnerDesc,
          color: newPartnerColor,
          siteUrl: newPartnerUrl,
          logoUrl: newPartnerLogo
        })
      });
      const data = await res.json();
      if (data.success) {
        // Prepare IDs & Fallbacks
        const partnerId = editingPartnerId || data.partnerId || `p-${Date.now()}`;
        const defaultLogoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1.5"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="%23475569" text-anchor="middle">${newPartnerName.slice(0, 2)}</text></svg>`;
        const finalLogo = newPartnerLogo || defaultLogoSvg;

        // Perform direct write (INSERT/UPDATE) to Supabase table
        try {
          const { error: sbError } = await supabase.from('partners').upsert({
            id: partnerId,
            name: newPartnerName,
            engName: newPartnerEng || "",
            desc: newPartnerDesc || "",
            color: newPartnerColor,
            siteUrl: newPartnerUrl,
            logoUrl: finalLogo
          });
          if (sbError) {
            console.warn("[AdminSection] Supabase sync warning for partners:", sbError.message);
          } else {
            console.log("[AdminSection] Successfully synchronized partner write to Supabase!");
          }
        } catch (sbErr) {
          console.error("[AdminSection] Supabase partner integration exception:", sbErr);
        }

        alert(editingPartnerId ? "파트너사 정보가 성공적으로 수정되었습니다!" : "새로운 파트너사가 실시간 성공적으로 생성 등록되었습니다.");
        setNewPartnerName('');
        setNewPartnerEng('');
        setNewPartnerDesc('');
        setNewPartnerColor('bg-blue-50 text-blue-600 border-blue-200');
        setNewPartnerUrl('');
        setNewPartnerLogo('');
        setEditingPartnerId(null);
        fetchPartnersList();
        // Trigger event to refresh partner slider immediately
        window.dispatchEvent(new CustomEvent("refresh-partners"));
      } else {
        alert(data.message || "작업 도중 오류가 발생했습니다.");
      }
    } catch (err: any) {
      alert(`API 연결 오류: ${err.message}`);
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!window.confirm("정말 이 유관 협력 파트너사 연계를 해제(삭제)하시겠습니까?")) return;
    try {
      const res = await fetch("/api/partners/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        // Perform direct delete write to Supabase table
        try {
          const { error: sbError } = await supabase.from('partners').delete().eq('id', id);
          if (sbError) {
            console.warn("[AdminSection] Supabase sync warning for deleting partner:", sbError.message);
          } else {
            console.log("[AdminSection] Successfully deleted partner from Supabase!");
          }
        } catch (sbErr) {
          console.error("[AdminSection] Supabase partner deletion exception:", sbErr);
        }

        alert("파트너사 연계가 안전하게 철회 및 삭제되었습니다.");
        fetchPartnersList();
        window.dispatchEvent(new CustomEvent("refresh-partners"));
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert(`API 통신 에러: ${err.message}`);
    }
  };

  const handleEditPartnerDraft = (p: any) => {
    setEditingPartnerId(p.id);
    setNewPartnerName(p.name);
    setNewPartnerEng(p.engName);
    setNewPartnerDesc(p.desc);
    setNewPartnerColor(p.color || "bg-blue-50 text-blue-600 border-blue-200");
    setNewPartnerUrl(p.siteUrl);
    setNewPartnerLogo(p.logoUrl);
  };

  // Supabase Live Integration Management States
  const [supabaseStatus, setSupabaseStatus] = useState<'unknown' | 'connected' | 'no_tables' | 'error'>('unknown');
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseConfig().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseConfig().key);

  const handleUpdateSupabaseCredentials = () => {
    updateSupabaseClient(supabaseUrlInput, supabaseKeyInput);
    testSupabaseConnection();
  };

  const [supabaseLog, setSupabaseLog] = useState<string>('초기화 대기 중...');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<Record<string, 'wait' | 'sync' | 'done' | 'fail'>>({
    members: 'wait',
    posts: 'wait',
    comments: 'wait',
    donations: 'wait',
    verifications: 'wait',
    slides: 'wait',
    partners: 'wait'
  });

  const testSupabaseConnection = async () => {
    setSupabaseLog("Supabase 연결 상태 확인 중...");
    try {
      const report = await supabaseDb.testConnection();
      setSupabaseLog(report.message);
      if (report.success) {
        if (report.status === 'no_tables') {
          setSupabaseStatus('no_tables');
        } else {
          setSupabaseStatus('connected');
        }
      } else {
        setSupabaseStatus('error');
      }
    } catch (e: any) {
      setSupabaseStatus('error');
      setSupabaseLog(`❌ 접속 확인 중 에러: ${e.message}`);
    }
  };

  const handleSyncAllToSupabase = async () => {
    setIsSyncing(true);
    setSupabaseLog("⌛ 1단계: 로컬 SQLite 데이터 전체 추출 중...");
    
    const initialProgress = {
      members: 'wait',
      posts: 'wait',
      comments: 'wait',
      donations: 'wait',
      verifications: 'wait',
      slides: 'wait',
      partners: 'wait'
    };
    setSyncProgress(initialProgress as any);

    try {
      const dbDumpRes = await fetch("/api/admin/raw-dump");
      if (!dbDumpRes.ok) {
        throw new Error("로컬 SQLite 데이터를 덤프하는 데 실패했습니다.");
      }
      const dbDumpData = await dbDumpRes.json();
      if (!dbDumpData.success || !dbDumpData.dump) {
        throw new Error(dbDumpData.message || "로컬 데이터 덤프 에러");
      }

      const dump = dbDumpData.dump;
      const tables = ["members", "posts", "comments", "donations", "verifications", "slides", "partners"];
      let succeededTablesCount = 0;

      for (const table of tables) {
        setSupabaseLog(`🔄 2단계: Supabase '${table}' 테이블 클라우드 동기화 중...`);
        setSyncProgress(prev => ({ ...prev, [table]: 'sync' }));
        
        const tableRows = dump[table] || [];
        const result = await supabaseDb.syncTable(table, tableRows);

        if (result.success) {
          setSyncProgress(prev => ({ ...prev, [table]: 'done' }));
          succeededTablesCount++;
        } else {
          setSyncProgress(prev => ({ ...prev, [table]: 'fail' }));
          setSupabaseLog(`⚠️ '${table}' 테이블 업로드 중 오류가 발생했습니다: ${result.error}. (Supabase 상에 해당 테이블 또는 제약 조건이 준비되었는지 확인하세요)`);
        }
      }

      if (succeededTablesCount === tables.length) {
        setSupabaseStatus('connected');
        setSupabaseLog("🎉 축하합니다! 모든 로컬 데이터가 Supabase Cloud 실시간 연계 DB에 단절 없이 완전하게 동기화 복제되었습니다.");
        alert("Supabase 클라우드 전체 백업/동기화가 안전하게 완료되었습니다!");
      } else {
        setSupabaseLog(`⚠️ 동기화 부분 완료: ${succeededTablesCount}/${tables.length}개 테이블 성공. 세션 로그를 검토하고 Supabase SQL 에디터에 스키마를 미리 생성했는지 점검해 주십시오.`);
      }

    } catch (err: any) {
      setSupabaseLog(`❌ 데이터 전송 연동 중 예외 발생: ${err.message}`);
      alert(`Supabase 동기화 통신 에러: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Real Database Synchronizers
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setTotalMembers(data.totalMembers);
        setActiveVolunteers(data.activeVolunteers);
        setPendingCount(data.pendingCount);
        setTotalContributions(data.totalContributions);
      }
    } catch (err) {
      console.error('Error fetching admin data stats:', err);
    }
  };

  const fetchVerifications = async () => {
    try {
      const res = await fetch('/api/verifications');
      const data = await res.json();
      if (data.success && data.verifications) {
        setVerifications(data.verifications);
      }
    } catch (err) {
      console.error('Error fetching verifications:', err);
    }
  };

  const fetchDonations = async () => {
    try {
      const res = await fetch('/api/donations');
      const data = await res.json();
      if (data.success && data.donations) {
        const mapped = data.donations.map((d: any) => ({
          id: d.id,
          donorName: d.donorName,
          amount: Number(d.amount),
          paymentMethod: d.paymentMethod,
          date: d.date,
          isRecognized: d.isRecognized === 1
        }));
        setDonations(mapped);
      }
    } catch (err) {
      console.error('Error fetching donations ledger:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchVerifications();
    fetchDonations();
    fetchPartnersList();
    testSupabaseConnection();
  }, []);

  // Authentication execution
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'admin' && adminPassword === 'bukmin123!') {
      setShowSuccessCheck(true);
      setTimeout(() => {
        setIsAdminAuthenticated(true);
        localStorage.setItem('bukmin_admin_authenticated', 'true');
        setShowSuccessCheck(false);
      }, 1000);
    } else {
      setLoginError('인증 아이디 또는 암호 정보가 ERP 관리 시스템의 정보와 불일치합니다.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('bukmin_admin_authenticated');
    setActiveAdminSubTab('dashboard');
  };

  // Processing Verification Requests
  const handleApprove = async (id: string, name: string) => {
    try {
      const res = await fetch('/api/verifications/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'approved' })
      });
      const data = await res.json();
      if (data.success) {
        fetchStats();
        fetchVerifications();
      } else {
        alert(data.message || '심사 승인 처리 실패');
      }
    } catch (err) {
      console.error('Error approving verification:', err);
    }
  };

  const handleReject = async (id: string, name: string) => {
    try {
      const res = await fetch('/api/verifications/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'rejected' })
      });
      const data = await res.json();
      if (data.success) {
        fetchStats();
        fetchVerifications();
      } else {
        alert(data.message || '심사 거부 처리 실패');
      }
    } catch (err) {
      console.error('Error rejecting verification:', err);
    }
  };

  // Add Donation manually
  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonorName || !newDonorAmount) return;

    const amt = parseInt(newDonorAmount.replace(/[^0-9]/g, ''), 10);
    if (isNaN(amt) || amt <= 0) return;

    try {
      const res = await fetch('/api/donations/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: newDonorName.trim(),
          amount: amt,
          paymentMethod: newDonorMethod,
          message: '행정 원장 수기 등록',
          isRegular: 0
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setNewDonorName('');
        setNewDonorAmount('');
        fetchStats();
        fetchDonations();
      } else {
        alert(data.message || '후원 등록 실패');
      }
    } catch (err) {
      console.error('Manual donation error:', err);
    }
  };

  // Interactive Database Terminal Real SQL Execution
  const handleExecuteTerminalQuery = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    // Append to virtual screen first
    setTerminalOutput(prev => [...prev, { type: 'input', text: `bukmin@admin-erp:~$ ${queryText}` }]);
    setDbQuery('');

    try {
      const res = await fetch('/api/admin/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: q })
      });
      const data = await res.json();

      if (data.success) {
        if (data.type === 'select') {
          const rowsArray = data.rows;
          if (rowsArray.length === 0) {
            setTerminalOutput(prev => [...prev, {
              type: 'info',
              text: 'Query OK. 0 rows returned.'
            }]);
          } else {
            const headers = Object.keys(rowsArray[0]);
            const rows = rowsArray.map((row: any) => headers.map(h => String(row[h] !== null ? row[h] : 'NULL')));

            setTerminalOutput(prev => [...prev, {
              type: 'success',
              text: `Query OK. ${rowsArray.length} rows returned from operational database.`
            }, {
              type: 'table',
              headers,
              rows
            }]);
          }
        } else {
          setTerminalOutput(prev => [...prev, {
            type: 'success',
            text: `Query OK. Statement executed successfully. Changes: ${data.changes}, Last Insert ID: ${data.lastInsertRowid}`
          }]);
          
          // Refresh statistics, verifications, and ledger arrays immediately!
          fetchStats();
          fetchVerifications();
          fetchDonations();
        }
      } else {
        setTerminalOutput(prev => [...prev, {
          type: 'error',
          text: `SQLite DB Error: ${data.message || 'Invalid SQLite syntax or schema integrity violation.'}`
        }]);
      }
    } catch (err: any) {
      setTerminalOutput(prev => [...prev, {
        type: 'error',
        text: `ERP Security Network Error: ${err.message || 'Failed to establish tunnel connection.'}`
      }]);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8" id="admin-main-section">
      {!isAdminAuthenticated ? (
        <div className="max-w-md mx-auto my-12" id="admin-login-card">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-150 p-8 shadow-xl text-center space-y-6"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Shield className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">ERP 행정망 대표 전산 시스템</h2>
              <p className="text-xs text-gray-400">북한이탈주민중앙회 레벨 10 최고 ERP 관리자 게이트</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Admin Id</label>
                <input 
                  type="text" 
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="아이디를 입력하세요 (admin)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Security Password</label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="암호를 입력하세요 (bukmin123!)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 text-red-650 border border-red-100 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span className="font-semibold leading-relaxed">{loginError}</span>
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-1.5"
              >
                {showSuccessCheck ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                    <span>전산 보안 승인 중...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>소인 관리 부트스트랩 개시</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-6" id="admin-dashboard-layout">
          {/* CONTROL BAR WITH TAB FILTERS & SYSTEM LOGOUT */}
          <div className="glass-card p-4 rounded-2xl border border-gray-100/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveAdminSubTab('dashboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeAdminSubTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-gray-600 hover:bg-slate-100 border border-gray-200'
                }`}
              >
                📊 행정 종합 대시보드
              </button>
              <button
                onClick={() => setActiveAdminSubTab('users')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  activeAdminSubTab === 'users' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-gray-600 hover:bg-slate-100 border border-gray-200'
                }`}
              >
                👥 실명인증 심사
                {verifications.filter(v => v.status === 'pending').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                    {verifications.filter(v => v.status === 'pending').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveAdminSubTab('donations')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeAdminSubTab === 'donations' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-gray-600 hover:bg-slate-100 border border-gray-200'
                }`}
              >
                💰 후원 원장 로그
              </button>
              <button
                onClick={() => setActiveAdminSubTab('system')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeAdminSubTab === 'system' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-gray-600 hover:bg-slate-100 border border-gray-200'
                }`}
              >
                💻 SQL DB 터미널
              </button>
              <button
                onClick={() => setActiveAdminSubTab('homepage')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeAdminSubTab === 'homepage' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-gray-600 hover:bg-slate-100 border border-gray-200'
                }`}
              >
                ⚙️ 홈 CMS 제어판
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded">
                Level 10 Admin
              </span>
              <button
                onClick={handleAdminLogout}
                className="px-3.5 py-2 hover:bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                ERP 안전 안전 로그아웃
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeAdminSubTab === 'dashboard' && (
              <AdminDashboard
                totalMembers={totalMembers}
                activeVolunteers={activeVolunteers}
                pendingCount={pendingCount}
                totalContributions={totalContributions}
                verifications={verifications}
                onApprove={handleApprove}
                onReject={handleReject}
                consoleLogs={[]}
                onSwitchTab={(tab) => setActiveAdminSubTab(tab as any)}
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
                isSyncingSettings={false}
                syncSettingsResult={null}
                onSyncSettings={() => {}}
                totalPosts={42}
                pendingG5Members={[]}
                onApproveG5Member={() => {}}
                onRejectG5Member={() => {}}
                g5BoardsConfig={g5BoardsConfig}
                setG5BoardsConfig={setG5BoardsConfig}
                projectsData={projectsData}
                setProjectsData={setProjectsData}
              />
            )}

            {activeAdminSubTab === 'users' && (
              <motion.div
                key="admin-users-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                <div className="bg-white rounded-3xl border border-gray-150 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-gray-900 font-sans">실명인증 심사 원장대장</h3>
                    <p className="text-[11px] text-gray-400">정회원 자격을 요청한 북한이탈주민의 고유 서류 실태 검인 관리 대장입니다.</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-bold">
                          <th className="p-4">이름</th>
                          <th className="p-4">나이</th>
                          <th className="p-4">탈북정착년도</th>
                          <th className="p-4">인증 서류 유형</th>
                          <th className="p-4">신청 접수일</th>
                          <th className="p-4">상태</th>
                          <th className="p-4 text-center">심사 작인</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150">
                        {verifications.map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-bold text-gray-900">{v.name}</td>
                            <td className="p-4">{v.age}세</td>
                            <td className="p-4 text-gray-500 font-medium">{v.settlementYear}년 가입</td>
                            <td className="p-4 text-indigo-600 font-semibold">{v.documentType}</td>
                            <td className="p-4 text-gray-400 font-mono">{v.requestDate}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                v.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                v.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                'bg-red-50 text-red-600 border border-red-200'
                              }`}>
                                {v.status === 'pending' ? '정비 대기' : v.status === 'approved' ? '승인 완료' : '반려 처리'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-1.5">
                                {v.status === 'pending' ? (
                                  <>
                                    <button
                                      onClick={() => handleApprove(v.id, v.name)}
                                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      승인
                                    </button>
                                    <button
                                      onClick={() => handleReject(v.id, v.name)}
                                      className="px-2.5 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      반려
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-gray-400 italic">심사 종결</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeAdminSubTab === 'donations' && (
              <motion.div
                key="admin-donations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
              >
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white rounded-3xl border border-gray-150 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-black text-gray-900 font-sans">실시간 통합 후원 원장 로그</h3>
                      <p className="text-[11px] text-gray-400">사단법인 북민회 전산망에 기록된 회원 및 외부 지원 기명 자금의 정합 원장입니다.</p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-bold">
                            <th className="p-4">기명인/기탁처</th>
                            <th className="p-4">기후금액</th>
                            <th className="p-4">전도 수단</th>
                            <th className="p-4">접수 날짜</th>
                            <th className="p-4">기금 검인 상태</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150">
                          {donations.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50 transition-all font-sans">
                              <td className="p-4 font-bold text-gray-900">{d.donorName}</td>
                              <td className="p-4 text-blue-600 font-extrabold">{d.amount.toLocaleString()}원</td>
                              <td className="p-4 text-gray-500 font-medium">{d.paymentMethod}</td>
                              <td className="p-4 text-gray-400 font-mono">{d.date}</td>
                              <td className="p-4">
                                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-full font-bold">
                                  세무 전결 수납완료
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 max-h-[450px]">
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <PlusCircle className="w-4 h-4 text-blue-600" />
                      수기 전결 기금 등재 (후원 수동 기입)
                    </h3>
                    <form onSubmit={handleAddDonation} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase block">후원자 기명/기탁처</label>
                        <input 
                          type="text" 
                          value={newDonorName}
                          onChange={(e) => setNewDonorName(e.target.value)}
                          placeholder="예: 최수식 또는 신한금융"
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase block">기탁 금전 (원화)</label>
                        <input 
                          type="text" 
                          value={newDonorAmount}
                          onChange={(e) => setNewDonorAmount(e.target.value)}
                          placeholder="예: 500000 (숫자만)"
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase block">전도 및 영수 수단</label>
                        <select 
                          value={newDonorMethod}
                          onChange={(e) => setNewDonorMethod(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option>계좌이체 (농협)</option>
                          <option>신용카드</option>
                          <option>해외송금</option>
                          <option>현금 수납</option>
                        </select>
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer active:scale-97"
                      >
                        신규 원장 기입 승인
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {activeAdminSubTab === 'system' && (
              <motion.div
                key="admin-terminal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
              >
                <div className="lg:col-span-8 flex flex-col h-[520px] bg-slate-950 rounded-3xl border border-slate-900 shadow-inner overflow-hidden font-mono text-xs">
                  <div className="bg-slate-900 px-4 py-3 border-b border-slate-850 flex items-center justify-between">
                    <span className="text-gray-400 font-bold flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-blue-500" />
                      bukmin-erp-sql-shell:~
                    </span>
                    <span className="text-[10px] text-emerald-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      INTELLIGENT SHELL READY
                    </span>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {terminalOutput.map((log, idx) => (
                      <div key={idx} className="space-y-1.5 leading-relaxed text-slate-350">
                        {log.type === 'system' && <div className="text-slate-400 font-extrabold text-[12px]">{log.text}</div>}
                        {log.type === 'info' && <div className="text-blue-400 text-left">{log.text}</div>}
                        {log.type === 'input' && <div className="text-white text-left font-semibold">{log.text}</div>}
                        {log.type === 'success' && <div className="text-emerald-400 text-left font-bold">{log.text}</div>}
                        {log.type === 'error' && <div className="text-red-400 text-left font-semibold">{log.text}</div>}
                        {log.type === 'table' && (
                          <div className="overflow-x-auto my-2 border border-slate-800 rounded-lg bg-slate-900/40">
                            <table className="w-full text-left border-collapse text-[10px]">
                              <thead>
                                <tr className="border-b border-slate-800 bg-slate-900 text-slate-400">
                                  {log.headers.map((h: string, hIdx: number) => <th key={hIdx} className="p-2">{h}</th>)}
                                </tr>
                              </thead>
                              <tbody>
                                {log.rows.map((row: any[], rIdx: number) => (
                                  <tr key={rIdx} className="border-b border-slate-850/50 hover:bg-slate-900/60 transition-colors">
                                    {row.map((val: any, cIdx: number) => <td key={cIdx} className="p-2 text-slate-300">{val}</td>)}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-900/80 border-t border-slate-850 flex items-center gap-2">
                    <span className="text-blue-500 font-extrabold flex shrink-0">bukmin@admin-erp:$</span>
                    <input 
                      type="text" 
                      value={dbQuery}
                      onChange={(e) => setDbQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleExecuteTerminalQuery(dbQuery);
                      }}
                      placeholder="SQL 질의문을 입력하십시오 (예: SELECT * FROM members)"
                      className="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs border-none"
                    />
                    <button 
                      onClick={() => handleExecuteTerminalQuery(dbQuery)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shrink-0 cursor-pointer transition-all active:scale-95"
                    >
                      실행
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                      <Code className="w-4 h-4 text-indigo-500" />
                      원터치 터미널 쿼리 사전
                    </h3>
                    <p className="text-[11px] text-gray-450 leading-relaxed">자주 기동되는 관리용 구조화 질의문 매핑 사전입니다. 터치 즉시 해당 SQL 결과 테이블이 실시간 로딩 분석됩니다.</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleExecuteTerminalQuery('SELECT * FROM members')}
                        className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-slate-350 hover:bg-slate-50 transition-colors text-[11px] font-bold font-mono text-indigo-700 flex items-center justify-between"
                      >
                        <span>SELECT * FROM members</span>
                        <span className="text-[9px] bg-indigo-50 text-indigo-650 px-1.5 py-0.5 rounded uppercase font-black font-sans">회원 명단</span>
                      </button>
                      <button
                        onClick={() => handleExecuteTerminalQuery('SELECT * FROM donations')}
                        className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-slate-350 hover:bg-slate-50 transition-colors text-[11px] font-bold font-mono text-amber-700 flex items-center justify-between"
                      >
                        <span>SELECT * FROM donations</span>
                        <span className="text-[9px] bg-amber-50 text-amber-650 px-1.5 py-0.5 rounded uppercase font-black font-sans">기금 대장</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ☁️ Supabase Cloud Synchronization & Schema Center */}
                <div className="col-span-12 bg-white rounded-3xl border border-gray-150 p-6 space-y-6 shadow-xs">
                  <div className="border-b border-gray-100 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-600 animate-pulse" />
                        ☁️ Supabase Cloud DB 통합 연동 & 실시간 동기화 센터
                      </h3>
                      <p className="text-[11px] text-gray-400 font-medium">
                        로컬 SQLite 파일 데이터베이스 구조를 클라우드 데이터 관리망인 Supabase PostgreSQL로 완벽 연결 동기화합니다.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`p-1.5 px-3 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 border ${
                        supabaseStatus === 'connected' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-150' 
                          : supabaseStatus === 'no_tables'
                          ? 'bg-amber-50 text-amber-600 border-amber-150'
                          : supabaseStatus === 'error'
                          ? 'bg-rose-50 text-rose-600 border-rose-150'
                          : 'bg-slate-50 text-slate-500 border-slate-150'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          supabaseStatus === 'connected' 
                            ? 'bg-emerald-500' 
                            : supabaseStatus === 'no_tables'
                            ? 'bg-amber-500 animate-pulse'
                            : supabaseStatus === 'error' 
                            ? 'bg-rose-500 animate-pulse' 
                            : 'bg-slate-400'
                        }`} />
                        {supabaseStatus === 'connected' 
                          ? 'Supabase ONLINE' 
                          : supabaseStatus === 'no_tables'
                          ? '인증 성공 / 테이블 생성 필요'
                          : supabaseStatus === 'error' 
                          ? 'Supabase OFFLINE' 
                          : '연결 상태 확인 필요'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Supabase Core Integration controls */}
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3.5">
                        <span className="text-xs font-black text-slate-700 block">⚙️ 클라우드 연결 설정 정보</span>
                        
                        <div className="grid grid-cols-1 gap-2.5 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 block uppercase">Client Target URL</span>
                            <input
                              type="text"
                              value={supabaseUrlInput}
                              onChange={(e) => setSupabaseUrlInput(e.target.value)}
                              placeholder="https://your-project.supabase.co"
                              className="w-full bg-white p-2.5 rounded-xl font-mono text-[11px] text-slate-700 border border-slate-200 select-text focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 block uppercase">Publishable Anon Key</span>
                            <input
                              type="text"
                              value={supabaseKeyInput}
                              onChange={(e) => setSupabaseKeyInput(e.target.value)}
                              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC..."
                              className="w-full bg-white p-2.5 rounded-xl font-mono text-[11px] text-slate-700 border border-slate-200 select-text focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleUpdateSupabaseCredentials}
                            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 text-blue-700 font-extrabold text-[11px] px-3.5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all active:scale-97"
                          >
                            <Save className="w-3.5 h-3.5 text-blue-500" />
                            설정 반영 및 연결
                          </button>

                          <button
                            type="button"
                            onClick={testSupabaseConnection}
                            className="bg-slate-150 hover:bg-slate-200 border border-gray-200 hover:border-slate-350 text-slate-700 font-extrabold text-[11px] px-3.5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all active:scale-97"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                            연결 확인
                          </button>
                          
                          <button
                            type="button"
                            disabled={isSyncing}
                            onClick={handleSyncAllToSupabase}
                            className={`flex-1 font-bold text-[11px] text-white px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-97 cursor-pointer ${
                              isSyncing ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow shadow-xs border border-blue-500"
                            }`}
                          >
                            <Layers className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                            {isSyncing ? "복제 중..." : "SQLite ➜ Supabase 복제"}
                          </button>
                        </div>
                      </div>

                      {/* Live Process Monitor console block */}
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900 text-left font-mono text-[11px] space-y-2.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">📡 클라우드 동기화 모니터 세션</span>
                        <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl min-h-[90px] max-h-[140px] overflow-y-auto text-emerald-400 leading-relaxed font-semibold">
                          {supabaseLog}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[9px] font-bold text-slate-300 font-mono">
                          {Object.entries(syncProgress).map(([tbl, status]) => (
                            <div key={tbl} className="flex items-center justify-between p-1.5 px-2.5 bg-slate-900 border border-slate-850 rounded-lg">
                              <span>{tbl}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
                                status === 'sync' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                                status === 'fail' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-850 text-slate-450'
                              }`}>
                                {status === 'done' ? '완료' : status === 'sync' ? '진행' : status === 'fail' ? '실패' : '대기'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Supabase Schema Query Area */}
                    <div className="flex flex-col border border-gray-150 rounded-2xl p-4 bg-slate-50/20 text-left">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                        <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 text-blue-600" />
                          📋 Supabase 전용 SQL DDL 스키마 모음 (PostgreSQL 호환)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const sqlContent = document.getElementById("supabase-ddl-schema-textarea")?.textContent || "";
                            navigator.clipboard.writeText(sqlContent);
                            alert("Supabase SQL 스키마 쿼리문이 클립보드에 안전하게 복사되었습니다!");
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-1 rounded border border-blue-100"
                        >
                          <Download className="w-3 h-3" /> 코드 복사
                        </button>
                      </div>

                      <p className="text-[11px] text-gray-550 leading-relaxed mb-3">
                        Supabase 대시보드 내 <strong className="text-slate-800">SQL Editor</strong>에 아래의 스키마 생성 쿼리문을 그대로 복사하여 실행하시면 실시간으로 데이터를 수용할 테이블 7개가 완전 자동 생성 완료됩니다.
                      </p>

                      <div className="flex-1 overflow-y-auto bg-slate-900 border border-slate-950 rounded-xl p-3 text-[10px] text-slate-350 font-mono leading-relaxed select-all shadow-inner h-[280px]" id="supabase-ddl-schema-textarea" style={{ whiteSpace: 'pre-wrap' }}>
{`-- 1. 회원 정보 테이블
CREATE TABLE IF NOT EXISTS members (
  mb_id TEXT PRIMARY KEY,
  mb_password TEXT NOT NULL,
  mb_name TEXT NOT NULL,
  mb_nick TEXT NOT NULL,
  mb_email TEXT NOT NULL,
  mb_tel TEXT NOT NULL,
  mb_level BIGINT NOT NULL DEFAULT 2,
  mb_point BIGINT NOT NULL DEFAULT 0,
  mb_datetime TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  mb_today_login TEXT
);

-- 2. 게시물 정보 테이블
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  board TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  date TEXT NOT NULL,
  views BIGINT NOT NULL DEFAULT 0,
  likes BIGINT NOT NULL DEFAULT 0
);

-- 3. 이탈주민 연동 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL
);

-- 4. 후원 내역 테이블
CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  "donorName" TEXT NOT NULL,
  amount BIGINT NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  date TEXT NOT NULL,
  message TEXT,
  "isRegular" INT DEFAULT 0,
  "isRecognized" INT DEFAULT 1
);

-- 5. 정착인 국가인증 처리 테이블
CREATE TABLE IF NOT EXISTS verifications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age BIGINT NOT NULL,
  "settlementYear" BIGINT NOT NULL,
  "documentType" TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  "requestDate" TEXT NOT NULL
);

-- 6. 메인 배너 슬라이드 테이블
CREATE TABLE IF NOT EXISTS slides (
  id INT PRIMARY KEY,
  "imageUrl" TEXT NOT NULL,
  badge TEXT NOT NULL,
  title TEXT NOT NULL,
  "subTitle" TEXT NOT NULL
);

-- 7. 우수 유관 협력 파트너사 테이블
CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "engName" TEXT NOT NULL,
  "desc" TEXT NOT NULL,
  color TEXT NOT NULL,
  "siteUrl" TEXT NOT NULL,
  "logoUrl" TEXT NOT NULL
);`}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeAdminSubTab === 'homepage' && (
              <motion.div
                key="admin-homepage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                <div className="bg-white rounded-3xl border border-gray-150 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-black text-gray-900 font-sans">홈페이지 CMS 메인 콘텐츠 편집기</h3>
                    <p className="text-[11px] text-gray-400">대고객용 메인 화면의 슬라이드, 인사말, 핵심 가치 등에 적용되는 문정 글귀를 즉각 실시간 제어 변경합니다.</p>
                  </div>
                </div>

                {/* 메인 배너 슬라이드 자율 교체기 전결 파트 */}
                {onOpenBannerEditor && (
                  <div className="bg-gradient-to-r from-blue-500/10 via-slate-50 to-white rounded-3xl border border-blue-200/60 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                    <div className="space-y-1 max-w-2xl">
                      <h4 className="font-bold text-sm text-blue-900 flex items-center gap-1.5">
                        <Image className="w-4 h-4 text-blue-600" />
                        🖼️ 홈페이지 메인 롤링 배너 자율 교체기
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                        메인 화면 최상단에 회전(Rolling) 노출 중인 이미지, 메인 슬로건 타이틀, 부제목, 링크 버튼 위치를 자율적으로 실시간 추가/순서 편집하고 변경할 수 있는 전용 도구입니다.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenBannerEditor}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer active:scale-97 shrink-0 flex items-center gap-1.5 border border-blue-500 hover:shadow-md animate-pulse"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      배너 슬라이드 관리자 도구 개시
                    </button>
                  </div>
                )}

                {/* 정착 협력 파트너사 자율 관리기 CMS 파트 */}
                <div className="bg-white rounded-3xl border border-gray-150 p-6 space-y-5">
                  <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-600" />
                        🤝 정착 협력 유관 파트너사 자율 관리기
                      </h4>
                      <p className="text-[11px] text-gray-400 font-medium">홈페이지 최하단에 롤링 중인 유관 정부부처, 지자체, NGO 협력 단체 목록을 실시간 추가/수정/삭제 조율합니다.</p>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                      총 {partners.length}개 유관단체 등록됨
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* 파트너사 등록 / 수정 폼 */}
                    <form onSubmit={handleApplyPartner} className="xl:col-span-5 bg-slate-50/50 rounded-2xl border border-slate-100 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700 block">
                          {editingPartnerId ? "✏️ 파트너사 정보 수정" : "✨ 우수 협력 단체 신규 연계"}
                        </span>
                        {editingPartnerId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPartnerId(null);
                              setNewPartnerName('');
                              setNewPartnerEng('');
                              setNewPartnerDesc('');
                              setNewPartnerColor('bg-blue-50 text-blue-600 border-blue-200');
                              setNewPartnerUrl('');
                              setNewPartnerLogo('');
                            }}
                            className="text-[10px] font-bold text-rose-500 hover:underline"
                          >
                            입력 취소
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">파트너 단체명 *</label>
                            <input
                              type="text"
                              required
                              placeholder="예: 통일부, 남북하나재단"
                              value={newPartnerName}
                              onChange={(e) => setNewPartnerName(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">영문 단체명</label>
                            <input
                              type="text"
                              placeholder="예: MOU, NUAC"
                              value={newPartnerEng}
                              onChange={(e) => setNewPartnerEng(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">한줄 정책 소개</label>
                          <input
                            type="text"
                            placeholder="예: 탈북민들의 사회 정착 생활 지원 총괄처"
                            value={newPartnerDesc}
                            onChange={(e) => setNewPartnerDesc(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">공식 인터넷 주소 URL *</label>
                          <input
                            type="url"
                            required
                            placeholder="https://example.com"
                            value={newPartnerUrl}
                            onChange={(e) => setNewPartnerUrl(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">로고 SVG 소스 또는 이미지 주소</label>
                          <textarea
                            placeholder="Data URL 형식의 SVG 소스나 고해상도 이미지 경로를 입력하세요. (미입력시 자동 생성)"
                            value={newPartnerLogo}
                            onChange={(e) => setNewPartnerLogo(e.target.value)}
                            rows={2}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-[11px] font-mono focus:outline-hidden focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">포인트 배정 디자인 색지정 클래스</label>
                          <input
                            type="text"
                            placeholder="bg-slate-50 text-slate-600 border-slate-200"
                            value={newPartnerColor}
                            onChange={(e) => setNewPartnerColor(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-hidden focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        {editingPartnerId ? "💾 수정 사항 영구 반영하기" : "➕ 파트너십 상호 조약 체결"}
                      </button>
                    </form>

                    {/* 등록된 파트너사 그리드 리스트 */}
                    <div className="xl:col-span-7 space-y-3">
                      <span className="text-xs font-black text-slate-700 block">
                        📋 연계 파트너 포털 리스트 ({partners.length})
                      </span>

                      <div className="max-h-[380px] overflow-y-auto border border-gray-100 rounded-2xl divide-y divide-gray-50 bg-white shadow-inner">
                        {partners.length === 0 ? (
                          <div className="p-8 text-center text-xs text-gray-400 font-semibold">
                            현재 연계 등록된 협력 파트너사 일람이 부재합니다.
                          </div>
                        ) : (
                          partners.map((p) => (
                            <div key={p.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 flex items-center justify-center bg-white shrink-0">
                                  <img 
                                    src={p.logoUrl} 
                                    alt={p.name} 
                                    className="w-full h-full object-contain"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-xs text-slate-800 truncate">{p.name}</span>
                                    {p.engName && (
                                      <span className="text-[9px] text-gray-400 font-bold font-mono truncate max-w-[120px]">({p.engName})</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-gray-400 font-semibold truncate leading-tight mt-0.5">{p.desc || "등록된 연계 협조 설명 정보가 부재합니다."}</p>
                                  <a 
                                    href={p.siteUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-[9px] text-blue-500 hover:underline font-bold font-mono mt-0.5 block inline-block truncate max-w-[200px]"
                                  >
                                    {p.siteUrl}
                                  </a>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleEditPartnerDraft(p)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 border border-transparent hover:border-emerald-100 text-slate-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                  title="기록 소환 수정"
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePartner(p.id)}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                  title="파트너십 철회"
                                >
                                  해제
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Greeting and Location Edit fields */}
                  <div className="lg:col-span-6 space-y-6">
                    {/* Greeting Edit Card */}
                    {aboutGreeting && setAboutGreeting && (
                      <div className="bg-white rounded-3xl border border-gray-150 p-6 space-y-4">
                        <h4 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4 text-blue-600" />
                          대표자 인사말 및 표제 변경
                        </h4>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">인사말 대표자 직함</label>
                            <input 
                              type="text"
                              value={aboutGreeting.signerRole}
                              onChange={(e) => setAboutGreeting({ ...aboutGreeting, signerRole: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">대표자 소속 단체명</label>
                            <input 
                              type="text"
                              value={aboutGreeting.signerOrg}
                              onChange={(e) => setAboutGreeting({ ...aboutGreeting, signerOrg: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">핵심 슬로건 화두</label>
                            <input 
                              type="text"
                              value={aboutGreeting.title}
                              onChange={(e) => setAboutGreeting({ ...aboutGreeting, title: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">상세 인사말 요약 단락</label>
                            <textarea 
                              rows={5}
                              value={aboutGreeting.boldPara}
                              onChange={(e) => setAboutGreeting({ ...aboutGreeting, boldPara: e.target.value })}
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-medium text-slate-705"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Hero Slider control lists */}
                  <div className="lg:col-span-6 space-y-6">
                    {/* Location and Location guide info */}
                    {aboutLocation && setAboutLocation && (
                      <div className="bg-white rounded-3xl border border-gray-150 p-6 space-y-4">
                        <h4 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-indigo-600" />
                          본사 전산 실무 사무처 주소지 변경
                        </h4>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">도로명 우편물 수령지 주소</label>
                            <input 
                              type="text"
                              value={aboutLocation.address}
                              onChange={(e) => setAboutLocation({ ...aboutLocation, address: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold text-slate-800"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">연락망 유선 전화번호</label>
                            <input 
                              type="text"
                              value={aboutLocation.phone}
                              onChange={(e) => setAboutLocation({ ...aboutLocation, phone: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">공식 연락망 이메일 주소</label>
                            <input 
                              type="text"
                              value={aboutLocation.email}
                              onChange={(e) => setAboutLocation({ ...aboutLocation, email: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick informative banner */}
                    <div className="p-5 rounded-3xl border border-blue-150 bg-blue-50/50 leading-relaxed text-blue-950 font-medium space-y-2 text-xs">
                      <div className="font-bold text-blue-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>💡 변경된 홈 CMS 정보는 즉시 적용됩니다</span>
                      </div>
                      <p className="text-slate-650 text-[11px] leading-relaxed">대표인 인사말, 직함 설정, 사무처 주소, 팩스 번호 등의 필드를 수정하면 본 시스템 기동과 더불어 다른 모든 상시 고객용 외부 탭(About 및 단체 설명 필드)들의 텍스트들과 매핑되어 자동 실시간 교대 완료 반영됩니다.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
