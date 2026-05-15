import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON middleware
  app.use(express.json());

  // API Proxy for OpenF1
  // This helps avoid CORS issues and provides a cleaner interface for the frontend
  app.use("/api/openf1", async (req, res) => {
    try {
      const targetUrl = `https://api.openf1.org/v1${req.url}`;
      const response = await fetch(targetUrl);
      if (!response.ok) {
        return res.status(response.status).json({ error: `OpenF1 API error: ${response.statusText}` });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("OpenF1 Proxy Error:", error);
      res.status(500).json({ error: "Failed to fetch from OpenF1 API" });
    }
  });

  // API Proxy for Jolpica (Ergast replacement)
  app.use("/api/jolpica", async (req, res) => {
    try {
      // Jolpica's Ergast endpoint is at /ergast/
      const targetUrl = `https://api.jolpi.ca/ergast${req.url}`;
      const response = await fetch(targetUrl);
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        return res.status(response.status).json({ error: `Jolpica API error: ${response.statusText}` });
      }

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        res.json(data);
      } else {
        const text = await response.text();
        console.error("Jolpica returned non-JSON response:", text.substring(0, 200));
        res.status(502).json({ error: "Received invalid response from Jolpica API" });
      }
    } catch (error) {
      console.error("Jolpica Proxy Error:", error);
      res.status(500).json({ error: "Failed to fetch from Jolpica API" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`F1 Live Timing Server running on http://localhost:${PORT}`);
  });
}

startServer();
