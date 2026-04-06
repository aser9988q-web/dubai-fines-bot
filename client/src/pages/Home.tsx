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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ===== ASSETS =====
const CAR_VIDEO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234476152/RPNmG5rkcSfq3Rp3WTDuVe/car_animation_2512fc32.mp4";
const DUBAI_POLICE_HEADER_LOGO = "/dubai-police-logo.svg";

// ===== SOURCE LOGOS - Comprehensive mapping system =====

interface SourceConfig {
  label: string;
  labelEn: string;
  bgColor: string;
  borderColor: string;
  logo: (size: number) => React.ReactElement;
}

const SOURCE_MAP: SourceConfig[] = [
  {
    label: "شرطة دبي",
    labelEn: "Dubai Police",
    bgColor: "#e8f5ee",
    borderColor: "#008755",
    logo: (size) => (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 4 L88 18 L88 56 Q88 82 50 96 Q12 82 12 56 L12 18 Z" fill="#006633" />
        <path d="M50 11 L80 23 L80 55 Q80 76 50 88 Q20 76 20 55 L20 23 Z" fill="#008755" />
        <circle cx="50" cy="38" r="14" fill="none" stroke="#FFD700" strokeWidth="2" />
        <polygon points="50,26 52.5,34 61,34 54.5,39 57,47 50,42 43,47 45.5,39 39,34 47.5,34" fill="#FFD700" />
        <rect x="28" y="62" width="44" height="10" rx="3" fill="rgba(255,255,255,0.15)" />
        <text x="50" y="70" textAnchor="middle" fill="white" fontSize="5.5" fontFamily="Arial" fontWeight="bold">DUBAI POLICE</text>
      </svg>
    ),
  },
  {
    label: "شرطة أبوظبي",
    labelEn: "Abu Dhabi Police",
    bgColor: "#fff5e8",
    borderColor: "#c8860a",
    logo: (size) => (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {/* Outer circle */}
        <circle cx="50" cy="50" r="46" fill="#8B0000" />
        <circle cx="50" cy="50" r="40" fill="#A00000" />
        {/* Eagle/Falcon silhouette */}
        <ellipse cx="50" cy="42" rx="16" ry="18" fill="#C8860A" />
        <path d="M34 42 Q26 35 22 50 Q30 55 34 48Z" fill="#C8860A" />
        <path d="M66 42 Q74 35 78 50 Q70 55 66 48Z" fill="#C8860A" />
        <circle cx="50" cy="35" r="8" fill="#C8860A" />
        <circle cx="47" cy="33" r="1.5" fill="#8B0000" />
        <path d="M44 60 L50 75 L56 60Z" fill="#C8860A" />
        {/* Text */}
        <text x="50" y="88" textAnchor="middle" fill="white" fontSize="5" fontFamily="Arial" fontWeight="bold">ABU DHABI POLICE</text>
      </svg>
    ),
  },
  {
    label: "شرطة الشارقة",
    labelEn: "Sharjah Police",
    bgColor: "#e8f0ff",
    borderColor: "#1a3a8c",
    logo: (size) => (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#1a3a8c" />
        <circle cx="50" cy="50" r="38" fill="#2a4aac" />
        <path d="M50 18 L56 36 L75 36 L60 47 L66 65 L50 54 L34 65 L40 47 L25 36 L44 36 Z" fill="#FFD700" />
        <text x="50" y="86" textAnchor="middle" fill="white" fontSize="5" fontFamily="Arial" fontWeight="bold">SHARJAH POLICE</text>
      </svg>
    ),
  },
  {
    label: "شرطة عجمان",
    labelEn: "Ajman Police",
    bgColor: "#f0f8ff",
    borderColor: "#1a6a8c",
    logo: (size) => (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#1a6a8c" />
        <circle cx="50" cy="50" r="38" fill="#2a7aac" />
        <path d="M50 20 L55 35 L70 35 L58 44 L63 59 L50 50 L37 59 L42 44 L30 35 L45 35 Z" fill="white" />
        <text x="50" y="86" textAnchor="middle" fill="white" fontSize="5" fontFamily="Arial" fontWeight="bold">AJMAN POLICE</text>
      </svg>
    ),
  },
  {
    label: "هيئة الطرق والمواصلات",
    labelEn: "RTA",
    bgColor: "#fff0f0",
    borderColor: "#CC0000",
    logo: (size) => (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="white" rx="8" />
        <polygon points="5,90 95,90 95,25" fill="#CC0000" />
        <text x="65" y="80" textAnchor="middle" fill="white" fontSize="20" fontFamily="Arial" fontWeight="900">RTA</text>
        <text x="35" y="22" textAnchor="middle" fill="#333" fontSize="7.5" fontFamily="Arial" fontWeight="bold">هيئة الطرق</text>
        <text x="35" y="33" textAnchor="middle" fill="#666" fontSize="6" fontFamily="Arial">ROADS &amp; TRANSPORT</text>
      </svg>
    ),
  },
  {
    label: "سالك",
    labelEn: "Salik",
    bgColor: "#f0f0f8",
    borderColor: "#4A4A6A",
    logo: (size) => (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="white" rx="8" />
        <polygon points="5,80 5,20 45,50" fill="#4A4A6A" />
        <polygon points="18,80 18,30 52,55" fill="#8080A0" opacity="0.65" />
        <text x="72" y="46" textAnchor="middle" fill="#4A4A6A" fontSize="15" fontFamily="Arial" fontWeight="bold">سالك</text>
        <text x="72" y="64" textAnchor="middle" fill="#6A6A8A" fontSize="14" fontFamily="Arial" fontWeight="600">Salik</text>
      </svg>
    ),
  },
  {
    label: "درب",
    labelEn: "Darb",
    bgColor: "#f0f8f0",
    borderColor: "#2d7a2d",
    logo: (size) => (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="white" rx="8" />
        <rect x="5" y="5" width="90" height="90" rx="6" fill="#2d7a2d" />
        <text x="50" y="48" textAnchor="middle" fill="white" fontSize="18" fontFamily="Arial" fontWeight="900">درب</text>
        <text x="50" y="68" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="14" fontFamily="Arial" fontWeight="600">Darb</text>
      </svg>
    ),
  },
];

function getSourceConfig(source: string): SourceConfig | null {
  if (!source) return null;
  const upper = source.toUpperCase();
  const lower = source.toLowerCase();
  // Dubai Police
  if (upper.includes("DUBAI POLICE") || lower.includes("شرطة دبي") || (upper.includes("DUBAI") && upper.includes("POLICE"))) return SOURCE_MAP[0];
  // Abu Dhabi Police
  if (upper.includes("ABU DHABI") || lower.includes("أبوظبي") || lower.includes("ابوظبي") || lower.includes("شرطة أبوظبي") || lower.includes("شرطة ابوظبي")) return SOURCE_MAP[1];
  // Sharjah Police
  if (upper.includes("SHARJAH") || lower.includes("شرطة الشارقة") || lower.includes("الشارقة")) return SOURCE_MAP[2];
  // Ajman Police
  if (upper.includes("AJMAN") || lower.includes("شرطة عجمان") || lower.includes("عجمان")) return SOURCE_MAP[3];
  // RTA
  if (upper.includes("RTA") || upper.includes("ROAD") || upper.includes("TRANSPORT") || lower.includes("طرق") || lower.includes("مواصلات")) return SOURCE_MAP[4];
  // Salik
  if (upper.includes("SALIK") || lower.includes("سالك")) return SOURCE_MAP[5];
  // Darb
  if (upper.includes("DARB") || lower.includes("درب")) return SOURCE_MAP[6];
  return null;
}

function SourceIcon({ source, size = 28 }: { source: string; size?: number }) {
  const config = getSourceConfig(source);
  if (config) return <>{config.logo(size)}</>;
  // Fallback: initials in colored circle
  const initials = (source || "?").substring(0, 2).toUpperCase();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#e8f5ee" stroke="#008755" strokeWidth="3" />
      <text x="50" y="62" textAnchor="middle" fill="#008755" fontSize="32" fontFamily="Arial" fontWeight="bold">{initials}</text>
    </svg>
  );
}

function getSourceBgColor(source: string): string {
  return getSourceConfig(source)?.bgColor ?? "#f0f4f2";
}

function getSourceLabel(source: string): string {
  return getSourceConfig(source)?.label ?? (source || "—");
}

// ===== SOURCE BADGE COMPONENT =====
function SourceBadge({ source }: { source: string }) {
  const bgColor = getSourceBgColor(source);
  const label = getSourceLabel(source);
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{ backgroundColor: bgColor, border: "1px solid #e5e7eb" }}
      >
        <SourceIcon source={source} size={24} />
      </div>
      <span className="text-sm font-bold text-gray-800">{label}</span>
    </div>
  );
}

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
  { value: "م", label: "م - M" },
  { value: "ن", label: "ن - N" },
  { value: "ه", label: "ه - H" },
  { value: "و", label: "و - U" },
  { value: "ي", label: "ي - V" },
];

type SearchTab = "plate" | "licence" | "tcnumber";
type ViewMode = "form" | "results";
type FilterStatus = "all" | "payable" | "seized" | "notpayable" | "blackpoints";

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
            className="w-full text-base rounded-xl px-4 py-4 appearance-none focus:outline-none"
            style={{ backgroundColor: "#ffffff", border: plateSource ? "2px solid #008755" : "1.5px solid #d1d5db", color: plateSource ? "#111827" : "#9ca3af", fontWeight: plateSource ? "600" : "400", paddingLeft: "2.5rem" }}
          >
            <option value="" disabled>اختر</option>
            {ALL_PLATE_SOURCES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></div>
        </div>
      </div>
      {/* رقم اللوحة */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 block text-right">رقم اللوحة</label>
        <input type="text" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder="رقم اللوحة" onKeyDown={(e) => e.key === "Enter" && onEnter()} className="w-full text-base rounded-xl px-4 py-4 focus:outline-none" style={{ backgroundColor: "#f5f5f5", border: "1.5px solid #e5e7eb", color: "#111827", textAlign: "right" }} dir="ltr" />
      </div>
      {/* رمز اللوحة */}
      {plateSource === "KSA" ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block text-right">رمز اللوحة</label>
            <div className="relative">
              <select value={plateCode} onChange={(e) => setPlateCode(e.target.value)} className="w-full text-base rounded-xl px-4 py-4 appearance-none focus:outline-none" style={{ backgroundColor: "#ffffff", border: "1.5px solid #d1d5db", color: plateCode ? "#111827" : "#9ca3af", paddingLeft: "2.5rem" }} dir="ltr">
                <option value="">اختر</option>
                {PLATE_CODES_BY_SOURCE.KSA.map((code) => (<option key={code} value={code}>{code}</option>))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {[{ value: ksaLetter1, setter: setKsaLetter1, label: "رمز اللوحة 1" },{ value: ksaLetter2, setter: setKsaLetter2, label: "رمز اللوحة 2" },{ value: ksaLetter3, setter: setKsaLetter3, label: "رمز اللوحة 3" }].map((item, idx) => (
              <div key={idx} className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block text-right">{item.label}</label>
                <div className="relative">
                  <select value={item.value} onChange={(e) => item.setter(e.target.value)} className="w-full text-base rounded-xl px-4 py-4 appearance-none focus:outline-none" style={{ backgroundColor: "#ffffff", border: "1.5px solid #d1d5db", color: item.value ? "#111827" : "#9ca3af", paddingLeft: "2.5rem" }} dir="rtl">
                    <option value="">اختر</option>
                    {KSA_LETTER_CODES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 block text-right">رمز اللوحة</label>
          <div className="relative">
            <select value={plateCode} onChange={(e) => setPlateCode(e.target.value)} disabled={!plateSource} className="w-full text-base rounded-xl px-4 py-4 appearance-none focus:outline-none" style={{ backgroundColor: plateSource ? "#ffffff" : "#f3f4f6", border: "1.5px solid #d1d5db", color: plateCode ? "#111827" : "#9ca3af", cursor: plateSource ? "pointer" : "not-allowed", paddingLeft: "2.5rem" }} dir="ltr">
              <option value="">اختر</option>
              {currentPlateCodes.map((code) => (<option key={code} value={code}>{code}</option>))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></div>
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
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: history } = trpc.fines.getHistory.useQuery(undefined, { retry: false });

  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
      setResult(data as QueryResult);
      setView("results");
      setSelectedFines(new Set());
      setFilterStatus("all");
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

  const allFines = result?.fines || [];

  const filteredFines = allFines.filter((fine) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "payable") return !fine.isPaid && fine.status !== "seized" && fine.status !== "blackpoints";
    if (filterStatus === "seized") return fine.status === "seized";
    if (filterStatus === "notpayable") return fine.isPaid;
    if (filterStatus === "blackpoints") return fine.status === "blackpoints";
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

  // Tab icons - matching original Dubai Police website exactly
  const PlateIcon = () => (
    <svg width="20" height="20" viewBox="0 0 32 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="1" y="1" width="30" height="18" rx="3"/>
      <rect x="4" y="4" width="24" height="12" rx="1.5" strokeWidth="1.2"/>
      <line x1="8" y1="1" x2="8" y2="19" strokeWidth="1"/>
      <line x1="24" y1="1" x2="24" y2="19" strokeWidth="1"/>
    </svg>
  );
  const LicenceIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="3" width="20" height="18" rx="2"/>
      <line x1="6" y1="8" x2="18" y2="8" strokeWidth="1.5"/>
      <line x1="6" y1="12" x2="18" y2="12" strokeWidth="1.5"/>
      <line x1="6" y1="16" x2="14" y2="16" strokeWidth="1.5"/>
      <line x1="6" y1="8" x2="6" y2="16" strokeWidth="1.5"/>
      <line x1="18" y1="8" x2="18" y2="12" strokeWidth="1.5"/>
      <line x1="14" y1="12" x2="14" y2="16" strokeWidth="1.5"/>
    </svg>
  );
  const TCIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="18" x2="20" y2="18"/>
      <line x1="4" y1="6" x2="4" y2="18"/>
      <line x1="12" y1="6" x2="12" y2="18"/>
      <line x1="20" y1="6" x2="20" y2="18"/>
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

  // Filter tabs config - مطابق للموقع الأصلي
  const filterTabs = [
    {
      key: "all" as FilterStatus,
      label: "الكل",
      count: allFines.length,
      // أيقونة كتاب/سجل مطابقة للموقع الأصلي
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      ),
    },
    {
      key: "seized" as FilterStatus,
      label: "الحجز",
      count: allFines.filter(f => f.status === "seized").length,
      // أيقونة قفل مطابقة للموقع الأصلي
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
    },
    {
      key: "payable" as FilterStatus,
      label: "قابل للدفع",
      count: allFines.filter(f => !f.isPaid && f.status !== "seized" && f.status !== "blackpoints").length,
      // أيقونة عملات معدنية مطابقة للموقع الأصلي
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4"/>
          <path d="M12 16h.01"/>
          <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3"/>
        </svg>
      ),
    },
    {
      key: "blackpoints" as FilterStatus,
      label: "النقاط السوداء",
      count: allFines.filter(f => f.status === "blackpoints").length,
      // أيقونة علامة تعجب داخل معين مطابقة للموقع الأصلي
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 19.5h20L12 2z"/>
          <line x1="12" y1="10" x2="12" y2="14"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    },
    {
      key: "notpayable" as FilterStatus,
      label: "غير قابل للدفع",
      count: allFines.filter(f => f.isPaid).length,
      // أيقونة درع/حماية مطابقة للموقع الأصلي
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
    },
  ];

  // ===== SHARED HEADER =====
  const SharedHeader = ({ transparent = false }: { transparent?: boolean }) => (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: transparent && !headerScrolled ? "transparent" : "#ffffff",
        borderBottom: transparent && !headerScrolled ? "none" : "1px solid #e8ede9",
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
        className="px-4 md:px-8 py-3 flex items-center justify-between transition-all duration-300"
        style={{ backgroundColor: transparent && !headerScrolled ? "transparent" : "#ffffff" }}
      >
        {/* Right: Logo + Name */}
        <div className="flex items-center gap-3">
          <img src="/dubai-police-logo.svg" alt="شرطة دبي" className="h-12 w-12 md:h-14 md:w-14 object-contain" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }} />
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
          <button className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors">الخدمات</button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors">الأخبار</button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors">عن شرطة دبي</button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors">تواصل معنا</button>
        </nav>

        {/* Left: Icons */}
        <div className="flex items-center gap-2">
          <button className="hidden md:flex w-10 h-10 rounded-full items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: "#374151" }}>
            <Search className="w-5 h-5" />
          </button>
          <button className="hidden md:flex w-10 h-10 rounded-full items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: "#374151" }}>
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
      <div className="md:hidden px-4 pb-3 pt-1 flex items-center justify-end gap-2 text-sm">
        <span className="font-semibold text-gray-700">الاستعلام والدفع</span>
        <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#f0f0f0", border: "1px solid #e5e7eb" }}>
          <ChevronLeft className="w-4 h-4 text-gray-500" />
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

  // ===== FINE CARD COMPONENT =====
  const FineCard = ({ fine, idx, isMobile = false }: { fine: FineResult; idx: number; isMobile?: boolean }) => {
    const isSelected = selectedFines.has(idx);
    const amt = parseFloat((fine.amount || "0").replace(/[^0-9.]/g, ""));
    const sourceBgColor = getSourceBgColor(fine.source);

    const toggleSelect = () => {
      const next = new Set(selectedFines);
      if (isSelected) next.delete(idx); else next.add(idx);
      setSelectedFines(next);
    };

    // Status badge config
    const statusConfig = fine.isPaid
      ? { label: "مدفوع", bg: "#e8f5ee", color: "#008755", icon: "✓" }
      : fine.status === "seized"
      ? { label: "محجوز", bg: "#fff0f0", color: "#dc2626", icon: "🔒" }
      : fine.status === "blackpoints"
      ? { label: "نقاط سوداء", bg: "#fef3c7", color: "#d97706", icon: "⚠" }
      : { label: "قابل للدفع", bg: "#fff3e0", color: "#f57c00", icon: "●" };

    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#ffffff", border: isSelected ? "2px solid #008755" : "1.5px solid #e8ede9",
          boxShadow: isSelected ? "0 4px 16px rgba(0,135,85,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {/* Card header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-baseline gap-1">
            <span className={`font-black text-gray-900 ${isMobile ? "text-2xl" : "text-3xl"}`}>
              Đ {isNaN(amt) ? fine.amount : amt.toFixed(0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
            >
              {statusConfig.icon} {statusConfig.label}
            </span>
            {/* Source logo in header - real CDN logo */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ backgroundColor: sourceBgColor, border: "1px solid #e5e7eb", padding: "3px" }}
            >
              <SourceIcon source={fine.source} size={26} />
            </div>
            {/* Checkbox - click only on checkbox, not entire card */}
            <div
              className="w-6 h-6 flex items-center justify-center flex-shrink-0"
              onClick={(e) => { e.stopPropagation(); toggleSelect(); }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                className="w-5 h-5 rounded cursor-pointer"
                style={{ accentColor: "#008755" }}
              />
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #f0f4f2" }} className="mx-4" />

        {/* Details */}
        <div className="px-4 py-3 space-y-2.5">
          {/* Source */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <Building2 className="w-4 h-4" style={{ color: "#008755" }} />
              <span className="text-sm">المصدر</span>
            </div>
            <SourceBadge source={fine.source} />
          </div>
          {/* Location */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="w-4 h-4" style={{ color: "#008755" }} />
              <span className="text-sm">الموقع</span>
            </div>
            <span className="text-sm font-semibold text-gray-800 text-left max-w-[55%] truncate" dir="rtl">{fine.location || "—"}</span>
          </div>
          {/* Speed */}
          {fine.speed && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500">
                <Gauge className="w-4 h-4" style={{ color: "#008755" }} />
                <span className="text-sm">السرعة</span>
              </div>
              <span className="text-sm font-semibold text-gray-800" dir="ltr">{fine.speed}</span>
            </div>
          )}
          {/* Ticket No */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <Hash className="w-4 h-4" style={{ color: "#008755" }} />
              <span className="text-sm">رقم المخالفة</span>
            </div>
            <span className="text-sm font-semibold text-gray-800" dir="ltr">{fine.ticketNo || "—"}</span>
          </div>
          {/* Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4" style={{ color: "#008755" }} />
              <span className="text-sm">التاريخ والوقت</span>
            </div>
            <span className="text-sm font-semibold text-gray-800" dir="ltr">{fine.dateTime || "—"}</span>
          </div>
        </div>

        {/* Description */}
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
  };

  // ===== RESULTS VIEW =====
  if (view === "results" && result) {
    const payableFines = allFines.filter(f => !f.isPaid);
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
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex gap-2 flex-wrap">
                {filterTabs.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilterStatus(f.key)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: filterStatus === f.key ? "#008755" : "#ffffff",
                      color: filterStatus === f.key ? "#ffffff" : "#374151",
                      border: filterStatus === f.key ? "none" : "1.5px solid #e5e7eb",
                    }}
                  >
                    <span style={{ color: filterStatus === f.key ? "#fff" : "#6b7280" }}>{f.icon}</span>
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
              {filteredFines.map((fine, idx) => (
                <FineCard key={idx} fine={fine} idx={idx} isMobile={false} />
              ))}
            </div>

            {/* Bottom summary bar - desktop */}
            {allFines.length > 0 && (
              <div
                className="mt-6 rounded-2xl overflow-hidden"
                style={{ backgroundColor: "#ffffff", border: "1.5px solid #e8ede9", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
              >
                <div className="flex items-center px-6 py-4 gap-6 border-b border-gray-100 flex-wrap">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5">المخالفات</p>
                    <p className="text-2xl font-black text-gray-900">{allFines.length}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5">قابل للدفع</p>
                    <p className="text-2xl font-black text-gray-900">{payableCount}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5">المحدد للدفع</p>
                    <p className="text-2xl font-black text-gray-900">{selectedFines.size}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5">إجمالي المبلغ</p>
                    <p className="text-2xl font-black" style={{ color: "#008755" }}>Đ {selectedTotal > 0 ? selectedTotal.toFixed(0) : "0"}</p>
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-3 flex-wrap">
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

            {/* Plate number bar - تصميم لوحة دبي الرسمية */}
            <div className="flex items-center justify-between py-1">
              {/* Dubai plate design */}
              <div
                className="flex items-stretch rounded-xl overflow-hidden flex-shrink-0"
                style={{ border: "1.5px solid #c8c8c8", backgroundColor: "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                dir="ltr"
              >
                {/* Left section: code + source */}
                <div
                  className="flex flex-col items-center justify-center px-2 py-1"
                  style={{ backgroundColor: "#f5f5f5", borderRight: "1.5px solid #c8c8c8", minWidth: "44px" }}
                >
                  <span className="text-sm font-black text-gray-900 leading-none" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
                    {finalPlateCodeDisplay || plateCode || "—"}
                  </span>
                  <span className="text-[8px] font-black text-gray-600 tracking-widest mt-0.5" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
                    {plateSource === "DXB" ? "DUBAI" : plateSource === "AUH" ? "ABU DHABI" : plateSource === "SHJ" ? "SHARJAH" : plateSource || "UAE"}
                  </span>
                </div>
                {/* Right section: plate number */}
                <div className="flex items-center justify-center px-3 py-1">
                  <span className="text-base font-black text-gray-900" style={{ fontFamily: "'Arial Black', Arial, sans-serif", letterSpacing: "2px" }}>
                    {plateNumber || "—"}
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-700 mr-2">مراجعة المخالفات رقم اللوحة:</span>
            </div>

            {/* Filter tabs - mobile: scroll horizontally, compact with icons only + count */}
            <div
              className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {filterTabs.map((f) => {
                const isActive = filterStatus === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilterStatus(f.key)}
                    className="flex items-center gap-1 py-2 rounded-2xl font-semibold whitespace-nowrap transition-all flex-shrink-0"
                    style={{
                      backgroundColor: isActive ? "#008755" : "#ffffff",
                      color: isActive ? "#ffffff" : "#374151",
                      border: isActive ? "none" : "1.5px solid #e5e7eb",
                      boxShadow: isActive ? "0 2px 8px rgba(0,135,85,0.25)" : "0 1px 3px rgba(0,0,0,0.06)",
                      fontSize: "11px",
                      padding: "6px 10px",
                    }}
                  >
                    <span style={{ color: isActive ? "#fff" : "#6b7280", display: "flex", alignItems: "center" }}>{f.icon}</span>
                    <span style={{ maxWidth: f.key === "all" ? undefined : "52px", overflow: "hidden", textOverflow: "ellipsis" }}>{f.label}</span>
                    <span
                      className="rounded-full font-bold"
                      style={{
                        backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "#f0f4f2",
                        color: isActive ? "#fff" : "#374151",
                        fontSize: "10px",
                        padding: "1px 5px",
                        minWidth: "16px",
                        textAlign: "center",
                      }}
                    >
                      {f.count}
                    </span>
                  </button>
                );
              })}
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

            {/* Fine cards - mobile (with bottom padding for sticky bar) */}
            {filteredFines.map((fine, idx) => (
              <FineCard key={idx} fine={fine} idx={idx} isMobile={true} />
            ))}

            {/* Spacer for sticky bottom bar */}
            <div className="h-36" />
          </div>

          {/* Bottom summary bar - mobile STICKY */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            style={{ backgroundColor: "#ffffff", borderTop: "1.5px solid #e8ede9", boxShadow: "0 -4px 20px rgba(0,0,0,0.12)" }}
          >
            {/* Stats row - compact */}
            <div className="flex items-center justify-between px-3 pt-2 pb-1">
              <div className="text-center flex-1">
                <p className="text-[10px] text-gray-500 leading-tight">المخالفات</p>
                <p className="text-sm font-black text-gray-900">{allFines.length}</p>
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <div className="text-center flex-1">
                <p className="text-[10px] text-gray-500 leading-tight">قابل للدفع</p>
                <p className="text-sm font-black text-gray-900">{payableCount}</p>
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <div className="text-center flex-1">
                <p className="text-[10px] text-gray-500 leading-tight">إجمالي المبلغ</p>
                <p className="text-sm font-black" style={{ color: "#008755" }}>Đ {selectedTotal > 0 ? selectedTotal.toFixed(0) : "0"}</p>
              </div>
            </div>
            {/* Action buttons + installment in one row */}
            <div className="flex items-center gap-2 px-3 pb-3">
              <button
                onClick={() => { setView("form"); setResult(null); setSelectedFines(new Set()); }}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm font-bold transition-all flex-shrink-0"
                style={{ backgroundColor: "#f0f4f2", color: "#374151", border: "1px solid #e5e7eb" }}
              >
                <ArrowRight className="w-4 h-4" />
                <span>رجوع</span>
              </button>
              <button
                disabled={selectedFines.size === 0}
                className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all"
                style={{ backgroundColor: selectedFines.size > 0 ? "#008755" : "#9ca3af", boxShadow: selectedFines.size > 0 ? "0 4px 12px rgba(0,135,85,0.3)" : "none" }}
                onClick={() => toast.info("سيتم تفعيل الدفع قريباً")}
              >
                دفع المحدد
              </button>
              <label className="flex items-center gap-1 flex-shrink-0 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer" style={{ accentColor: "#008755" }} />
                <span className="text-[10px] text-gray-500 leading-tight">تقسيط<br/>مباشر</span>
              </label>
            </div>
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
      <SharedHeader transparent={true} />

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
