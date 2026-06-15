<?php
/**
 * 사단법인 북한이탈주민중앙회 (북민회) - 그누보드5 (GnuBoard5) 실시간 동기화 브릿지 API v1.2.0
 * 
 * [설치 및 사용 방법]
 * 1. 이 파일을 그누보드5가 설치된 서버의 루트 폴더 또는 특정 폴더(예: /api/sync_bridge.php)에 업로드합니다.
 * 2. 보안을 위해 하단의 $API_SECRET_TOKEN 값을 북민회 ERP 행정 시스템에 입력한 Secret Key와 완전히 동일하게 변경하십시오.
 * 3. 이 파일이 정상 작동하려면 PHP PDO MySQL 익스텐션이 활성화되어 있어야 합니다.
 */

// 1. CORS 및 응답 헤더 설정
// [팁] PHP header() 구문 대신 Apache 웹서버의 .htaccess 설정을 사용하는 것이 훨씬 안정적이며 성능상 우수합니다.
// 만약 .htaccess로 CORS 헤더를 설정하셨다면 아래 header() 구문들은 주석 처리하셔도 무방합니다.
if (!headers_sent()) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Content-Type: application/json; charset=UTF-8");
}

// OPTIONS 사전 요청(Pre-flight) 처리 (.htaccess에서 200 응답을 가로채지 않았을 때를 위한 php 폴백)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. 통합 보안 API 토큰 선언 (반드시 보안성이 높은 무작위 키로 변경하십시오)
// 기본 예시토큰: "bukmin_g5_secure_token_key_2026"
$API_SECRET_TOKEN = "bukmin_g5_secure_token_key_2026";

// 3. Authorization Bearer 헤더 검증
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (!$auth_header && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
}

$token_verified = false;
if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    if ($matches[1] === $API_SECRET_TOKEN) {
        $token_verified = true;
    }
}

// 4. 보안 차단 조치
if (!$token_verified) {
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access. Invalid or missing secret Bearer API key."
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

// 5. 요청 및 파라미터 파싱
$input_data = json_decode(file_get_contents("php://input"), true);
if (!$input_data) {
    $input_data = $_POST;
}

$action = isset($input_data['action']) ? $input_data['action'] : '';

// 6. DB 동적으로 부팅 처리 또는 그누보드5의 dbconfig.php 자동 로드 설정
// 본 스크립트는 원격 동적 진단 및 안전한 범용 PDO 모듈을 탑재하고 있습니다.
$db_host = isset($input_data['db_host']) ? $input_data['db_host'] : '';
$db_name = isset($input_data['db_name']) ? $input_data['db_name'] : '';
$db_user = isset($input_data['db_user']) ? $input_data['db_user'] : '';
$db_password = isset($input_data['db_password']) ? $input_data['db_password'] : '';

// 값이 수동으로 전송되지 않은 경우, 로컬 그누보드5의 dbconfig.php 파일을 자동 탐색하여 연결할 수 있습니다.
if (empty($db_host)) {
    $g5_config_path = dirname(__FILE__) . '/../common.php'; // common.php 경로 역탐색
    if (file_exists($g5_config_path)) {
        @include_once($g5_config_path);
        // 그누보드 상수 사용 가능 시 대입
        if (defined('G5_MYSQL_HOST')) {
            $db_host = G5_MYSQL_HOST;
            $db_name = G5_MYSQL_DB;
            $db_user = G5_MYSQL_USER;
            $db_password = G5_MYSQL_PASSWORD;
        }
    }
}

// 7. 데이터베이스 커넥션 개시
try {
    if (empty($db_host) || empty($db_name) || empty($db_user)) {
        throw new Exception("MySQL Database Connection parameters are blank or directory autoload failed.");
    }

    $dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    $pdo = new PDO($dsn, $db_user, $db_password, $options);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

// 8. 요청 액션 분기 처리 (Action router)
switch ($action) {
    
    // [Action A] 커넥션 안정성 사전 테스팅 (Pre-flight Test)
    case 'test_db_connection':
        try {
            // 그누보드5 회원 수 및 게시글 통계 요약 쿼리 질의
            $member_stmt = $pdo->query("SELECT COUNT(*) as cnt FROM `g5_member`");
            $member_count = $member_stmt->fetch()['cnt'];

            $board_stmt = $pdo->query("SELECT COUNT(*) as cnt FROM `g5_board`");
            $board_count = $board_stmt->fetch()['cnt'];

            echo json_encode([
                "status" => "success",
                "message" => "Connected to GnuBoard MariaDB safely!",
                "timestamp" => date("Y-m-d H:i:s"),
                "metrics" => [
                    "totalMembers" => intval($member_count),
                    "totalBoards" => intval($board_count)
                ]
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        } catch (PDOException $ex) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "SQL Execution Error on diagnostic: " . $ex->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
        break;

    // [Action E] 그누보드5 세션 및 비밀번호 로그인 통합 검증 (React DB Auth sync)
    case 'verify_member_login':
        $mb_id = isset($input_data['mb_id']) ? trim($input_data['mb_id']) : '';
        $mb_password = isset($input_data['mb_password']) ? $input_data['mb_password'] : '';

        if (empty($mb_id) || empty($mb_password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Required parameters 'mb_id' or 'mb_password' are missing."], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            // g5_member 테이블에서 회원 기록 점검
            $stmt = $pdo->prepare("SELECT mb_id, mb_password, mb_name, mb_nick, mb_level, mb_email, mb_tel, mb_datetime FROM `g5_member` WHERE mb_id = ?");
            $stmt->execute([$mb_id]);
            $member = $stmt->fetch();

            if (!$member) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "존재하지 않는 회원 아이디입니다."], JSON_UNESCAPED_UNICODE);
                exit();
            }

            // GnuBoard5 다양한 패스워드 호환 대조 검증 알고리즘
            $stored_hash = $member['mb_password'];
            $is_password_valid = false;

            // 1. bcrypt 기법 대조
            if (strpos($stored_hash, '$2y$') === 0 && password_verify($mb_password, $stored_hash)) {
                $is_password_valid = true;
            } 
            // 2. MD5 / 일반 텍스트 대조 (로컬 샌드박스 및 단순 해시)
            elseif (md5($mb_password) === $stored_hash || hash('sha256', $mb_password) === $stored_hash || $mb_password === $stored_hash) {
                $is_password_valid = true;
            }
            // 3. 그누보드 고유 sql_password() 쿼리 기반 암호 검증 방식 대용 (MariaDB/MySQL 고유 PASSWORD() 기법 대조)
            else {
                try {
                    // DB 서버에 password() 나 옛날 mysql_password 방식으로 질의하여 검증
                    $chk_stmt = $pdo->prepare("SELECT (PASSWORD(?) = ?) as is_ok");
                    $chk_stmt->execute([$mb_password, $stored_hash]);
                    if ($chk_stmt->fetch()['is_ok']) {
                        $is_password_valid = true;
                    }
                } catch (Exception $e) {
                    // PASSWORD() 함수 미지원 시 단순히 암기된 커스텀 검증 수행
                }
            }

            if (!$is_password_valid) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "비밀번호가 일치하지 않습니다."], JSON_UNESCAPED_UNICODE);
                exit();
            }

            // 실시간 그누보드5 세션 연동 개시 (PHP Session Engine)
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['ss_mb_id'] = $mb_id;
            
            // 로그인 시각 업데이트 (g5_member 에 기록)
            try {
                $time_stmt = $pdo->prepare("UPDATE `g5_member` SET mb_today_login = NOW() WHERE mb_id = ?");
                $time_stmt->execute([$mb_id]);
            } catch (Exception $e) {
                // 단순 무시
            }

            echo json_encode([
                "status" => "success",
                "message" => "그누보드 회원 데이터 검인 성공 및 세션 발급 완료",
                "session_active" => true,
                "session_id" => session_id(),
                "data" => [
                    "mb_id" => $member['mb_id'],
                    "mb_name" => $member['mb_name'] ? $member['mb_name'] : $member['mb_nick'],
                    "mb_nick" => $member['mb_nick'],
                    "mb_level" => intval($member['mb_level']),
                    "mb_email" => $member['mb_email'],
                    "mb_tel" => $member['mb_tel']
                ]
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        } catch (PDOException $ex) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "SQL 검색 연동 실패: " . $ex->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        break;

    // [Action F] 그누보드5 세션 무조건 실시간 점검 (React Auto Cookie-Session Sync)
    case 'check_session':
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $mb_id = isset($_SESSION['ss_mb_id']) ? $_SESSION['ss_mb_id'] : '';

        if (empty($mb_id)) {
            echo json_encode([
                "status" => "success",
                "session_active" => false,
                "message" => "액티브한 그누보드5 PHP 로그인 세션이 발견되지 않았습니다."
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            exit();
        }

        try {
            $stmt = $pdo->prepare("SELECT mb_id, mb_name, mb_nick, mb_level, mb_email, mb_tel FROM `g5_member` WHERE mb_id = ?");
            $stmt->execute([$mb_id]);
            $member = $stmt->fetch();

            if (!$member) {
                // 세션은 있으나 실제 회원이 없는 경우 무효 조치
                unset($_SESSION['ss_mb_id']);
                echo json_encode([
                    "status" => "success",
                    "session_active" => false,
                    "message" => "세션 기록은 존재하나 g5_member 상에 회원이 없습니다."
                ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                exit();
            }

            echo json_encode([
                "status" => "success",
                "session_active" => true,
                "data" => [
                    "mb_id" => $member['mb_id'],
                    "mb_name" => $member['mb_name'] ? $member['mb_name'] : $member['mb_nick'],
                    "mb_nick" => $member['mb_nick'],
                    "mb_level" => intval($member['mb_level']),
                    "mb_email" => $member['mb_email'],
                    "mb_tel" => $member['mb_tel']
                ]
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        } catch (PDOException $ex) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "세션 복구 에러: " . $ex->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        break;

    // [Action B] 그누보드5 정회원 대조/목록 동기화 (G5 Members Read)
    case 'get_members':
        try {
            // 최신 가입 회원 순 500명 추출
            $stmt = $pdo->query("SELECT mb_id, mb_name, mb_nick, mb_level, mb_email, mb_tel, mb_datetime FROM `g5_member` ORDER BY mb_no DESC LIMIT 500");
            $members = $stmt->fetchAll();

            echo json_encode([
                "status" => "success",
                "count" => count($members),
                "data" => $members
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        } catch (PDOException $ex) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to fetch players: " . $ex->getMessage()]);
        }
        break;

    // [Action G] 그누보드5 회원 가입 처리 (React DB Sign Up Sync)
    case 'register_member':
        $mb_id = isset($input_data['mb_id']) ? trim($input_data['mb_id']) : '';
        $mb_password = isset($input_data['mb_password']) ? $input_data['mb_password'] : '';
        $mb_name = isset($input_data['mb_name']) ? trim($input_data['mb_name']) : '';
        $mb_nick = isset($input_data['mb_nick']) ? trim($input_data['mb_nick']) : '';
        $mb_email = isset($input_data['mb_email']) ? trim($input_data['mb_email']) : '';
        $mb_tel = isset($input_data['mb_tel']) ? trim($input_data['mb_tel']) : '';

        if (empty($mb_id) || empty($mb_password) || empty($mb_name) || empty($mb_nick)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "필수 가입 정보(아이디, 패스워드, 이름, 닉네임)가 누락되었습니다."], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            // 1. 아이디 중복 체크
            $chk1 = $pdo->prepare("SELECT COUNT(*) as cnt FROM `g5_member` WHERE mb_id = ?");
            $chk1->execute([$mb_id]);
            if ($chk1->fetch()['cnt'] > 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "이미 존재하는 아이디입니다."], JSON_UNESCAPED_UNICODE);
                exit();
            }

            // 2. 닉네임 중복 체크
            $chk2 = $pdo->prepare("SELECT COUNT(*) as cnt FROM `g5_member` WHERE mb_nick = ?");
            $chk2->execute([$mb_nick]);
            if ($chk2->fetch()['cnt'] > 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "이미 사용 중인 닉네임입니다."], JSON_UNESCAPED_UNICODE);
                exit();
            }

            // 3. 비밀번호 암호화 (Bcrypt 적용)
            $hashed_pass = password_hash($mb_password, PASSWORD_BCRYPT);

            // 4. 스키마 안전 대조 및 동적 바인딩 컬럼 탐색 (SHOW COLUMNS 수임)
            $desc_stmt = $pdo->query("SHOW COLUMNS FROM `g5_member`");
            $existing_cols = [];
            while ($row = $desc_stmt->fetch(PDO::FETCH_ASSOC)) {
                $existing_cols[] = $row['Field'];
            }

            // 그누보드 표준 필드 디폴트 매핑 구성
            $candidate_data = [
                'mb_id' => $mb_id,
                'mb_password' => $hashed_pass,
                'mb_name' => $mb_name,
                'mb_nick' => $mb_nick,
                'mb_email' => $mb_email,
                'mb_tel' => $mb_tel,
                'mb_hp' => $mb_tel,
                'mb_level' => 2, // 일반 가입회원 수준 (2레벨)
                'mb_datetime' => date("Y-m-d H:i:s"),
                'mb_nick_date' => date("Y-m-d"),
                'mb_open' => 1,
                'mb_open_date' => date("Y-m-d"),
                'mb_today_login' => date("Y-m-d H:i:s"),
                'mb_login_ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                'mb_ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                'mb_mailling' => 1,
                'mb_sms' => 1,
                'mb_birth' => '',
                'mb_sex' => '',
                'mb_signature' => '',
                'mb_memo' => '',
                'mb_profile' => '',
                'mb_recommend' => '',
                'mb_point' => 1000 // 가입 감사 포인트 1,000점 증정
            ];

            $filtered_data = [];
            foreach ($candidate_data as $key => $val) {
                if (in_array($key, $existing_cols)) {
                    $filtered_data[$key] = $val;
                }
            }

            // SQL 쿼리 빌드
            $cols = array_keys($filtered_data);
            $escape_cols = array_map(function($c) { return "`$c`"; }, $cols);
            $placeholders = array_fill(0, count($cols), '?');

            $insert_sql = "INSERT INTO `g5_member` (" . implode(', ', $escape_cols) . ") VALUES (" . implode(', ', $placeholders) . ")";
            $stmt = $pdo->prepare($insert_sql);
            $stmt->execute(array_values($filtered_data));

            echo json_encode([
                "status" => "success",
                "message" => "그누보드 회원가입 성공!",
                "data" => [
                    "mb_id" => $mb_id,
                    "mb_name" => $mb_name,
                    "mb_nick" => $mb_nick,
                    "mb_level" => 2,
                    "mb_email" => $mb_email
                ]
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        } catch (PDOException $ex) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "회원가입 처리 중 데이터베이스 오류가 발생했습니다: " . $ex->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        break;

    // [Action C] 후원 신청 연합 회원 등급 일괄 자동 등급 상향 조정 (G5 User Level Promote)
    case 'promote_member':
        $mb_id = isset($input_data['mb_id']) ? trim($input_data['mb_id']) : '';
        $target_level = isset($input_data['target_level']) ? intval($input_data['target_level']) : 2; // 보통 정회원 등급 = 2

        if (empty($mb_id)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Required parameter 'mb_id' is missing."]);
            exit();
        }

        try {
            // 회원 존재 유무 사전 확인 검인
            $check_stmt = $pdo->prepare("SELECT mb_id, mb_level FROM `g5_member` WHERE mb_id = ?");
            $check_stmt->execute([$mb_id]);
            $member = $check_stmt->fetch();

            if (!$member) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "The GnuBoard member [{$mb_id}] does not exist."]);
                exit();
            }

            // 등급 점진 상향 쿼리 실행
            $up_stmt = $pdo->prepare("UPDATE `g5_member` SET mb_level = ? WHERE mb_id = ?");
            $up_stmt->execute([$target_level, $mb_id]);

            echo json_encode([
                "status" => "success",
                "message" => "Successfully promoted member [{$mb_id}] level to [{$target_level}].",
                "previous_level" => intval($member['mb_level']),
                "current_level" => $target_level
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        } catch (PDOException $ex) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Database promotion error: " . $ex->getMessage()]);
        }
        break;

    // [Action D] 최신 게시글 큐 연계 데이터 조회 (API Multi Latest Posts)
    case 'get_latest_posts':
        $bo_table = isset($input_data['bo_table']) ? trim($input_data['bo_table']) : 'free';
        $limit = isset($input_data['limit']) ? intval($input_data['limit']) : 10;

        // 테이블명 SQL 인젝션 가글 차단
        if (preg_match('/[^a-zA-Z0-9_]/', $bo_table)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Insecure table identifier detected."]);
            exit();
        }

        try {
            $write_table = "g5_write_" . $bo_table;
            
            // 테이블 존재 여부 최종 검증
            $table_check = $pdo->prepare("SHOW TABLES LIKE ?");
            $table_check->execute([$write_table]);
            if ($table_check->rowCount() == 0) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "The target board table [{$write_table}] does not exist."]);
                exit();
            }

            // 최신 순 정밀 질의처리
            $stmt = $pdo->prepare("SELECT wr_id, wr_subject, wr_content, wr_name, wr_datetime, wr_hit FROM `{$write_table}` WHERE wr_is_comment = 0 ORDER BY wr_id DESC LIMIT ?");
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->execute();
            $posts = $stmt->fetchAll();

            echo json_encode([
                "status" => "success",
                "board" => $bo_table,
                "count" => count($posts),
                "data" => $posts
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        } catch (PDOException $ex) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to fetch latest posts: " . $ex->getMessage()]);
        }
        break;

    // 정의되지 않은 예외 처리
    default:
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Unsupported action parameter request."
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        break;
}
?>
