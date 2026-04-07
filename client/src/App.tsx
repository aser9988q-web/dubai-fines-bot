import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Payment from "./pages/Payment";
import AdminPanel from "./pages/AdminPanel";
import { useEffect, useRef } from "react";

// تتبع الزوار عبر WebSocket
function VisitorTracker() {
  const [location] = useLocation();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // لا تتبع صفحة الأدمن
    if (location.startsWith('/admin')) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/visitors?page=${encodeURIComponent(location)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'page_update', page: location }));
    };

    ws.onerror = () => {};

    return () => {
      ws.close();
    };
  }, [location]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/payment"} component={Payment} />
      <Route path={"/admin"} component={AdminPanel} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <VisitorTracker />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
