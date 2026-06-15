# 사단법인 북한이탈주민중앙회 (북민회) GnuBoard5 실시간 연동 매뉴얼 및 명세서

본 가이드는 사단법인 북한이탈주민중앙회(북민회) ERP 행정 정보망 시스템과 독립적으로 운영되는 그누보드5 독립 웹사이트의 데이터베이스 원장 간 실시간 동기화 및 API 통신 관리를 위한 명세입니다.

---

## 📂 파일 구성 안내 (g5 폴더 내부)

본 통합 검인 패키지(`g5/`)는 아래와 같은 실제 프로덕션용 파일들로 구성되어 즉시 다운로드하거나 서버에 업로드할 수 있습니다.

1. **`g5_sync_bridge.php`**
   * 그누보드5가 설치된 웹 서버의 루트 또는 특정 하위 경로(예: `/g5/g5_sync_bridge.php`)에 업로드하여 동작하는 통합 API 브릿지 프로그램입니다.
   * 비침습적 양방향 설계로 구현되었으며, Bearer 토큰 보안 검증 및 JSON/POST 파라미터를 유기적으로 대응합니다.
2. **`g5_schema_additions.sql`**
   * 그누보드 데이터베이스상에 기본 구비해야 할 `g5_member`, `g5_board`, `g5_write_*` 테이블들의 MySQL 이식용 DDL 쿼리문입니다.
   * 후원 회원을 체계적으로 추적/기록 관리하기 위한 추가 연계용 스키마 `g5_sponsorship` 정의서가 동시 포함되어 있습니다.

---

## 🛡️ 1. 보안 규정 및 CORS/인증 토큰 설계

이 브릿지는 크로스 도메인(React 클라이언트 - 그누보드 PHP 서버) 상에서 안정적이면서도 위협 침입을 차단하기 위해 3단계 보안 보호막을 포함하고 있습니다.

### CORS 허용 설정 (PHP 코드 핵심)
CORS(Cross-Origin Resource Sharing) 충돌로 인한 브라우저 내 통신 차단 현상을 방지하기 위해, PHP 최상단에서 승인 헤더를 실시간 바인딩 처리합니다:
```php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

### Authorization Bearer Token 인증 정책
모든 연합 트랜잭션은 HTTP Request Header 영역에 `Authorization: Bearer <Secret_Token>` 형식을 탑재해야 유효 검인을 통과합니다.
* **디폴트 API 토큰:** `bukmin_g5_secure_token_key_2026`
* *실배포 운영 시, 보안 수준을 대폭 높인 32자리 이상의 임의 문자열로 양쪽 시스템 값을 일치시켜 변경하십시오.*

---

## 🪐 2. React에서 PHP API로의 안정적인 Fetch 통신 호출 규격

React 클라이언트 애플리케이션에서 본 G5 동기화 브릿지 PHP 단으로 안전한 인증 토큰을 동반한 통신을 개시할 때의 모범 소스 코드 가이드라인입니다.

### 전형적인 fetch API 호출 샘플 (TSX 구조)

```typescript
interface PromoteResponse {
  status: 'success' | 'error';
  message: string;
  previous_level?: number;
  current_level?: number;
}

/**
 * 그누보드 회원 등급 승급 및 연합 검인 대집행 요청 함수
 * mbId: 대상 그누보드 로그인 ID
 * targetLevel: 자동 상향 등급 코드 (예: 정회원 승인=2)
 */
async function promoteG5User(mbId: string, targetLevel: number = 2): Promise<PromoteResponse> {
  const g5BridgeUrl = 'https://YOUR_DOMAIN.com/g5/g5_sync_bridge.php';
  const apiSecretToken = 'bukmin_g5_secure_token_key_2026'; // 두 서버간 동일 비밀 토큰

  try {
    const response = await fetch(g5BridgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiSecretToken}`
      },
      body: JSON.stringify({
        action: 'promote_member',
        mb_id: mbId,
        target_level: targetLevel
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증에 실패하였습니다. API 보안 토큰을 확인하십시오.');
      }
      throw new Error(`HTTP 통신 실패 코드: ${response.status}`);
    }

    const data: PromoteResponse = await response.json();
    return data;
  } catch (error) {
    console.error('그누보드 연동 통신 도중 치명적 에러 발생:', error);
    throw error;
  }
}
```

---

## 🧾 3. API 브릿지 세부 기능 (Action 분류 체계)

HTTP POST 요청 시 바인딩하여 전송할 JSON Payload의 `action` 멤버 값에 따라 브릿지 내부에서 PDO 안전하게 분기 쿼리를 수행합니다:

### 1) DB 접속 자가 진단 및 데이터 통계 (`test_db_connection`)
* **목적:** ERP 인트라넷상에서 그누보드서버에 제대로 접속할 수 있는지 회선 테스트를 실행합니다.
* **Payload 예시:**
  ```json
  { "action": "test_db_connection" }
  ```
* **결과 포맷:**
  ```json
  {
    "status": "success",
    "message": "Connected to GnuBoard safely!",
    "timestamp": "2026-06-15 01:23:45",
    "metrics": { "totalMembers": 128, "totalBoards": 6 }
  }
  ```

### 2) 가입 회원 최신 데이터 로딩 (`get_members`)
* **목적:** 가입 완료된 탈북이주민 및 후원 회원의 회원 등급, 정보 대조를 위해 목록을 받아 동기화 세션에 탑재합니다.
* **Payload 예시:**
  ```json
  { "action": "get_members" }
  ```

### 3) 정회원 권한 일괄 자동 자격 상향 (`promote_member`)
* **목적:** 정착 지원 서류 검인이 끝났거나, 후원 지정 기부를 기탁하여 자격이 승격된 ID의 등급을 즉시 동기화해 올립니다.
* **Payload 예시:**
  ```json
  {
    "action": "promote_member",
    "mb_id": "test_g5_user_id01",
    "target_level": 2
  }
  ```

### 4) 실시간 최신 정보 리사이클 및 노출 (`get_latest_posts`)
* **목적:** 홈페이지 메인이나 행정 ERP 대시보드 알림 마당 영역에 그누보드 내부 게시글 테이터를 크롤링 없이 API 방식으로 가져와 리스팅합니다.
* **Payload 예시:**
  ```json
  {
    "action": "get_latest_posts",
    "bo_table": "notice",
    "limit": 5
  }
  ```

---

## ⚙️ 4. 서버 적용 및 이식 절차 가이드

1. **MySQL 스키마 이식**
   * 제공된 `g5_schema_additions.sql`의 SQL 구문을 phpMyAdmin 또는 MySQL Workbench, 터미널 등을 이용하여 그누보드가 매핑되어 작동 중인 데이터베이스 스키마에 일괄 밀어 넣습니다.
2. **PHP 통합 브릿지 업로드**
   * `g5_sync_bridge.php` 파일 내부의 `$API_SECRET_TOKEN` 값을 나만의 보안 키로 교환합니다.
   * FTP / SFTP 툴을 사용해 그누보드 설치 폴더인 `/g5` 또는 특정 공개 디렉토리에 해당 PHP 브릿지 파일을 이식합니다.
3. **가동성 사전 테스트**
   * 위에서 작성한 React Fetch 함수 또는 포스트맨(Postman)과 같은 툴을 사용하여 POST 요청을 발송한 뒤 정상 데이터가 JSON으로 덤프되는지 점검하고 행정 운용을 시작합니다.
