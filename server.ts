import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add parser middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API proxy endpoint FIRST
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

  // Common check for other API paths
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
