import { createClient } from "@supabase/supabase-js";

// Safe dynamic credentials resolution
export const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem("bukmin_supabase_url");
  const localKey = localStorage.getItem("bukmin_supabase_anon_key");
  
  const url = localUrl || (import.meta as any).env?.VITE_SUPABASE_URL || "https://lkinchgwfrwurekfapid.supabase.co";
  const key = localKey || (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX05B1NrxSVqQUdKIvpelQ_L_RgV9vU";
  
  return { url, key, isCustom: !!(localUrl || localKey) };
};

let config = getSupabaseConfig();
let internalClient = createClient(config.url, config.key);

// Function to update credentials live and rebuild connection
export const updateSupabaseClient = (url: string, key: string) => {
  if (url.trim()) {
    localStorage.setItem("bukmin_supabase_url", url.trim());
  } else {
    localStorage.removeItem("bukmin_supabase_url");
  }
  
  if (key.trim()) {
    localStorage.setItem("bukmin_supabase_anon_key", key.trim());
  } else {
    localStorage.removeItem("bukmin_supabase_anon_key");
  }
  
  config = getSupabaseConfig();
  internalClient = createClient(config.url, config.key);
};

// Proxied supabase export to permit hot swaps of host endpoint while preserving correct "this" binding
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const val = (internalClient as any)[prop];
    if (typeof val === 'function') {
      return val.bind(internalClient);
    }
    return val;
  }
});


export interface SupabaseConnReport {
  success: boolean;
  status: 'connected' | 'no_tables' | 'auth_error' | 'network_error';
  message: string;
}

// Utility functions for Supabase live data operations
export const supabaseDb = {
  // Check live connection availability with precise diagnostic classification
  testConnection: async (): Promise<SupabaseConnReport> => {
    try {
      // Just try a simple query to see if supabase is alive
      const { data, error } = await supabase.from("partners").select("count").limit(1);
      
      if (error) {
        const msg = error.message || "";
        const code = error.code || "";
        
        // PostgreSQL error code 42P01 / PGRST205 means table does not exist (relation missing / schema cache miss)
        // PostgREST PGRST204 or PGRST116 can also refer to table-missing scenarios
        if (code === "42P01" || code === "PGRST205" || msg.includes("does not exist") || msg.includes("not found") || msg.includes("schema cache")) {
          return {
            success: true, // Connection itself is valid!
            status: 'no_tables',
            message: "⚠️ Supabase 클라우드 서버와의 인증에 완료했으나, 데이터베이스 테이블들이 아직 생성되지 않았습니다. 우측의 SQL DDL 스키마를 복사하여 Supabase SQL Editor에서 한 번 실행해주시기 바랍니다."
          };
        }
        
        // PGRST301, PGRST302, 401, 403 are typical JWT / API Key invalid issues
        if (code.startsWith("PGRST3") || ["401", "403"].includes(code) || msg.toLowerCase().includes("jwt") || msg.toLowerCase().includes("invalid api key") || msg.toLowerCase().includes("invalid-jwt")) {
          return {
            success: false,
            status: 'auth_error',
            message: "❌ Supabase 인증(API Key) 오류가 발생했습니다. 설정된 URL 또는 Anon 키의 유효성을 다시 한 번 확인해 주세요."
          };
        }

        // Other PostgREST error codes
        return {
          success: false,
          status: 'network_error',
          message: `❌ Supabase 응답 에러 (코드: ${code}): ${msg}`
        };
      }
      
      return {
        success: true,
        status: 'connected',
        message: "✅ Supabase 클라우드 데이터베이스에 연동되어 실시간 양방향 데이터 통신이 원활히 동작 중입니다!"
      };
    } catch (e: any) {
      const errMsg = e?.message || "";
      if (errMsg.includes("fetch") || errMsg.includes("NetworkError") || errMsg.includes("Failed to fetch")) {
        return {
          success: false,
          status: 'network_error',
          message: "❌ Supabase 서버와의 네트워크 통신 연결에 실패했습니다. 인터넷 연결 또는 CORS 지침을 재확인하십시오."
        };
      }
      return {
        success: false,
        status: 'network_error',
        message: `❌ 알 수 없는 연결 문제: ${errMsg}`
      };
    }
  },

  // Dynamic upsert logic to synchronize tables
  syncTable: async (tableName: string, rows: any[]): Promise<{ success: boolean; count: number; error?: string }> => {
    if (!rows || rows.length === 0) return { success: true, count: 0 };
    try {
      const { data, error } = await supabase.from(tableName).upsert(rows);
      if (error) {
        throw new Error(error.message);
      }
      return { success: true, count: rows.length };
    } catch (err: any) {
      console.error(`[Supabase Sync failed for ${tableName}]:`, err);
      return { success: false, count: 0, error: err.message };
    }
  }
};
