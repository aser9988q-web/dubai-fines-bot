import "dotenv/config";
import { runMigrations } from "./migrate";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { setupVisitorTracking } from "../visitors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Run database migrations on startup
  await runMigrations();

  const app = express();
  const server = createServer(app);

  // ===== Security Headers (Helmet) =====
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://fonts.googleapis.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        mediaSrc: ["'self'", "https://d2xsxph8kpxj0f.cloudfront.net", "blob:"],
        connectSrc: ["'self'", "wss:", "ws:", "https://d2xsxph8kpxj0f.cloudfront.net"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // ===== Rate Limiting =====
  // General API rate limit: 100 requests per 15 minutes per IP
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "طلبات كثيرة جداً، يرجى الانتظار قليلاً" },
    skip: (req) => req.path === "/api/health",
  });

  // Fines query rate limit: 10 requests per minute per IP
  const finesLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "تجاوزت الحد المسموح به للاستعلامات، يرجى الانتظار دقيقة" },
  });

  // Payment rate limit: 5 requests per minute per IP
  const paymentLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "تجاوزت الحد المسموح به لطلبات الدفع، يرجى الانتظار دقيقة" },
  });

  app.use("/api/trpc", generalLimiter);
  app.use("/api/trpc/fines.query", finesLimiter);
  app.use("/api/trpc/payment", paymentLimiter);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Health check endpoint for Railway
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  // WebSocket for visitor tracking
  setupVisitorTracking(server);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
