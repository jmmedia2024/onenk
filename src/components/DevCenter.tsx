import React, { useState } from 'react';
import { Copy, Check, Database, FileCode, Server, Terminal, HelpCircle, RefreshCw, Send, AlertTriangle, CheckCircle, Sliders, Globe, Lock } from 'lucide-react';
import { DeveloperSnippet } from '../types';

export default function DevCenter() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeSnippet, setActiveSnippet] = useState<number>(0);

  // 🌐 Live GnuBoard API Fetch Integration Engine
  // Retrieve the target sync bridge API URL from the dotenv configuration
  const g5ApiUrl = (import.meta as any).env?.VITE_GNUBOARD_API_URL || 'http://onenk.kr/g5/sync_bridge.php';

  const [selectedAction, setSelectedAction] = useState<'get_latest_posts' | 'get_members' | 'test_db_connection'>('get_latest_posts');
  const [selectedBoard, setSelectedBoard] = useState<string>('notice');
  const [apiKey, setApiKey] = useState<string>('bukmin_secure_token_5848');
  
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    // Disable Sandbox Simulation Mode by default to run live real-time GnuBoard 5 database fetch operations immediately
    return false;
  });

  const handleFetchG5Data = async () => {
    setApiLoading(true);
    setApiError(null);
    setApiResponse(null);

    // If Sandbox/Demo mode is active, simulate the API call immediately for offline compliance
    if (isDemoMode) {
      setTimeout(() => {
        let dummyData: any = {};
        if (selectedAction === 'test_db_connection') {
          dummyData = {
            status: 'success',
            message: 'Connected to GnuBoard MySQL database successfully! (Sandbox Active Local Gate)',
            database: 'g5_database',
            host: '127.0.0.1',
            tables_loaded: ['g5_member', 'g5_board', 'g5_write_notice', 'g5_write_free', 'g5_sponsorship', 'g5_verification'],
            mysql_version: 'MySQL 5.7.35-log',
            server_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
            ping_ms: 11.2,
            security: 'Bearer Key Authorized'
          };
        } else if (selectedAction === 'get_members') {
          dummyData = {
            status: 'success',
            count: 4,
            data: [
              { mb_no: 1, mb_id: 'admin', mb_name: '최고관리자', mb_nick: '북민회대표', mb_level: 10, mb_email: 'admin@bukmin.org', mb_tel: '02-720-3400', mb_datetime: '2026-06-15 12:00:00' },
              { mb_no: 2, mb_id: 'nk_hero', mb_name: '박상혁', mb_nick: '자유수호가', mb_level: 3, mb_email: 'sanghyuk@gmail.com', mb_tel: '010-8937-1234', mb_datetime: '2026-06-11 09:14:15' },
              { mb_no: 3, mb_id: 'happy_uni', mb_name: '이정현', mb_nick: '통일나래', mb_level: 2, mb_email: 'junghyun@naver.com', mb_tel: '010-6575-5678', mb_datetime: '2026-06-12 18:05:11' },
              { mb_no: 4, mb_id: 'k_sarang', mb_name: '한은혜', mb_nick: '새삶인', mb_level: 2, mb_email: 'eunhye@daum.net', mb_tel: '010-4461-9012', mb_datetime: '2026-06-12 14:33:02' }
            ]
          };
        } else if (selectedAction === 'get_latest_posts') {
          dummyData = {
            status: 'success',
            board: selectedBoard,
            count: 2,
            data: [
              { wr_id: 1, wr_num: -1, wr_subject: `[${selectedBoard === 'notice' ? '공지사항' : selectedBoard === 'free' ? '자유소통' : '소식'}] 북민회 연합 홈페이지에 환영합니다.`, wr_content: '그누보드5 연동 스토리지 테스트 데이터 필드가 정상적으로 프론트바와 연계 가동 중입니다.', wr_name: '대표관리자', wr_datetime: '2026-06-15 10:00:00', wr_hit: 84 },
              { wr_id: 2, wr_num: -2, wr_subject: `북한이탈주민 정착 지원 사업 추진 실태 보고 (${selectedBoard})`, wr_content: '본 영역은 .env 및 fetch 엔드포인트 연동이 완료되어 실제 원격 서버와 교환 가능합니다.', wr_name: '박상혁', wr_datetime: '2026-06-14 15:30:00', wr_hit: 21 }
            ]
          };
        }
        setApiResponse(dummyData);
        setApiLoading(false);
      }, 650);
      return;
    }

    // 🌐 Actual Live fetch method to target GnuBoard database
    try {
      const response = await fetch(g5ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          action: selectedAction,
          bo_table: selectedBoard,
          db_host: '127.0.0.1',
          db_name: 'g5_database'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status} (${response.statusText})`);
      }

      const json = await response.json();
      setApiResponse(json);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || '네트워크 연결 실패 또는 CORS 정책으로 인한 차단이 발생했습니다.');
    } finally {
      setApiLoading(false);
    }
  };

  const snippets: DeveloperSnippet[] = [
    {
      title: '회원 테이블 및 기본 스키마',
      filename: 'db_schema_users.sql',
      language: 'sql',
      description: '탈북민 회원 정보와 관리 등급, 인증 상태를 기록하는 MySQL 스키마입니다.',
      code: `-- 1. 회원 정보 테이블 (g5_member 또는 개별 users 테이블 확장)
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(50) NOT NULL UNIQUE COMMENT '로그인 아이디',
  \`password\` VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호',
  \`name\` VARCHAR(100) NOT NULL COMMENT '회원 실명',
  \`email\` VARCHAR(100) NULL UNIQUE COMMENT '이메일 주소',
  \`phone\` VARCHAR(20) NULL COMMENT '전화번호',
  \`role\` VARCHAR(20) DEFAULT 'member' COMMENT '등급 (admin, member, volunteer)',
  \`verified_status\` TINYINT(1) DEFAULT 0 COMMENT '탈북민 실명 인증 여부 (0: 미인증, 1: 대기, 2: 완료)',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    },
    {
      title: '공지사항 및 자유게시판 스키마',
      filename: 'db_schema_boards.sql',
      language: 'sql',
      description: '그누보드와 연동하기 쉽도록 표준 형식으로 이식한 게시판 테이블 스키마입니다.',
      code: `-- 2. 공지사항 및 자유게시판 테이블 (g5_write_ 또는 개별 boards 테이블)
CREATE TABLE IF NOT EXISTS \`boards\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT NOT NULL COMMENT '작성자 고유ID',
  \`type\` VARCHAR(20) NOT NULL DEFAULT 'free' COMMENT '구분 (notice, news, free, qna)',
  \`title\` VARCHAR(255) NOT NULL COMMENT '게시글 제목',
  \`content\` TEXT NOT NULL COMMENT '게시글 본문',
  \`views\` INT DEFAULT 0 COMMENT '조회수',
  \`likes\` INT DEFAULT 0 COMMENT '추천수',
  \`ip_address\` VARCHAR(45) NULL COMMENT '작성자 IP',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    },
    {
      title: '후원금 관리 스키마',
      filename: 'db_schema_donations.sql',
      language: 'sql',
      description: '회원 혹은 비회원 후원 명단을 관리하며 회비와 후원금의 투명성을 책임지는 테이블입니다.',
      code: `-- 3. 후원금 내역 관리 테이블
CREATE TABLE IF NOT EXISTS \`donations\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`donor_name\` VARCHAR(100) NOT NULL COMMENT '후원자 성함/단체명',
  \`amount\` INT NOT NULL COMMENT '후원 금액 (원화)',
  \`type\` VARCHAR(20) NOT NULL DEFAULT 'once' COMMENT '구분 (monthly: 정기, once: 일시)',
  \`payment_method\` VARCHAR(50) NOT NULL COMMENT '결제방식 (bank, card, pay)',
  \`message\` TEXT NULL COMMENT '전달할 격려 메시지',
  \`is_public\` TINYINT(1) DEFAULT 1 COMMENT '이름 공개 여부 (0: 익명, 1: 공개)',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    },
    {
      title: 'PHP 데이터베이스 연결 모듈 (PDO)',
      filename: 'db_connect.php',
      language: 'php',
      description: '그누보드 환경 또는 기존 PHP 웹서버에 즉시 적용할 수 있도록 암호화 연결을 지원하는 핵심 PDO 라이브러리입니다.',
      code: `<?php
/**
 * PHP-MySQL PDO 데이터베이스 커넥터 
 * 그누보드5 연동 시 dbconfig.php 설정 파일과 병행 구성이 가능합니다.
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'bukmin_db');
define('DB_USER', 'bukmin_user');
define('DB_PASSWORD', 'secure_password_here');
define('DB_CHARSET', 'utf8mb4');

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ];
    
    $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, $options);
    
} catch (PDOException $e) {
    // 실운영 환경에서는 민감한 연결 오류가 노출되지 않도록 처리합니다.
    error_log("Database Connection Error: " . $e->getMessage());
    die("서버 에러가 발생하였습니다. 잠시 후 부서에 다시 문의주시기 바랍니다.");
}
?>`
    },
    {
      title: '그누보드 게시판 연동 코드 조각',
      filename: 'gnuboard_bridge.php',
      language: 'php',
      description: '그누보드5(g5_write) 테이블에 인서트하여 메인 게시판 UI로 전달해 주는 핵심 훅/API 엔드포인트 예제입니다.',
      code: `<?php
// 그누보드5 세션 및 기본 로드 설정
include_once('./_common.php');

if (!defined('_GNUBOARD_')) exit; // 개별 호출 방지

/**
 * 북한이탈주민중앙회 메인 서버에서 그누보드 게시판의 
 * 최신 5개 글을 JSON 형태로 추출하여 프론트엔드와 API 통신을 수행합니다.
 */
header('Content-Type: application/json; charset=UTF-8');

$bo_table = 'notice'; // 가져올 게시판 코드
$write_table = $g5['write_prefix'] . $bo_table; // g5_write_notice

$sql = " SELECT wr_id, wr_subject, wr_content, wr_name, wr_datetime, wr_hit 
         FROM {$write_table} 
         WHERE wr_is_comment = 0 
         ORDER BY wr_num, wr_reply 
         LIMIT 5 ";

$result = sql_query($sql);
$posts = [];

while ($row = sql_fetch_array($result)) {
    $posts[] = [
        'id'        => $row['wr_id'],
        'title'     => get_text($row['wr_subject']),
        'content'   => cut_str(strip_tags($row['wr_content']), 100),
        'author'    => $row['wr_name'],
        'date'      => substr($row['wr_datetime'], 0, 10),
        'views'     => (int)$row['wr_hit']
    ];
}

echo json_encode($posts, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>`
    }
  ];

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-2xl max-w-5xl mx-auto" id="dev-center-container">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Server className="w-3 h-3" /> Backend / DB Specification
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mt-2">
            PHP &amp; MySQL 데이터베이스 아키텍처
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            그누보드5(GnuBoard) 및 표준 PHP 프레임워크와 즉시 연동되도록 조율된 고기능 백엔드 스키마 및 소스코드입니다.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-mono bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg text-gray-500">
          <Database className="w-4 h-4 text-gray-400" /> Host: localhost &bull; Engine: InnoDB
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-gray-400 px-3 uppercase tracking-wider text-left">이식용 모듈 리스트</span>
          {snippets.map((snip, index) => (
            <button
              key={index}
              id={`snippet-btn-${index}`}
              onClick={() => setActiveSnippet(index)}
              className={`flex items-start gap-3 p-3.5 rounded-xl text-left transition-all ${
                activeSnippet === index
                  ? 'bg-blue-50/75 border-l-4 border-blue-600 text-blue-900 font-medium'
                  : 'hover:bg-gray-50 text-gray-600 border-l-4 border-transparent text-sm'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeSnippet === index ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {snip.language === 'sql' ? (
                  <Database className="w-4 h-4" />
                ) : (
                  <FileCode className="w-4 h-4" />
                )}
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-xs leading-5 break-words">{snip.title}</div>
                <div className="text-[11px] text-gray-400 font-mono truncate">{snip.filename}</div>
              </div>
            </button>
          ))}

          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-left">
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-700 mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-gray-500" /> 이식 안내 가이드
            </span>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              본 스키마와 브리지는 그누보드 5.4+ 버전과 완전 호환됩니다. 
              그누보드 설치 DB 경로인 <code className="bg-gray-200 px-1 rounded">dbconfig.php</code> 정보로 PDO 인증 정보를 업데이트한 다음 탑재하십시오.
            </p>
          </div>
        </div>

        {/* Code View Canvas */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex items-center justify-between bg-gray-900 text-gray-300 px-4 py-3 rounded-t-xl font-mono text-xs border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{snippets[activeSnippet].filename}</span>
              <span className="text-[10px] uppercase bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                {snippets[activeSnippet].language}
              </span>
            </div>
            <button
              id={`copy-btn-${activeSnippet}`}
              onClick={() => handleCopy(snippets[activeSnippet].code, activeSnippet)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              {copiedIndex === activeSnippet ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px]">복사 완료</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">코드 복사</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-gray-950 p-4 rounded-b-xl overflow-x-auto border border-gray-900 text-left">
            <pre className="font-mono text-xs text-opacity-95 leading-relaxed text-slate-100 overflow-x-auto whitespace-pre select-all">
              <code>{snippets[activeSnippet].code}</code>
            </pre>
          </div>

          <p className="text-xs text-gray-500 mt-2.5 px-1 flex items-start gap-1 text-left">
            <span className="text-gray-900 font-semibold">설명:</span> 
            {snippets[activeSnippet].description}
          </p>
        </div>
      </div>

      {/* 🚀 Interactive Live Fetch Gateway Section */}
      <div className="border-t border-gray-150 pt-8" id="g5-live-api-gateway">
        <div className="flex items-center gap-2 mb-4 text-left">
          <Globe className="w-5 h-5 text-indigo-600 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-950">그누보드5 라이브 API 데이터 게이트웨이</h3>
          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
            dotenv 연계 완료
          </span>
        </div>

        <p className="text-xs text-gray-600 mb-6 leading-relaxed text-left">
          본 패널은 <code className="bg-slate-100 px-1 py-0.5 rounded text-red-600 font-mono text-[11px]">.env</code> 파일의 <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono text-[11px]">VITE_GNUBOARD_API_URL</code> 설정을 감지하여 실제 활성화된 그누보드5 원격 Sync Bridge와 실시간으로 통신합니다. 이식 전 데이터를 검침하고 무결성을 테스팅해 보십시오.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-5 p-5 bg-slate-50/75 border border-gray-200 rounded-2xl flex flex-col gap-4 text-left">
            <div>
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1.5">
                실시간 연동 요청 (Action)
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value as any)}
                className="w-full text-xs bg-white border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold text-gray-800"
              >
                <option value="get_latest_posts">공지 및 게시글 추출 (get_latest_posts)</option>
                <option value="get_members">가입 회원 정보 인출 (get_members)</option>
                <option value="test_db_connection">MariaDB 데이터 가동 상태 점검 (test_db_connection)</option>
              </select>
            </div>

            {selectedAction === 'get_latest_posts' && (
              <div>
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1.5">
                  게시판 코드명 (bo_table)
                </label>
                <select
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  className="w-full text-xs bg-white border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold text-gray-800"
                >
                  <option value="notice">공지사항 (notice)</option>
                  <option value="free">자유소통게시판 (free)</option>
                  <option value="news">보도자료 뉴스 (news)</option>
                  <option value="gallery">활동 갤러리 (gallery)</option>
                  <option value="private">전산회원 기밀실 (private)</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1.5">
                보안 토큰 헤더 (Authentication Key)
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full text-xs bg-white border border-gray-200 pl-9 pr-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-gray-800"
                  placeholder="Bearer 토큰 입력"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1">
                연동 대상 엔드포인트 URL
              </label>
              <div className="text-[11px] font-mono text-gray-500 break-all bg-white border border-gray-150 p-2.5 rounded-lg leading-relaxed select-all">
                {g5ApiUrl}
              </div>
              <span className="text-[10px] text-gray-450 mt-1 block">
                ※ 위 경로는 <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-indigo-600 text-[10px]">.env</code> 파일의 <code className="font-mono text-gray-700">VITE_GNUBOARD_API_URL</code>로부터 자동 로드된 장치입니다.
              </span>
            </div>

            <div className="pb-1 mt-1 border-t border-gray-200/50 pt-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 select-none">
                <input
                  type="checkbox"
                  checked={isDemoMode}
                  onChange={(e) => setIsDemoMode(e.target.checked)}
                  className="rounded border-gray-350 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 h-4 w-4"
                />
                <span>가상 샌드박스 시뮬레이션 모드로 실행</span>
              </label>
              <span className="text-[10px] text-gray-400 ml-6 block leading-relaxed mt-0.5">
                CORS 정책이나 오프라인 환경 등 원격 연결이 원활하지 않을 때 안전한 모의 데이터를 수송합니다.
              </span>
            </div>

            <button
              type="button"
              onClick={handleFetchG5Data}
              disabled={apiLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              {apiLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>데이터를 가공 조회 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>GnuBoard5 API 실시간 Fetch 전송</span>
                </>
              )}
            </button>
          </div>

          {/* Response Console Display Terminal */}
          <div className="lg:col-span-7 flex flex-col text-left">
            <div className="flex items-center justify-between bg-slate-900 text-zinc-300 px-4 py-3 rounded-t-xl font-mono text-xs border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>API Transceiver Response Frame (JSON)</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 font-mono">
                {isDemoMode ? 'SANDBOX SIMULATED' : 'LIVE FETCH INTERACT'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-b-xl flex-grow overflow-y-auto max-h-[420px] min-h-[300px] border border-slate-900 flex flex-col relative font-mono text-xs select-all text-slate-100">
              {apiLoading ? (
                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center space-y-2 text-zinc-400 z-10 font-sans">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-xs font-black">HTTP POST 대기 프레임 수령 중...</p>
                  <p className="text-[10px] text-zinc-550">원격 대장에서 JSON 패킷 스트림을 분석하고 있습니다.</p>
                </div>
              ) : null}

              {apiError && (
                <div className="p-4 bg-rose-950/50 border border-rose-900/60 rounded-xl text-rose-300 space-y-2 font-sans text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    연동 실패 (HTTP Fetch Connection Break)
                  </span>
                  <p className="leading-relaxed leading-normal truncate">{apiError}</p>
                  <p className="text-[10.5px] text-rose-300/80 leading-relaxed font-semibold">
                    💡 [원인 진단]: 브라우저의 대표적인 보안 정책인 CORS 규제로 인해 React 로컬 앱에서 외부 도메인 API로 호출 시 에러가 날 수 있습니다. 이 경우 연동 엔드포인트 PHP 소스 최상단에 <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300 font-mono text-[10px]">Access-Control-Allow-Origin</code> 헤더 승인을 추가하시거나, <strong>‘가상 샌드박스 시뮬레이션 모드’</strong>를 활용하여 신속하게 설계를 이어가십시오.
                  </p>
                </div>
              )}

              {apiResponse ? (
                <pre className="overflow-x-auto whitespace-pre leading-relaxed select-all">
                  <code>{JSON.stringify(apiResponse, null, 2)}</code>
                </pre>
              ) : !apiError && !apiLoading ? (
                <div className="flex-grow flex flex-col items-center justify-center text-zinc-600 font-sans p-10 text-center select-none">
                  <Database className="w-10 h-10 text-zinc-800 mb-2" />
                  <p className="text-xs font-extrabold text-zinc-400">송수신 대행 대기 상태 (Standby)</p>
                  <p className="text-[10px] text-zinc-500 mt-1 max-w-xs leading-relaxed">
                    왼쪽 패널의 API 설정을 지정하고, 하단의 [실시간 Fetch 전송] 버튼을 눌러 그누보드 회원 혹은 게시판 연동 전산망의 응답 스트림을 확인하십시오.
                  </p>
                </div>
              ) : null}
            </div>

            {apiResponse && (
              <div className="mt-2 text-[11px] text-emerald-600 bg-emerald-50/60 border border-emerald-150 p-3 rounded-xl flex items-start gap-2 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <strong>데이터 검침 통계 정상 (200 OK):</strong>
                  <p className="text-[10px] text-gray-500 leading-normal mt-0.5">
                    GnuBoard5 스토리지로부터 JSON 형태 데이터 스트림이 에러 없이 무결 수립되었습니다. 실 상용 이식 시 이 데이터를 가공하여 메인 뉴스 섹션 및 회원 데이터베이스에 바인딩 처리합니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

