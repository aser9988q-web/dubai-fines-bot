import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPin,
  Calendar,
  Hash,
  Building2,
  Info,
  Ticket,
  Menu,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ===== ASSETS =====
const DUBAI_POLICE_LOGO = "/dubai-police-logo.svg";
const FINE_BADGE_LOGO   = "/fine-badge-logo.svg";
const CAR_VIDEO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234476152/RPNmG5rkcSfq3Rp3WTDuVe/car_animation_2512fc32.mp4";

// ===== PLATE SOURCES =====
const ALL_PLATE_SOURCES = [
  { value: "DXB",  label: "دبي",         labelEn: "Dubai" },
  { value: "AUH",  label: "أبوظبي",      labelEn: "Abu Dhabi" },
  { value: "SHJ",  label: "الشارقة",     labelEn: "Sharjah" },
  { value: "AJM",  label: "عجمان",       labelEn: "Ajman" },
  { value: "UMQ",  label: "أم القيوين",  labelEn: "Umm Al Quwain" },
  { value: "RAK",  label: "رأس الخيمة", labelEn: "Ras Al Khaimah" },
  { value: "FUJ",  label: "الفجيرة",    labelEn: "Fujairah" },
  { value: "OMN",  label: "عُمان",       labelEn: "Oman" },
  { value: "QAT",  label: "قطر",         labelEn: "Qatar" },
  { value: "KWT",  label: "الكويت",      labelEn: "Kuwait" },
  { value: "BAH",  label: "البحرين",     labelEn: "Bahrain" },
  { value: "KSA",  label: "السعودية",    labelEn: "Saudi Arabia" },
];

// ===== PLATE CODES =====
const PLATE_CODES_BY_SOURCE: Record<string, string[]> = {
  DXB: ["Motorcycle","Motorcycle2","Motorcycle3","Motorcycle9","A","B","C","D","E","F","H","G","I","J","K","L","M","N","O","R","T","Z","S","Q","U","V","W","X","Y","ابيض","P","BB","AA","CC","DD","NN","HH","EE","MM","FF","II","Taxi","PublicTransportation","Public Transportation 1","Trade","Export","Export 2","Export 3","Export 4","Export 5","Export 6","Export 7","Export 8","Export 9","Consulate","Political association","International Organization","Accommodation","Government","PrivateTransportation","Data Migration","EntertainmentMotorcycle","Trailer","Classical","Import","Learning","DubaiPolice","Dubai Flag","EXPO 1","EXPO 2","EXPO 3","EXPO 4","EXPO 5","EXPO 6","EXPO 7","SelfDrivingVehicle"],
  AUH: ["White","Red","Motorcycle4","1","15","Blue","Green","Gray","5","6","11","10","4","7","8","9","12","13","14","16","2","17","50","18","20","19","21","22","Yellow","Green1","TradeWhite","Trade","Export","Consulate","Diplomat","International Organization","Accommodation","Government","Custom","Probation","Orange","Protocol","RED"],
  SHJ: ["Motorcycle","Classic","13","White","Orange","1","2","3","4","Green","PublicTransportation2","PublicTransportation1","Trade","Export","Export4","Export - 5","Police","Trailer"],
  AJM: ["Motorcycle","A","B","C","D","E","H","F","K","Classic","Green","Probation","Export","Trailer"],
  UMQ: ["Motorcycle","A","B","White","G","X","I","D","H","C","K","F","J","E","L","M","N","Green","Probation","Export","Government Green","Government","Learning"],
  RAK: ["Motorcycle","4","Motorcycle1","N","White","A","C","D","I","V","Y","M","RAK-Tower","K","S","B","X","Z","G","U","P","WhiteGreen","Green","Probation","Export","Government","GovernmentWhite","Local Guard","Hospitality","Hospitality Blue","Municipality","Police","Works"],
  FUJ: ["Motorcycle","F","M","P","R","S","T","White","A","B","C","D","E","G","K","X","I","V","L","Z","H","O","N","J","U","Y","Green","Probation","Export","Government"],
  OMN: ["PRIVATE - Yellow","Motor Bike - Yellow","GOVERNMENT - white","INTL.ORGANIZATION - white","CONSULAR - white","COMMERCIAL - Red","EXPORT - BLUE","DIPLOMATIC - white"],
  QAT: ["Private - White","Privet Transport - BLACK","Motor bike - White","PUBLIC TRANSPORT - RED","EXPORT - YELLOW","TRAILER - GREEN"],
  KWT: ["Private - 1","Private - 2","Private - 3","Private - 4","Private - 5","Private - 6","Private - 7","Private - 8","Private - 9","Private - 10","Private - 11","Private - 12","Private - 13","Private - 14","Private - 15","Private - 16","Private - 17","Private - 18","Private - 19","Private - 20"],
  BAH: ["Private - White","Private transport - Orange","Public Transport - Yellow","MotorCycle - White","Royal Court - RED","DIPLOMATIC - GREEN"],
  KSA: ["Private - White","Public Transport - Yellow","Motor Bike - White","PRIVATE TRANSPORT - BLUE","DIPLOMATIC - GREEN","EXPORT - GRAY","TEMPORARY - BLACK","CONSULAR - GREEN"],
};

// ===== KSA LETTER CODES =====
const KSA_LETTER_CODES = [
  { value: "أ", label: "أ - A" },
  { value: "ب", label: "ب - B" },
  { value: "ح", label: "ح - J" },
  { value: "د", label: "د - D" },
  { value: "ر", label: "ر - R" },
  { value: "س", label: "س - S" },
  { value: "ص", label: "ص - X" },
  { value: "ط", label: "ط - T" },
  { value: "ع", label: "ع - E" },
  { value: "ق", label: "ق - G" },
  { value: "ك", label: "ك - K" },
  { value: "ل", label: "ل - L" },
  { value: "م", label: "م - Z" },
  { value: "ن", label: "ن - N" },
  { value: "ه", label: "ه - H" },
  { value: "و", label: "و - U" },
  { value: "ى", label: "ى - V" },
];

type SearchTab = "plate" | "licence" | "tcnumber";
type ViewMode = "form" | "results";

interface FineResult {
  ticketNo: string;
  amount: string;
  location: string;
  source: string;
  description: string;
  dateTime: string;
  status: string;
  isPaid: boolean;
}

interface QueryResult {
  success: boolean;
  fines: FineResult[];
  errorMessage?: string;
  ownerName?: string;
}

interface QueryHistory {
  id: number;
  plateSource: string;
  plateNumber: string;
  plateCode: string;
  status: string;
  createdAt: Date;
}

export default function Home() {
  const [view, setView] = useState<ViewMode>("form");
  const [searchTab, setSearchTab] = useState<SearchTab>("plate");
  const [plateSource, setPlateSource] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [plateCode, setPlateCode] = useState("");
  const [ksaLetter1, setKsaLetter1] = useState("");
  const [ksaLetter2, setKsaLetter2] = useState("");
  const [ksaLetter3, setKsaLetter3] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFines, setSelectedFines] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState<"all" | "payable" | "seized">("all");
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: history } = trpc.fines.getHistory.useQuery(undefined, { retry: false });

  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
      setResult(data as QueryResult);
      setView("results");
      setSelectedFines(new Set());
    },
    onError: (err) => {
      toast.error("فشل الاستعلام: " + err.message);
    },
  });

  // Video: play once and freeze on last frame
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleEnded = () => {
      video.pause();
    };
    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, []);

  const handleQuery = () => {
    if (!plateSource) {
      toast.error("يرجى اختيار جهة إصدار اللوحة");
      return;
    }
    if (!plateNumber.trim()) {
      toast.error("يرجى إدخال رقم اللوحة");
      return;
    }
    const finalPlateCode = plateSource === "KSA"
      ? [ksaLetter1, ksaLetter2, ksaLetter3].filter(Boolean).join("")
      : plateCode;
    queryMutation.mutate({ plateSource, plateNumber: plateNumber.trim(), plateCode: finalPlateCode });
  };

  const currentPlateCodes = plateSource ? (PLATE_CODES_BY_SOURCE[plateSource] || []) : [];

  const filteredFines = (result?.fines || []).filter((fine) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "payable") return !fine.isPaid && fine.status !== "seized";
    if (filterStatus === "seized") return fine.status === "seized";
    return true;
  });

  const selectedTotal = Array.from(selectedFines).reduce((sum, idx) => {
    const fine = filteredFines[idx];
    if (!fine) return sum;
    const amt = parseFloat((fine.amount || "0").replace(/[^0-9.]/g, ""));
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      payable: { label: "قابل للدفع", variant: "default" },
      paid: { label: "مدفوع", variant: "secondary" },
      seized: { label: "حجز", variant: "destructive" },
      blackpoints: { label: "نقاط سوداء", variant: "outline" },
    };
    return map[status] || { label: status, variant: "outline" };
  };

  const searchTabs = [
    { key: "plate" as SearchTab,    labelAr: "اللوحة",       icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="10" rx="2"/>
        <line x1="6" y1="7" x2="6" y2="17"/>
        <line x1="18" y1="7" x2="18" y2="17"/>
      </svg>
    )},
    { key: "licence" as SearchTab,  labelAr: "الرخصة",       icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="18" rx="2"/>
        <line x1="7" y1="8" x2="17" y2="8"/>
        <line x1="7" y1="12" x2="17" y2="12"/>
        <line x1="7" y1="16" x2="13" y2="16"/>
      </svg>
    )},
    { key: "tcnumber" as SearchTab, labelAr: "الملف المروري", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    )},
  ];

  // ===== RESULTS VIEW =====
  if (view === "results" && result) {
    const payableFines = filteredFines.filter(f => !f.isPaid);
    const payableCount = payableFines.length;

    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "#f0f4f2", fontFamily: "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif" }}
        dir="rtl"
      >
        {/* Header */}
        <header style={{ backgroundColor: "#ffffff" }} className="sticky top-0 z-50">
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Right: logo */}
            <img src={DUBAI_POLICE_LOGO} alt="شرطة دبي" className="h-12 w-12 object-contain" />
            {/* Left: info + menu buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-semibold"
                style={{ backgroundColor: "#f5f5f5", border: "1px solid #e5e7eb", color: "#374151" }}
              >
                ⓘ
              </button>
              <button
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#f5f5f5", border: "1px solid #e5e7eb" }}
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {showHistory && (
            <div className="px-4 pb-3">
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 max-h-60 overflow-y-auto">
                {!history || history.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">لا توجد استعلامات سابقة</p>
                ) : (
                  <div className="space-y-2">
                    {(history as QueryHistory[]).map((q) => (
                      <div
                        key={q.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setPlateSource(q.plateSource);
                          setPlateNumber(q.plateNumber);
                          setPlateCode(q.plateCode);
                          setView("form");
                          setShowHistory(false);
                        }}
                      >
                        <div className="px-2 py-1 rounded text-white text-xs font-bold" style={{ backgroundColor: "#008755" }} dir="ltr">
                          {q.plateSource} {q.plateNumber} {q.plateCode}
                        </div>
                        <Badge variant={getStatusBadge(q.status).variant} className="text-xs">
                          {getStatusBadge(q.status).label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        <div className="px-4 py-4 space-y-3 max-w-lg mx-auto">
          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { key: "all", label: "الكل" },
              { key: "payable", label: "قابل للدفع" },
              { key: "seized", label: "الحجز" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key as typeof filterStatus)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                style={{
                  backgroundColor: filterStatus === f.key ? "#ffffff" : "#e8ede9",
                  color: filterStatus === f.key ? "#008755" : "#6b7280",
                  border: filterStatus === f.key ? "1.5px solid #008755" : "1.5px solid transparent",
                  boxShadow: filterStatus === f.key ? "0 1px 4px rgba(0,135,85,0.15)" : "none",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {!result.success && (
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: "#fff3f3", border: "1px solid #fecaca" }}>
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{result.errorMessage || "لم يتم العثور على مخالفات"}</p>
            </div>
          )}

          {/* No fines */}
          {result.success && filteredFines.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12">
              <CheckCircle2 className="w-16 h-16" style={{ color: "#008755" }} />
              <p className="text-lg font-bold text-gray-700">سجل نظيف</p>
              <p className="text-sm text-gray-400">لا توجد مخالفات مرورية مسجلة</p>
            </div>
          )}

          {/* Fine cards */}
          {filteredFines.map((fine, idx) => {
            const isSelected = selectedFines.has(idx);
            const amt = parseFloat((fine.amount || "0").replace(/[^0-9.]/g, ""));
            return (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: "#ffffff",
                  border: isSelected ? "2px solid #008755" : "1px solid #e8ede9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                {/* Card top row */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900">₿ {isNaN(amt) ? fine.amount : amt.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ backgroundColor: fine.isPaid ? "#e8f5ee" : "#fff3e0", color: fine.isPaid ? "#008755" : "#f57c00" }}
                    >
                      {fine.isPaid ? "مدفوع" : "قابل للدفع"}
                    </span>
                    <img src={FINE_BADGE_LOGO} alt="" className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        const next = new Set(selectedFines);
                        if (isSelected) next.delete(idx); else next.add(idx);
                        setSelectedFines(next);
                      }}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: "#008755" }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #f0f0f0" }} className="mx-4" />

                {/* Details */}
                <div className="px-4 py-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Building2 className="w-4 h-4" style={{ color: "#008755" }} />
                      <span className="text-sm">المصدر</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{fine.source || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="w-4 h-4" style={{ color: "#008755" }} />
                      <span className="text-sm">الموقع</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 text-left max-w-[55%] truncate" dir="rtl">
                      {fine.location || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Hash className="w-4 h-4" style={{ color: "#008755" }} />
                      <span className="text-sm">رقم المخالفة</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800" dir="ltr">{fine.ticketNo || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-4 h-4" style={{ color: "#008755" }} />
                      <span className="text-sm">التاريخ والوقت</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800" dir="ltr">{fine.dateTime || "—"}</span>
                  </div>
                </div>

                {fine.description && (
                  <>
                    <div style={{ borderTop: "1px solid #f0f0f0" }} className="mx-4" />
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Ticket className="w-4 h-4" style={{ color: "#008755" }} />
                        <span className="text-sm font-bold" style={{ color: "#008755" }}>تفاصيل المخالفة</span>
                      </div>
                      <div className="flex items-start gap-2 justify-center">
                        <p className="text-sm text-gray-700 text-center">{fine.description}</p>
                        <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Bottom summary bar */}
          <div
            className="rounded-2xl overflow-hidden mt-4"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e8ede9", boxShadow: "0 -2px 12px rgba(0,0,0,0.08)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="text-center flex-1">
                <p className="text-xs text-gray-500">المخالفات</p>
                <p className="text-lg font-black text-gray-900">{payableCount}</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center flex-1">
                <p className="text-xs text-gray-500">إجمالي المبلغ</p>
                <p className="text-lg font-black text-gray-900">₿ {selectedTotal > 0 ? selectedTotal.toFixed(0) : "0"}</p>
              </div>
            </div>
            <div className="flex gap-3 p-3">
              <button
                onClick={() => { setView("form"); setResult(null); setSelectedFines(new Set()); }}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: "#f0f4f2", color: "#374151", border: "1px solid #e5e7eb" }}
              >
                <span>رجوع</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                disabled={selectedFines.size === 0}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{ backgroundColor: selectedFines.size > 0 ? "#008755" : "#9ca3af" }}
                onClick={() => toast.info("سيتم تفعيل الدفع قريباً")}
              >
                دفع
              </button>
            </div>
            <div className="flex items-center gap-2 px-4 pb-3">
              <input type="checkbox" className="w-4 h-4" style={{ accentColor: "#008755" }} />
              <span className="text-xs text-gray-500">الدفع بالتقسيط عبر الخصم المباشر</span>
            </div>
          </div>

          <div className="h-4" />
        </div>
      </div>
    );
  }

  // ===== FORM VIEW - مطابق 100% للموقع الأصلي =====
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f0f4f2", fontFamily: "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif" }}
      dir="rtl"
    >
      {/* ===== HEADER - مطابق للأصلي تماماً ===== */}
      <header style={{ backgroundColor: "#ffffff" }} className="sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Right: logo */}
          <img src={DUBAI_POLICE_LOGO} alt="شرطة دبي" className="h-12 w-12 object-contain" />
          {/* Left: info + menu buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-semibold"
              style={{ backgroundColor: "#f5f5f5", border: "1px solid #e5e7eb", color: "#374151" }}
            >
              ⓘ
            </button>
            <button
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#f5f5f5", border: "1px solid #e5e7eb" }}
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Breadcrumb row - "الاستعلام والدفع" with arrow */}
        <div className="px-4 pb-2 flex items-center justify-end gap-2 text-sm">
          <span className="font-semibold text-gray-700 text-base">الاستعلام والدفع</span>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#f5f5f5", border: "1px solid #e5e7eb" }}
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* History dropdown */}
        {showHistory && (
          <div className="px-4 pb-3">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 max-h-60 overflow-y-auto">
              {!history || history.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">لا توجد استعلامات سابقة</p>
              ) : (
                <div className="space-y-2">
                  {(history as QueryHistory[]).map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setPlateSource(q.plateSource);
                        setPlateNumber(q.plateNumber);
                        setPlateCode(q.plateCode);
                        setShowHistory(false);
                      }}
                    >
                      <div className="px-2 py-1 rounded text-white text-xs font-bold" style={{ backgroundColor: "#008755" }} dir="ltr">
                        {q.plateSource} {q.plateNumber} {q.plateCode}
                      </div>
                      <Badge variant={getStatusBadge(q.status).variant} className="text-xs">
                        {getStatusBadge(q.status).label}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ===== SEARCH TABS - مطابق للأصلي ===== */}
      <div style={{ backgroundColor: "#f0f4f2" }} className="px-3 pt-3 pb-0">
        <div className="flex items-center gap-1 overflow-x-auto">
          {searchTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSearchTab(tab.key)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap"
              style={{
                backgroundColor: searchTab === tab.key ? "#ffffff" : "transparent",
                color: searchTab === tab.key ? "#008755" : "#6b7280",
                boxShadow: searchTab === tab.key ? "0 2px 8px rgba(0,0,0,0.10)" : "none",
              }}
            >
              <span style={{ color: searchTab === tab.key ? "#008755" : "#9ca3af" }}>{tab.icon}</span>
              <span>{tab.labelAr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== VIDEO HERO - عرض كامل مطابق للأصلي ===== */}
      {/* الفيديو أبعاده 870×1892 - نعرض الجزء الأوسط (مقدمة السيارة) بنفس طريقة الموقع الأصلي */}
      <div
        className="w-full overflow-hidden"
        style={{ height: "280px", backgroundColor: "#e8e8e8", lineHeight: 0, position: "relative" }}
      >
        <video
          ref={videoRef}
          src={CAR_VIDEO_URL}
          autoPlay
          muted
          playsInline
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            height: "auto",
            minHeight: "100%",
            objectFit: "cover",
            objectPosition: "center 45%",
            display: "block",
          }}
          onEnded={(e) => {
            const video = e.currentTarget;
            video.pause();
          }}
        />
      </div>

      {/* ===== FORM CARD - مطابق للأصلي ===== */}
      <div className="px-4 pt-4 pb-2 max-w-lg mx-auto">
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ backgroundColor: "#ffffff", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
        >
          {/* جهة إصدار اللوحة */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block text-right">جهة إصدار اللوحة</label>
            <div className="relative">
              <select
                value={plateSource}
                onChange={(e) => {
                  setPlateSource(e.target.value);
                  const codes = PLATE_CODES_BY_SOURCE[e.target.value] || [];
                  setPlateCode(codes[0] || "");
                }}
                className="w-full text-sm rounded-xl px-4 py-4 appearance-none focus:outline-none"
                style={{
                  backgroundColor: "#f8faf9",
                  border: plateSource ? "2px solid #008755" : "1.5px solid #d1d5db",
                  color: plateSource ? "#111827" : "#9ca3af",
                  fontWeight: plateSource ? "600" : "400",
                }}
              >
                <option value="" disabled>اختر</option>
                {ALL_PLATE_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-gray-500 text-sm">▼</span>
              </div>
            </div>
          </div>

          {/* رقم اللوحة */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block text-right">رقم اللوحة</label>
            <input
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="رقم اللوحة"
              onKeyDown={(e) => e.key === "Enter" && handleQuery()}
              className="w-full text-sm rounded-xl px-4 py-4 focus:outline-none"
              style={{
                backgroundColor: "#f8faf9",
                border: "1.5px solid #d1d5db",
                color: "#111827",
                textAlign: "right",
              }}
              dir="ltr"
            />
          </div>

          {/* رمز اللوحة - للسعودية: نوع اللوحة + 3 حروف */}
          {plateSource === "KSA" ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block text-right">رمز اللوحة</label>
                <div className="relative">
                  <select
                    value={plateCode}
                    onChange={(e) => setPlateCode(e.target.value)}
                    className="w-full text-sm rounded-xl px-4 py-4 appearance-none focus:outline-none"
                    style={{ backgroundColor: "#f8faf9", border: "1.5px solid #d1d5db", color: plateCode ? "#111827" : "#9ca3af" }}
                    dir="ltr"
                  >
                    <option value="">اختر</option>
                    {PLATE_CODES_BY_SOURCE.KSA.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><span className="text-gray-500 text-sm">▼</span></div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { value: ksaLetter1, setter: setKsaLetter1, label: "رمز اللوحة 1" },
                  { value: ksaLetter2, setter: setKsaLetter2, label: "رمز اللوحة 2" },
                  { value: ksaLetter3, setter: setKsaLetter3, label: "رمز اللوحة 3" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 block text-right">{item.label}</label>
                    <div className="relative">
                      <select
                        value={item.value}
                        onChange={(e) => item.setter(e.target.value)}
                        className="w-full text-sm rounded-xl px-4 py-4 appearance-none focus:outline-none"
                        style={{ backgroundColor: "#f8faf9", border: "1.5px solid #d1d5db", color: item.value ? "#111827" : "#9ca3af", fontWeight: item.value ? "600" : "400" }}
                        dir="rtl"
                      >
                        <option value="">اختر</option>
                        {KSA_LETTER_CODES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><span className="text-gray-500 text-sm">▼</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block text-right">رمز اللوحة</label>
              <div className="relative">
                <select
                  value={plateCode}
                  onChange={(e) => setPlateCode(e.target.value)}
                  disabled={!plateSource}
                  className="w-full text-sm rounded-xl px-4 py-4 appearance-none focus:outline-none"
                  style={{
                    backgroundColor: plateSource ? "#f8faf9" : "#f3f4f6",
                    border: "1.5px solid #d1d5db",
                    color: plateCode ? "#111827" : "#9ca3af",
                    fontWeight: plateCode ? "600" : "400",
                    cursor: plateSource ? "pointer" : "not-allowed",
                  }}
                  dir="ltr"
                >
                  <option value="">اختر</option>
                  {currentPlateCodes.map((code) => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-gray-500 text-sm">▼</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== BUTTONS - مطابق للأصلي ===== */}
      <div className="px-4 pt-4 pb-8 space-y-3 max-w-lg mx-auto">
        {/* زر التحقق من المخالفات - أخضر */}
        <button
          onClick={handleQuery}
          disabled={queryMutation.isPending}
          className="w-full py-4 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-3 transition-all"
          style={{ backgroundColor: "#008755", boxShadow: "0 4px 12px rgba(0,135,85,0.3)" }}
        >
          {queryMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري الاستعلام...</span>
            </>
          ) : (
            <>
              <ArrowLeft className="w-5 h-5" />
              <span>التحقق من المخالفات</span>
            </>
          )}
        </button>

        {/* زر رجوع - أبيض */}
        <button
          onClick={() => {
            setPlateNumber("");
            setPlateCode("");
            setPlateSource("");
            setKsaLetter1("");
            setKsaLetter2("");
            setKsaLetter3("");
          }}
          className="w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-3 transition-all"
          style={{ backgroundColor: "#ffffff", color: "#374151", border: "1.5px solid #d1d5db" }}
        >
          <span>رجوع</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
