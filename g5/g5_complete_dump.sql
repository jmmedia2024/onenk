-- =====================================================================
-- 사단법인 북한이탈주민중앙회 (북민회) GnuBoard G5 통합 데이터베이스 백업 및 마이그레이션 DDL/DML 원장 (안전 보존형)
-- 파일명: g5_complete_dump.sql
-- 버전: v1.9 (안전 가드레일 장착 완료)
-- 생성 일시: 2026-06-15 01:25:00
-- 시스템 환경: MySQL 5.7+ / MariaDB 10.3+ 
-- 캐릭터셋: utf8mb4 / utf8mb4_general_ci
-- 설명: 기존 그누보드 핵심 테이블을 DROP하지 않고 보존하며 존재하지 않는 경우에만 스키마를 생성합니다.
--       회원 정보, 게시판 정보 등도 INSERT IGNORE를 사용하여 기존 실데이터 유실을 원천 차단합니다.
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET AUTOCOMMIT = 0;

-- ---------------------------------------------------------
-- 1. g5_config (그누보드 기본 환경 및 보안 설정 관리 대장 - 보존형)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `g5_config` (
  `cf_title` varchar(255) NOT NULL DEFAULT '사단법인 북한이탈주민중앙회',
  `cf_admin` varchar(20) NOT NULL DEFAULT 'admin',
  `cf_admin_email` varchar(100) NOT NULL DEFAULT 'admin@bukmin.org',
  `cf_use_cert` varchar(20) NOT NULL DEFAULT '1',
  `cf_login_level` tinyint(4) NOT NULL DEFAULT '1',
  `cf_register_level` tinyint(4) NOT NULL DEFAULT '2',
  `cf_intercept_ip` text NOT NULL,
  `cf_analytics` text NOT NULL,
  `cf_theme` varchar(255) NOT NULL DEFAULT 'bukmin_glass_theme',
  PRIMARY KEY (`cf_title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_config` (`cf_title`, `cf_admin`, `cf_admin_email`, `cf_use_cert`, `cf_login_level`, `cf_register_level`, `cf_intercept_ip`, `cf_analytics`) VALUES
('사단법인 북한이탈주민중앙회', 'admin', 'admin@bukmin.org', '1', 1, 2, '', '<!-- Real-Time Analytics Integrated -->');


-- ---------------------------------------------------------
-- 2. g5_group (게시판 그룹 정보 - 보존형)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `g5_group` (
  `gr_id` varchar(10) NOT NULL DEFAULT '',
  `gr_subject` varchar(255) NOT NULL DEFAULT '',
  `gr_admin` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`gr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_group` (`gr_id`, `gr_subject`, `gr_admin`) VALUES
('homepage', '메인 웹사이트 그룹', 'admin'),
('erp_group', '내부 행정망 연계 소통그룹', 'admin');


-- ---------------------------------------------------------
-- 3. g5_board (게시판 메타 설정 리스트 및 접근 레벨 규정 - 보존형)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `g5_board` (
  `bo_table` varchar(20) NOT NULL DEFAULT '',
  `gr_id` varchar(10) NOT NULL DEFAULT '',
  `bo_subject` varchar(255) NOT NULL DEFAULT '',
  `bo_admin` varchar(20) NOT NULL DEFAULT '',
  `bo_list_level` tinyint(4) NOT NULL DEFAULT '1',
  `bo_read_level` tinyint(4) NOT NULL DEFAULT '1',
  `bo_write_level` tinyint(4) NOT NULL DEFAULT '2',
  `bo_comment_level` tinyint(4) NOT NULL DEFAULT '2',
  `bo_count_write` int(11) NOT NULL DEFAULT '0',
  `bo_count_comment` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`bo_table`),
  KEY `gr_id` (`gr_id`),
  CONSTRAINT `fk_board_group` FOREIGN KEY (`gr_id`) REFERENCES `g5_group` (`gr_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_board` (`bo_table`, `gr_id`, `bo_subject`, `bo_admin`, `bo_list_level`, `bo_read_level`, `bo_write_level`, `bo_comment_level`, `bo_count_write`) VALUES
('notice', 'homepage', '공지사항', 'admin', 1, 1, 10, 2, 1),
('free', 'homepage', '자유소통공간', 'admin', 1, 1, 1, 1, 2),
('qna', 'homepage', '자주하는질문 및 1:1 민원', 'admin', 1, 1, 1, 1, 0),
('private', 'erp_group', '정회원 비공개 기밀 전산회원실', 'admin', 3, 3, 3, 3, 1),
('press', 'homepage', '보도자료 뉴스', 'admin', 1, 1, 10, 2, 1),
('gallery', 'homepage', '활동 갤러리 화랑', 'admin', 1, 1, 5, 2, 0);


-- ---------------------------------------------------------
-- 4. g5_member (그누보드 회원 데이터 원장 - 보존형)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `g5_member` (
  `mb_no` int(11) NOT NULL AUTO_INCREMENT,
  `mb_id` varchar(20) NOT NULL DEFAULT '',
  `mb_password` varchar(255) NOT NULL DEFAULT '',
  `mb_name` varchar(255) NOT NULL DEFAULT '',
  `mb_nick` varchar(255) NOT NULL DEFAULT '',
  `mb_email` varchar(100) NOT NULL DEFAULT '',
  `mb_level` tinyint(4) NOT NULL DEFAULT '1',
  `mb_tel` varchar(20) NOT NULL DEFAULT '',
  `mb_datetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `mb_open` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`mb_no`),
  UNIQUE KEY `mb_id` (`mb_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_member` (`mb_id`, `mb_password`, `mb_name`, `mb_nick`, `mb_email`, `mb_level`, `mb_tel`, `mb_datetime`, `mb_open`) VALUES
('admin', '*AD31C949D645BD3C116790C98854D2026', '최고관리자', '북민회대표', 'admin@bukmin.org', 10, '02-720-3400', '2026-01-01 00:00:00', 1),
('nk_hero', '*AD31C949D645BD3C116790C98854D2026', '박상혁', '자유수호가', 'sanghyuk@gmail.com', 3, '010-8937-1234', '2026-06-11 00:00:00', 1),
('happy_uni', '*AD31C949D645BD3C116790C98854D2026', '이정현', '통일나래', 'junghyun@naver.com', 2, '010-6575-5678', '2026-06-12 00:00:00', 1),
('k_sarang', '*AD31C949D645BD3C116790C98854D2026', '한은혜', '새삶인', 'eunhye@daum.net', 2, '010-4461-9012', '2026-06-13 00:00:00', 1),
('young_ref', '*AD31C949D645BD3C116790C98854D2026', '최영학', '청년리더', 'younghak@gmail.com', 3, '010-5732-4567', '2026-06-13 00:00:00', 1),
('unify_one', '*AD31C949D645BD3C116790C98854D2026', '김선녀', '평화메신저', 'sunryeo@unify.or.kr', 4, '010-5737-0689', '2026-02-15 00:00:00', 1),
('busan_sarang', '*AD31C949D645BD3C116790C98854D2026', '이장열', '부산우뚝이', 'jangyeol@life.net', 4, '010-8013-2180', '2026-03-31 00:00:00', 1);


-- ---------------------------------------------------------
-- 5. g5_write_notice (공지사항 저장판 - 보존형)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `g5_write_notice` (
  `wr_id` int(11) NOT NULL AUTO_INCREMENT,
  `wr_num` int(11) NOT NULL DEFAULT '0',
  `wr_reply` varchar(10) NOT NULL DEFAULT '',
  `wr_parent` int(11) NOT NULL DEFAULT '0',
  `wr_subject` varchar(255) NOT NULL DEFAULT '',
  `wr_content` text NOT NULL,
  `wr_hit` int(11) NOT NULL DEFAULT '0',
  `wr_name` varchar(255) NOT NULL DEFAULT '',
  `wr_datetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `wr_is_comment` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`wr_id`),
  KEY `wr_num` (`wr_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_write_notice` (`wr_id`, `wr_num`, `wr_reply`, `wr_parent`, `wr_subject`, `wr_content`, `wr_hit`, `wr_name`, `wr_datetime`, `wr_is_comment`) VALUES
(1, -1, '', 1, '[공지] 2026 하반기 정착 생활 장학생 선발 모집 규격 안내', '안녕하십니까, 사단법인 북한이탈주민중앙회 기획재정부입니다.\n본회 가입 회원의 자녀 및 학업을 이행하고 있는 북한이탈주민 청년들을 자조 격려하기 위한 하반기 인재 장학 전형 접수를 시작합니다.\n\n■ 접수 기한: 2026년 7월 15일까지\n■ 제출 서류: 장학 신청원, 북한이탈주민 확인서, 학업 성적 증명서\n많은 지원 바랍니다.', 194, '중앙회 관리총무처', '2026-06-11 12:00:00', 0);


-- ---------------------------------------------------------
-- 6. g5_write_free (자유게시판 저장판 - 보존형)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `g5_write_free` (
  `wr_id` int(11) NOT NULL AUTO_INCREMENT,
  `wr_num` int(11) NOT NULL DEFAULT '0',
  `wr_reply` varchar(10) NOT NULL DEFAULT '',
  `wr_parent` int(11) NOT NULL DEFAULT '0',
  `wr_subject` varchar(255) NOT NULL DEFAULT '',
  `wr_content` text NOT NULL,
  `wr_hit` int(11) NOT NULL DEFAULT '0',
  `wr_name` varchar(255) NOT NULL DEFAULT '',
  `wr_datetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `wr_is_comment` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`wr_id`),
  KEY `wr_num` (`wr_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_write_free` (`wr_id`, `wr_num`, `wr_reply`, `wr_parent`, `wr_subject`, `wr_content`, `wr_hit`, `wr_name`, `wr_datetime`, `wr_is_comment`) VALUES
(2, -2, '', 2, '지난주 주말 수제 오찬 빵 나눔 봉사에 동행했습니다. 정말 감동적이었습니다.', '처음 만나는 어르신들께서 손을 잡아주시며 \"자유 찾아서 남한에서 열심히 살고, 또 이렇게 봉사까지 하느라 눈물겹도록 기특하다\"고 격려해 주셨을 때 눈시울이 붉어졌습니다.\n\n정부의 양치 지원에만 의존하지 않고 주체적으로 우리 사회의 한 기둥이 되겠다는 다짐을 되새기게 한 하루였습니다. 앞으로도 정기 모임 동아리에 꾸준히 참가하겠습니다.', 245, '김하나', '2026-06-08 12:00:00', 0),
(3, -3, '', 3, '북한이탈주민중앙회 공식 홈페이지 개설을 축하드립니다.', '홈페이지가 정말 아름답고 모던하며, 유리 질감 디자인이 압권입니다. 우리 탈북민들의 자조 자립 창구가 되길 진심으로 성원합니다.', 180, '이은택', '2026-06-14 12:00:00', 0);


-- ---------------------------------------------------------
-- 7. g5_write_private (비공개전산 저장판 - 보존형)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `g5_write_private` (
  `wr_id` int(11) NOT NULL AUTO_INCREMENT,
  `wr_num` int(11) NOT NULL DEFAULT '0',
  `wr_reply` varchar(10) NOT NULL DEFAULT '',
  `wr_parent` int(11) NOT NULL DEFAULT '0',
  `wr_subject` varchar(255) NOT NULL DEFAULT '',
  `wr_content` text NOT NULL,
  `wr_hit` int(11) NOT NULL DEFAULT '0',
  `wr_name` varchar(255) NOT NULL DEFAULT '',
  `wr_datetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `wr_is_comment` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`wr_id`),
  KEY `wr_num` (`wr_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_write_private` (`wr_id`, `wr_num`, `wr_reply`, `wr_parent`, `wr_subject`, `wr_content`, `wr_hit`, `wr_name`, `wr_datetime`, `wr_is_comment`) VALUES
(4, -4, '', 4, '[정회원 기밀] 2026 하반기 긴급 정착자금 수혜 특별 배정 현황 공람 (우대배부)', '안녕하십니까, 공식 정회원 심사위원회입니다.\n올해 하반기 영세 보수 가구 및 위기 중독 세대를 자조 격려하고자 지급되는 특별 후원 특별 연대 자금 산정안이 정식 인가되었습니다.\n\n정회원들께서는 지급 영수증과 실명 거주 확인 지침서를 지참하시고 다음 주 금요일 오전까지 중앙회 3층 자력지원실로 신분증 및 사도 도장을 지참하시어 직접 내방해 주십시오.\n\n■ 대지급액: 정회원 심사 후 개별 산도 지급\n■ 비고: 보안 기밀 엄수 요망', 18, '중앙기금운용위', '2026-06-12 12:00:00', 0);


-- ---------------------------------------------------------
-- 8. g5_write_press (보도자료 뉴스 저장판 - 보존형)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `g5_write_press` (
  `wr_id` int(11) NOT NULL AUTO_INCREMENT,
  `wr_num` int(11) NOT NULL DEFAULT '0',
  `wr_reply` varchar(10) NOT NULL DEFAULT '',
  `wr_parent` int(11) NOT NULL DEFAULT '0',
  `wr_subject` varchar(255) NOT NULL DEFAULT '',
  `wr_content` text NOT NULL,
  `wr_hit` int(11) NOT NULL DEFAULT '0',
  `wr_name` varchar(255) NOT NULL DEFAULT '',
  `wr_datetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `wr_is_comment` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`wr_id`),
  KEY `wr_num` (`wr_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_write_press` (`wr_id`, `wr_num`, `wr_reply`, `wr_parent`, `wr_subject`, `wr_content`, `wr_hit`, `wr_name`, `wr_datetime`, `wr_is_comment`) VALUES
(5, -5, '', 5, '[보도] 3만 4천 탈북민 정착 지원 강화를 위한 통일부 정책 간담회 개최', '본사 5층 대강의실에서 통일부 관계 실무진들과 탈북 연대 회장단이 배석하여 생활지원금 인상 및 자격 교육 기회 확충에 대해 열띈 대안을 건의 및 교환하였습니다.\n\n통일부 정착 지원 담당 과장 및 연구진 10여명이 참석하여 구체적인 소득 보장 대책을 논의하고 향후 지원 법률을 정교하게 고도화하기로 합의하였습니다.', 310, '정책대변인', '2026-05-12 12:00:00', 0);


-- ---------------------------------------------------------
-- 9. g5_sponsorship (추가 테이블: 북민회 기부 회계 원장 - 보존형)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `g5_sponsorship` (
  `sp_id` int(11) NOT NULL AUTO_INCREMENT,
  `mb_id` varchar(20) DEFAULT NULL,
  `sp_name` varchar(255) NOT NULL DEFAULT '',
  `sp_tel` varchar(20) NOT NULL DEFAULT '',
  `sp_amount` int(11) NOT NULL DEFAULT '10000',
  `sp_recur` tinyint(1) NOT NULL DEFAULT '0',
  `sp_message` text,
  `sp_datetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`sp_id`),
  KEY `mb_id` (`mb_id`),
  CONSTRAINT `fk_sponsor_member` FOREIGN KEY (`mb_id`) REFERENCES `g5_member` (`mb_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_sponsorship` (`sp_id`, `mb_id`, `sp_name`, `sp_tel`, `sp_amount`, `sp_recur`, `sp_message`, `sp_datetime`) VALUES
(1, NULL, '김태균', '010-3341-9080', 300000, 0, '정착 지원 제도의 확장을 진심으로 고대합니다.', '2026-06-12 00:00:00'),
(2, NULL, '유진우', '010-8910-1234', 150000, 0, '자립하는 청년들에게 작은 불씨가 되었으면 합니다.', '2026-06-12 00:00:00'),
(3, NULL, '정성수', '010-5342-8890', 1000000, 0, '투명하고 바르게 자금이 꼭 필요한 이들에게 전해지길 바랍니다.', '2026-06-11 00:00:00'),
(4, NULL, '글로벌하나재단', '02-5561-3942', 5000000, 1, '정기적인 자립 교육 프로그램 운영을 적극 지원합니다.', '2026-06-10 00:00:00');


-- ---------------------------------------------------------
-- 10. g5_verification (추가 테이블: 정착민 실명 증빙서류 관리 대장 - 보존형)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `g5_verification` (
  `vf_id` varchar(50) NOT NULL,
  `mb_id` varchar(20) DEFAULT NULL,
  `vf_name` varchar(255) NOT NULL DEFAULT '',
  `vf_age` int(11) NOT NULL DEFAULT '0',
  `vf_settlement_year` int(11) NOT NULL DEFAULT '0',
  `vf_document_type` varchar(255) NOT NULL DEFAULT '',
  `vf_status` varchar(20) NOT NULL DEFAULT 'pending',
  `vf_request_date` date NOT NULL,
  PRIMARY KEY (`vf_id`),
  KEY `mb_id` (`mb_id`),
  CONSTRAINT `fk_verification_member` FOREIGN KEY (`mb_id`) REFERENCES `g5_member` (`mb_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_verification` (`vf_id`, `mb_id`, `vf_name`, `vf_age`, `vf_settlement_year`, `vf_document_type`, `vf_status`, `vf_request_date`) VALUES
('v-1', 'nk_hero', '박상혁', 29, 2021, '북한이탈주민 확인서', 'pending', '2026-06-11'),
('v-2', 'happy_uni', '이정현', 34, 2019, '가족관계증명서 & 북민서', 'pending', '2026-06-12'),
('v-3', 'k_sarang', '한은혜', 25, 2023, '북한이탈주민 확인서', 'pending', '2026-06-13'),
('v-4', 'young_ref', '최영학', 41, 2015, '정착지원금 수급 확인 필증', 'pending', '2026-06-13');


-- ---------------------------------------------------------
-- 11. g5_visit (그누보드 기본 트래픽 분석 카운터 가동로그 - 보존형)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `g5_visit` (
  `vi_id` int(11) NOT NULL AUTO_INCREMENT,
  `vi_ip` varchar(255) NOT NULL DEFAULT '',
  `vi_date` date NOT NULL DEFAULT '0000-00-00',
  `vi_time` time NOT NULL DEFAULT '00:00:00',
  `vi_referer` text NOT NULL,
  `vi_agent` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`vi_id`),
  KEY `index1` (`vi_date`,`vi_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_visit` (`vi_ip`, `vi_date`, `vi_time`, `vi_referer`, `vi_agent`) VALUES
('192.168.0.1', '2026-06-14', '09:12:45', 'https://bukmin.org/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'),
('112.214.5.34', '2026-06-14', '11:34:02', 'https://search.naver.com/', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X)'),
('220.76.19.120', '2026-06-14', '14:22:15', 'https://www.google.com/', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');


COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;

-- =====================================================================
-- 사단법인 북한이탈주민중앙회 기획관리처 데이터 원장 백업 완료 (안전 보존형 다운로드 가능).
-- =====================================================================
