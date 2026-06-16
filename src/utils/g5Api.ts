/**
 * 개발 환경에서 CORS 및 Mixed-Content 차단을 무결하게 해결하고,
 * 실전 배포 후 독립 도메인 환경에서는 0% 속도 저하 없이 다이렉트 고속 연결해주는 지능형 API 통신 헬퍼입니다.
 */
export async function safeG5Fetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    const curOrigin = window.location.origin;
    
    // 로컬 개발/프리뷰 환경 검출 (ais-dev.run.app, localhost, 127.0.0.1 등)
    const isLocalDev = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' || 
      window.location.hostname.includes('.run.app') || 
      window.location.hostname.includes('gitpod') || 
      window.location.hostname.includes('github') || 
      window.location.hostname.includes('webcontainer');

    // 1. 외부 도메인을 호출하는 PHP API 요청이고 개발 프리뷰 단계라면 CORS/Mixed-Content 차단 방지용 백엔드 프록시로 라우팅
    if (url.startsWith('http') && isLocalDev) {
      const urlObj = new URL(url);
      if (urlObj.origin !== curOrigin) {
        let bodyData = init?.body;
        if (bodyData && typeof bodyData === 'string') {
          try {
            bodyData = JSON.parse(bodyData);
          } catch {
            // Keep original string if parsing fails
          }
        }

        const proxyHeaders: Record<string, string> = {};
        if (init?.headers) {
          if (init.headers instanceof Headers) {
            init.headers.forEach((value, key) => {
              proxyHeaders[key] = value;
            });
          } else if (Array.isArray(init.headers)) {
            init.headers.forEach(([key, value]) => {
              proxyHeaders[key] = value;
            });
          } else {
            Object.assign(proxyHeaders, init.headers);
          }
        }

        console.log(`[ERP Sync Proxy System] Routing external HTTP fetch safely: ${url}`);
        
        // Express.js Backend "/api/g5-proxy"를 통과
        return fetch('/api/g5-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            targetUrl: url,
            method: init?.method || 'GET',
            headers: proxyHeaders,
            body: bodyData
          }),
          signal: init?.signal
        });
      }
    }
  } catch (err) {
    console.warn('[safeG5Fetch Proxy Config] URL 파싱 또는 전환 중 폴백 직렬 호출 유도됨:', err);
  }

  // 2. 실전 기기 배포 환경(onenk.kr 등 동일 도메인상에 탑재된 경우)에서는 아무런 지연 없이 native fetch 직접 가동함!
  return fetch(url, init);
}
