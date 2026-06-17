import { supabase } from "./supabase";
import { Post, Comment, ProjectItem } from "./types";

/**
 * ☁️ Supabase Cloud Database Operations Service Component
 * 사단법인 북한이탈주민중앙회 (북민회) 클라우드 실시간 데이터 관리 모듈
 */

export interface SupabaseNewsItem {
  id: string;
  category: "press" | "activity" | "notice" | "gallery";
  title: string;
  date: string;
  description: string;
  views: number;
  tags?: string[];
  imageUrl?: string;
  imagePlaceholderColor?: string;
}

export const supabaseService = {
  // ==========================================
  // 1. NEWS & GALLERY (공식 보도자료 및 활동 소식) SERVICE
  // ==========================================
  
  /**
   * Supabase 클라우드로부터 최신 공식 뉴스 및 외부 언론 배포 보도자료 피드를 수집합니다.
   * `news` 테이블 또는 백업 `posts` 테이블의 board='news'/board='press' 조건으로 유연하게 매핑 쿼리합니다.
   */
  async fetchNews(limit = 15): Promise<{ success: boolean; data: SupabaseNewsItem[]; error?: string }> {
    try {
      // 1-1. 'news' 혹은 'press' 전용 테이블에서 먼저 시도
      const { data: newsData, error: newsError } = await supabase
        .from("news")
        .select("*")
        .order("date", { ascending: false })
        .limit(limit);

      if (!newsError && newsData) {
        const formatted: SupabaseNewsItem[] = newsData.map((item: any) => ({
          id: item.id || `sb_news_${item.wr_id || Math.random().toString()}`,
          category: item.category || "press",
          title: item.title || item.wr_subject || "",
          date: item.date || (item.wr_datetime ? item.wr_datetime.substring(0, 10) : new Date().toISOString().substring(0, 10)),
          description: item.description || item.content || item.wr_content || "",
          views: parseInt(item.views || item.wr_hit || "0", 10),
          tags: Array.isArray(item.tags) ? item.tags : ["북민회", "보도자료"],
          imageUrl: item.imageUrl || item.logoUrl || "",
          imagePlaceholderColor: item.imagePlaceholderColor || "from-blue-400 to-indigo-600"
        }));
        return { success: true, data: formatted };
      }

      // 1-2. 만약 news 테이블이 존재하지 않으면, 통합 posts 테이블에서 board='news' 조건으로 2차 폴백 쿼리 시도
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("posts")
        .select("*")
        .eq("board", "news")
        .order("date", { ascending: false })
        .limit(limit);

      if (!fallbackError && fallbackData) {
        const formatted: SupabaseNewsItem[] = fallbackData.map((item: any) => ({
          id: item.id,
          category: "press",
          title: item.title,
          date: item.date,
          description: item.content,
          views: parseInt(item.views || "0", 10),
          tags: ["언론연계", "클라우드"],
          imagePlaceholderColor: "from-emerald-400 to-teal-600"
        }));
        return { success: true, data: formatted };
      }

      throw new Error(newsError?.message || fallbackError?.message || "뉴스 데이터를 쿼리하는데 실패했습니다.");
    } catch (err: any) {
      console.warn("[Supabase fetchNews warning - using DB fallback]:", err.message);
      return { success: false, data: [], error: err.message };
    }
  },

  /**
   * 우수 보도자료 및 언론 소식을 신규 발행 등록하거나 기존 자료를 수정합니다.
   */
  async upsertNews(newsItem: Partial<SupabaseNewsItem>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const payload = {
        id: newsItem.id || `news_${Date.now()}`,
        category: newsItem.category || "press",
        title: newsItem.title,
        date: newsItem.date || new Date().toISOString().substring(0, 10),
        description: newsItem.description,
        views: newsItem.views || 0,
        tags: newsItem.tags || ["북민회"],
        imageUrl: newsItem.imageUrl || "",
        imagePlaceholderColor: newsItem.imagePlaceholderColor || "from-amber-400 to-rose-500"
      };

      const { data, error } = await supabase
        .from("news")
        .upsert(payload)
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error("[Supabase upsertNews error]:", err);
      return { success: false, error: err.message };
    }
  },

  // ==========================================
  // 2. PROJECT MANAGEMENT SERVICE (협회 추진사업기획)
  // ==========================================

  /**
   * Supabase 클라우드에서 자립/통합/나눔 3대 가치실현 주요 추진 사업 리스트를 수집합니다.
   */
  async fetchProjects(): Promise<{ success: boolean; data: ProjectItem[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("title", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted: ProjectItem[] = data.map((p: any) => ({
          title: p.title,
          subtitle: p.subtitle || "",
          detail: p.detail || "",
          achievements: Array.isArray(p.achievements) 
            ? p.achievements 
            : typeof p.achievements === "string" 
            ? JSON.parse(p.achievements)
            : []
        }));
        return { success: true, data: formatted };
      }

      return { success: true, data: [] };
    } catch (err: any) {
      console.warn("[Supabase fetchProjects warning - using fallback or empty list]:", err.message);
      return { success: false, data: [], error: err.message };
    }
  },

  /**
   * 추진 사업 정보를 클라우드 상에 신규 갱신 추가합니다.
   */
  async saveProject(project: ProjectItem): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("projects")
        .upsert({
          title: project.title,
          subtitle: project.subtitle,
          detail: project.detail,
          achievements: project.achievements
        });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("[Supabase saveProject error]:", err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 추진 사업 리스트를 전체 한 번에 동기화합니다.
   */
  async syncAllProjects(projects: ProjectItem[]): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const payload = projects.map(p => ({
        title: p.title,
        subtitle: p.subtitle,
        detail: p.detail,
        achievements: p.achievements
      }));

      const { error } = await supabase.from("projects").upsert(payload);
      if (error) throw error;
      return { success: true, count: projects.length };
    } catch (err: any) {
      console.error("[Supabase syncAllProjects error]:", err);
      return { success: false, count: 0, error: err.message };
    }
  },

  // ==========================================
  // 3. COMMUNITY POSTS (자유게시판/공지사항/건의함 통합 게시글) SERVICE
  // ==========================================

  /**
   * Supabase 클라우드 상에서 소통공간 게시판 데이터를 실시간 인출합니다.
   * @param board 게시판 구분자 (공지사항='notice', 자유게시판='free', 건의함='private', 대자보='news' 등)
   */
  async fetchCommunityPosts(board?: string): Promise<{ success: boolean; posts: Post[]; error?: string }> {
    try {
      let query = supabase.from("posts").select("*, comments(*)");
      
      if (board) {
        query = query.eq("board", board);
      }

      const { data, error } = await query.order("date", { ascending: false });

      if (error) throw error;

      if (data) {
        const posts: Post[] = data.map((p: any) => ({
          id: p.id,
          type: (p.board || p.type || "free") as any,
          title: p.title,
          content: p.content,
          author: p.author,
          date: p.date,
          views: parseInt(p.views || "0", 10),
          likes: parseInt(p.likes || "0", 10),
          comments: Array.isArray(p.comments) 
            ? p.comments.map((c: any) => ({
                id: c.id,
                author: c.author,
                content: c.content,
                date: c.date
              }))
            : []
        }));
        return { success: true, posts };
      }

      return { success: true, posts: [] };
    } catch (err: any) {
      console.warn("[Supabase fetchCommunityPosts failed or table lacks]:", err.message);
      return { success: false, posts: [], error: err.message };
    }
  },

  /**
   * 새로운 소통공간 게시물을 작성하거나 기존 글을 클라우드 상에서 원격 갱신합니다.
   */
  async writeCommunityPost(post: Partial<Post> & { board: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const payload = {
        id: post.id || `post_${Date.now()}`,
        board: post.board || post.type || "free",
        title: post.title,
        content: post.content,
        author: post.author || "비회원",
        date: post.date || new Date().toISOString().substring(0, 10),
        views: post.views || 0,
        likes: post.likes || 0
      };

      const { data, error } = await supabase
        .from("posts")
        .upsert(payload)
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error("[Supabase writeCommunityPost error]:", err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 해당 글에 새로운 활성 댓글을 Supabase에 영구 등록합니다.
   */
  async writeSupabaseComment(postId: string, comment: { author: string; content: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const payload = {
        id: `comment_${Date.now()}`,
        post_id: postId,
        author: comment.author || "익명회원",
        content: comment.content,
        date: new Date().toISOString().substring(0, 16).replace("T", " ")
      };

      const { data, error } = await supabase
        .from("comments")
        .insert(payload)
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error("[Supabase writeSupabaseComment error]:", err);
      return { success: false, error: err.message };
    }
  }
};
