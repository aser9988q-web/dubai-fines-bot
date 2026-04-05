import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  History,
  Loader2,
  MapPin,
  Calendar,
  Hash,
  Building2,
  ArrowRight,
  ChevronLeft,
  Info,
} from "lucide-react";

// CDN URLs for logos
const DUBAI_POLICE_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234476152/RPNmG5rkcSfq3Rp3WTDuVe/1000068048_a156a246.svg";
const FINE_BADGE_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234476152/RPNmG5rkcSfq3Rp3WTDuVe/1000068049_5df51fd5.svg";

interface FineResult {
  fineNumber?: string;
  fineDate?: string;
  description?: string;
  amount?: string;
  blackPoints?: number;
  isPaid?: "paid" | "unpaid" | "partial";
  location?: string;
  source?: string;
}

interface QueryResult {
  success: boolean;
  queryId: number;
  fines: FineResult[];
  totalAmount?: string;
  totalFines?: number;
  errorMessage?: string;
}

type ActiveTab = "all" | "impound" | "payable" | "blackpoints" | "unpayable";

export default function Home() {
  const [plateSource, setPlateSource] = useState("DXB");
  const [plateNumber, setPlateNumber] = useState("");
  const [plateCode, setPlateCode] = useState("1");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [selectedFines, setSelectedFines] = useState<Set<number>>(new Set());
  const [view, setView] = useState<"form" | "results">("form");

  const { data: options } = trpc.fines.getOptions.useQuery();
  const { data: history, refetch: refetchHistory } = trpc.fines.getHistory.useQuery(
    { limit: 10 },
    { enabled: showHistory }
  );

  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
      setResult(data as QueryResult);
      setSelectedFines(new Set());
      setActiveTab("all");
      if (data.success && data.totalFines === 0) {
        toast.success("لا توجد مخالفات مسجلة على هذه اللوحة");
      } else if (data.success && (data.totalFines ?? 0) > 0) {
        toast.warning(`تم العثور على ${data.totalFines} مخالفة`);
        setView("results");
      } else if (!data.success) {
        toast.error(data.errorMessage || "فشل الاستعلام");
      }
      refetchHistory();
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء الاستعلام: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateSource) { toast.error("يرجى اختيار الإمارة"); return; }
    if (!plateNumber.trim()) { toast.error("يرجى إدخال رقم اللوحة"); return; }
    if (!plateCode) { toast.error("يرجى اختيار كود اللوحة"); return; }
    setResult(null);
    setView("form");
    queryMutation.mutate({ plateSource, plateNumber: plateNumber.trim(), plateCode });
  };

  const toggleFineSelection = (index: number) => {
    setSelectedFines(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectAll = () => {
    if (!result?.fines) return;
    if (selectedFines.size === result.fines.length) {
      setSelectedFines(new Set());
    } else {
      setSelectedFines(new Set(result.fines.map((_, i) => i)));
    }
  };

  const filteredFines = result?.fines?.filter(fine => {
    if (activeTab === "all") return true;
    if (activeTab === "payable") return fine.isPaid === "unpaid";
    if (activeTab === "blackpoints") return (fine.blackPoints ?? 0) > 0;
    return true;
  }) ?? [];

  const getPlateSourceLabel = (code: string) => {
    const src = options?.plateSources.find(s => s.value === code);
    return src?.label || code;
  };

  const getPlateCodeLabel = (code: string) => {
    const c = options?.plateCodes.find(c => c.value === code);
    return c?.label || code;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      success: { label: "ناجح", variant: "default" },
      failed: { label: "فشل", variant: "destructive" },
      no_fines: { label: "لا مخالفات", variant: "secondary" },
      pending: { label: "جاري...", variant: "outline" },
    };
    return map[status] || { label: status, variant: "outline" };
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0f4f2", fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }} dir="rtl">

      {/* ===== HEADER ===== */}
      <header style={{ backgroundColor: "#1a5c3a" }} className="shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={DUBAI_POLICE_LOGO} alt="شرطة دبي" className="h-12 w-12 object-contain" />
            <div>
              <p className="text-white font-bold text-lg leading-tight">شرطة دبي</p>
              <p className="text-green-200 text-xs">DUBAI POLICE</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <span>الخدمات</span>
            <ChevronLeft className="w-4 h-4" />
            <span>الاستعلام والدفع</span>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-white font-semibold">استعلام عن المخالفات</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">

        {/* ===== SIDEBAR ===== */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div style={{ backgroundColor: "#1a5c3a" }} className="px-4 py-3">
              <p className="text-white font-semibold text-sm">الخدمات</p>
            </div>
            <nav className="p-2">
              {[
                { label: "الاستعلامات والمتابعة", active: true },
                { label: "التقارير الجنائية والشكاوى", active: false },
                { label: "التصاريح والشهادات", active: false },
                { label: "خدمات المرور", active: false },
                { label: "الأعمال والشركات", active: false },
                { label: "المشاركة المجتمعية", active: false },
                { label: "الطوارئ والاستجابة", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                    item.active
                      ? "text-white font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={item.active ? { backgroundColor: "#2e7d52" } : {}}
                >
                  {item.label}
                </div>
              ))}
            </nav>
          </div>

          {/* History */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-4">
            <button
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              onClick={() => setShowHistory(!showHistory)}
            >
              <span className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                <History className="w-4 h-4" style={{ color: "#1a5c3a" }} />
                الاستعلامات الأخيرة
              </span>
              <span className="text-xs" style={{ color: "#1a5c3a" }}>{showHistory ? "إخفاء" : "عرض"}</span>
            </button>
            {showHistory && (
              <div className="px-3 pb-3 space-y-2">
                {!history || history.length === 0 ? (
                  <p className="text-gray-400 text-xs text-center py-3">لا توجد استعلامات سابقة</p>
                ) : (
                  history.map((q) => {
                    const statusInfo = getStatusBadge(q.status);
                    return (
                      <div
                        key={q.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => {
                          setPlateSource(q.plateSource);
                          setPlateNumber(q.plateNumber);
                          setPlateCode(q.plateCode);
                          setView("form");
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate" dir="ltr">
                            {q.plateCode} {q.plateNumber}
                          </p>
                          <p className="text-xs text-gray-400">{q.plateSource}</p>
                        </div>
                        <Badge variant={statusInfo.variant} className="text-xs shrink-0">
                          {statusInfo.label}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 min-w-0">

          {/* ===== FORM VIEW ===== */}
          {(view === "form" || !result) && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Page title */}
              <div className="px-6 py-5 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900">الاستعلام عن المخالفات</h1>
                <p className="text-gray-500 text-sm mt-1">
                  خدمة الاستعلام عن المخالفات المرورية وسدادها
                </p>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* الإمارة */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold text-sm">
                        الإمارة <span className="text-red-500">*</span>
                      </Label>
                      <Select value={plateSource} onValueChange={setPlateSource}>
                        <SelectTrigger className="bg-white border-gray-200 focus:border-green-500 focus:ring-green-500/20">
                          <SelectValue placeholder="اختر الإمارة" />
                        </SelectTrigger>
                        <SelectContent>
                          {options?.plateSources.map((src) => (
                            <SelectItem key={src.value} value={src.value}>
                              {src.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* رقم اللوحة */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold text-sm">
                        رقم اللوحة <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        placeholder="مثال: 12345"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        className="bg-white border-gray-200 text-center font-bold text-lg tracking-widest focus:border-green-500 focus:ring-green-500/20"
                        maxLength={10}
                        dir="ltr"
                      />
                    </div>

                    {/* كود اللوحة */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold text-sm">
                        كود اللوحة <span className="text-red-500">*</span>
                      </Label>
                      <Select value={plateCode} onValueChange={setPlateCode}>
                        <SelectTrigger className="bg-white border-gray-200 focus:border-green-500 focus:ring-green-500/20">
                          <SelectValue placeholder="اختر الكود" />
                        </SelectTrigger>
                        <SelectContent>
                          {options?.plateCodes.map((code) => (
                            <SelectItem key={code.value} value={code.value}>
                              {code.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* معاينة اللوحة */}
                  {(plateNumber || plateCode || plateSource) && (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 mb-3">معاينة اللوحة</p>
                      <div
                        className="inline-flex items-center gap-3 rounded-xl px-8 py-4 shadow-md"
                        style={{ backgroundColor: "#1a5c3a" }}
                      >
                        <span className="text-white/70 text-sm font-bold">{plateSource || "—"}</span>
                        <div className="w-px h-8 bg-white/30" />
                        <span className="text-white font-black text-3xl tracking-widest" dir="ltr">
                          {plateNumber || "——"}
                        </span>
                        <div className="w-px h-8 bg-white/30" />
                        <span className="text-white font-bold text-xl">{getPlateCodeLabel(plateCode) || "—"}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full text-white font-bold py-4 text-base rounded-xl transition-all"
                    style={{ backgroundColor: "#1a5c3a" }}
                    disabled={queryMutation.isPending}
                  >
                    {queryMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        جاري الاستعلام من موقع شرطة دبي...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 ml-2" />
                        استعلام عن المخالفات
                      </>
                    )}
                  </Button>
                </form>

                {/* Loading state */}
                {queryMutation.isPending && (
                  <div className="mt-8 text-center py-8">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "#1a5c3a" }} />
                    <p className="text-gray-700 font-semibold">جاري الاستعلام من موقع شرطة دبي</p>
                    <p className="text-gray-400 text-sm mt-2">يتم الاتصال بالموقع الرسمي وجلب البيانات...</p>
                  </div>
                )}

                {/* No fines result */}
                {result && result.success && result.totalFines === 0 && (
                  <div className="mt-6 text-center py-10 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
                    <p className="text-green-700 font-bold text-xl">سجل نظيف!</p>
                    <p className="text-gray-500 text-sm mt-2">لا توجد أي مخالفات مرورية مسجلة على هذه اللوحة</p>
                  </div>
                )}

                {/* Error result */}
                {result && !result.success && (
                  <div className="mt-6 bg-red-50 rounded-xl border border-red-200 p-5 flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-700 font-bold">فشل الاستعلام</p>
                      <p className="text-red-500 text-sm mt-1">{result.errorMessage}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== RESULTS VIEW (مطابق للموقع الأصلي) ===== */}
          {view === "results" && result && result.success && (result.totalFines ?? 0) > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">

              {/* Results header */}
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">مراجعة المخالفات</h1>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gray-500 text-sm">رقم اللوحة:</span>
                      <div
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-white text-sm font-bold"
                        style={{ backgroundColor: "#1a5c3a" }}
                        dir="ltr"
                      >
                        <span>{getPlateSourceLabel(plateSource)}</span>
                        <span>{plateNumber}</span>
                        <span>{getPlateCodeLabel(plateCode)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAll}
                      className="text-sm border-gray-200"
                    >
                      {selectedFines.size === (result.fines?.length ?? 0) ? "إلغاء التحديد" : "تحديد الكل"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-sm border-gray-200"
                    >
                      طلب قائمة المخالفات
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-6 pt-4 flex gap-2 overflow-x-auto">
                {[
                  { key: "all", label: "الكل" },
                  { key: "impound", label: "الحجز" },
                  { key: "payable", label: "قابلة للدفع" },
                  { key: "blackpoints", label: "النقاط السوداء" },
                  { key: "unpayable", label: "غير قابلة للدفع" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as ActiveTab)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                      activeTab === tab.key
                        ? "text-white border-transparent"
                        : "text-gray-600 border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                    style={activeTab === tab.key ? { backgroundColor: "#1a5c3a", borderColor: "#1a5c3a" } : {}}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Fines list */}
              <div className="p-6 space-y-4">
                {filteredFines.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Info className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>لا توجد مخالفات في هذه الفئة</p>
                  </div>
                ) : (
                  filteredFines.map((fine, index) => (
                    <div
                      key={index}
                      className={`rounded-xl border-2 transition-all ${
                        selectedFines.has(index) ? "border-green-400 bg-green-50/30" : "border-gray-100 bg-white"
                      } shadow-sm overflow-hidden`}
                    >
                      {/* Fine card header */}
                      <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedFines.has(index)}
                            onChange={() => toggleFineSelection(index)}
                            className="w-4 h-4 rounded accent-green-600"
                          />
                          {/* Red badge logo */}
                          <img
                            src={FINE_BADGE_LOGO}
                            alt="مخالفة"
                            className="w-8 h-8 object-contain"
                          />
                          <span
                            className="text-xs font-bold px-2 py-1 rounded-full text-white"
                            style={{
                              backgroundColor:
                                fine.isPaid === "paid" ? "#16a34a" :
                                fine.isPaid === "partial" ? "#d97706" : "#dc2626"
                            }}
                          >
                            {fine.isPaid === "paid" ? "مدفوعة" : fine.isPaid === "partial" ? "مدفوعة جزئياً" : "قابلة للدفع"}
                          </span>
                        </div>
                        <div className="text-left" dir="ltr">
                          <span className="text-2xl font-black text-gray-900">
                            ₿ {fine.amount || "0"}
                          </span>
                        </div>
                      </div>

                      {/* Fine card body */}
                      <div className="px-5 py-4 grid grid-cols-2 gap-3">
                        {fine.source && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="w-4 h-4 shrink-0" style={{ color: "#1a5c3a" }} />
                            <span className="font-medium text-gray-500">المصدر:</span>
                            <span className="font-semibold text-gray-800">{fine.source}</span>
                          </div>
                        )}
                        {fine.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 shrink-0" style={{ color: "#1a5c3a" }} />
                            <span className="font-medium text-gray-500">الموقع:</span>
                            <span className="font-semibold text-gray-800 truncate">{fine.location}</span>
                          </div>
                        )}
                        {fine.fineNumber && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Hash className="w-4 h-4 shrink-0" style={{ color: "#1a5c3a" }} />
                            <span className="font-medium text-gray-500">رقم التذكرة:</span>
                            <span className="font-semibold text-gray-800 font-mono">{fine.fineNumber}</span>
                          </div>
                        )}
                        {fine.fineDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 shrink-0" style={{ color: "#1a5c3a" }} />
                            <span className="font-medium text-gray-500">التاريخ والوقت:</span>
                            <span className="font-semibold text-gray-800">{fine.fineDate}</span>
                          </div>
                        )}
                      </div>

                      {/* Fine details section */}
                      {fine.description && (
                        <div
                          className="mx-5 mb-4 rounded-xl p-4"
                          style={{ backgroundColor: "#f0f9f4", border: "1px solid #bbf7d0" }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: "#1a5c3a" }}
                            >
                              <span className="text-white text-xs font-bold">!</span>
                            </div>
                            <span className="font-bold text-sm" style={{ color: "#1a5c3a" }}>تفاصيل المخالفة</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                            <p className="text-sm text-gray-700">{fine.description}</p>
                          </div>
                        </div>
                      )}

                      {/* Black points */}
                      {(fine.blackPoints ?? 0) > 0 && (
                        <div className="mx-5 mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                          <span className="text-red-700 text-sm font-semibold">
                            {fine.blackPoints} نقطة سوداء
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer summary */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-gray-500 text-sm">عدد المخالفات</span>
                      <span className="font-bold text-gray-900 text-lg mr-2">{result.totalFines ?? 0}</span>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div>
                      <span className="text-gray-500 text-sm">الإجمالي</span>
                      <span className="font-black text-xl mr-2" style={{ color: "#1a5c3a" }}>
                        ₿ {result.totalAmount ?? "0"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => { setView("form"); setResult(null); }}
                      className="border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                      <ArrowRight className="w-4 h-4 ml-1" />
                      رجوع
                    </Button>
                    <Button
                      disabled={selectedFines.size === 0}
                      className="text-white font-bold"
                      style={{ backgroundColor: selectedFines.size > 0 ? "#1a5c3a" : "#9ca3af" }}
                      onClick={() => toast.info("خدمة الدفع الإلكتروني قريباً")}
                    >
                      دفع المخالفات المحددة
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===== FOOTER ===== */}
      <footer style={{ backgroundColor: "#1a5c3a" }} className="mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src={DUBAI_POLICE_LOGO} alt="شرطة دبي" className="h-8 w-8 object-contain" />
            <p className="text-white font-semibold">شرطة دبي — خدمة الاستعلام عن المخالفات المرورية</p>
          </div>
          <p className="text-green-300 text-xs">للأغراض التعليمية فقط · البيانات من الموقع الرسمي لشرطة دبي</p>
        </div>
      </footer>
    </div>
  );
}
