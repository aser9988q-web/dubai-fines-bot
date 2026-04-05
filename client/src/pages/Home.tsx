import { useState } from "react";
import { trpc } from "@/lib/trpc";
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
  Info,
  Ticket,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// CDN logos
const DUBAI_POLICE_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234476152/RPNmG5rkcSfq3Rp3WTDuVe/1000068048_62cb3c80.svg";
const FINE_BADGE_LOGO   = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234476152/RPNmG5rkcSfq3Rp3WTDuVe/1000068049_f97b8af7.svg";

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
  const [payWithInstalment, setPayWithInstalment] = useState(false);

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

  const filteredFines = result?.fines?.filter(fine => {
    if (activeTab === "all") return true;
    if (activeTab === "payable") return fine.isPaid === "unpaid";
    if (activeTab === "blackpoints") return (fine.blackPoints ?? 0) > 0;
    if (activeTab === "unpayable") return fine.isPaid === "paid";
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

  // حساب المبلغ الإجمالي للمخالفات المحددة
  const selectedTotal = Array.from(selectedFines).reduce((sum, idx) => {
    const fine = filteredFines[idx];
    if (!fine) return sum;
    const amt = parseFloat((fine.amount || "0").replace(/[^0-9.]/g, ""));
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f5f7f5", fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }}
      dir="rtl"
    >
      {/* ===== HEADER - مطابق لموقع شرطة دبي ===== */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e5e7eb" }} className="sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={DUBAI_POLICE_LOGO} alt="شرطة دبي" className="h-12 w-12 object-contain" />
          </div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span style={{ color: "#3d7a5a" }} className="font-medium">الخدمات</span>
            <span className="mx-1">/</span>
            <span style={{ color: "#3d7a5a" }} className="font-medium">الاستعلام والدفع</span>
            <span className="mx-1">/</span>
            <span className="text-gray-700 font-semibold">استعلام عن المخالفات</span>
          </div>
          {/* History button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
            style={{ color: "#3d7a5a", backgroundColor: showHistory ? "#e8f5ee" : "transparent" }}
          >
            <History className="w-4 h-4" />
            <span>الاستعلامات الأخيرة</span>
          </button>
        </div>

        {/* History dropdown */}
        {showHistory && (
          <div className="max-w-5xl mx-auto px-4 pb-3">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 max-h-60 overflow-y-auto">
              {!history || history.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">لا توجد استعلامات سابقة</p>
              ) : (
                <div className="space-y-2">
                  {history.map((q) => {
                    const statusInfo = getStatusBadge(q.status);
                    return (
                      <div
                        key={q.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setPlateSource(q.plateSource);
                          setPlateNumber(q.plateNumber);
                          setPlateCode(q.plateCode);
                          setView("form");
                          setShowHistory(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="px-3 py-1 rounded text-white text-xs font-bold"
                            style={{ backgroundColor: "#1a5c3a" }}
                            dir="ltr"
                          >
                            {q.plateSource} {q.plateNumber} {q.plateCode}
                          </div>
                        </div>
                        <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ===== FORM VIEW ===== */}
        {(view === "form" || !result) && (
          <div
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
            style={{ border: "1px solid #e8ede9" }}
          >
            {/* Card header */}
            <div className="px-6 py-5" style={{ borderBottom: "1px solid #f0f0f0" }}>
              <h1 className="text-xl font-bold text-gray-900">الاستعلام عن المخالفات</h1>
              <p className="text-gray-400 text-sm mt-1">أدخل بيانات اللوحة للاستعلام عن المخالفات من موقع شرطة دبي</p>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* الإمارة */}
                  <div className="space-y-1">
                    <Label className="text-gray-700 font-medium text-sm">
                      الإمارة <span className="text-red-500">*</span>
                    </Label>
                    <Select value={plateSource} onValueChange={setPlateSource}>
                      <SelectTrigger
                        className="bg-white text-right"
                        style={{ border: "1.5px solid #d1d5db", borderRadius: "10px" }}
                      >
                        <SelectValue placeholder="اختر الإمارة" />
                      </SelectTrigger>
                      <SelectContent>
                        {options?.plateSources.map((src) => (
                          <SelectItem key={src.value} value={src.value}>{src.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* رقم اللوحة */}
                  <div className="space-y-1">
                    <Label className="text-gray-700 font-medium text-sm">
                      رقم اللوحة <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      placeholder="مثال: 12345"
                      className="text-center font-bold text-lg"
                      style={{ border: "1.5px solid #d1d5db", borderRadius: "10px" }}
                      dir="ltr"
                    />
                  </div>

                  {/* كود اللوحة */}
                  <div className="space-y-1">
                    <Label className="text-gray-700 font-medium text-sm">
                      كود اللوحة <span className="text-red-500">*</span>
                    </Label>
                    <Select value={plateCode} onValueChange={setPlateCode}>
                      <SelectTrigger
                        className="bg-white"
                        style={{ border: "1.5px solid #d1d5db", borderRadius: "10px" }}
                      >
                        <SelectValue placeholder="اختر الكود" />
                      </SelectTrigger>
                      <SelectContent>
                        {options?.plateCodes.map((code) => (
                          <SelectItem key={code.value} value={code.value}>{code.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* معاينة اللوحة */}
                {(plateNumber || plateCode || plateSource) && (
                  <div className="flex justify-center py-2">
                    <div
                      className="inline-flex items-center gap-0 rounded-xl overflow-hidden shadow-md"
                      style={{ border: "2px solid #1a5c3a" }}
                      dir="ltr"
                    >
                      <div
                        className="px-3 py-3 text-white text-xs font-bold"
                        style={{ backgroundColor: "#1a5c3a" }}
                      >
                        {plateSource || "DXB"}
                      </div>
                      <div
                        className="px-6 py-3 font-black text-2xl tracking-widest"
                        style={{ backgroundColor: "#ffffff", color: "#111" }}
                      >
                        {plateNumber || "——"}
                      </div>
                      <div
                        className="px-3 py-3 text-white text-sm font-bold"
                        style={{ backgroundColor: "#1a5c3a" }}
                      >
                        {getPlateCodeLabel(plateCode) || "1"}
                      </div>
                    </div>
                  </div>
                )}

                {/* زر الاستعلام */}
                <button
                  type="submit"
                  disabled={queryMutation.isPending}
                  className="w-full text-white font-bold py-4 text-base rounded-xl flex items-center justify-center gap-2 transition-all"
                  style={{
                    backgroundColor: queryMutation.isPending ? "#6b9e82" : "#1a5c3a",
                    borderRadius: "12px",
                  }}
                >
                  {queryMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الاستعلام من موقع شرطة دبي...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      استعلام عن المخالفات
                    </>
                  )}
                </button>
              </form>

              {/* Loading */}
              {queryMutation.isPending && (
                <div className="mt-8 text-center py-8">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "#1a5c3a" }} />
                  <p className="text-gray-700 font-semibold">جاري الاستعلام من موقع شرطة دبي</p>
                  <p className="text-gray-400 text-sm mt-1">يتم الاتصال بالموقع الرسمي وجلب البيانات...</p>
                </div>
              )}

              {/* No fines */}
              {result && result.success && result.totalFines === 0 && (
                <div className="mt-6 text-center py-10 rounded-xl" style={{ backgroundColor: "#f0f9f4", border: "1px solid #bbf7d0" }}>
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-3" style={{ color: "#1a5c3a" }} />
                  <p className="font-bold text-xl" style={{ color: "#1a5c3a" }}>سجل نظيف!</p>
                  <p className="text-gray-500 text-sm mt-2">لا توجد أي مخالفات مرورية مسجلة على هذه اللوحة</p>
                </div>
              )}

              {/* Error */}
              {result && !result.success && (
                <div className="mt-6 rounded-xl p-5 flex items-start gap-3" style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
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

        {/* ===== RESULTS VIEW - مطابق تماماً للصورة الأصلية ===== */}
        {view === "results" && result && result.success && (result.totalFines ?? 0) > 0 && (
          <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
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
                  className="px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: activeTab === tab.key ? "#1a5c3a" : "#ffffff",
                    color: activeTab === tab.key ? "#ffffff" : "#374151",
                    border: activeTab === tab.key ? "2px solid #1a5c3a" : "2px solid #e5e7eb",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Fines list */}
            <div className="space-y-4">
              {filteredFines.length === 0 ? (
                <div
                  className="text-center py-12 rounded-2xl"
                  style={{ backgroundColor: "#ffffff", border: "1px solid #e8ede9" }}
                >
                  <Info className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-400">لا توجد مخالفات في هذه الفئة</p>
                </div>
              ) : (
                filteredFines.map((fine, index) => {
                  const isSelected = selectedFines.has(index);
                  const isPaid = fine.isPaid === "paid";
                  const isUnpaid = fine.isPaid !== "paid";

                  return (
                    <div
                      key={index}
                      className="rounded-2xl overflow-hidden transition-all"
                      style={{
                        backgroundColor: "#ffffff",
                        border: isSelected ? "2px solid #1a5c3a" : "1px solid #e8ede9",
                        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                      }}
                    >
                      {/* ===== بطاقة المخالفة - مطابقة للصورة ===== */}

                      {/* الجزء العلوي: المبلغ + الحالة + الشعار + checkbox */}
                      <div className="px-5 pt-5 pb-3 flex items-start justify-between">
                        {/* المبلغ */}
                        <div className="flex items-center gap-1">
                          <span className="text-3xl font-black text-gray-900" dir="ltr">
                            ₿ {fine.amount || "0"}
                          </span>
                        </div>

                        {/* الجانب الأيسر: حالة + شعار + checkbox */}
                        <div className="flex items-center gap-2">
                          {/* badge الحالة */}
                          <span
                            className="text-xs font-bold px-3 py-1 rounded-full"
                            style={{
                              backgroundColor: isPaid ? "#dcfce7" : "#f0fdf4",
                              color: isPaid ? "#166534" : "#15803d",
                              border: isPaid ? "1px solid #86efac" : "1px solid #86efac",
                            }}
                          >
                            {isPaid ? "مدفوعة" : fine.isPaid === "partial" ? "مدفوعة جزئياً" : "قابلة للدفع"}
                          </span>

                          {/* شعار الجهة (الأحمر) */}
                          <img
                            src={FINE_BADGE_LOGO}
                            alt="شعار"
                            className="w-9 h-9 object-contain rounded-full"
                            style={{ border: "1px solid #f3f4f6" }}
                          />

                          {/* checkbox */}
                          <button
                            onClick={() => toggleFineSelection(index)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                            style={{
                              backgroundColor: isSelected ? "#1a5c3a" : "#f3f4f6",
                              border: isSelected ? "2px solid #1a5c3a" : "2px solid #e5e7eb",
                            }}
                          >
                            {isSelected && (
                              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* تفاصيل المخالفة: المصدر، الموقع، الرقم، التاريخ */}
                      <div className="px-5 pb-3 space-y-3">
                        {/* المصدر */}
                        {fine.source && (
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800 text-sm">{fine.source}</span>
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                              <Building2 className="w-4 h-4" />
                              <span>المصدر</span>
                            </div>
                          </div>
                        )}

                        {/* الموقع */}
                        {fine.location && (
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800 text-sm text-left" dir="ltr">{fine.location}</span>
                            <div className="flex items-center gap-1 text-gray-400 text-sm shrink-0 mr-2">
                              <MapPin className="w-4 h-4" />
                              <span>الموقع</span>
                            </div>
                          </div>
                        )}

                        {/* رقم المخالفة */}
                        {fine.fineNumber && (
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800 text-sm font-mono" dir="ltr">{fine.fineNumber}</span>
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                              <Hash className="w-4 h-4" />
                              <span>رقم المخالفة</span>
                            </div>
                          </div>
                        )}

                        {/* التاريخ والوقت */}
                        {fine.fineDate && (
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800 text-sm" dir="ltr">{fine.fineDate}</span>
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                              <Calendar className="w-4 h-4" />
                              <span>التاريخ والوقت</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* قسم تفاصيل المخالفة */}
                      {fine.description && (
                        <div
                          className="mx-4 mb-4 rounded-xl p-4"
                          style={{ backgroundColor: "#f8faf8", border: "1px solid #e2ece5" }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: "#e8f5ee" }}
                            >
                              <Ticket className="w-4 h-4" style={{ color: "#1a5c3a" }} />
                            </div>
                            <span className="font-bold text-sm" style={{ color: "#1a5c3a" }}>تفاصيل المخالفة</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                              style={{ backgroundColor: "#6b7280" }}
                            >
                              <span className="text-white text-xs font-bold">i</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{fine.description}</p>
                          </div>
                        </div>
                      )}

                      {/* النقاط السوداء */}
                      {(fine.blackPoints ?? 0) > 0 && (
                        <div
                          className="mx-4 mb-4 rounded-xl p-3 flex items-center gap-2"
                          style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}
                        >
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                          <span className="text-red-700 text-sm font-semibold">{fine.blackPoints} نقطة سوداء</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* ===== الفوتر الثابت - مطابق للصورة ===== */}
            <div
              className="fixed bottom-0 left-0 right-0 z-50"
              style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e5e7eb", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}
            >
              <div className="max-w-5xl mx-auto px-4 py-3">
                {/* السطر العلوي: عدد المخالفات + الإجمالي */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span className="font-bold text-gray-900">المخالفات</span>
                    <span
                      className="font-black text-lg mx-1"
                      style={{ color: "#1a5c3a" }}
                    >
                      {result.totalFines ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span className="font-bold text-gray-900">إجمالي المبلغ</span>
                    <span className="font-black text-lg mx-1" style={{ color: "#1a5c3a" }} dir="ltr">
                      ₿ {selectedFines.size > 0 ? selectedTotal.toFixed(0) : (result.totalAmount ?? "0")}
                    </span>
                  </div>
                </div>

                {/* الأزرار: دفع + رجوع */}
                <div className="grid grid-cols-2 gap-3">
                  {/* زر الدفع */}
                  <button
                    className="py-3.5 rounded-xl text-white font-bold text-base transition-all"
                    style={{
                      backgroundColor: "#1a5c3a",
                      opacity: selectedFines.size === 0 ? 0.7 : 1,
                    }}
                    onClick={() => {
                      if (selectedFines.size === 0) {
                        toast.info("يرجى تحديد المخالفات المراد دفعها أولاً");
                      } else {
                        toast.info("خدمة الدفع الإلكتروني قريباً");
                      }
                    }}
                  >
                    دفع
                  </button>

                  {/* زر الرجوع */}
                  <button
                    className="py-3.5 rounded-xl font-bold text-base transition-all"
                    style={{
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      border: "1.5px solid #e5e7eb",
                    }}
                    onClick={() => { setView("form"); setResult(null); }}
                  >
                    رجوع
                  </button>
                </div>

                {/* خيار الدفع بالتقسيط */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setPayWithInstalment(!payWithInstalment)}
                    className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0"
                    style={{
                      borderColor: payWithInstalment ? "#1a5c3a" : "#d1d5db",
                      backgroundColor: payWithInstalment ? "#1a5c3a" : "#ffffff",
                    }}
                  >
                    {payWithInstalment && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#6b7280" }}
                    >
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    <span>الدفع بالتقسيط عبر الخصم المباشر</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spacer for fixed footer */}
            <div className="h-44" />
          </div>
        )}
      </div>
    </div>
  );
}
