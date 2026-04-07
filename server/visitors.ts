import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage, Server } from "http";

// تخزين الاتصالات النشطة
const activeConnections = new Set<WebSocket>();

// تخزين معلومات الزوار
interface VisitorInfo {
  ip: string;
  userAgent: string;
  connectedAt: number;
  page: string;
}

const visitorMap = new Map<WebSocket, VisitorInfo>();

// دالة لإرسال عدد الزوار لجميع الأدمن المتصلين
function broadcastVisitorCount() {
  const count = activeConnections.size;
  const visitors = Array.from(visitorMap.values());
  const message = JSON.stringify({ type: "visitor_count", count, visitors });
  
  adminConnections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

// اتصالات الأدمن (لوحة التحكم)
const adminConnections = new Set<WebSocket>();

export function setupVisitorTracking(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws/visitors" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || 
               req.socket.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";
    const url = new URL(req.url || "/", "http://localhost");
    const isAdmin = url.searchParams.get("admin") === "true";

    if (isAdmin) {
      // اتصال لوحة التحكم
      adminConnections.add(ws);
      
      // إرسال العدد الحالي فوراً
      ws.send(JSON.stringify({ 
        type: "visitor_count", 
        count: activeConnections.size,
        visitors: Array.from(visitorMap.values())
      }));

      ws.on("close", () => {
        adminConnections.delete(ws);
      });
    } else {
      // زائر عادي
      const visitorInfo: VisitorInfo = {
        ip,
        userAgent,
        connectedAt: Date.now(),
        page: url.searchParams.get("page") || "/",
      };
      
      activeConnections.add(ws);
      visitorMap.set(ws, visitorInfo);
      broadcastVisitorCount();

      ws.on("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === "page_update" && msg.page) {
            const info = visitorMap.get(ws);
            if (info) {
              info.page = msg.page;
              broadcastVisitorCount();
            }
          }
        } catch {}
      });

      ws.on("close", () => {
        activeConnections.delete(ws);
        visitorMap.delete(ws);
        broadcastVisitorCount();
      });

      ws.on("error", () => {
        activeConnections.delete(ws);
        visitorMap.delete(ws);
        broadcastVisitorCount();
      });
    }
  });

  // تنظيف الاتصالات المنتهية كل 30 ثانية
  setInterval(() => {
    activeConnections.forEach(ws => {
      if (ws.readyState !== WebSocket.OPEN) {
        const info = visitorMap.get(ws);
        activeConnections.delete(ws);
        visitorMap.delete(ws);
      }
    });
    broadcastVisitorCount();
  }, 30000);

  return wss;
}

export function getActiveVisitorCount(): number {
  return activeConnections.size;
}
