import { createClient } from "@supabase/supabase-js";

// Retrieve environment credentials with highly resilient direct fallback
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "https://lkinchgwfrwurekfapid.supabase.co";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX05B1NrxSVqQUdKIvpelQ_L_RgV9vU";

// Graceful client initialization
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility functions for Supabase live data operations
export const supabaseDb = {
  // Check live connection availability
  testConnection: async (): Promise<boolean> => {
    try {
      // Just try a simple query to see if supabase is alive
      const { data, error } = await supabase.from("partners").select("count").limit(1);
      if (error && error.code !== "PGRST116") {
        // Table might not exist but if we connected, we won't get network/auth error
        console.warn("[Supabase Connection warning, probably table lacks]:", error.message);
        return error.code === "42P01"; // 42P01 is "relation does not exist" which proves connection succeeded!
      }
      return true;
    } catch (e) {
      console.error("[Supabase Connection failed]:", e);
      return false;
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
