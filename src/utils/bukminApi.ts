/**
 * 사단법인 북민회(사단법인 북한이탈주민중앙회) 자체 SQLite DB 통합 연동 통신 모듈
 * 모든 프론트엔드 컴포넌트는 본 API 모듈을 통해 실제 서버에 영구 영수기록, 포스팅, 댓글, 회원 인증, 관리자 통계를 실시간 조회합니다.
 */

export interface Post {
  id: string;
  board?: string;
  type?: string; // category mapping for compatibility
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: Comment[];
  imagePlaceholderColor?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author: string;
  content: string;
  date: string;
}

export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  paymentMethod: string;
  date: string;
  message: string;
  isRegular: number;
  isRecognized: number;
}

export interface Verification {
  id: string;
  name: string;
  age: number;
  settlementYear: number;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
}

export interface Slide {
  id: number;
  imageUrl: string;
  badge: string;
  title: string;
  subTitle: string;
}

export interface Stats {
  totalMembers: number;
  activeVolunteers: number;
  pendingCount: number;
  totalContributions: number;
}

export const bukminApi = {
  // 1. AUTHENTICATION
  async login(mb_id: string, mb_password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mb_id, mb_password }),
    });
    return res.json();
  },

  async register(data: any) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async editProfile(data: any) {
    const res = await fetch("/api/auth/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMembers() {
    const res = await fetch("/api/members");
    return res.json();
  },

  async deleteMember(mb_id: string) {
    const res = await fetch("/api/members/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mb_id }),
    });
    return res.json();
  },

  // 2. COMMUNITY POSTS & COMMENTS
  async getPosts(board?: string) {
    const url = board ? `/api/posts?board=${board}` : "/api/posts";
    const res = await fetch(url);
    const data = await res.json();
    
    // Auto-map DB's `board` column to frontend's expected properties for backwards compatibility
    if (data.success && Array.isArray(data.posts)) {
      data.posts = data.posts.map((post: any) => ({
        ...post,
        type: post.board || post.type || 'free',
        comments: post.comments || []
      }));
    }
    return data;
  },

  async writePost(board: string, title: string, content: string, author: string, id?: string) {
    const res = await fetch("/api/posts/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board, title, content, author, id }),
    });
    return res.json();
  },

  async writeComment(postId: string, author: string, content: string) {
    const res = await fetch(`/api/posts/${postId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, content }),
    });
    return res.json();
  },

  async deletePost(id: string) {
    const res = await fetch("/api/posts/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return res.json();
  },

  async likePost(id: string) {
    const res = await fetch(`/api/posts/${id}/like`, { method: "POST" });
    return res.json();
  },

  async viewPost(id: string) {
    const res = await fetch(`/api/posts/${id}/view`, { method: "POST" });
    return res.json();
  },

  // 3. SPONSORSHIP & DONATION RECORDS
  async getDonations() {
    const res = await fetch("/api/donations");
    return res.json();
  },

  async applyDonation(data: { donorName: string; amount: number; paymentMethod?: string; message?: string; isRegular?: boolean }) {
    const res = await fetch("/api/donations/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteDonation(id: string) {
    const res = await fetch("/api/donations/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return res.json();
  },

  // 4. NORTH KOREAN REFUGEE VERIFICATION LOGS
  async getVerifications() {
    const res = await fetch("/api/verifications");
    return res.json();
  },

  async applyVerification(data: { name: string; age: number; settlementYear: number; documentType: string }) {
    const res = await fetch("/api/verifications/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateVerificationStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    const res = await fetch("/api/verifications/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    return res.json();
  },

  // 5. BANNER HOMEPAGE SLIDES MANAGEMENT
  async getSlides() {
    const res = await fetch("/api/settings/slides");
    return res.json();
  },

  async saveSlides(slides: Slide[]) {
    const res = await fetch("/api/settings/slides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slides }),
    });
    return res.json();
  },

  // 6. DASHBOARD GENERAL SUMMARY METRICS (Stats)
  async getStats() {
    const res = await fetch("/api/stats");
    return res.json();
  }
};
