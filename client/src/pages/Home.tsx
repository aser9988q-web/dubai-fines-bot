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
  ArrowLeft,
  ArrowRight,
  Gauge,
  ChevronLeft,
  Phone,
  Globe,
  Mail,
  Search,
  Bell,
  User,
  Home as HomeIcon,
  Settings,
  HelpCircle,
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
  speed?: string;
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

// ===== FORM FIELDS COMPONENT (shared between desktop and mobile) =====
function PlateFormFields({
  plateSource, setPlateSource,
  plateNumber, setPlateNumber,
  plateCode, setPlateCode,
  ksaLetter1, setKsaLetter1,
  ksaLetter2, setKsaLetter2,
  ksaLetter3, setKsaLetter3,
  onEnter,
}: {
  plateSource: string; setPlateSource: (v: string) => void;
  plateNumber: string; setPlateNumber: (v: string) => void;
  plateCode: string; setPlateCode: (v: string) => void;
  ksaLetter1: string; setKsaLetter1: (v: string) => void;
  ksaLetter2: string; setKsaLetter2: (v: string) => void;
  ksaLetter3: string; setKsaLetter3: (v: string) => void;
  onEnter: () => void;
}) {
  const currentPlateCodes = plateSource ? (PLATE_CODES_BY_SOURCE[plateSource] || []) : [];

  return (
    <>
      {/* جهة إصدار اللوحة */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 block text-right">جهة إصدار اللوحة</label>
        <div className="relative">
          <select
            value={plateSource}
            onChange={(e) => { setPlateSource(e.target.value); const codes = PLATE_CODES_BY_SOURCE[e.target.value] || []; setPlateCode(codes[0] || ""); }}
            className="w-full text-sm rounded-xl px-4 py-4 appearance-none focus:outline-none"
            style={{ backgroundColor: "#f8faf9", border: plateSource ? "2px solid #008755" : "1.5px solid #d1d5db", color: plateSource ? "#111827" : "#9ca3af", fontWeight: plateSource ? "600" : "400" }}
          >
            <option value="" disabled>اختر</option>
            {ALL_PLATE_SOURCES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><span className="text-gray-500 text-sm">▼</span></div>
        </div>
      </div>
      {/* رقم اللوحة */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 block text-right">رقم اللوحة</label>
        <input type="text" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder="رقم اللوحة" onKeyDown={(e) => e.key === "Enter" && onEnter()} className="w-full text-sm rounded-xl px-4 py-4 focus:outline-none" style={{ backgroundColor: "#f8faf9", border: "1.5px solid #d1d5db", color: "#111827", textAlign: "right" }} dir="ltr" />
      </div>
      {/* رمز اللوحة */}
      {plateSource === "KSA" ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block text-right">رمز اللوحة</label>
            <div className="relative">
              <select value={plateCode} onChange={(e) => setPlateCode(e.target.value)} className="w-full text-sm rounded-xl px-4 py-4 appearance-none focus:outline-none" style={{ backgroundColor: "#f8faf9", border: "1.5px solid #d1d5db", color: plateCode ? "#111827" : "#9ca3af" }} dir="ltr">
                <option value="">اختر</option>
                {PLATE_CODES_BY_SOURCE.KSA.map((code) => (<option key={code} value={code}>{code}</option>))}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><span className="text-gray-500 text-sm">▼</span></div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {[{ value: ksaLetter1, setter: setKsaLetter1, label: "رمز اللوحة 1" },{ value: ksaLetter2, setter: setKsaLetter2, label: "رمز اللوحة 2" },{ value: ksaLetter3, setter: setKsaLetter3, label: "رمز اللوحة 3" }].map((item, idx) => (
              <div key={idx} className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block text-right">{item.label}</label>
                <div className="relative">
                  <select value={item.value} onChange={(e) => item.setter(e.target.value)} className="w-full text-sm rounded-xl px-4 py-4 appearance-none focus:outline-none" style={{ backgroundColor: "#f8faf9", border: "1.5px solid #d1d5db", color: item.value ? "#111827" : "#9ca3af" }} dir="rtl">
                    <option value="">اختر</option>
                    {KSA_LETTER_CODES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
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
            <select value={plateCode} onChange={(e) => setPlateCode(e.target.value)} disabled={!plateSource} className="w-full text-sm rounded-xl px-4 py-4 appearance-none focus:outline-none" style={{ backgroundColor: plateSource ? "#f8faf9" : "#f3f4f6", border: "1.5px solid #d1d5db", color: plateCode ? "#111827" : "#9ca3af", cursor: plateSource ? "pointer" : "not-allowed" }} dir="ltr">
              <option value="">اختر</option>
              {currentPlateCodes.map((code) => (<option key={code} value={code}>{code}</option>))}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><span className="text-gray-500 text-sm">▼</span></div>
          </div>
        </div>
      )}
    </>
  );
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleEnded = () => { video.pause(); };
    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, []);

  const handleQuery = () => {
    if (!plateSource) { toast.error("يرجى اختيار جهة إصدار اللوحة"); return; }
    if (!plateNumber.trim()) { toast.error("يرجى إدخال رقم اللوحة"); return; }
    const finalPlateCode = plateSource === "KSA"
      ? [ksaLetter1, ksaLetter2, ksaLetter3].filter(Boolean).join("")
      : plateCode;
    queryMutation.mutate({ plateSource, plateNumber: plateNumber.trim(), plateCode: finalPlateCode });
  };

  const resetForm = () => {
    setPlateNumber(""); setPlateCode(""); setPlateSource("");
    setKsaLetter1(""); setKsaLetter2(""); setKsaLetter3("");
  };

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

  // Tab icons
  const PlateIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="10" rx="2"/>
      <line x1="6" y1="7" x2="6" y2="17"/>
      <line x1="18" y1="7" x2="18" y2="17"/>
    </svg>
  );
  const LicenceIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="18" rx="2"/>
      <circle cx="8" cy="10" r="2"/>
      <line x1="13" y1="8" x2="19" y2="8"/>
      <line x1="13" y1="12" x2="19" y2="12"/>
      <line x1="5" y1="16" x2="19" y2="16"/>
    </svg>
  );
  const TCIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );

  const searchTabs = [
    { key: "plate" as SearchTab, labelAr: "اللوحة", icon: <PlateIcon /> },
    { key: "licence" as SearchTab, labelAr: "الرخصة", icon: <LicenceIcon /> },
    { key: "tcnumber" as SearchTab, labelAr: "الملف المروري", icon: <TCIcon /> },
  ];

  // Plate display
  const plateSourceLabel = ALL_PLATE_SOURCES.find(s => s.value === plateSource)?.labelEn || plateSource;
  const finalPlateCodeDisplay = plateSource === "KSA"
    ? [ksaLetter1, ksaLetter2, ksaLetter3].filter(Boolean).join(" ")
    : plateCode;
  const plateDisplay = [plateSourceLabel.toUpperCase(), plateNumber, finalPlateCodeDisplay].filter(Boolean).join(" ");

  // ===== SHARED HEADER =====
  const SharedHeader = ({ transparent = false }: { transparent?: boolean }) => (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: transparent ? "transparent" : "#ffffff",
        borderBottom: transparent ? "none" : "1px solid #e8ede9",
      }}
    >
      {/* Top bar - desktop only */}
      <div
        className="hidden md:flex items-center justify-between px-8 py-2 text-xs"
        style={{ backgroundColor: "#005c38", color: "#ffffff" }}
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> 901</span>
          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> info@dubaipolice.gov.ae</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 hover:opacity-80"><Globe className="w-3 h-3" /> English</button>
          <button className="flex items-center gap-1 hover:opacity-80"><User className="w-3 h-3" /> تسجيل الدخول</button>
        </div>
      </div>

      {/* Main header */}
      <div
        className="px-4 md:px-8 py-3 flex items-center justify-between"
        style={{ backgroundColor: transparent ? "transparent" : "#ffffff" }}
      >
        {/* Right: Logo + Name */}
        <div className="flex items-center gap-3">
          <img src={DUBAI_POLICE_LOGO} alt="شرطة دبي" className="h-12 w-12 md:h-14 md:w-14 object-contain" />
          <div className="hidden md:block">
            <div className="text-lg font-black" style={{ color: "#008755" }}>شرطة دبي</div>
            <div className="text-xs text-gray-500">Dubai Police</div>
          </div>
        </div>

        {/* Center: Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <button className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors">
            <HomeIcon className="w-4 h-4" /> الرئيسية
          </button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors">
            الخدمات
          </button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors">
            الأخبار
          </button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors">
            عن شرطة دبي
          </button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors">
            تواصل معنا
          </button>
        </nav>

        {/* Left: Icons */}
        <div className="flex items-center gap-2">
          <button
            className="hidden md:flex w-10 h-10 rounded-full items-center justify-center hover:bg-gray-100 transition-colors"
            style={{ color: "#374151" }}
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            className="hidden md:flex w-10 h-10 rounded-full items-center justify-center hover:bg-gray-100 transition-colors"
            style={{ color: "#374151" }}
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold hover:bg-gray-100 transition-colors"
            style={{ border: "1.5px solid #e5e7eb", color: "#374151" }}
          >
            ⓘ
          </button>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            style={{ border: "1.5px solid #e5e7eb" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Breadcrumb - desktop */}
      {!transparent && (
        <div
          className="hidden md:flex items-center gap-2 px-8 py-2 text-sm border-t"
          style={{ backgroundColor: "#f8faf9", borderColor: "#e8ede9" }}
        >
          <button className="text-gray-500 hover:text-green-700 flex items-center gap-1">
            <HomeIcon className="w-3.5 h-3.5" /> الرئيسية
          </button>
          <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
          <button className="text-gray-500 hover:text-green-700">الخدمات</button>
          <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
          <button className="text-gray-500 hover:text-green-700">خدمات الأفراد</button>
          <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold" style={{ color: "#008755" }}>الاستعلام والدفع عن المخالفات المرورية</span>
        </div>
      )}

      {/* Breadcrumb - mobile */}
      <div className="md:hidden px-4 pb-2 flex items-center justify-end gap-2 text-sm">
        <span className="font-semibold text-gray-700">الاستعلام والدفع</span>
        <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#f5f5f5", border: "1px solid #e5e7eb" }}>
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* History dropdown */}
      {showHistory && (
        <div className="px-4 pb-3">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 max-h-60 overflow-y-auto max-w-2xl mx-auto">
            {!history || history.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">لا توجد استعلامات سابقة</p>
            ) : (
              <div className="space-y-2">
                {(history as QueryHistory[]).map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => { setPlateSource(q.plateSource); setPlateNumber(q.plateNumber); setPlateCode(q.plateCode); setView("form"); setShowHistory(false); }}
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
  );

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
        <SharedHeader transparent={false} />

        {/* Desktop Results Layout */}
        <div className="hidden md:block">
          <div className="max-w-5xl mx-auto px-8 py-6">
            {/* Back + title */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => { setView("form"); setResult(null); setSelectedFines(new Set()); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white"
                style={{ backgroundColor: "#e8ede9", color: "#374151" }}
              >
                <ArrowRight className="w-4 h-4" />
                <span>رجوع</span>
              </button>
              <div>
                <h1 className="text-xl font-black text-gray-900">مراجعة المخالفات</h1>
                <p className="text-sm text-gray-500">رقم اللوحة: <span className="font-bold" style={{ color: "#008755" }} dir="ltr">{plateDisplay}</span></p>
              </div>
            </div>

            {/* Filter tabs + actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                {[
                  { key: "all", label: "الكل", count: result.fines.length },
                  { key: "payable", label: "قابل للدفع", count: result.fines.filter(f => !f.isPaid).length },
                  { key: "seized", label: "الحجز", count: result.fines.filter(f => f.status === "seized").length },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilterStatus(f.key as typeof filterStatus)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: filterStatus === f.key ? "#008755" : "#ffffff",
                      color: filterStatus === f.key ? "#ffffff" : "#374151",
                      border: filterStatus === f.key ? "none" : "1.5px solid #e5e7eb",
                    }}
                  >
                    {f.label}
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: filterStatus === f.key ? "rgba(255,255,255,0.25)" : "#f0f4f2", color: filterStatus === f.key ? "#fff" : "#374151" }}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "#ffffff", border: "1.5px solid #e5e7eb", color: "#374151" }}
                  onClick={() => {
                    if (filteredFines.length === 0) return;
                    if (selectedFines.size === filteredFines.length) setSelectedFines(new Set());
                    else setSelectedFines(new Set(filteredFines.map((_, i) => i)));
                  }}
                >
                  تحديد الكل
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "#ffffff", border: "1.5px solid #e5e7eb", color: "#374151" }}
                  onClick={() => toast.info("سيتم تفعيله قريباً")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>
                  طلب قائمة المخالفات
                </button>
              </div>
            </div>

            {/* Error */}
            {!result.success && (
              <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ backgroundColor: "#fff3f3", border: "1px solid #fecaca" }}>
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{result.errorMessage || "لم يتم العثور على مخالفات"}</p>
              </div>
            )}

            {/* No fines */}
            {result.success && filteredFines.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-20 bg-white rounded-2xl">
                <CheckCircle2 className="w-20 h-20" style={{ color: "#008755" }} />
                <p className="text-xl font-black text-gray-700">سجل نظيف</p>
                <p className="text-sm text-gray-400">لا توجد مخالفات مرورية مسجلة</p>
              </div>
            )}

            {/* Fines grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredFines.map((fine, idx) => {
                const isSelected = selectedFines.has(idx);
                const amt = parseFloat((fine.amount || "0").replace(/[^0-9.]/g, ""));
                return (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: "#ffffff",
                      border: isSelected ? "2px solid #008755" : "1.5px solid #e8ede9",
                      boxShadow: isSelected ? "0 4px 16px rgba(0,135,85,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    onClick={() => {
                      const next = new Set(selectedFines);
                      if (isSelected) next.delete(idx); else next.add(idx);
                      setSelectedFines(next);
                    }}
                  >
                    {/* Card top */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-gray-900">Đ {isNaN(amt) ? fine.amount : amt.toFixed(0)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: fine.isPaid ? "#e8f5ee" : "#fff3e0", color: fine.isPaid ? "#008755" : "#f57c00" }}
                        >
                          {fine.isPaid ? "✓ مدفوع" : "● قابل للدفع"}
                        </span>
                        <img src={FINE_BADGE_LOGO} alt="" className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-5 h-5 rounded"
                          style={{ accentColor: "#008755" }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid #f0f4f2" }} className="mx-5" />

                    {/* Details grid */}
                    <div className="px-5 py-4 grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" style={{ color: "#008755" }} /> المصدر</span>
                        <span className="text-sm font-bold text-gray-800">{fine.source || "—"}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" style={{ color: "#008755" }} /> الموقع</span>
                        <span className="text-sm font-bold text-gray-800 truncate">{fine.location || "—"}</span>
                      </div>
                      {fine.speed && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-400 flex items-center gap-1"><Gauge className="w-3.5 h-3.5" style={{ color: "#008755" }} /> السرعة</span>
                          <span className="text-sm font-bold text-gray-800" dir="ltr">{fine.speed}</span>
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Hash className="w-3.5 h-3.5" style={{ color: "#008755" }} /> رقم المخالفة</span>
                        <span className="text-sm font-bold text-gray-800" dir="ltr">{fine.ticketNo || "—"}</span>
                      </div>
                      <div className="flex flex-col gap-1 col-span-2">
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" style={{ color: "#008755" }} /> التاريخ والوقت</span>
                        <span className="text-sm font-bold text-gray-800" dir="ltr">{fine.dateTime || "—"}</span>
                      </div>
                    </div>

                    {fine.description && (
                      <>
                        <div style={{ borderTop: "1px solid #f0f4f2" }} className="mx-5" />
                        <div className="px-5 py-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Ticket className="w-4 h-4" style={{ color: "#008755" }} />
                            <span className="text-sm font-bold" style={{ color: "#008755" }}>تفاصيل المخالفة</span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{fine.description}</p>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom summary bar - desktop */}
            {filteredFines.length > 0 && (
              <div
                className="mt-6 rounded-2xl overflow-hidden"
                style={{ backgroundColor: "#ffffff", border: "1.5px solid #e8ede9", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
              >
                <div className="flex items-center px-6 py-4 gap-8 border-b border-gray-100">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5">المخالفات القابلة للدفع</p>
                    <p className="text-2xl font-black text-gray-900">{payableCount}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5">المحدد للدفع</p>
                    <p className="text-2xl font-black text-gray-900">{selectedFines.size}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5">إجمالي المبلغ المحدد</p>
                    <p className="text-2xl font-black" style={{ color: "#008755" }}>Đ {selectedTotal > 0 ? selectedTotal.toFixed(0) : "0"}</p>
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4" style={{ accentColor: "#008755" }} />
                      الدفع بالتقسيط عبر الخصم المباشر
                    </label>
                    <button
                      disabled={selectedFines.size === 0}
                      className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all"
                      style={{ backgroundColor: selectedFines.size > 0 ? "#008755" : "#9ca3af", boxShadow: selectedFines.size > 0 ? "0 4px 12px rgba(0,135,85,0.3)" : "none" }}
                      onClick={() => toast.info("سيتم تفعيل الدفع قريباً")}
                    >
                      دفع المخالفات المحددة
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Results Layout */}
        <div className="md:hidden">
          <div className="px-4 py-2 space-y-3 max-w-lg mx-auto">
            {/* Back + breadcrumb */}
            <div className="flex items-center gap-2 py-1">
              <button
                onClick={() => { setView("form"); setResult(null); setSelectedFines(new Set()); }}
                className="flex items-center justify-center w-8 h-8 rounded-full"
                style={{ backgroundColor: "#f0f4f2", border: "1px solid #e5e7eb" }}
              >
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-sm font-semibold text-gray-700">الاستعلام والدفع</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "#f0f4f2", border: "1px solid #e5e7eb", color: "#374151" }} onClick={() => toast.info("سيتم تفعيله قريباً")}>...</button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: "#f0f4f2", border: "1px solid #e5e7eb", color: "#374151" }} onClick={() => toast.info("سيتم تفعيله قريباً")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>
                <span>طلب قائمة المخالفات</span>
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mr-auto"
                style={{ backgroundColor: "#f0f4f2", border: "1px solid #e5e7eb", color: "#374151" }}
                onClick={() => {
                  if (filteredFines.length === 0) return;
                  if (selectedFines.size === filteredFines.length) setSelectedFines(new Set());
                  else setSelectedFines(new Set(filteredFines.map((_, i) => i)));
                }}
              >
                <span>تحديد الكل</span>
              </button>
            </div>

            {/* Plate number bar */}
            <div className="flex items-center justify-between py-1">
              <div className="px-3 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", color: "#374151", letterSpacing: "1px" }} dir="ltr">{plateDisplay}</div>
              <span className="text-sm font-bold text-gray-700">مراجعة المخالفات رقم اللوحة:</span>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { key: "all", label: "الكل", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm2 5h12v2H6zm3 5h6v2H9z"/></svg> },
                { key: "seized", label: "الحجز", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
                { key: "payable", label: "قابل للدفع", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path fill="#fff" d="M12 6v6l4 2-1 1.7-5-2.7V6z"/></svg> },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key as typeof filterStatus)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: filterStatus === f.key ? "#ffffff" : "#e8ede9",
                    color: filterStatus === f.key ? "#008755" : "#6b7280",
                    border: filterStatus === f.key ? "1.5px solid #008755" : "1.5px solid transparent",
                    boxShadow: filterStatus === f.key ? "0 1px 4px rgba(0,135,85,0.15)" : "none",
                  }}
                >
                  <span style={{ color: filterStatus === f.key ? "#008755" : "#6b7280" }}>{f.icon}</span>
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

            {/* Fine cards - mobile */}
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
                  <div className="flex items-center justify-between px-4 pt-4 pb-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-gray-900">Đ {isNaN(amt) ? fine.amount : amt.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: fine.isPaid ? "#e8f5ee" : "#fff3e0", color: fine.isPaid ? "#008755" : "#f57c00" }}>
                        {fine.isPaid ? "مدفوع" : "قابل للدفع"}
                      </span>
                      <img src={FINE_BADGE_LOGO} alt="" className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <input type="checkbox" checked={isSelected} onChange={() => { const next = new Set(selectedFines); if (isSelected) next.delete(idx); else next.add(idx); setSelectedFines(next); }} className="w-5 h-5 rounded" style={{ accentColor: "#008755" }} />
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid #f0f0f0" }} className="mx-4" />
                  <div className="px-4 py-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500"><Building2 className="w-4 h-4" style={{ color: "#008755" }} /><span className="text-sm">المصدر</span></div>
                      <span className="text-sm font-semibold text-gray-800">{fine.source || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500"><MapPin className="w-4 h-4" style={{ color: "#008755" }} /><span className="text-sm">الموقع</span></div>
                      <span className="text-sm font-semibold text-gray-800 text-left max-w-[55%] truncate" dir="rtl">{fine.location || "—"}</span>
                    </div>
                    {fine.speed && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500"><Gauge className="w-4 h-4" style={{ color: "#008755" }} /><span className="text-sm">السرعة</span></div>
                        <span className="text-sm font-semibold text-gray-800" dir="ltr">{fine.speed}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500"><Hash className="w-4 h-4" style={{ color: "#008755" }} /><span className="text-sm">رقم المخالفة</span></div>
                      <span className="text-sm font-semibold text-gray-800" dir="ltr">{fine.ticketNo || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500"><Calendar className="w-4 h-4" style={{ color: "#008755" }} /><span className="text-sm">التاريخ والوقت</span></div>
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

            {/* Bottom summary bar - mobile */}
            <div className="rounded-2xl overflow-hidden mt-4" style={{ backgroundColor: "#ffffff", border: "1px solid #e8ede9", boxShadow: "0 -2px 12px rgba(0,0,0,0.08)" }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-500">المخالفات</p>
                  <p className="text-lg font-black text-gray-900">{payableCount}</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-500">إجمالي المبلغ</p>
                  <p className="text-lg font-black text-gray-900">Đ {selectedTotal > 0 ? selectedTotal.toFixed(0) : "0"}</p>
                </div>
              </div>
              <div className="flex gap-3 p-3">
                <button onClick={() => { setView("form"); setResult(null); setSelectedFines(new Set()); }} className="flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2" style={{ backgroundColor: "#f0f4f2", color: "#374151", border: "1px solid #e5e7eb" }}>
                  <span>رجوع</span><ArrowRight className="w-4 h-4" />
                </button>
                <button disabled={selectedFines.size === 0} className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all" style={{ backgroundColor: selectedFines.size > 0 ? "#008755" : "#9ca3af" }} onClick={() => toast.info("سيتم تفعيل الدفع قريباً")}>
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
      </div>
    );
  }

  // ===== FORM VIEW =====
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f0f4f2", fontFamily: "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif" }}
      dir="rtl"
    >
      <SharedHeader transparent={false} />

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:flex min-h-[calc(100vh-130px)]">
        {/* Right: Video */}
        <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: "#1a1a1a" }}>
          <video
            src={CAR_VIDEO_URL}
            autoPlay muted playsInline
            style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "auto", height: "100%", minWidth: "100%", objectFit: "cover", objectPosition: "center 45%" }}
            onEnded={(e) => { e.currentTarget.pause(); }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to left, rgba(240,244,242,0.15) 0%, transparent 40%)" }} />
          {/* Service title overlay */}
          <div className="absolute bottom-8 right-8 text-white">
            <div className="text-xs font-semibold opacity-70 mb-1">خدمة إلكترونية</div>
            <div className="text-2xl font-black">الاستعلام والدفع</div>
            <div className="text-sm opacity-80 mt-1">عن المخالفات المرورية</div>
          </div>
        </div>

        {/* Left: Form panel */}
        <div
          className="w-[440px] xl:w-[500px] flex flex-col justify-center px-8 py-8 overflow-y-auto"
          style={{ backgroundColor: "#f0f4f2" }}
        >
          {/* Service header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: "#008755" }} />
              <h2 className="text-xl font-black text-gray-900">الاستعلام عن المخالفات</h2>
            </div>
            <p className="text-sm text-gray-500 mr-3">أدخل بيانات اللوحة للاستعلام عن المخالفات المرورية</p>
          </div>

          {/* Search tabs */}
          <div
            className="flex items-center gap-1 mb-5 p-1 rounded-2xl"
            style={{ backgroundColor: "#e8ede9" }}
          >
            {searchTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSearchTab(tab.key)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
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

          {/* Form card */}
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ backgroundColor: "#ffffff", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e8ede9" }}
          >
            <PlateFormFields
              plateSource={plateSource} setPlateSource={setPlateSource}
              plateNumber={plateNumber} setPlateNumber={setPlateNumber}
              plateCode={plateCode} setPlateCode={setPlateCode}
              ksaLetter1={ksaLetter1} setKsaLetter1={setKsaLetter1}
              ksaLetter2={ksaLetter2} setKsaLetter2={setKsaLetter2}
              ksaLetter3={ksaLetter3} setKsaLetter3={setKsaLetter3}
              onEnter={handleQuery}
            />
          </div>

          {/* Buttons */}
          <div className="mt-5 space-y-3">
            <button
              onClick={handleQuery}
              disabled={queryMutation.isPending}
              className="w-full py-4 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-3 transition-all hover:opacity-90"
              style={{ backgroundColor: "#008755", boxShadow: "0 4px 16px rgba(0,135,85,0.35)" }}
            >
              {queryMutation.isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /><span>جاري الاستعلام...</span></>
              ) : (
                <><ArrowLeft className="w-5 h-5" /><span>التحقق من المخالفات</span></>
              )}
            </button>
            <button
              onClick={resetForm}
              className="w-full py-3.5 rounded-2xl text-base font-bold flex items-center justify-center gap-3 transition-all hover:bg-gray-50"
              style={{ backgroundColor: "#ffffff", color: "#374151", border: "1.5px solid #d1d5db" }}
            >
              <span>رجوع</span><ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Info note */}
          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl" style={{ backgroundColor: "#e8f5ee" }}>
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#008755" }} />
            <p className="text-xs text-gray-600">يمكنك الاستعلام عن المخالفات المرورية المسجلة على لوحة مركبتك وسداد المستحقات إلكترونياً</p>
          </div>
        </div>
      </div>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden">
        {/* Search tabs */}
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

        {/* Video hero */}
        <div className="w-full overflow-hidden" style={{ height: "280px", backgroundColor: "#e8e8e8", lineHeight: 0, position: "relative" }}>
          <video
            ref={videoRef}
            src={CAR_VIDEO_URL}
            autoPlay muted playsInline
            style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", height: "auto", minHeight: "100%", objectFit: "cover", objectPosition: "center 45%", display: "block" }}
            onEnded={(e) => { e.currentTarget.pause(); }}
          />
        </div>

        {/* Form card */}
        <div className="px-4 pt-4 pb-2 max-w-lg mx-auto">
          <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: "#ffffff", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <PlateFormFields
              plateSource={plateSource} setPlateSource={setPlateSource}
              plateNumber={plateNumber} setPlateNumber={setPlateNumber}
              plateCode={plateCode} setPlateCode={setPlateCode}
              ksaLetter1={ksaLetter1} setKsaLetter1={setKsaLetter1}
              ksaLetter2={ksaLetter2} setKsaLetter2={setKsaLetter2}
              ksaLetter3={ksaLetter3} setKsaLetter3={setKsaLetter3}
              onEnter={handleQuery}
            />
          </div>
        </div>
      </div>

      {/* ===== BUTTONS - mobile only ===== */}
      <div className="md:hidden px-4 pt-4 pb-8 space-y-3 max-w-lg mx-auto">
        <button
          onClick={handleQuery}
          disabled={queryMutation.isPending}
          className="w-full py-4 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-3 transition-all"
          style={{ backgroundColor: "#008755", boxShadow: "0 4px 12px rgba(0,135,85,0.3)" }}
        >
          {queryMutation.isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /><span>جاري الاستعلام...</span></>
          ) : (
            <><ArrowLeft className="w-5 h-5" /><span>التحقق من المخالفات</span></>
          )}
        </button>
        <button
          onClick={resetForm}
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
