-- =====================================================================
-- 사단법인 북한이탈주민중앙회 (북민회) GnuBoard G5 통합 데이터베이스 백업 및 마이그레이션 DDL/DML 원장 (안전 보존형)
-- 설명: 기존에 있던 그누보드5 원장을 물리적으로 손상시키거나 오버라이트하지 않는 
--       "CREATE TABLE IF NOT EXISTS" 및 "INSERT IGNORE" 안전 가드레일이 탑재된 추가 설계안입니다.
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- 테이블 스키마: g5_member (그누보드 회신 데이터 원장 - 기존 DB 보호를 위해 IF NOT EXISTS 사용)
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

-- 데이터 삽입: 기존에 생성된 admin이나 회원들과 절대 부딪치지 않는 INSERT IGNORE 모드로 안착
INSERT IGNORE INTO `g5_member` (`mb_id`, `mb_password`, `mb_name`, `mb_nick`, `mb_email`, `mb_level`, `mb_tel`, `mb_datetime`, `mb_open`) VALUES
('admin', '*AD31C949D645BD3C116790C98854D2026', '최고관리자', '북민회대표', 'admin@bukmin.org', 10, '02-720-3400', '2026-01-01 00:00:00', 1),
('nk_hero', '*AD31C949D645BD3C116790C98854D2026', '박상혁', '자유수호가', 'sanghyuk@gmail.com', 3, '010-8937-1234', '2026-06-11 00:00:00', 1),
('happy_uni', '*AD31C949D645BD3C116790C98854D2026', '이정현', '통일나래', 'junghyun@naver.com', 2, '010-6575-5678', '2026-06-12 00:00:00', 1),
('k_sarang', '*AD31C949D645BD3C116790C98854D2026', '한은혜', '새삶인', 'eunhye@daum.net', 2, '010-4461-9012', '2026-06-13 00:00:00', 1),
('young_ref', '*AD31C949D645BD3C116790C98854D2026', '최영학', '청년리더', 'younghak@gmail.com', 3, '010-5732-4567', '2026-06-13 00:00:00', 1),
('unify_one', '*AD31C949D645BD3C116790C98854D2026', '김선녀', '평화메신저', 'sunryeo@unify.or.kr', 4, '010-5737-0689', '2026-02-15 00:00:00', 1),
('busan_sarang', '*AD31C949D645BD3C116790C98854D2026', '이장열', '부산우뚝이', 'jangyeol@life.net', 4, '010-8013-2180', '2026-03-31 00:00:00', 1);


-- ---------------------------------------------------------
-- 테이블 스키마: g5_board (게시판 메타 설정 리스트 - 기존 정보 보호)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `g5_board` (
  `bo_table` varchar(20) NOT NULL DEFAULT '',
  `bo_subject` varchar(255) NOT NULL DEFAULT '',
  `bo_read_level` tinyint(4) NOT NULL DEFAULT '1',
  `bo_write_level` tinyint(4) NOT NULL DEFAULT '2',
  PRIMARY KEY (`bo_table`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_board` (`bo_table`, `bo_subject`, `bo_read_level`, `bo_write_level`) VALUES
('notice', '공지사항', 1, 10),
('free', '자유소통공간', 1, 1),
('qna', '자주하는질문 및 1:1 민원', 1, 1),
('private', '정회원 비공개 기밀 전산회원실', 3, 3),
('press', '보도자료 뉴스', 1, 10),
('gallery', '활동 갤러리 화랑', 1, 5);


-- ---------------------------------------------------------
-- 테이블 스키마: g5_write_notice (공지사항 저장판 - 기존 데이터 유지)
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
  PRIMARY KEY (`wr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_write_notice` (`wr_id`, `wr_num`, `wr_subject`, `wr_content`, `wr_hit`, `wr_name`, `wr_datetime`) VALUES
(1, -1, '[공지] 2026 하반기 정착 생활 장학생 선발 모집 규격 안내', '안녕하십니까, 사단법인 북한이탈주민중앙회 기획재정부입니다.\n■ 접수 기한: 2026년 7월 15일까지\n■ 제출 서류: 장학 신청원, 북한이탈주민 확인서, 학업 성적 증명서\n많은 지원 바랍니다.', 194, '중앙회 관리총무처', '2026-06-11 12:00:00');


-- ---------------------------------------------------------
-- 테이블 스키마: g5_write_free (자유게시판 저장판)
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
  PRIMARY KEY (`wr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_write_free` (`wr_id`, `wr_num`, `wr_subject`, `wr_content`, `wr_hit`, `wr_name`, `wr_datetime`) VALUES
(2, -2, '지난주 주말 수제 오찬 빵 나눔 봉사에 동행했습니다. 정말 감동적이었습니다.', '정부의 양치 지원에만 의존하지 않고 주체적으로 우리 사회의 한 기둥이 되겠다는 다짐을 되새기게 한 하루였습니다. 앞으로도 정기 모임 동아리에 꾸준히 참가하겠습니다.', 245, '김하나', '2026-06-08 12:00:00'),
(3, -3, '북한이탈주민중앙회 공식 홈페이지 개설을 축하드립니다.', '홈페이지가 정말 아름답고 모던하며, 우리 탈북민들의 자조 자립 창구가 되길 진심으로 성원합니다.', 180, '이은택', '2026-06-14 12:00:00');


-- ---------------------------------------------------------
-- 테이블 스키마: g5_sponsorship (추가 테이블: 북민회 후원 대장 - 기존 테이블 보호)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `g5_sponsorship` (
  `sp_id` int(11) NOT NULL AUTO_INCREMENT,
  `sp_name` varchar(255) NOT NULL DEFAULT '',
  `sp_tel` varchar(20) NOT NULL DEFAULT '',
  `sp_amount` int(11) NOT NULL DEFAULT '10000',
  `sp_recur` tinyint(1) NOT NULL DEFAULT '0',
  `sp_message` text,
  `sp_datetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`sp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_sponsorship` (`sp_id`, `sp_name`, `sp_tel`, `sp_amount`, `sp_recur`, `sp_message`, `sp_datetime`) VALUES
(1, '김태균', '010-3341-9080', 300000, 0, '정착 지원 제도의 확장을 진심으로 고대합니다.', '2026-06-12 00:00:00'),
(2, '유진우', '010-8910-1234', 150000, 0, '자립하는 청년들에게 작은 불씨가 되었으면 합니다.', '2026-06-12 00:00:00'),
(3, '정성수', '010-5342-8890', 1000000, 0, '투명하고 바르게 자금이 꼭 필요한 이들에게 전해지길 바랍니다.', '2026-06-11 00:00:00'),
(4, '글로벌하나재단', '02-5561-3942', 5000000, 1, '정기적인 자립 교육 프로그램 운영을 적극 지원합니다.', '2026-06-10 00:00:00');


-- ---------------------------------------------------------
-- 테이블 스키마: g5_verification (추가 테이블: 북민회 ERP 연계 정착민 실명 증빙 서류 심사 대기 리스트)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `g5_verification` (
  `vf_id` varchar(50) NOT NULL,
  `vf_name` varchar(255) NOT NULL DEFAULT '',
  `vf_age` int(11) NOT NULL DEFAULT '0',
  `vf_settlement_year` int(11) NOT NULL DEFAULT '0',
  `vf_document_type` varchar(255) NOT NULL DEFAULT '',
  `vf_status` varchar(20) NOT NULL DEFAULT 'pending',
  `vf_request_date` date NOT NULL,
  PRIMARY KEY (`vf_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `g5_verification` (`vf_id`, `vf_name`, `vf_age`, `vf_settlement_year`, `vf_document_type`, `vf_status`, `vf_request_date`) VALUES
('v-1', '박상혁', 29, 2021, '북한이탈주민 확인서', 'pending', '2026-06-11'),
('v-2', '이정현', 34, 2019, '가족관계증명서 & 북민서', 'pending', '2026-06-12'),
('v-3', '한은혜', 25, 2023, '북한이탈주민 확인서', 'pending', '2026-06-13'),
('v-4', '최영학', 41, 2015, '정착지원금 수급 확인 필증', 'pending', '2026-06-13');

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 보완형 스키마 및 가이드 가동 준비 완료.
-- =====================================================================
