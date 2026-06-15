<?php
/**
 * 사단법인 북한이탈주민중앙회 (북민회) - 그누보드5 (GnuBoard5) 실시간 동기화 브릿지 API v1.2.0
 * 
 * [설치 및 사용 방법]
 * 1. 이 파일을 그누보드5가 설치된 서버의 루트 폴더 또는 특정 폴더(예: /g5/g5_sync_bridge.php)에 업로드합니다.
 * 2. 보안을 위해 하단의 $API_SECRET_TOKEN 값을 북민회 ERP 행정 시스템에 입력한 Secret Key와 완전히 동일하게 변경하십시오.
 * 3. 이 파일이 정상 작동하려면 PHP PDO MySQL 익스텐션이 활성화되어 있어야 합니다.
 */

// 1. CORS 및 응답 헤더 설정
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// OPTIONS 사전 요청(Pre-flight) 처리
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
    // common.php 또는 dbconfig.php 경로 역탐색 (g5폴더 내부인 경우)
    $g5_config_path = dirname(__FILE__) . '/../common.php'; 
    if (!file_exists($g5_config_path)) {
        $g5_config_path = dirname(__FILE__) . '/common.php'; 
    }
    
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
            echo json_encode(["status" => "error", "message" => "Failed to fetch members: " . $ex->getMessage()]);
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
