import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import db from "./src/server/db";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add parser middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API proxy endpoint FIRST (Preserved for compatibility/legacy bridge support)
  app.post("/api/g5-proxy", async (req, res) => {
    try {
      const { targetUrl, method, headers, body } = req.body;
      if (!targetUrl) {
        return res.status(400).json({ success: false, message: "Missing targetUrl" });
      }

      console.log(`[API PROXY] Routing ${method || "POST"} request to: ${targetUrl}`);

      // Forward request using node fetch (built-in in stable Node 18+)
      const fetchResponse = await fetch(targetUrl, {
        method: method || "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
      });

      const responseText = await fetchResponse.text();
      let responseJson: any = null;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        // Response is not JSON
      }

      res.status(fetchResponse.status);
      if (responseJson) {
        res.json(responseJson);
      } else {
        res.send(responseText);
      }
    } catch (proxyError: any) {
      console.error("[API PROXY ERROR]:", proxyError);
      res.status(500).json({
        success: false,
        message: `통합망 서버 프록시 통신 장애: ${proxyError.message || "Unknown error"}`
      });
    }
  });

  // ============================================
  // NATIVE PERSISTENT SELF-CONTAINED DATABASE API
  // ============================================

  // 1. AUTHENTICATION & MEMBERSHIP API
  app.post("/api/auth/login", (req, res) => {
    try {
      const { mb_id, mb_password } = req.body;
      if (!mb_id || !mb_password) {
        return res.status(400).json({ success: false, message: "아이디와 패스워드를 입력해 주십시오." });
      }

      const member: any = db.prepare("SELECT * FROM members WHERE mb_id = ?").get(mb_id);
      if (!member) {
        return res.status(401).json({ success: false, message: "등록되지 않은 회원 ID입니다." });
      }

      if (member.mb_password !== mb_password) {
        return res.status(401).json({ success: false, message: "비밀번호가 일치하지 않습니다." });
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      db.prepare("UPDATE members SET mb_today_login = ? WHERE mb_id = ?").run(now, mb_id);

      res.json({
        success: true,
        member: {
          mb_id: member.mb_id,
          mb_name: member.mb_name,
          mb_nick: member.mb_nick,
          mb_email: member.mb_email,
          mb_tel: member.mb_tel,
          mb_level: member.mb_level,
          mb_point: member.mb_point,
          mb_datetime: member.mb_datetime,
          mb_today_login: now
        }
      });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    try {
      const { mb_id, mb_password, mb_name, mb_nick, mb_email, mb_tel } = req.body;
      if (!mb_id || !mb_password || !mb_name || !mb_nick) {
        return res.status(400).json({ success: false, message: "필수 가입 양식 항목 중 누락된 부분이 존재합니다." });
      }

      // Check duplicate ID
      const existing: any = db.prepare("SELECT mb_id FROM members WHERE mb_id = ?").get(mb_id);
      if (existing) {
        return res.status(400).json({ success: false, message: "이미 사용 중인 회원 정보 ID가 존재합니다." });
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      
      // Default level 2 for regular member, give 2000 welcome points!
      db.prepare(`
        INSERT INTO members (mb_id, mb_password, mb_name, mb_nick, mb_email, mb_tel, mb_level, mb_point, mb_datetime, mb_today_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(mb_id, mb_password, mb_name, mb_nick, mb_email || "", mb_tel || "", 2, 2000, now, now);

      res.status(201).json({ success: true, message: "사단법인 북민회 공식 일원으로 가입이 성공적으로 완수되었습니다!" });
    } catch (err: any) {
      console.error("Register error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/auth/edit", (req, res) => {
    try {
      const { mb_id, mb_nick, mb_tel } = req.body;
      if (!mb_id || !mb_nick) {
        return res.status(400).json({ success: false, message: "수정 요구 값이 불성실하게 인입되었습니다." });
      }

      const member: any = db.prepare("SELECT mb_id FROM members WHERE mb_id = ?").get(mb_id);
      if (!member) {
        return res.status(404).json({ success: false, message: "대조할 수 있는 활성 회원을 찾을 수 없습니다." });
      }

      db.prepare(`
        UPDATE members 
        SET mb_nick = ?, mb_tel = ?
        WHERE mb_id = ?
      `).run(mb_nick, mb_tel || "", mb_id);

      const updatedMember: any = db.prepare("SELECT * FROM members WHERE mb_id = ?").get(mb_id);

      res.json({
        success: true,
        member: {
          mb_id: updatedMember.mb_id,
          mb_name: updatedMember.mb_name,
          mb_nick: updatedMember.mb_nick,
          mb_email: updatedMember.mb_email,
          mb_tel: updatedMember.mb_tel,
          mb_level: updatedMember.mb_level,
          mb_point: updatedMember.mb_point,
          mb_datetime: updatedMember.mb_datetime,
          mb_today_login: updatedMember.mb_today_login
        }
      });
    } catch (err: any) {
      console.error("Edit member error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get("/api/members", (req, res) => {
    try {
      const list = db.prepare("SELECT mb_id, mb_name, mb_nick, mb_level, mb_email, mb_tel, mb_datetime, mb_point, mb_today_login FROM members ORDER BY mb_datetime DESC").all();
      res.json({ success: true, count: list.length, members: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/members/delete", (req, res) => {
    try {
      const { mb_id } = req.body;
      if (!mb_id) return res.status(400).json({ success: false, message: "Missing Member ID" });
      if (mb_id === "admin") {
        return res.status(400).json({ success: false, message: "최고 관리자 계정은 기밀 영구 보존 대상으로 삭제가 기각됩니다." });
      }
      db.prepare("DELETE FROM members WHERE mb_id = ?").run(mb_id);
      res.json({ success: true, message: "회원이 데이터베이스에서 영구 소멸 조치되었습니다." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 2. COMMUNITY BOARD & COMMENTS API
  app.get("/api/posts", (req, res) => {
    try {
      const boardType = req.query.board as string;
      let posts: any[] = [];
      if (boardType) {
        posts = db.prepare("SELECT * FROM posts WHERE board = ? ORDER BY date DESC, id DESC").all(boardType);
      } else {
        posts = db.prepare("SELECT * FROM posts ORDER BY date DESC, id DESC").all();
      }

      // Merge comments to each post
      const postsWithComments = posts.map((post: any) => {
        const comments = db.prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY date ASC, id ASC").all(post.id);
        return {
          ...post,
          likes: Number(post.likes) || 0,
          views: Number(post.views) || 0,
          comments
        };
      });

      res.json({ success: true, count: postsWithComments.length, posts: postsWithComments });
    } catch (err: any) {
      console.error("Get posts error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/posts/write", (req, res) => {
    try {
      const { board, title, content, author, id } = req.body;
      if (!board || !title || !content || !author) {
        return res.status(400).json({ success: false, message: "글을 등록하기 위한 필수 항목이 결핍되어 있습니다." });
      }

      const post_id = id || `post-${Date.now()}`;
      const nowStr = new Date().toISOString().split('T')[0];

      db.prepare(`
        INSERT INTO posts (id, board, title, content, author, date, views, likes)
        VALUES (?, ?, ?, ?, ?, ?, 1, 0)
      `).run(post_id, board, title, content, author, nowStr);

      // Reward writing points!
      db.prepare("UPDATE members SET mb_point = mb_point + 150 WHERE mb_nick = ? OR mb_name = ?").run(author, author);

      const createdPost = db.prepare("SELECT * FROM posts WHERE id = ?").get(post_id);
      res.status(201).json({ success: true, message: "게시글이 자체 DB에 완벽 영구 등록 되었습니다.", post: createdPost });
    } catch (err: any) {
      console.error("Write post error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/posts/:id/comment", (req, res) => {
    try {
      const { author, content } = req.body;
      const { id: post_id } = req.params;
      if (!author || !content) {
        return res.status(400).json({ success: false, message: "댓글 작성 내용이 누락되었습니다." });
      }

      const comment_id = `com-${Date.now()}`;
      const nowStr = new Date().toISOString().split('T')[0];

      db.prepare(`
        INSERT INTO comments (id, post_id, author, content, date)
        VALUES (?, ?, ?, ?, ?)
      `).run(comment_id, post_id, author, content, nowStr);

      // Reward comment points!
      db.prepare("UPDATE members SET mb_point = mb_point + 50 WHERE mb_nick = ? OR mb_name = ?").run(author, author);

      const comments = db.prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY date ASC, id ASC").all(post_id);
      res.status(201).json({ success: true, message: "댓글이 작성 수립되어 영구 저장되었습니다.", comments });
    } catch (err: any) {
      console.error("Write comment error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/posts/delete", (req, res) => {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ success: false, message: "Missing Post ID" });

      db.prepare("DELETE FROM comments WHERE post_id = ?").run(id);
      db.prepare("DELETE FROM posts WHERE id = ?").run(id);

      res.json({ success: true, message: "선택하신 게시글이 관계 댓글과 함께 DB에서 안전 소멸 처리되었습니다." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/posts/:id/like", (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("UPDATE posts SET likes = likes + 1 WHERE id = ?").run(id);
      const post = db.prepare("SELECT likes FROM posts WHERE id = ?").get(id) as { likes: number };
      res.json({ success: true, likes: post.likes });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/posts/:id/view", (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("UPDATE posts SET views = views + 1 WHERE id = ?").run(id);
      const post = db.prepare("SELECT views FROM posts WHERE id = ?").get(id) as { views: number };
      res.json({ success: true, views: post.views });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 3. SPONSORSHIP & DONATION RECORD API
  app.get("/api/donations", (req, res) => {
    try {
      const list = db.prepare("SELECT * FROM donations ORDER BY date DESC, id DESC").all();
      res.json({ success: true, donations: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/donations/apply", (req, res) => {
    try {
      const { donorName, amount, paymentMethod, message, isRegular } = req.body;
      if (!donorName || !amount) {
        return res.status(400).json({ success: false, message: "Sponsorship name and amount are required" });
      }

      const id = `d-${Date.now()}`;
      const nowStr = new Date().toISOString().split('T')[0];

      db.prepare(`
        INSERT INTO donations (id, donorName, amount, paymentMethod, date, message, isRegular, isRecognized)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `).run(id, donorName, Number(amount), paymentMethod || "계좌이체 (농협)", nowStr, message || "", isRegular ? 1 : 0);

      res.status(201).json({ success: true, message: "후원 신청서가 중앙회 원장에 정식 등재되어 영구 보존 처리 완료되었습니다!" });
    } catch (err: any) {
      console.error("Apply donation error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/donations/delete", (req, res) => {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ success: false, message: "Missing item ID" });
      db.prepare("DELETE FROM donations WHERE id = ?").run(id);
      res.json({ success: true, message: "후원 기록 연장이 파기(삭제) 성립되었습니다." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 4. NORTH KOREAN REFUGEE VERIFICATION LOGS
  app.get("/api/verifications", (req, res) => {
    try {
      const list = db.prepare("SELECT * FROM verifications ORDER BY requestDate DESC, id DESC").all();
      res.json({ success: true, verifications: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/verifications/apply", (req, res) => {
    try {
      const { name, age, settlementYear, documentType } = req.body;
      if (!name || !age || !settlementYear || !documentType) {
        return res.status(400).json({ success: false, message: "All document credentials are required" });
      }

      const id = `v-${Date.now()}`;
      const nowStr = new Date().toISOString().split('T')[0];

      db.prepare(`
        INSERT INTO verifications (id, name, age, settlementYear, documentType, status, requestDate)
        VALUES (?, ?, ?, ?, ?, 'pending', ?)
      `).run(id, name, Number(age), Number(settlementYear), documentType, nowStr);

      res.status(201).json({ success: true, message: "서류 및 영 수심사 청구권이 국정원/통일부 산안 규정에 맞추어 접수 완수되었습니다." });
    } catch (err: any) {
      console.error("Apply verification error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/verifications/status", (req, res) => {
    try {
      const { id, status } = req.body;
      if (!id || !status) return res.status(400).json({ success: false, message: "Id and Status are required" });

      db.prepare("UPDATE verifications SET status = ? WHERE id = ?").run(status, id);

      // If approved, trigger member level elevation or points
      if (status === "approved") {
        const checkVer = db.prepare("SELECT name FROM verifications WHERE id = ?").get(id) as { name: string };
        if (checkVer) {
          db.prepare("UPDATE members SET mb_level = 3, mb_point = mb_point + 10000 WHERE mb_name = ?").run(checkVer.name);
        }
      }

      res.json({ success: true, message: "심사 상태가 실시간 성공적으로 동기 변환 완료되었습니다." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 5. BANNER HOMEPAGE SLIDES MANAGEMENT
  app.get("/api/settings/slides", (req, res) => {
    try {
      const list = db.prepare("SELECT * FROM slides ORDER BY id ASC").all();
      res.json({ success: true, slides: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/settings/slides", (req, res) => {
    try {
      const { slides } = req.body;
      if (!slides || !Array.isArray(slides)) {
        return res.status(400).json({ success: false, message: "Invalid slides format" });
      }

      // Re-populate slides safely
      db.prepare("DELETE FROM slides").run();
      const insert = db.prepare(`
        INSERT INTO slides (id, imageUrl, badge, title, subTitle)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (let i = 0; i < slides.length; i++) {
        const s = slides[i];
        insert.run(i + 1, s.imageUrl, s.badge, s.title, s.subTitle);
      }

      res.json({ success: true, message: "슬라이드 레이아웃 설정이 DB에 영구 고정 복제 되었습니다." });
    } catch (err: any) {
      console.error("Save slides settings error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 6. GENERAL SUMMARY METRICS API
  app.get("/api/stats", (req, res) => {
    try {
      const membersRow = db.prepare("SELECT COUNT(*) as count FROM members").get() as { count: number };
      const pendingRow = db.prepare("SELECT COUNT(*) as count FROM verifications WHERE status = 'pending'").get() as { count: number };
      const donationSum = db.prepare("SELECT SUM(amount) as sum FROM donations WHERE isRecognized=1").get() as { sum: number|null };

      res.json({
        success: true,
        totalMembers: membersRow.count + 1444, // Align with rich real starting counts (1450 default)
        activeVolunteers: 384 + Math.floor(membersRow.count / 3),
        pendingCount: pendingRow.count,
        totalContributions: (donationSum.sum || 0) + 89200000 // Cumulative ledger baseline
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 7. REAL DATABASE SQL TERMINAL INTERFERER
  app.post("/api/admin/query", (req, res) => {
    try {
      const { sql } = req.body;
      if (!sql) {
        return res.status(400).json({ success: false, message: "SQL명령어는 필수 입력 항목입니다." });
      }

      const cleanSql = sql.trim();
      const lowerSql = cleanSql.toLowerCase();

      console.log(`[REAL SQL TERMINAL RUN]: ${cleanSql}`);

      if (lowerSql.startsWith("select")) {
        // Query database fetch rows
        const stmt = db.prepare(cleanSql);
        const rows = stmt.all();
        res.json({ success: true, type: "select", rows });
      } else {
        // Run executing statements (Insert, Update, Delete)
        const stmt = db.prepare(cleanSql);
        const result = stmt.run();
        res.json({
          success: true,
          type: "run",
          changes: result.changes,
          lastInsertRowid: result.lastInsertRowid
        });
      }
    } catch (err: any) {
      console.error("[SQL EXECUTION SERVER ERROR]:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  });

  // 8. PARTNER MANAGEMENT API
  app.get("/api/partners", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM partners").all();
      res.json({ success: true, partners: rows });
    } catch (err: any) {
      console.error("[PARTNERS GET ERROR]:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/partners/apply", (req, res) => {
    try {
      const { id, name, engName, desc, color, siteUrl, logoUrl } = req.body;
      if (!name || !siteUrl) {
        return res.status(400).json({ success: false, message: "파트너 단체명과 웹 주소는 필수입니다." });
      }

      const partnerId = id || `p-${Date.now()}`;
      const partnerColor = color || "bg-slate-50 text-slate-600 border-slate-200";
      
      // Default placeholder elegant logo if none provided
      const defaultLogoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1.5"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="%23475569" text-anchor="middle">${name.slice(0, 2)}</text></svg>`;
      const partnerLogo = logoUrl || defaultLogoSvg;

      db.prepare(`
        INSERT OR REPLACE INTO partners (id, name, engName, desc, color, siteUrl, logoUrl)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(partnerId, name, engName || "", desc || "", partnerColor, siteUrl, partnerLogo);

      res.status(200).json({ success: true, message: "파트너사가 성공적으로 반영되었습니다.", partnerId });
    } catch (err: any) {
      console.error("[PARTNER APPLY ERROR]:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/partners/delete", (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ success: false, message: "삭제할 파트너 ID 누락" });
      }

      db.prepare("DELETE FROM partners WHERE id = ?").run(id);
      res.json({ success: true, message: "파트너사가 성공적으로 삭제되었습니다." });
    } catch (err: any) {
      console.error("[PARTNER DELETE ERROR]:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Admin Raw DB Dump Endpoint for Supabase Data Integration / Replication
  app.get("/api/admin/raw-dump", (req, res) => {
    try {
      const tables = ["members", "posts", "comments", "donations", "verifications", "slides", "partners"];
      const dump: Record<string, any[]> = {};

      for (const table of tables) {
        try {
          dump[table] = db.prepare(`SELECT * FROM ${table}`).all();
        } catch (tableErr: any) {
          dump[table] = [];
          console.warn(`[Dump Warn for ${table}]:`, tableErr.message);
        }
      }

      res.json({ success: true, dump });
    } catch (err: any) {
      console.error("[RAW DUMP FETCH ERROR]:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Common check for health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", persistence: "SQLite WAL activated" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
