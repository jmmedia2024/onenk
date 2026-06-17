import { supabase } from "../supabase";
import { Post, Comment, ProjectItem } from "../types";

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

export const dataService = {
  // =========================================================================
  // 1. OFFICIAL NEWS & GALLERY (공식 보도자료 및 활동 소식) CRUD
  // =========================================================================

  /**
   * 뉴스 보도자료 피드를 수집합니다. (Read ALL / Filtered)
   */
  async fetchNews(category?: string, limit = 15): Promise<{ success: boolean; data: SupabaseNewsItem[]; error?: string }> {
    try {
      let query = supabase.from("news").select("*");
      
      if (category) {
        query = query.eq("category", category);
      }
      
      const { data, error } = await query
        .order("date", { ascending: false })
        .limit(limit);

      if (error) {
        // Fallback: Check if we can get board='news' from posts table
        console.warn("[news table query failed, attempting posts table fallback]:", error.message);
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("posts")
          .select("*")
          .eq("board", "news")
          .order("date", { ascending: false })
          .limit(limit);

        if (fallbackError) {
          throw new Error(`뉴스 테이블 및 대체 포스트 테이블 모두 로드 실패: ${fallbackError.message}`);
        }

        const formattedFallback: SupabaseNewsItem[] = (fallbackData || []).map((p: any) => ({
          id: p.id,
          category: "press",
          title: p.title,
          date: p.date,
          description: p.content,
          views: parseInt(p.views || "0", 10),
          tags: ["자동 폴백", "북민회"],
          imageUrl: "",
          imagePlaceholderColor: "from-blue-500 to-cyan-500"
        }));

        return { success: true, data: formattedFallback };
      }

      const formatted: SupabaseNewsItem[] = (data || []).map((item: any) => ({
        id: item.id,
        category: (item.category || "press") as any,
        title: item.title || "",
        date: item.date || new Date().toISOString().substring(0, 10),
        description: item.description || "",
        views: parseInt(item.views || "0", 10),
        tags: Array.isArray(item.tags) ? item.tags : (item.tags ? JSON.parse(item.tags) : ["북민회"]),
        imageUrl: item.imageUrl || "",
        imagePlaceholderColor: item.imagePlaceholderColor || "from-blue-400 to-indigo-600"
      }));

      return { success: true, data: formatted };
    } catch (err: any) {
      console.error("[dataService.fetchNews Error]:", err);
      return { success: false, data: [], error: err.message };
    }
  },

  /**
   * 특정 보도자료 ID로 상세 검색합니다. (Read Single)
   */
  async fetchNewsById(id: string): Promise<{ success: boolean; data: SupabaseNewsItem | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) return { success: true, data: null };

      const formatted: SupabaseNewsItem = {
        id: data.id,
        category: data.category || "press",
        title: data.title || "",
        date: data.date || "",
        description: data.description || "",
        views: parseInt(data.views || "0", 10),
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? JSON.parse(data.tags) : ["북민회"]),
        imageUrl: data.imageUrl || "",
        imagePlaceholderColor: data.imagePlaceholderColor || "from-blue-400 to-indigo-600"
      };

      return { success: true, data: formatted };
    } catch (err: any) {
      console.error(`[dataService.fetchNewsById ID:${id} Error]:`, err);
      return { success: false, data: null, error: err.message };
    }
  },

  /**
   * 신규 보도자료/활동소식을 추가합니다. (Create)
   */
  async createNews(news: Omit<SupabaseNewsItem, "id" | "views">): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const payload = {
        id: `news_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        category: news.category,
        title: news.title,
        date: news.date || new Date().toISOString().substring(0, 10),
        description: news.description,
        views: 0,
        tags: news.tags || ["북민회"],
        imageUrl: news.imageUrl || "",
        imagePlaceholderColor: news.imagePlaceholderColor || "from-indigo-500 to-purple-600"
      };

      const { data, error } = await supabase
        .from("news")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error("[dataService.createNews Error]:", err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 보도자료/활동소식을 수정합니다. (Update)
   */
  async updateNews(id: string, updates: Partial<SupabaseNewsItem>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("news")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error(`[dataService.updateNews ID:${id} Error]:`, err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 보도자료/활동소식을 영구 연계 해제 삭제합니다. (Delete)
   */
  async deleteNews(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("news")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error(`[dataService.deleteNews ID:${id} Error]:`, err);
      return { success: false, error: err.message };
    }
  },


  // =========================================================================
  // 2. PROJECT MANAGEMENT (추진 주요 사업) CRUD
  // =========================================================================

  /**
   * 중앙회 핵심 추진사업 리스트를 가져옵니다. (Read ALL)
   */
  async fetchProjects(): Promise<{ success: boolean; data: ProjectItem[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("title", { ascending: true });

      if (error) {
        console.warn("[projects table load error, returning empty fallback list]:", error.message);
        return { success: false, data: [], error: error.message };
      }

      const formatted: ProjectItem[] = (data || []).map((p: any) => ({
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
    } catch (err: any) {
      console.error("[dataService.fetchProjects Error]:", err);
      return { success: false, data: [], error: err.message };
    }
  },

  /**
   * 새로운 추진 기획 사업 항목을 연동 추가합니다. (Create)
   */
  async createProject(project: ProjectItem): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("projects")
        .insert({
          title: project.title,
          subtitle: project.subtitle,
          detail: project.detail,
          achievements: project.achievements
        });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("[dataService.createProject Error]:", err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 기존 추진사업의 세부 기획 내용을 갱신합니다. (Update by title)
   */
  async updateProject(originalTitle: string, updatedProject: ProjectItem): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          title: updatedProject.title,
          subtitle: updatedProject.subtitle,
          detail: updatedProject.detail,
          achievements: updatedProject.achievements
        })
        .eq("title", originalTitle);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error(`[dataService.updateProject Title:${originalTitle} Error]:`, err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 특정 기획 사업의 연동을 철회 삭제합니다. (Delete)
   */
  async deleteProject(title: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("title", title);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error(`[dataService.deleteProject Title:${title} Error]:`, err);
      return { success: false, error: err.message };
    }
  },


  // =========================================================================
  // 3. COMMUNITY POSTS & COMMENTS (건의함-notice-free-qna 통합 게시판) CRUD
  // =========================================================================

  /**
   * 소통공간 게시판 데이터를 최신순으로 가져옵니다. (+ 연계된 댓글 목록 통합) (Read ALL / Filtered)
   */
  async fetchPosts(boardType?: string, limit = 50): Promise<{ success: boolean; posts: Post[]; error?: string }> {
    try {
      let query = supabase.from("posts").select("*, comments(*)");

      if (boardType) {
        query = query.eq("board", boardType);
      }

      const { data, error } = await query
        .order("date", { ascending: false })
        .limit(limit);

      if (error) throw error;

      const posts: Post[] = (data || []).map((p: any) => ({
        id: p.id,
        type: (p.board || p.type || "free") as any,
        title: p.title || "",
        content: p.content || "",
        author: p.author || "익명",
        date: p.date || new Date().toISOString().substring(0, 10),
        views: parseInt(p.views || "0", 10),
        likes: parseInt(p.likes || "0", 10),
        comments: Array.isArray(p.comments) 
          ? p.comments.map((c: any) => ({
              id: c.id,
              author: c.author || "익명",
              content: c.content || "",
              date: c.date || ""
            }))
          : []
      }));

      return { success: true, posts };
    } catch (err: any) {
      console.error("[dataService.fetchPosts Error]:", err);
      return { success: false, posts: [], error: err.message };
    }
  },

  /**
   * 단 하나의 게시글만을 댓글 목록과 함께 로드합니다. (Read Single)
   */
  async fetchPostById(id: string): Promise<{ success: boolean; post: Post | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*, comments(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) return { success: true, post: null };

      const post: Post = {
        id: data.id,
        type: (data.board || data.type || "free") as any,
        title: data.title || "",
        content: data.content || "",
        author: data.author || "익명",
        date: data.date || "",
        views: parseInt(data.views || "0", 10),
        likes: parseInt(data.likes || "0", 10),
        comments: Array.isArray(data.comments)
          ? data.comments.map((c: any) => ({
              id: c.id,
              author: c.author || "익명",
              content: c.content || "",
              date: c.date || ""
            }))
          : []
      };

      return { success: true, post };
    } catch (err: any) {
      console.error(`[dataService.fetchPostById ID:${id} Error]:`, err);
      return { success: false, post: null, error: err.message };
    }
  },

  /**
   * 새로운 소통공간 게시글을 생성합니다. (Create)
   */
  async createPost(post: Omit<Post, "id" | "views" | "likes" | "comments"> & { board?: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const payload = {
        id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        board: post.board || post.type || "free",
        title: post.title,
        content: post.content,
        author: post.author || "비회원",
        date: post.date || new Date().toISOString().substring(0, 10),
        views: 0,
        likes: 0
      };

      const { data, error } = await supabase
        .from("posts")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error("[dataService.createPost Error]:", err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 기존 게시글의 제목, 내용, 태그, 혹은 조회수/좋아요 등의 지표를 수정 반영합니다. (Update)
   */
  async updatePost(id: string, updates: Partial<Post & { board?: string }>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const mappedUpdates: any = { ...updates };
      if (updates.type) {
        mappedUpdates.board = updates.type;
      }

      const { data, error } = await supabase
        .from("posts")
        .update(mappedUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error(`[dataService.updatePost ID:${id} Error]:`, err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 게시물을 영구 삭제 탈퇴 처리합니다. (Delete)
   */
  async deletePost(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error(`[dataService.deletePost ID:${id} Error]:`, err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 지정된 게시글 번호에 실시간 소통 댓글을 신규 등록 등록합니다. (Comment - Create)
   */
  async createComment(postId: string, comment: { author: string; content: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const payload = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        post_id: postId,
        author: comment.author || "익명회원",
        content: comment.content,
        date: new Date().toISOString().substring(0, 16).replace("T", " ")
      };

      const { data, error } = await supabase
        .from("comments")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error(`[dataService.createComment Post:${postId} Error]:`, err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 특정 댓글을 연동 삭제합니다. (Comment - Delete)
   */
  async deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error(`[dataService.deleteComment ID:${commentId} Error]:`, err);
      return { success: false, error: err.message };
    }
  }
};
