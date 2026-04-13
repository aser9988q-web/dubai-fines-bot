import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
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
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ===== ASSETS =====
const CAR_VIDEO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234476152/RPNmG5rkcSfq3Rp3WTDuVe/car_animation_37ef9678.mp4";
const DUBAI_POLICE_HEADER_LOGO = "/dubai-police-logo.svg";

// CDN logos for sources - الصور الحقيقية من موقع شرطة دبي الرسمي (FinePayment2025)
const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234476152/RPNmG5rkcSfq3Rp3WTDuVe";
const LOGO_DUBAI_POLICE       = `${CDN}/dubaiPolice_525672a1.png`;
const LOGO_SALIK              = `${CDN}/salik_c3c00410.png`;
const LOGO_ABU_DHABI_TRAFFIC  = `${CDN}/abuDhabiTraffic_6fe3c544.png`;
const LOGO_RTA                = `${CDN}/rta_f867f03e.png`;
const LOGO_AJMAN_POLICE       = `${CDN}/ajmanPolice_9dd0afb7.png`;
const LOGO_FUJAIRAH_POLICE    = `${CDN}/fujairahPolice_0b010826.png`;
const LOGO_SHARJAH_TRAFFIC    = `${CDN}/sharjahTraffic_ee9c4faa.png`;
const LOGO_ABU_DHABI_MUN      = `${CDN}/abuDhabiMunicipality_5b3f150c.png`;
const LOGO_BAHRAIN            = `${CDN}/bahrain_46834dc6.png`;
const LOGO_DUBAI_MUN          = `${CDN}/dubaiMunicipality_70bf9d62.png`;
const LOGO_KSA                = `${CDN}/ksa_49d6a139.png`;
const LOGO_KUWAIT             = `${CDN}/kuwait_1bd801b9.png`;
const LOGO_OMAN               = `${CDN}/oman_4935ad8e.png`;
const LOGO_QATAR              = `${CDN}/qatar_de3cea19.png`;
const LOGO_RAK_POLICE         = `${CDN}/rasAlKhaimahPolice_0ed409e6.png`;
const LOGO_SHARJAH_GOV        = `${CDN}/sharjahGoverment_910b1d4d.png`;
const LOGO_SHARJAH_MUN        = `${CDN}/sharjahMunicipality_984da160.png`;

// ===== SOURCE LOGOS - Comprehensive mapping system =====

interface SourceConfig {
  label: string;
  labelEn: string;
  bgColor: string;
  borderColor: string;
  logo: (size: number) => React.ReactElement;
}

// Helper: شعار شرطة عام (دائرة مع نجمة)
function PoliceShieldLogo({ size, bg, accent, text }: { size: number; bg: string; accent: string; text: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 4 L88 18 L88 56 Q88 82 50 96 Q12 82 12 56 L12 18 Z" fill={bg} />
      <path d="M50 10 L82 22 L82 55 Q82 78 50 90 Q18 78 18 55 L18 22 Z" fill={accent} />
      <polygon points="50,24 53,33 63,33 55,39 58,48 50,42 42,48 45,39 37,33 47,33" fill="#FFD700" />
      <text x="50" y="72" textAnchor="middle" fill="white" fontSize="4.5" fontFamily="Arial" fontWeight="bold">{text}</text>
    </svg>
  );
}

// Helper: شعار هيئة عام (مربع ملون)
function AgencyLogo({ size, bg, text1, text2, textColor = "white" }: { size: number; bg: string; text1: string; text2: string; textColor?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="white" rx="10" />
      <rect x="5" y="5" width="90" height="90" rx="8" fill={bg} />
      <text x="50" y="46" textAnchor="middle" fill={textColor} fontSize="13" fontFamily="Arial" fontWeight="900">{text1}</text>
      <text x="50" y="64" textAnchor="middle" fill={textColor} fontSize="10" fontFamily="Arial" fontWeight="600" opacity="0.9">{text2}</text>
    </svg>
  );
}

// Helper: شعار بلدية (مربع بحدود)
function MunicipalityLogo({ size, bg, abbr, city }: { size: number; bg: string; abbr: string; city: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="white" rx="10" />
      <rect x="5" y="5" width="90" height="90" rx="8" fill={bg} />
      {/* Building icon */}
      <rect x="35" y="28" width="30" height="35" fill="rgba(255,255,255,0.25)" rx="2" />
      <rect x="40" y="35" width="6" height="8" fill="rgba(255,255,255,0.6)" rx="1" />
      <rect x="54" y="35" width="6" height="8" fill="rgba(255,255,255,0.6)" rx="1" />
      <rect x="40" y="48" width="6" height="8" fill="rgba(255,255,255,0.6)" rx="1" />
      <rect x="54" y="48" width="6" height="8" fill="rgba(255,255,255,0.6)" rx="1" />
      <rect x="44" y="56" width="12" height="7" fill="rgba(255,255,255,0.4)" rx="1" />
      <text x="50" y="76" textAnchor="middle" fill="white" fontSize="8" fontFamily="Arial" fontWeight="900">{abbr}</text>
      <text x="50" y="88" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="5.5" fontFamily="Arial">{city}</text>
    </svg>
  );
}

const SOURCE_MAP: SourceConfig[] = [
  // ===== شرطة دبي =====
  {
    label: "شرطة دبي",
    labelEn: "Dubai Police",
    bgColor: "#e8f5ee",
    borderColor: "#008755",
    logo: (size) => <img src={LOGO_DUBAI_POLICE} alt="Dubai Police" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />,
  },
  // ===== شرطة أبوظبي =====
  {
    label: "شرطة أبوظبي",
    labelEn: "Abu Dhabi Police",
    bgColor: "#fff5e8",
    borderColor: "#8B0000",
    logo: (size) => <img src={LOGO_ABU_DHABI_TRAFFIC} alt="Abu Dhabi Police" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />
  },
  // ===== شرطة الشارقة =====
  {
    label: "شرطة الشارقة",
    labelEn: "Sharjah Police",
    bgColor: "#e8f0ff",
    borderColor: "#1a3a8c",
    logo: (size) => <img src={LOGO_SHARJAH_TRAFFIC} alt="Sharjah Police" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />
  },
  // ===== شرطة عجمان =====
  {
    label: "شرطة عجمان",
    labelEn: "Ajman Police",
    bgColor: "#e8f4ff",
    borderColor: "#0a5a8c",
    logo: (size) => <img src={LOGO_AJMAN_POLICE} alt="Ajman Police" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />
  },
  // ===== شرطة أم القيوين =====
  {
    label: "شرطة أم القيوين",
    labelEn: "UAQ Police",
    bgColor: "#f0f8ff",
    borderColor: "#2a6a4a",
    logo: (size) => <PoliceShieldLogo size={size} bg="#1a5a3a" accent="#2a6a4a" text="UAQ POLICE" />,
  },
  // ===== شرطة رأس الخيمة =====
  {
    label: "شرطة رأس الخيمة",
    labelEn: "RAK Police",
    bgColor: "#fff0f8",
    borderColor: "#8c1a4a",
    logo: (size) => <img src={LOGO_RAK_POLICE} alt="RAK Police" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />
  },
  // ===== شرطة الفجيرة =====
  {
    label: "شرطة الفجيرة",
    labelEn: "Fujairah Police",
    bgColor: "#f8f0ff",
    borderColor: "#5a1a8c",
    logo: (size) => <img src={LOGO_FUJAIRAH_POLICE} alt="Fujairah Police" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />
  },
  // ===== وزارة الداخلية =====
  {
    label: "وزارة الداخلية",
    labelEn: "MOI",
    bgColor: "#f5f0e8",
    borderColor: "#8B6914",
    logo: (size) => (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="white" rx="10" />
        <rect x="5" y="5" width="90" height="90" rx="8" fill="#8B6914" />
        {/* UAE Falcon */}
        <ellipse cx="50" cy="40" rx="14" ry="16" fill="#C8A020" />
        <path d="M36 40 Q28 33 24 48 Q32 53 36 46Z" fill="#C8A020" />
        <path d="M64 40 Q72 33 76 48 Q68 53 64 46Z" fill="#C8A020" />
        <circle cx="50" cy="33" r="7" fill="#C8A020" />
        <path d="M44 56 L50 70 L56 56Z" fill="#C8A020" />
        <text x="50" y="84" textAnchor="middle" fill="white" fontSize="5.5" fontFamily="Arial" fontWeight="bold">MOI UAE</text>
      </svg>
    ),
  },
  // ===== هيئة الطرق والمواصلات - دبي =====
  {
    label: "هيئة الطرق والمواصلات - دبي",
    labelEn: "RTA Dubai",
    bgColor: "#fff0f0",
    borderColor: "#CC0000",
    logo: (size) => <img src={LOGO_RTA} alt="RTA Dubai" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />,
  },
  // ===== مركز النقل المتكامل - أبوظبي =====
  {
    label: "مركز النقل المتكامل - أبوظبي",
    labelEn: "ITC Abu Dhabi",
    bgColor: "#e8f0ff",
    borderColor: "#1a3a8c",
    logo: (size) => <AgencyLogo size={size} bg="#1a3a8c" text1="ITC" text2="أبوظبي" />,
  },
  // ===== هيئة الطرق - الشارقة =====
  {
    label: "هيئة الطرق والمواصلات - الشارقة",
    labelEn: "SRTA Sharjah",
    bgColor: "#fff5e8",
    borderColor: "#c86a00",
    logo: (size) => <AgencyLogo size={size} bg="#c86a00" text1="SRTA" text2="الشارقة" />,
  },
  // ===== هيئة النقل - عجمان =====
  {
    label: "هيئة النقل - عجمان",
    labelEn: "TA Ajman",
    bgColor: "#e8f8ff",
    borderColor: "#0a6a9c",
    logo: (size) => <AgencyLogo size={size} bg="#0a6a9c" text1="TA" text2="عجمان" />,
  },
  // ===== هيئة رأس الخيمة للمواصلات =====
  {
    label: "هيئة رأس الخيمة للمواصلات",
    labelEn: "RAK TA",
    bgColor: "#fff0f5",
    borderColor: "#9c1a4a",
    logo: (size) => <AgencyLogo size={size} bg="#9c1a4a" text1="RAK" text2="مواصلات" />,
  },
  // ===== سالك =====
  {
    label: "سالك",
    labelEn: "Salik",
    bgColor: "#f0f0f8",
    borderColor: "#4A4A6A",
    logo: (size) => <img src={LOGO_SALIK} alt="Salik" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />,
  },
  // ===== درب =====
  {
    label: "درب",
    labelEn: "Darb",
    bgColor: "#f0f8f0",
    borderColor: "#2d7a2d",
    logo: (size) => (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="white" rx="8" />
        <rect x="5" y="5" width="90" height="90" rx="7" fill="#2d7a2d" />
        <text x="50" y="46" textAnchor="middle" fill="white" fontSize="20" fontFamily="Arial" fontWeight="900">درب</text>
        <text x="50" y="66" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="15" fontFamily="Arial" fontWeight="600">Darb</text>
      </svg>
    ),
  },
  // ===== بلدية دبي =====
  {
    label: "بلدية دبي",
    labelEn: "Dubai Municipality",
    bgColor: "#e8f5ee",
    borderColor: "#006633",
    logo: (size) => <img src={LOGO_DUBAI_MUN} alt="Dubai Municipality" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />
  },
  // ===== بلدية مدينة أبوظبي =====
  {
    label: "بلدية مدينة أبوظبي",
    labelEn: "Abu Dhabi City Municipality",
    bgColor: "#fff5e8",
    borderColor: "#8B4500",
    logo: (size) => <img src={LOGO_ABU_DHABI_MUN} alt="Abu Dhabi Municipality" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />
  },
  // ===== بلدية مدينة العين =====
  {
    label: "بلدية مدينة العين",
    labelEn: "Al Ain Municipality",
    bgColor: "#f0f8e8",
    borderColor: "#4a7a00",
    logo: (size) => <MunicipalityLogo size={size} bg="#4a7a00" abbr="AAM" city="Al Ain" />,
  },
  // ===== بلدية منطقة الظفرة =====
  {
    label: "بلدية منطقة الظفرة",
    labelEn: "Dhafra Municipality",
    bgColor: "#f5f0e8",
    borderColor: "#7a5a00",
    logo: (size) => <MunicipalityLogo size={size} bg="#7a5a00" abbr="DHM" city="Dhafra" />,
  },
  // ===== بلدية مدينة الشارقة =====
  {
    label: "بلدية مدينة الشارقة",
    labelEn: "Sharjah City Municipality",
    bgColor: "#e8ecff",
    borderColor: "#2a3a9c",
    logo: (size) => <img src={LOGO_SHARJAH_MUN} alt="Sharjah Municipality" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />
  },
  // ===== بلدية منطقة عجمان =====
  {
    label: "بلدية منطقة عجمان",
    labelEn: "Ajman Municipality",
    bgColor: "#e8f4ff",
    borderColor: "#0a5a9c",
    logo: (size) => <MunicipalityLogo size={size} bg="#0a5a9c" abbr="AJM" city="Ajman" />,
  },
  // ===== بلدية أم القيوين =====
  {
    label: "بلدية أم القيوين",
    labelEn: "UAQ Municipality",
    bgColor: "#e8fff5",
    borderColor: "#007a4a",
    logo: (size) => <MunicipalityLogo size={size} bg="#007a4a" abbr="UAQ" city="Um Al Quwain" />,
  },
  // ===== بلدية رأس الخيمة =====
  {
    label: "بلدية رأس الخيمة",
    labelEn: "RAK Municipality",
    bgColor: "#fff0f5",
    borderColor: "#9c1a4a",
    logo: (size) => <MunicipalityLogo size={size} bg="#9c1a4a" abbr="RAKM" city="Ras Al Khaimah" />,
  },
  // ===== بلدية الفجيرة =====
  {
    label: "بلدية الفجيرة",
    labelEn: "Fujairah Municipality",
    bgColor: "#f5f0ff",
    borderColor: "#5a1a9c",
    logo: (size) => <MunicipalityLogo size={size} bg="#5a1a9c" abbr="FJM" city="Fujairah" />,
  },
  // ===== دائرة التنمية الاقتصادية - دبي =====
  {
    label: "دائرة التنمية الاقتصادية - دبي",
    labelEn: "DED Dubai",
    bgColor: "#fff8e8",
    borderColor: "#c87000",
    logo: (size) => <AgencyLogo size={size} bg="#c87000" text1="DED" text2="Dubai" />,
  },
  // ===== دائرة التنمية الاقتصادية - أبوظبي =====
  {
    label: "دائرة التنمية الاقتصادية - أبوظبي",
    labelEn: "ADDED",
    bgColor: "#fff5e8",
    borderColor: "#8B4500",
    logo: (size) => <AgencyLogo size={size} bg="#8B4500" text1="ADDED" text2="أبوظبي" />,
  },
  // ===== دائرة التنمية الاقتصادية - الشارقة =====
  {
    label: "دائرة التنمية الاقتصادية - الشارقة",
    labelEn: "SEDD",
    bgColor: "#e8ecff",
    borderColor: "#2a3a9c",
    logo: (size) => <AgencyLogo size={size} bg="#2a3a9c" text1="SEDD" text2="الشارقة" />,
  },
  // ===== الهيئة الاتحادية للهوية والجنسية (ICP) =====
  {
    label: "الهيئة الاتحادية للهوية والجنسية والجمارك وأمن المنافذ",
    labelEn: "ICP",
    bgColor: "#f5f0e8",
    borderColor: "#7a5a00",
    logo: (size) => <AgencyLogo size={size} bg="#7a5a00" text1="ICP" text2="UAE" />,
  },
  // ===== حكومة الشارقة =====
  {
    label: "حكومة الشارقة",
    labelEn: "Sharjah Government",
    bgColor: "#e8ecff",
    borderColor: "#2a3a9c",
    logo: (size) => <img src={LOGO_SHARJAH_GOV} alt="Sharjah Government" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />
  },
  // ===== الكويت =====
  {
    label: "الكويت",
    labelEn: "Kuwait",
    bgColor: "#f0f8e8",
    borderColor: "#2d7a2d",
    logo: (size) => <img src={LOGO_KUWAIT} alt="Kuwait" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />
  },
  // ===== قطر =====
  {
    label: "قطر",
    labelEn: "Qatar",
    bgColor: "#f8e8f0",
    borderColor: "#8B0000",
    logo: (size) => <img src={LOGO_QATAR} alt="Qatar" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />
  },
  // ===== عمان =====
  {
    label: "عُمان",
    labelEn: "Oman",
    bgColor: "#fff0e8",
    borderColor: "#c83a00",
    logo: (size) => <img src={LOGO_OMAN} alt="Oman" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />
  },
  // ===== البحرين =====
  {
    label: "البحرين",
    labelEn: "Bahrain",
    bgColor: "#f8e8e8",
    borderColor: "#cc0000",
    logo: (size) => <img src={LOGO_BAHRAIN} alt="Bahrain" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />
  },
  // ===== المملكة العربية السعودية =====
  {
    label: "المملكة العربية السعودية",
    labelEn: "Saudi Arabia",
    bgColor: "#e8f5ee",
    borderColor: "#006633",
    logo: (size) => <img src={LOGO_KSA} alt="Saudi Arabia" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />
  },
  // ===== النيابة العامة =====
  {
    label: "النيابة العامة للدولة",
    labelEn: "Public Prosecution",
    bgColor: "#f0f0f5",
    borderColor: "#3a3a6a",
    logo: (size) => <AgencyLogo size={size} bg="#3a3a6a" text1="PP" text2="UAE" />,
  },
  // ===== دائرة القضاء - أبوظبي =====
  {
    label: "دائرة القضاء - أبوظبي",
    labelEn: "ADJD",
    bgColor: "#f5f0e8",
    borderColor: "#8B6914",
    logo: (size) => <AgencyLogo size={size} bg="#8B6914" text1="ADJD" text2="أبوظبي" />,
  },
  // ===== محاكم دبي =====
  {
    label: "محاكم دبي",
    labelEn: "Dubai Courts",
    bgColor: "#e8f5ee",
    borderColor: "#006633",
    logo: (size) => <AgencyLogo size={size} bg="#006633" text1="DC" text2="Dubai" />,
  },
];

function getSourceConfig(source: string): SourceConfig | null {
  if (!source) return null;
  const s = source.trim();
  const up = s.toUpperCase();
  const lo = s.toLowerCase();

  // ===== شرطة دبي =====
  if (lo.includes("شرطة دبي") || up.includes("DUBAI POLICE") || (up.includes("DUBAI") && up.includes("POLICE")))
    return SOURCE_MAP[0];

  // ===== شرطة أبوظبي =====
  if (lo.includes("شرطة أبوظبي") || lo.includes("شرطة ابوظبي") || up.includes("ABU DHABI POLICE") || (up.includes("ABU DHABI") && up.includes("POLICE")))
    return SOURCE_MAP[1];

  // ===== شرطة الشارقة =====
  if (lo.includes("شرطة الشارقة") || up.includes("SHARJAH POLICE") || (up.includes("SHARJAH") && up.includes("POLICE")))
    return SOURCE_MAP[2];

  // ===== شرطة عجمان =====
  if (lo.includes("شرطة عجمان") || up.includes("AJMAN POLICE") || (up.includes("AJMAN") && up.includes("POLICE")))
    return SOURCE_MAP[3];

  // ===== شرطة أم القيوين =====
  if (lo.includes("شرطة أم القيوين") || lo.includes("شرطة ام القيوين") || up.includes("UAQ POLICE") || (up.includes("UAQ") && up.includes("POLICE")) || up.includes("UMM AL QUWAIN"))
    return SOURCE_MAP[4];

  // ===== شرطة رأس الخيمة =====
  if (lo.includes("شرطة رأس الخيمة") || lo.includes("شرطة راس الخيمة") || up.includes("RAK POLICE") || (up.includes("RAS AL KHAIMAH") && up.includes("POLICE")))
    return SOURCE_MAP[5];

  // ===== شرطة الفجيرة =====
  if (lo.includes("شرطة الفجيرة") || up.includes("FUJAIRAH POLICE") || (up.includes("FUJAIRAH") && up.includes("POLICE")))
    return SOURCE_MAP[6];

  // ===== وزارة الداخلية =====
  if (lo.includes("وزارة الداخلية") || up.includes("MINISTRY OF INTERIOR") || up === "MOI")
    return SOURCE_MAP[7];

  // ===== هيئة الطرق والمواصلات - دبي (RTA) =====
  if (lo.includes("هيئة الطرق والمواصلات") || up.includes("RTA") || up.includes("ROADS AND TRANSPORT") || up.includes("ROADS & TRANSPORT"))
    return SOURCE_MAP[8];

  // ===== مركز النقل المتكامل - أبوظبي =====
  if (lo.includes("مركز النقل المتكامل") || up.includes("ITC") || up.includes("INTEGRATED TRANSPORT"))
    return SOURCE_MAP[9];

  // ===== Abu Dhabi Traffic (القيمة الحرفية من الـ API) - مرور أبوظبي =====
  if (lo.includes("abu dhabi traffic") || up.includes("ABU DHABI TRAFFIC") || lo.includes("مرور أبوظبي") || lo.includes("مرور ابوظبي") || (up.includes("ABU DHABI") && up.includes("TRAFFIC")))
    return SOURCE_MAP[1]; // شرطة أبوظبي / مرور أبوظبي

  // ===== هيئة الطرق - الشارقة =====
  if (lo.includes("هيئة الطرق") && lo.includes("الشارقة") || up.includes("SRTA"))
    return SOURCE_MAP[10];

  // ===== هيئة النقل - عجمان =====
  if ((lo.includes("هيئة النقل") && lo.includes("عجمان")) || (up.includes("TA") && up.includes("AJMAN")))
    return SOURCE_MAP[11];

  // ===== هيئة رأس الخيمة للمواصلات =====
  if (lo.includes("هيئة رأس الخيمة") || lo.includes("هيئة راس الخيمة") || up.includes("RAK TA") || (up.includes("RAK") && up.includes("TRANSPORT")))
    return SOURCE_MAP[12];

  // ===== سالك =====
  if (lo.includes("سالك") || up.includes("SALIK"))
    return SOURCE_MAP[13];

  // ===== درب =====
  if (lo.includes("درب") || up.includes("DARB"))
    return SOURCE_MAP[14];

  // ===== بلدية دبي =====
  if (lo.includes("بلدية دبي") || up.includes("DUBAI MUNICIPALITY") || up.includes("DUBAI MUN"))
    return SOURCE_MAP[15];

  // ===== بلدية مدينة أبوظبي =====
  if (lo.includes("بلدية مدينة أبوظبي") || lo.includes("بلدية مدينة ابوظبي") || up.includes("ABU DHABI CITY MUNICIPALITY"))
    return SOURCE_MAP[16];

  // ===== بلدية مدينة العين =====
  if (lo.includes("بلدية مدينة العين") || up.includes("AL AIN MUNICIPALITY"))
    return SOURCE_MAP[17];

  // ===== بلدية منطقة الظفرة =====
  if (lo.includes("بلدية منطقة الظفرة") || up.includes("DHAFRA"))
    return SOURCE_MAP[18];

  // ===== بلدية مدينة الشارقة =====
  if (lo.includes("بلدية مدينة الشارقة") || up.includes("SHARJAH CITY MUNICIPALITY") || up.includes("SHARJAH MUN"))
    return SOURCE_MAP[19];

  // ===== بلدية منطقة عجمان =====
  if (lo.includes("بلدية منطقة عجمان") || lo.includes("بلدية عجمان") || up.includes("AJMAN MUNICIPALITY"))
    return SOURCE_MAP[20];

  // ===== بلدية أم القيوين =====
  if (lo.includes("بلدية أم القيوين") || lo.includes("بلدية ام القيوين") || up.includes("UAQ MUNICIPALITY"))
    return SOURCE_MAP[21];

  // ===== بلدية رأس الخيمة =====
  if (lo.includes("بلدية رأس الخيمة") || lo.includes("بلدية راس الخيمة") || up.includes("RAK MUNICIPALITY"))
    return SOURCE_MAP[22];

  // ===== بلدية الفجيرة =====
  if (lo.includes("بلدية الفجيرة") || up.includes("FUJAIRAH MUNICIPALITY"))
    return SOURCE_MAP[23];

  // ===== دائرة التنمية الاقتصادية - دبي =====
  if ((lo.includes("دائرة التنمية") && lo.includes("دبي")) || up.includes("DED") && up.includes("DUBAI"))
    return SOURCE_MAP[24];

  // ===== دائرة التنمية الاقتصادية - أبوظبي =====
  if ((lo.includes("دائرة التنمية") && (lo.includes("أبوظبي") || lo.includes("ابوظبي"))) || up.includes("ADDED"))
    return SOURCE_MAP[25];

  // ===== دائرة التنمية الاقتصادية - الشارقة =====
  if ((lo.includes("دائرة التنمية") && lo.includes("الشارقة")) || up.includes("SEDD"))
    return SOURCE_MAP[26];

  // ===== ICP =====
  if (lo.includes("هيئة الاتحادية للهوية") || up.includes("ICP") || up.includes("IDENTITY") || up.includes("CUSTOMS"))
    return SOURCE_MAP[27];

  // ===== النيابة العامة =====
  if (lo.includes("النيابة العامة") || up.includes("PUBLIC PROSECUTION") || up.includes("PROSECUTION"))
    return SOURCE_MAP[28];

  // ===== دائرة القضاء - أبوظبي =====
  if ((lo.includes("دائرة القضاء") && (lo.includes("أبوظبي") || lo.includes("ابوظبي"))) || up.includes("ADJD"))
    return SOURCE_MAP[29];

  // ===== محاكم دبي =====
  if (lo.includes("محاكم دبي") || up.includes("DUBAI COURTS"))
    return SOURCE_MAP[30];

  // ===== حكومة الشارقة =====
  if (lo.includes("حكومة الشارقة") || up.includes("SHARJAH GOVERNMENT") || up.includes("SHARJAH GOV"))
    return SOURCE_MAP[31];

  // ===== الكويت =====
  if (lo.includes("الكويت") || up.includes("KUWAIT") || up === "KWT")
    return SOURCE_MAP[32];

  // ===== قطر =====
  if (lo.includes("قطر") || up.includes("QATAR") || up === "QAT")
    return SOURCE_MAP[33];

  // ===== عمان =====
  if (lo.includes("عُمان") || lo.includes("عمان") || up.includes("OMAN") || up === "OMN")
    return SOURCE_MAP[34];

  // ===== البحرين =====
  if (lo.includes("البحرين") || up.includes("BAHRAIN") || up === "BAH")
    return SOURCE_MAP[35];

  // ===== السعودية =====
  if (lo.includes("السعودية") || lo.includes("سعودية") || up.includes("SAUDI") || up.includes("KSA") || up === "KSA")
    return SOURCE_MAP[36];

  return null;
}

function SourceIcon({ source, size = 28 }: { source: string; size?: number }) {
  const config = getSourceConfig(source);
  // Debug: log source value to understand what comes from API
  if (typeof window !== 'undefined') {
    console.log('[SourceIcon] source value:', JSON.stringify(source), '| matched:', config?.label ?? 'NO MATCH');
  }
  if (config) return <>{config.logo(size)}</>;
  // Fallback: initials in colored circle
  const initials = (source || "?").substring(0, 2).toUpperCase();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: "50%" }}>
      <circle cx="50" cy="50" r="50" fill="#e8f5ee" />
      <text x="50" y="62" textAnchor="middle" fill="#008755" fontSize="32" fontFamily="Arial" fontWeight="bold">{initials}</text>
    </svg>
  );
}

function getSourceBgColor(source: string): string {
  return getSourceConfig(source)?.bgColor ?? "#f0f4f2";
}

function getSourceLabel(source: string, lang?: string): string {
  const config = getSourceConfig(source);
  if (!config) return source || "—";
  return lang === "en" ? (config.labelEn || config.label) : config.label;
}

// ===== SOURCE BADGE COMPONENT =====
function SourceBadge({ source, lang }: { source: string; lang?: string }) {
  const config = getSourceConfig(source);
  const bgColor = config?.bgColor ?? "#f0f4f2";
  const label = getSourceLabel(source, lang);
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          backgroundColor: bgColor,
          border: "1px solid rgba(0,0,0,0.08)",
          padding: "2px",
        }}
      >
        <SourceIcon source={source} size={32} />
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
  blackPoints?: number | string;
}

interface QueryResult {
  success: boolean;
  fines: FineResult[];
  errorMessage?: string;
  ownerName?: string;
  queryId?: number;
  sessionId?: string | null;
}

interface QueryHistory {
  id: number;
  plateSource: string;
  plateNumber: string;
  plateCode: string;
  status: string;
  createdAt: Date;
}

// ===== DUBAI PLATE DISPLAY COMPONENT =====
function DubaiPlateDisplay({ plateSource, plateNumber, plateCode }: { plateSource: string; plateNumber: string; plateCode: string }) {
  // Get the English label for the source
  const sourceConfig = ALL_PLATE_SOURCES.find(s => s.value === plateSource);
  const sourceLabel = sourceConfig?.labelEn?.toUpperCase() || (plateSource ? plateSource.toUpperCase() : "UAE");

  // Determine if it's an Emirati plate (white background with colored city name)
  const isEmirati = ["DXB","AUH","SHJ","AJM","UAQ","RAK","FUJ"].includes(plateSource);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        border: "2.5px solid #c0c0c0",
        borderRadius: "10px",
        padding: "8px 18px",
        minWidth: "220px",
        height: "60px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.8)",
        gap: "10px",
        position: "relative",
      }}
    >
      {/* Plate code on the left */}
      {plateCode && (
        <span style={{ fontSize: "22px", fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, color: "#111", letterSpacing: "1px", minWidth: "20px", textAlign: "center" }}>
          {plateCode}
        </span>
      )}

      {/* City name in the middle - styled like Dubai Police */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {isEmirati ? (
          <>
            {/* Arabic city name */}
            <span style={{ fontSize: "9px", fontFamily: "'Arial', sans-serif", fontWeight: 700, color: "#222", lineHeight: 1, letterSpacing: "0.5px" }}>
              {sourceConfig?.label || sourceLabel}
            </span>
            {/* English city name - styled like original */}
            <span style={{
              fontSize: "16px",
              fontFamily: "'Arial Black', Arial, sans-serif",
              fontWeight: 900,
              color: plateSource === "DXB" ? "#1a1a1a" : plateSource === "AUH" ? "#1a1a1a" : "#1a1a1a",
              letterSpacing: "3px",
              lineHeight: 1,
              textTransform: "uppercase",
            }}>
              {sourceLabel}
            </span>
          </>
        ) : (
          <span style={{ fontSize: "16px", fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, color: "#1a1a1a", letterSpacing: "2px" }}>
            {plateSource ? sourceLabel : "UAE"}
          </span>
        )}
      </div>

      {/* Plate number on the right */}
      <span style={{ fontSize: "24px", fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, color: "#111", letterSpacing: "2px", minWidth: "40px", textAlign: "center" }}>
        {plateNumber || (plateCode || plateSource ? "" : "—")}
      </span>
    </div>
  );
}

// ===== DUBAI PLATE DISPLAY LARGE (for video overlay - matches original Dubai Police site) =====
function DubaiPlateDisplayLarge({ plateSource, plateNumber, plateCode }: { plateSource: string; plateNumber: string; plateCode: string }) {
  const sourceConfig = ALL_PLATE_SOURCES.find(s => s.value === plateSource);
  const sourceLabel = sourceConfig?.labelEn?.toUpperCase() || (plateSource ? plateSource.toUpperCase() : "");
  const arabicLabel = sourceConfig?.label || "";
  const isEmirati = ["DXB","AUH","SHJ","AJM","UAQ","RAK","FUJ"].includes(plateSource);
  const hasData = !!(plateSource || plateNumber || plateCode);

  // Font matching original Dubai Police site - uses 'Dubai' font family
  const plateFontStyle: React.CSSProperties = {
    fontFamily: "'Dubai', 'Arial Black', Arial, sans-serif",
    fontWeight: 700,
    letterSpacing: "2px",
    color: "#111",
    lineHeight: 1,
    direction: "ltr",
    unicodeBidi: "bidi-override",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        border: "2px solid #c0c0c0",
        borderRadius: "8px",
        padding: "5px 12px",
        width: "100%",
        height: "52px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.25)",
        gap: "8px",
        direction: "ltr",
      }}
    >
      {/* Plate code - left side */}
      <span style={{ ...plateFontStyle, fontSize: "18px", minWidth: "20px", textAlign: "center", flexShrink: 0 }}>
        {plateCode || ""}
      </span>

      {/* City name - center */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "1px" }}>
        {isEmirati && arabicLabel ? (
          <span style={{ fontSize: "7px", fontFamily: "'Dubai', 'Cairo', sans-serif", fontWeight: 500, color: "#444", lineHeight: 1, letterSpacing: "0.5px" }}>
            {arabicLabel}
          </span>
        ) : null}
        <span style={{ ...plateFontStyle, fontSize: "16px", letterSpacing: "3px", textTransform: "uppercase" }}>
          {plateSource ? sourceLabel : ""}
        </span>
      </div>

      {/* Plate number - right side */}
      <span style={{ ...plateFontStyle, fontSize: "20px", letterSpacing: "2px", flexShrink: 0, minWidth: "32px", textAlign: "center" }}>
        {plateNumber || ""}
      </span>
    </div>
  );
}

// ===== FORM FIELDS COMPONENT (shared between desktop and mobile) =====
function PlateFormFields({
  plateSource, setPlateSource,
  plateNumber, setPlateNumber,
  plateCode, setPlateCode,
  selectedPlateCodeId, setSelectedPlateCodeId,
  selectedPlateCategory, setSelectedPlateCategory,
  ksaLetter1, setKsaLetter1,
  ksaLetter2, setKsaLetter2,
  ksaLetter3, setKsaLetter3,
  onEnter,
}: {
  plateSource: string; setPlateSource: (v: string) => void;
  plateNumber: string; setPlateNumber: (v: string) => void;
  plateCode: string; setPlateCode: (v: string) => void;
  selectedPlateCodeId?: number; setSelectedPlateCodeId: (v: number | undefined) => void;
  selectedPlateCategory?: number; setSelectedPlateCategory: (v: number | undefined) => void;
  ksaLetter1: string; setKsaLetter1: (v: string) => void;
  ksaLetter2: string; setKsaLetter2: (v: string) => void;
  ksaLetter3: string; setKsaLetter3: (v: string) => void;
  onEnter: () => void;
}) {
  const { t, lang } = useLanguage();
  const { data: plateCodesData } = trpc.fines.getPlateCodes.useQuery(
    { plateSource },
    {
      enabled: !!plateSource && plateSource !== "KSA",
      retry: false,
      staleTime: 60 * 60 * 1000,
    }
  );
  const dynamicPlateCodes = plateCodesData?.plateCodes ?? [];
  const hasDynamicPlateCodes = dynamicPlateCodes.length > 0;
  const normalizePlateValue = (value: string) => value
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .trim()
    .toUpperCase();
  const currentPlateCodes = hasDynamicPlateCodes
    ? dynamicPlateCodes
    : (plateSource ? (PLATE_CODES_BY_SOURCE[plateSource] || []).map((code) => ({
        value: code,
        label: code,
        labelEn: code,
        labelAr: code,
        categoryId: 2,
        codeId: Number.isFinite(Number(code)) ? Number(code) : 0,
      })) : []);
  const selectedDynamicPlateCode = hasDynamicPlateCodes
    ? (dynamicPlateCodes.find((code) => code.codeId === selectedPlateCodeId && code.categoryId === selectedPlateCategory)
      ?? dynamicPlateCodes.find((code) => [code.label, code.labelEn, code.labelAr, code.value].some(
        (candidate) => normalizePlateValue(String(candidate ?? "")) === normalizePlateValue(plateCode)
      )))
    : null;
  const plateCodeSelectValue = hasDynamicPlateCodes
    ? (selectedDynamicPlateCode ? `${selectedDynamicPlateCode.codeId}:${selectedDynamicPlateCode.categoryId}` : "")
    : plateCode;

  return (
    <>
      {/* جهة إصدار اللوحة */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 block text-right">{t.home.form.plateSource}</label>
        <div className="relative">
            <select
              value={plateSource}
              onChange={(e) => {
                setPlateSource(e.target.value);
                setPlateCode("");
                setSelectedPlateCodeId(undefined);
                setSelectedPlateCategory(undefined);
              }}
              className="w-full text-base rounded-xl px-4 py-4 appearance-none focus:outline-none"

            style={{ backgroundColor: "#ffffff", border: plateSource ? "2px solid #008755" : "1.5px solid #d1d5db", color: plateSource ? "#111827" : "#9ca3af", fontWeight: plateSource ? "600" : "400", paddingLeft: "2.5rem" }}
          >
            <option value="" disabled>{t.home.form.plateSourcePlaceholder}</option>
            {ALL_PLATE_SOURCES.map((s) => (<option key={s.value} value={s.value}>{lang === "en" ? s.labelEn : s.label}</option>))}
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></div>
        </div>
      </div>
      {/* رقم اللوحة */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 block text-right">{t.home.form.plateNumber}</label>
        <input type="text" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder={t.home.form.plateNumberPlaceholder} onKeyDown={(e) => e.key === "Enter" && onEnter()} className="w-full text-base rounded-xl px-4 py-4 focus:outline-none" style={{ backgroundColor: "#f5f5f5", border: "1.5px solid #e5e7eb", color: "#111827", textAlign: "right" }} dir="ltr" />
      </div>
      {/* رمز اللوحة */}
      {plateSource === "KSA" ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block text-right">{t.home.form.plateCode}</label>
            <div className="relative">
              <select value={plateCode} onChange={(e) => { setPlateCode(e.target.value); setSelectedPlateCodeId(undefined); setSelectedPlateCategory(undefined); }} className="w-full text-base rounded-xl px-4 py-4 appearance-none focus:outline-none" style={{ backgroundColor: "#ffffff", border: "1.5px solid #d1d5db", color: plateCode ? "#111827" : "#9ca3af", paddingLeft: "2.5rem" }} dir="ltr">
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
                  <select value={item.value} onChange={(e) => item.setter(e.target.value)} className="w-full text-base rounded-xl px-4 py-4 appearance-none focus:outline-none" style={{ backgroundColor: "#ffffff", border: "1.5px solid #d1d5db", color: item.value ? "#111827" : "#9ca3af", paddingLeft: "2.5rem" }} dir={isRTL ? "rtl" : "ltr"}>
                    <option value="">{t.home.form.plateCodePlaceholder}</option>
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
          <label className="text-sm font-bold text-gray-700 block text-right">{t.home.form.plateCode}</label>
          <div className="relative">
            <select
              value={plateCodeSelectValue}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (!hasDynamicPlateCodes) {
                  setPlateCode(selectedValue);
                  setSelectedPlateCodeId(undefined);
                  setSelectedPlateCategory(undefined);
                  return;
                }

                const selected = currentPlateCodes.find((code) => `${code.codeId}:${code.categoryId}` === selectedValue);
                setPlateCode(selected ? (lang === "en" ? (selected.labelEn || selected.label) : (selected.labelAr || selected.labelEn || selected.label)) : "");
                setSelectedPlateCodeId(selected?.codeId);
                setSelectedPlateCategory(selected?.categoryId);
              }}
              disabled={!plateSource}
              className="w-full text-base rounded-xl px-4 py-4 appearance-none focus:outline-none"
              style={{ backgroundColor: plateSource ? "#ffffff" : "#f3f4f6", border: "1.5px solid #d1d5db", color: plateCode ? "#111827" : "#9ca3af", cursor: plateSource ? "pointer" : "not-allowed", paddingLeft: "2.5rem" }}
              dir="ltr"
            >
              <option value="">{t.home.form.plateCodePlaceholder}</option>
              {currentPlateCodes.map((code) => {
                const optionValue = hasDynamicPlateCodes ? `${code.codeId}:${code.categoryId}` : code.label;
                const optionLabel = lang === "en"
                  ? (code.labelEn || code.label)
                  : (code.labelAr || code.labelEn || code.label);
                return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
              })}
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
  const [selectedPlateCodeId, setSelectedPlateCodeId] = useState<number | undefined>(undefined);
  const [selectedPlateCategory, setSelectedPlateCategory] = useState<number | undefined>(undefined);
  const [ksaLetter1, setKsaLetter1] = useState("");
  const [ksaLetter2, setKsaLetter2] = useState("");
  const [ksaLetter3, setKsaLetter3] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [location, navigate] = useLocation();
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFines, setSelectedFines] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const { t, lang, setLanguage, isRTL } = useLanguage();
  const isArabicRoute = location === "/ar" || location.startsWith("/ar?");

  const buildLocalizedPath = (targetLang: "ar" | "en") => {
    const params = window.location.search || "";
    return targetLang === "ar" ? `/ar${params}` : `/${params}`;
  };

  const handleLanguageNavigation = () => {
    const nextLang = isArabicRoute ? "en" : "ar";
    setLanguage(nextLang);
    navigate(buildLocalizedPath(nextLang));
  };

  useEffect(() => {
    setLanguage(isArabicRoute ? "ar" : "en");
  }, [isArabicRoute, setLanguage]);

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
      toast.error((lang === "ar" ? "فشل الاستعلام: " : "Query failed: ") + err.message);
    },
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleEnded = () => { video.pause(); setIsVideoPlaying(false); };
    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const normalizeDigits = (value: string) => value
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

  const handleQuery = () => {
    if (!plateSource) { toast.error(lang === "ar" ? "يرجى اختيار جهة إصدار اللوحة" : "Please select the plate source"); return; }

    const normalizedPlateNumber = normalizeDigits(plateNumber).trim();
    if (!normalizedPlateNumber) { toast.error(lang === "ar" ? "يرجى إدخال رقم اللوحة" : "Please enter the plate number"); return; }

    const finalPlateCode = plateSource === "KSA"
      ? [ksaLetter1, ksaLetter2, ksaLetter3].filter(Boolean).join("")
      : normalizeDigits(plateCode).trim();

    if (!finalPlateCode) { toast.error(lang === "ar" ? "يرجى اختيار رمز اللوحة" : "Please select the plate code"); return; }

    queryMutation.mutate({
      plateSource,
      plateNumber: normalizedPlateNumber,
      plateCode: finalPlateCode,
      plateCodeId: plateSource === "KSA" ? undefined : selectedPlateCodeId,
      plateCategory: plateSource === "KSA" ? undefined : selectedPlateCategory,
      lang,
    });
  };

  const resetForm = () => {
    setPlateNumber(""); setPlateCode(""); setPlateSource("");
    setSelectedPlateCodeId(undefined); setSelectedPlateCategory(undefined);
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

  const buildPaymentPayload = () => {
    const selectedFinesData = Array.from(selectedFines)
      .map(idx => filteredFines[idx])
      .filter(Boolean);
    const total = selectedTotal.toFixed(0);
    const sessionId = result?.sessionId || null;

    return {
      selectedFines: selectedFinesData,
      totalAmount: total,
      plateNumber,
      plateSource,
      plateCode: plateSource === "KSA"
        ? [ksaLetter1, ksaLetter2, ksaLetter3].filter(Boolean).join("")
        : normalizeDigits(plateCode).trim(),
      queryId: result?.queryId,
      sessionId,
    };
  };

  const goToPaymentPage = () => {
    const paymentPayload = buildPaymentPayload();

    try {
      sessionStorage.setItem("paymentData", JSON.stringify(paymentPayload));
      if (paymentPayload.sessionId) {
        sessionStorage.setItem("paymentSessionId", paymentPayload.sessionId);
      } else {
        sessionStorage.removeItem("paymentSessionId");
      }
    } catch (error) {
      console.error("Failed to cache payment payload before navigation", error);
    }

    const params = new URLSearchParams();
    if (paymentPayload.sessionId) params.set("sessionId", paymentPayload.sessionId);
    if (paymentPayload.totalAmount) params.set("total", paymentPayload.totalAmount);

    const queryString = params.toString();
    const paymentBasePath = isArabicRoute ? "/ar/payment" : "/payment";
    navigate(queryString ? `${paymentBasePath}?${queryString}` : paymentBasePath);
  };

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
    { key: "plate" as SearchTab, labelAr: t.home.tabs.plate, icon: <PlateIcon /> },
    { key: "licence" as SearchTab, labelAr: t.home.tabs.license, icon: <LicenceIcon /> },
    { key: "tcnumber" as SearchTab, labelAr: t.home.tabs.trafficFile, icon: <TCIcon /> },
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
      label: t.home.results.filters.all,
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
      label: t.home.results.filters.booking,
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
      label: t.home.results.filters.payable,
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
      label: t.home.results.filters.blackPoints,
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
      label: t.home.results.filters.notPayable,
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
          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {t.header.topBar.phone}</span>
          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {t.header.topBar.email}</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLanguageNavigation} className="flex items-center gap-1 hover:opacity-80 font-bold"><Globe className="w-3 h-3" /> {t.header.topBar.language}</button>
          <button className="flex items-center gap-1 hover:opacity-80"><User className="w-3 h-3" /> {t.header.topBar.login}</button>
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
            <div className="text-lg font-black" style={{ color: "#008755" }}>{t.header.siteName}</div>
            <div className="text-xs text-gray-500">{t.header.siteNameEn}</div>
          </div>
        </div>

        {/* Center: Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <button className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors">
            <HomeIcon className="w-4 h-4" /> {t.header.nav.home}
          </button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors">{t.header.nav.services}</button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors">{t.header.nav.news}</button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors">{t.header.nav.about}</button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors">{t.header.nav.contact}</button>
        </nav>

        {/* Left: Icons */}
        <div className="flex items-center gap-2">
          {/* زر تبديل اللغة - ظاهر على الموبايل والديسكتوب */}
          <button
            onClick={handleLanguageNavigation}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold border transition-all hover:opacity-80"
            style={{ borderColor: "#008755", color: "#008755", backgroundColor: "#f0faf5" }}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t.header.topBar.language}</span>
          </button>
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
            <HomeIcon className="w-3.5 h-3.5" /> {t.breadcrumb.home}
          </button>
          <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
          <button className="text-gray-500 hover:text-green-700">{t.breadcrumb.services}</button>
          <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
          <button className="text-gray-500 hover:text-green-700">{t.breadcrumb.individualServices}</button>
          <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold" style={{ color: "#008755" }}>{t.breadcrumb.finesLookup}</span>
        </div>
      )}

      {/* Breadcrumb - mobile */}
      <div className="md:hidden px-4 pb-3 pt-1 flex items-center justify-end gap-2 text-sm">
        <span className="font-semibold text-gray-700">{t.breadcrumb.finesLookup}</span>
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
                    onClick={() => { setPlateSource(q.plateSource); setPlateNumber(q.plateNumber); setPlateCode(q.plateCode); setSelectedPlateCodeId(undefined); setSelectedPlateCategory(undefined); setView("form"); setShowHistory(false); }}
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

    const toggleSelect = () => {
      const next = new Set(selectedFines);
      if (isSelected) next.delete(idx); else next.add(idx);
      setSelectedFines(next);
    };

    const isBlackPoints = fine.status === "blackpoints";
    const isSeized = fine.status === "seized";

    const statusConfig = fine.isPaid
      ? { label: t.home.results.status.paid, bg: "#eef1f1", color: "#5b5f62" }
      : isSeized
      ? { label: t.home.results.status.seized, bg: "#fff2e8", color: "#c45e13" }
      : isBlackPoints
      ? { label: t.home.results.status.blackPoints, bg: "#f0f1f2", color: "#565b61" }
      : fine.status === "notpayable"
      ? { label: t.home.results.filters.notPayable, bg: "#fff2e8", color: "#c45e13" }
      : { label: t.home.results.status.payable, bg: "#e8faf2", color: "#007d53" };

    const sourceConfig = getSourceConfig(fine.source);
    const iconSize = isMobile ? 20 : 22;
    const amountSize = isMobile ? 30 : 34;
    const bodyLabelSize = isMobile ? 14 : 15;
    const bodyValueSize = isMobile ? 15 : 16;

    const DirhamMark = ({ size = 24 }: { size?: number }) => (
      <span
        style={{
          fontSize: size,
          lineHeight: 1,
          fontWeight: 900,
          fontFamily: "'Arial Black', Arial, sans-serif",
          color: "#101114",
          display: "inline-block",
          transform: "translateY(-1px)",
        }}
      >Ð</span>
    );

    const CheckboxIcon = () => (
      <button
        type="button"
        aria-label={isSelected ? "Deselect fine" : "Select fine"}
        onClick={toggleSelect}
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: isMobile ? "42px" : "46px",
          height: isMobile ? "42px" : "46px",
          borderRadius: "12px",
          border: `2px solid ${isSelected ? "#008755" : "#c7ccd1"}`,
          backgroundColor: isSelected ? "#eefaf5" : "#ffffff",
          boxShadow: isSelected ? "0 0 0 3px rgba(0,135,85,0.08)" : "none",
        }}
      >
        <div
          style={{
            width: isMobile ? "20px" : "22px",
            height: isMobile ? "20px" : "22px",
            borderRadius: "7px",
            backgroundColor: isSelected ? "#008755" : "transparent",
            border: isSelected ? "none" : "2px solid #c7ccd1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isSelected && (
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 5L4.2 8.2L12 1" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </button>
    );

    const SourceFieldIcon = () => (
      <svg width={iconSize} height={iconSize} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 16.2H17" stroke="#45474B" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M4.2 8.6H15.8" stroke="#45474B" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M5.2 8.6V16.2" stroke="#45474B" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M10 8.6V16.2" stroke="#45474B" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M14.8 8.6V16.2" stroke="#45474B" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M2.6 7L10 3L17.4 7" stroke="#45474B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );

    const LocationFieldIcon = () => (
      <svg width={iconSize} height={iconSize} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 17C13.2 13.3 14.8 10.8 14.8 8.4C14.8 5.75 12.65 3.6 10 3.6C7.35 3.6 5.2 5.75 5.2 8.4C5.2 10.8 6.8 13.3 10 17Z" fill="#45474B"/>
        <circle cx="10" cy="8.3" r="1.7" fill="#ffffff"/>
      </svg>
    );

    const TicketFieldIcon = () => (
      <svg width={iconSize} height={iconSize} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8" fill="#45474B"/>
        <path d="M7.2 12.9L7.8 9.9H5.9V8.4H8.1L8.6 6.1H10.1L9.6 8.4H11.6L12.1 6.1H13.6L13.1 8.4H14.8V9.9H12.7L12.1 12.9H10.6L11.2 9.9H9.2L8.6 12.9H7.2ZM9.5 8.4L9 9.9H11L11.5 8.4H9.5Z" fill="#ffffff"/>
      </svg>
    );

    const DateFieldIcon = () => (
      <svg width={iconSize} height={iconSize} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8" fill="#45474B"/>
        <path d="M10 6.2V10.1L12.5 11.6" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );

    const SpeedFieldIcon = () => (
      <svg width={iconSize} height={iconSize} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.2 13.6C2.8 12.8 2.6 11.9 2.6 11C2.6 6.9 5.9 3.6 10 3.6C14.1 3.6 17.4 6.9 17.4 11C17.4 11.9 17.2 12.8 16.8 13.6" stroke="#45474B" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M10 11L13 8.3" stroke="#45474B" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M4.1 14.9H15.9" stroke="#45474B" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    );

    const DetailsTicketIcon = () => (
      <svg width={isMobile ? 28 : 30} height={isMobile ? 28 : 30} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 8.5C6 7.12 7.12 6 8.5 6H19.5C20.88 6 22 7.12 22 8.5V10.05C20.67 10.27 19.65 11.43 19.65 12.82C19.65 14.21 20.67 15.37 22 15.59V17.5C22 18.88 20.88 20 19.5 20H8.5C7.12 20 6 18.88 6 17.5V15.59C7.33 15.37 8.35 14.21 8.35 12.82C8.35 11.43 7.33 10.27 6 10.05V8.5Z" fill="#46D695" stroke="#0A845C" strokeWidth="1.4"/>
        <path d="M14 9.1V16.9" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="1.8 1.8"/>
      </svg>
    );

    const DetailsInfoIcon = () => (
      <svg width={isMobile ? 28 : 30} height={isMobile ? 28 : 30} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="13" fill="#4A4B4E"/>
        <path d="M15 13.1V20" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="15" cy="9.6" r="1.4" fill="#ffffff"/>
      </svg>
    );

    const displayAmount = isNaN(amt) ? fine.amount : amt.toLocaleString();
    const cardRadius = isMobile ? "34px" : "28px";
    const cardPadding = isMobile ? "30px" : "26px";

    const InfoRow = ({ icon, label, value, highlight = false }: { icon: React.ReactNode; label: string; value: React.ReactNode; highlight?: boolean }) => (
      <div className="flex items-start justify-between gap-4" style={{ paddingBottom: isMobile ? "10px" : "12px" }}>
        <div
          className={isRTL ? "text-left" : "text-right"}
          style={{
            minWidth: 0,
            flex: 1,
            fontSize: bodyValueSize,
            fontWeight: highlight ? 800 : 500,
            color: highlight ? "#008755" : "#4c4f55",
            lineHeight: 1.45,
          }}
          dir="auto"
        >
          {value || <span style={{ color: "#b0b4b8" }}>—</span>}
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0" style={{ color: "#141518" }}>
          <span style={{ fontSize: bodyLabelSize, fontWeight: 700, lineHeight: 1.35 }}>{label}</span>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
        </div>
      </div>
    );

    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: cardRadius,
          boxShadow: isMobile ? "0 12px 36px rgba(0,0,0,0.08)" : "0 14px 34px rgba(0,0,0,0.08)",
          border: "1px solid rgba(230,232,234,0.95)",
          padding: cardPadding,
          marginBottom: isMobile ? "20px" : "18px",
        }}
      >
        <div className="flex items-start justify-between gap-3" style={{ direction: "ltr", marginBottom: isMobile ? "26px" : "30px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "16px" : "18px", minWidth: 0, flex: 1 }}>
            <div
              className="flex items-center gap-2"
              style={{
                fontSize: amountSize,
                fontWeight: 900,
                color: "#111216",
                lineHeight: 1,
                fontFamily: "'Arial Black', 'Cairo', Arial, sans-serif",
              }}
            >
              <DirhamMark size={isMobile ? 28 : 30} />
              <span>{displayAmount}</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap" style={{ justifyContent: isRTL ? "flex-end" : "flex-start" }}>
              <span
                style={{
                  backgroundColor: statusConfig.bg,
                  color: statusConfig.color,
                  borderRadius: isMobile ? "12px" : "14px",
                  padding: isMobile ? "6px 14px" : "8px 16px",
                  fontSize: isMobile ? "16px" : "17px",
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                {statusConfig.label}
              </span>
              <div
                className="flex items-center justify-center overflow-hidden"
                style={{
                  width: isMobile ? "40px" : "44px",
                  height: isMobile ? "40px" : "44px",
                  borderRadius: "999px",
                  backgroundColor: "#f4fbf8",
                  border: "1.5px solid rgba(0,135,85,0.16)",
                }}
              >
                {sourceConfig ? sourceConfig.logo(isMobile ? 28 : 30) : <SourceFieldIcon />}
              </div>
            </div>
          </div>

          <CheckboxIcon />
        </div>

        <div style={{ direction: "rtl", marginBottom: fine.description ? (isMobile ? "16px" : "18px") : 0 }}>
          <InfoRow icon={<SourceFieldIcon />} label={t.home.results.fineCard.source} value={getSourceLabel(fine.source, lang)} />
          <InfoRow icon={<LocationFieldIcon />} label={t.home.results.fineCard.location} value={fine.location} highlight />
          <InfoRow icon={<TicketFieldIcon />} label={t.home.results.fineCard.ticketNo} value={fine.ticketNo} />
          {fine.dateTime && <InfoRow icon={<DateFieldIcon />} label={t.home.results.fineCard.dateTime} value={fine.dateTime} />}
          {fine.speed && <InfoRow icon={<SpeedFieldIcon />} label={t.home.results.fineCard.speed} value={fine.speed} />}
        </div>

        {fine.description && (
          <div
            style={{
              backgroundColor: "#f7f7f7",
              borderRadius: isMobile ? "24px" : "22px",
              padding: isMobile ? "24px 22px" : "24px 24px",
            }}
          >
            <div className="flex items-center justify-between gap-3" style={{ marginBottom: isMobile ? "14px" : "16px", direction: "rtl" }}>
              <DetailsTicketIcon />
              <span style={{ fontSize: isMobile ? "26px" : "28px", fontWeight: 800, color: "#111216", lineHeight: 1.1 }}>
                {t.home.results.fineCard.details}
              </span>
            </div>
            <div className="flex items-end justify-between gap-4" style={{ direction: "rtl" }}>
              <DetailsInfoIcon />
              <p
                className={isRTL ? "text-right" : "text-left"}
                style={{
                  margin: 0,
                  color: "#1f2328",
                  fontSize: isMobile ? "17px" : "18px",
                  lineHeight: 1.7,
                  flex: 1,
                }}
                dir="auto"
              >
                {fine.description}
              </p>
            </div>
          </div>
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
        style={{ backgroundColor: "#f0f4f2", fontFamily: lang === "ar" ? "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif" : "'Inter', 'Segoe UI', Arial, sans-serif" }}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <SharedHeader transparent={false} />

        {/* Desktop Results Layout */}
        <div className="hidden md:block">
          <div className="max-w-5xl mx-auto px-8 py-6">
            {/* Back + title */}
            <div className="flex items-center justify-between mb-6" dir="ltr">
              {/* اللوحة على اليسار (مع dir=ltr العنصر الأول يظهر على اليسار) */}
              <div
                className="flex items-stretch rounded-2xl overflow-hidden flex-shrink-0"
                style={{ border: "2px solid #c8c8c8", backgroundColor: "#ffffff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", height: "56px" }}
                dir="ltr"
              >
                {/* Left section: code + source */}
                <div
                  className="flex flex-col items-center justify-center px-3 py-1"
                  style={{ backgroundColor: "#f5f5f5", borderRight: "2px solid #c8c8c8", minWidth: "56px" }}
                >
                  <span className="text-base font-black text-gray-900 leading-none" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
                    {finalPlateCodeDisplay || plateCode || "—"}
                  </span>
                  <span className="text-[9px] font-black text-gray-600 tracking-widest mt-0.5" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
                    {plateSource === "DXB" ? "DUBAI" : plateSource === "AUH" ? "ABU DHABI" : plateSource === "SHJ" ? "SHARJAH" : plateSource === "AJM" ? "AJMAN" : plateSource === "RAK" ? "RAS AL KHAIMAH" : plateSource === "FUJ" ? "FUJAIRAH" : plateSource === "UMQ" ? "UMM AL QUWAIN" : plateSource || "UAE"}
                  </span>
                </div>
                {/* Right section: plate number */}
                <div className="flex items-center justify-center px-4 py-1">
                  <span className="text-xl font-black text-gray-900" style={{ fontFamily: "'Arial Black', Arial, sans-serif", letterSpacing: "3px" }}>
                    {plateNumber || "—"}
                  </span>
                </div>
              </div>
              {/* النص + زر الرجوع على اليمين - مطابق للأصلي */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setView("form"); setResult(null); setSelectedFines(new Set()); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white"
                  style={{ backgroundColor: "#e8ede9", color: "#374151" }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.home.results.backButton}</span>
                </button>
                <div dir={isRTL ? "rtl" : "ltr"}>
                  <h1 className="text-2xl font-black" style={{ color: "#111827", lineHeight: 1.2 }}>
                    {t.home.results.title}
                  </h1>
                  <p className="text-sm font-medium mt-0.5" style={{ color: "#6B7280" }}>
                    {t.home.form.plateNumber}: <span className="font-bold" style={{ color: "#111827" }} dir="ltr">{plateNumber}</span>
                  </p>
                </div>
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
                  {selectedFines.size === filteredFines.length ? t.home.results.deselectAll : t.home.results.selectAll}
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "#ffffff", border: "1.5px solid #e5e7eb", color: "#374151" }}
                  onClick={() => toast.info("سيتم تفعيله قريباً")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>
                  {t.home.results.requestList}
                </button>
              </div>
            </div>

            {/* Error */}
            {!result.success && (
              <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ backgroundColor: "#fff3f3", border: "1px solid #fecaca" }}>
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{result.errorMessage || (lang === "ar" ? "لم يتم العثور على مخالفات" : "No fines found")}</p>
              </div>
            )}

            {/* No fines */}
            {result.success && filteredFines.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-20 bg-white rounded-2xl">
                <CheckCircle2 className="w-20 h-20" style={{ color: "#008755" }} />
                <p className="text-xl font-black text-gray-700">{t.home.results.noFines}</p>
                <p className="text-sm text-gray-400">{t.home.results.noFinesDesc}</p>
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
                style={{ backgroundColor: "#ffffff", border: "1px solid #e8e8e8", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              >
                {/* Stats row + Buttons */}
                <div className="flex items-center px-6 py-4" style={{ direction: isRTL ? "rtl" : "ltr" }}>
                  {/* المخالفات */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{selectedFines.size > 0 ? selectedFines.size : allFines.length}</span>
                    <span className="text-sm text-gray-500">{t.home.results.summary.fines}</span>
                  </div>
                  {/* Divider */}
                  <div className="w-px bg-gray-200 mx-6" style={{ height: "24px" }} />
                  {/* إجمالي المبلغ */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-1" dir="ltr">
                       <span style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, fontSize: "12px", fontWeight: 900, fontFamily: "'Arial Black', Arial, sans-serif", color: "#111", letterSpacing: "-0.5px", lineHeight: 1 }}>AED</span>
                      <span>{selectedTotal > 0 ? selectedTotal.toFixed(0) : "0"}</span>
                    </span>
                    <span className="text-sm text-gray-500">{t.home.results.totalAmount}</span>
                  </div>
                  <div className="flex-1" />
                  {/* أزرار */}
                  <div className="flex items-center gap-3">
                    {/* زر رجوع */}
                    <button
                      onClick={() => { setView("form"); setResult(null); setSelectedFines(new Set()); }}
                      className="px-8 py-2.5 rounded-full text-sm font-semibold"
                      style={{ backgroundColor: "#f3f4f6", border: "1.5px solid #d1d5db", color: "#374151" }}
                    >
                      {t.home.results.backButton}
                    </button>
                    {/* زر دفع */}
                    <button
                      disabled={selectedFines.size === 0}
                      className="px-8 py-2.5 rounded-full text-sm font-bold transition-all"
                      style={{
                        backgroundColor: selectedFines.size > 0 ? "#008755" : "#d1d5db",
                        color: selectedFines.size > 0 ? "#ffffff" : "#9ca3af",
                      }}
                      onClick={goToPaymentPage}
                    >
                      {t.home.results.payButton}
                    </button>
                  </div>
                </div>
                {/* الدفع بالتقسيط عبر الخصم المباشر */}
                <div
                  className="flex items-center gap-2 px-6 pb-4 pt-2"
                  style={{ direction: isRTL ? "rtl" : "ltr", borderTop: "1px solid #f0f0f0" }}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 cursor-pointer flex-shrink-0"
                    style={{ accentColor: "#008755" }}
                  />
                  <span className="text-sm text-gray-600">{t.home.results.payInstallment}</span>
                  <button
                    onClick={() => toast.info(lang === "ar" ? "خدمة الدفع بالتقسيط عبر الخصم المباشر تتيح لك سداد المخالفات على أقساط شهرية." : "DDA Instalments service allows you to pay fines in monthly installments.")}
                    className="flex-shrink-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="1.5"/>
                      <path d="M12 11v6" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="12" cy="7.5" r="0.75" fill="#9ca3af"/>
                    </svg>
                  </button>
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
                {isRTL ? <ArrowRight className="w-4 h-4 text-gray-600" /> : <ArrowLeft className="w-4 h-4 text-gray-600" />}
              </button>
              <span className="text-sm font-semibold text-gray-700">{t.breadcrumb.finesLookup}</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "#f0f4f2", border: "1px solid #e5e7eb", color: "#374151" }} onClick={() => toast.info(lang === "ar" ? "سيتم تفعيله قريباً" : "Coming soon")}>...</button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: "#f0f4f2", border: "1px solid #e5e7eb", color: "#374151" }} onClick={() => toast.info(lang === "ar" ? "سيتم تفعيله قريباً" : "Coming soon")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>
                <span>{t.home.results.requestList}</span>
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
                <span>{selectedFines.size === filteredFines.length ? t.home.results.deselectAll : t.home.results.selectAll}</span>
              </button>
            </div>

            {/* Plate + مراجعة المخالفات - مطابق للأصلي: اللوحة على اليسار والنص على اليمين */}
            <div className="flex items-center justify-between py-1" dir="ltr">
              {/* اللوحة على اليسار */}
              <div
                className="flex items-stretch rounded-xl overflow-hidden flex-shrink-0"
                style={{ border: "1.5px solid #c8c8c8", backgroundColor: "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                dir="ltr"
              >
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
                <div className="flex items-center justify-center px-3 py-1">
                  <span className="text-base font-black text-gray-900" style={{ fontFamily: "'Arial Black', Arial, sans-serif", letterSpacing: "2px" }}>
                    {plateNumber || "—"}
                  </span>
                </div>
              </div>
              {/* نص مراجعة المخالفات + رقم اللوحة على اليمين */}
              <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "text-right" : "text-left"}>
                <h2 className="text-lg font-black" style={{ color: "#111827", lineHeight: 1.2 }}>
                  {t.home.results.title}
                </h2>
                <p className="text-xs font-medium" style={{ color: "#6B7280" }}>
                  {t.home.form.plateNumber}
                </p>
              </div>
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
                <p className="text-sm text-red-700">{result.errorMessage || (lang === "ar" ? "لم يتم العثور على مخالفات" : "No fines found")}</p>
              </div>
            )}

            {/* No fines */}
            {result.success && filteredFines.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-12">
                <CheckCircle2 className="w-16 h-16" style={{ color: "#008755" }} />
            <p className="text-lg font-bold text-gray-700">{t.home.results.noFines}</p>
              <p className="text-sm text-gray-400">{t.home.results.noFinesDesc}</p>
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
            style={{
              backgroundColor: "rgba(255,255,255,0.96)",
              borderTopLeftRadius: "22px",
              borderTopRightRadius: "22px",
              borderTop: "1px solid #eceef0",
              boxShadow: "0 -10px 30px rgba(0,0,0,0.10)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center justify-between" style={{ direction: "rtl" }}>
                <div className="flex-1 text-center">
                  <div className="text-[15px] font-extrabold text-gray-900">
                    {t.home.results.summary.fines} <span>{selectedFines.size > 0 ? selectedFines.size : allFines.length}</span>
                  </div>
                </div>
                <div className="w-px mx-3" style={{ height: "32px", backgroundColor: "#dfe3e6" }} />
                <div className="flex-1 text-center">
                  <div className="text-[15px] font-extrabold text-gray-900 flex items-center justify-center gap-1" dir="ltr">
                    <span style={{ fontSize: "18px", fontWeight: 900, lineHeight: 1, fontFamily: "'Arial Black', Arial, sans-serif" }}>Ð</span>
                    <span>{selectedTotal > 0 ? selectedTotal.toFixed(0) : "0"}</span>
                    <span dir="rtl">{t.home.results.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4" style={{ direction: "rtl" }}>
                <button
                  onClick={() => { setView("form"); setResult(null); setSelectedFines(new Set()); }}
                  className="flex-1 py-3.5 rounded-full text-base font-semibold"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1.6px solid #cfd4d8",
                    color: "#2a2e33",
                  }}
                >
                  {t.home.results.backButton}
                </button>
                <button
                  disabled={selectedFines.size === 0}
                  className="flex-1 py-3.5 rounded-full text-base font-bold transition-all"
                  style={{
                    backgroundColor: selectedFines.size > 0 ? "#008755" : "#e4e7eb",
                    color: selectedFines.size > 0 ? "#ffffff" : "#9aa1a9",
                  }}
                  onClick={goToPaymentPage}
                >
                  {t.home.results.payButton}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 mt-4" style={{ direction: "rtl" }}>
                <button
                  onClick={() => toast.info(lang === "ar" ? "خدمة الدفع بالتقسيط عبر الخصم المباشر تتيح لك سداد المخالفات على أقساط شهرية." : "DDA Instalments service allows you to pay fines in monthly installments.")}
                  className="flex-shrink-0"
                >
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="15" cy="15" r="13" fill="#ffffff" stroke="#5E6166" strokeWidth="1.6"/>
                    <path d="M15 13.2V20" stroke="#4A4B4E" strokeWidth="2.2" strokeLinecap="round"/>
                    <circle cx="15" cy="9.5" r="1.4" fill="#4A4B4E"/>
                  </svg>
                </button>
                <span className="text-[15px] text-gray-900 font-medium flex-1 text-right">{t.home.results.payInstallment}</span>
                <button
                  type="button"
                  aria-label="Installment option"
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: "36px", height: "36px", borderRadius: "10px", border: "2px solid #c7ccd1", backgroundColor: "#ffffff" }}
                >
                  <div style={{ width: "18px", height: "18px", borderRadius: "6px", border: "2px solid #c7ccd1" }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== FORM VIEW =====
  const desktopServiceHighlights = lang === "ar"
    ? [
        "الاستعلام عن المخالفات المرورية وعرض جميع المخالفات المرتبطة باللوحة بالكامل.",
        "الاطلاع على تفاصيل المخالفة، بما في ذلك الموقع والتاريخ ورقم التذكرة والمبلغ.",
        "إتاحة متابعة خيارات الدفع للخدمات القابلة للسداد بعد اختيار المخالفات المطلوبة.",
      ]
    : [
        "Inquire about traffic fines and display all violations linked to the plate in full.",
        "Review violation details including location, date, ticket number, and amount.",
        "Continue to payment options for payable services after selecting the required fines.",
      ];
  const desktopServiceFeesNote = lang === "ar" ? "تعتمد الرسوم على المخالفات المسترجعة من الخدمة." : "Fees depend on the fines returned by the service.";

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f0f4f2", fontFamily: "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif" }}
      dir="rtl"
    >
      <SharedHeader transparent={true} />

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:grid grid-cols-[minmax(0,1fr)_320px] gap-6 px-6 xl:px-10 py-6 min-h-[calc(100vh-130px)] max-w-[1380px] mx-auto">
        <div className="relative rounded-[34px] overflow-hidden" style={{ backgroundColor: "#dce7df", boxShadow: "0 18px 48px rgba(17,24,39,0.08)" }}>
          <video
            autoPlay
            muted
            playsInline
            style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 45%" }}
            onEnded={(e) => { e.currentTarget.pause(); }}
          >
            <source src={CAR_VIDEO_URL} type="video/mp4" />
          </video>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(240,244,242,0.08) 0%, rgba(22,28,24,0.18) 100%)" }} />

          <div className="absolute inset-x-0 top-0 p-6 xl:p-8">
            <div className="mx-auto w-fit rounded-[20px] p-1.5 flex items-center gap-1.5" style={{ backgroundColor: "rgba(255,255,255,0.88)", backdropFilter: "blur(10px)", boxShadow: "0 10px 26px rgba(17,24,39,0.08)" }}>
              {searchTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSearchTab(tab.key)}
                  className="flex items-center justify-center gap-2 px-4 xl:px-5 py-3 rounded-2xl text-sm font-bold transition-all"
                  style={{
                    minWidth: "132px",
                    backgroundColor: searchTab === tab.key ? "#ffffff" : "transparent",
                    color: searchTab === tab.key ? "#008755" : "#6b7280",
                    boxShadow: searchTab === tab.key ? "0 2px 8px rgba(0,0,0,0.10)" : "none",
                  }}
                >
                  <span style={{ color: searchTab === tab.key ? "#008755" : "#9ca3af" }}>{tab.icon}</span>
                  <span>{lang === "ar" ? tab.labelAr : tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="absolute inset-x-0 top-[27%] flex justify-center px-6">
            <div className="rounded-[20px] px-8 py-5 border-2" style={{ backgroundColor: "rgba(255,255,255,0.96)", borderColor: "rgba(17,24,39,0.18)", boxShadow: "0 12px 32px rgba(17,24,39,0.12)" }}>
              <DubaiPlateDisplayLarge
                plateSource={plateSource}
                plateNumber={plateNumber}
                plateCode={plateSource === "KSA" ? [ksaLetter1, ksaLetter2, ksaLetter3].filter(Boolean).join(" ") : plateCode}
              />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 xl:p-8">
            <div className="mx-auto max-w-[760px] rounded-[28px] p-6 xl:p-7" style={{ backgroundColor: "rgba(255,255,255,0.95)", boxShadow: "0 14px 42px rgba(17,24,39,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.75)" }}>
              <div className="grid grid-cols-3 gap-4 items-start">
                <PlateFormFields
                  plateSource={plateSource} setPlateSource={setPlateSource}
                  plateNumber={plateNumber} setPlateNumber={setPlateNumber}
                  plateCode={plateCode} setPlateCode={setPlateCode}
                  selectedPlateCodeId={selectedPlateCodeId} setSelectedPlateCodeId={setSelectedPlateCodeId}
                  selectedPlateCategory={selectedPlateCategory} setSelectedPlateCategory={setSelectedPlateCategory}
                  ksaLetter1={ksaLetter1} setKsaLetter1={setKsaLetter1}
                  ksaLetter2={ksaLetter2} setKsaLetter2={setKsaLetter2}
                  ksaLetter3={ksaLetter3} setKsaLetter3={setKsaLetter3}
                  onEnter={handleQuery}
                />
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={resetForm}
                  className="flex-1 py-4 rounded-full text-base font-bold flex items-center justify-center gap-3 transition-all hover:bg-gray-50"
                  style={{ backgroundColor: "#ffffff", color: "#374151", border: "1.5px solid #ccd3d7" }}
                >
                  {lang === "ar" ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                  <span>{lang === "ar" ? "رجوع" : "Back"}</span>
                </button>
                <button
                  onClick={handleQuery}
                  disabled={queryMutation.isPending}
                  className="flex-1 py-4 rounded-full text-base font-bold text-white flex items-center justify-center gap-3 transition-all hover:opacity-90"
                  style={{ backgroundColor: "#008755", boxShadow: "0 8px 22px rgba(0,135,85,0.28)" }}
                >
                  {queryMutation.isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>{t.home.form.checking}</span></>
                  ) : (
                    <><span>{t.home.form.checkButton}</span>{lang === "ar" ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] overflow-hidden self-start" style={{ backgroundColor: "#ffffff", boxShadow: "0 18px 42px rgba(17,24,39,0.08)", border: "1px solid #edf1ee" }}>
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "#edf1ee" }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#e9f7f1", color: "#008755" }}>
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">{lang === "ar" ? "الاستعلام والدفع عن المخالفات" : "Fines Inquiry and Payment"}</h2>
                <p className="text-sm text-gray-500">{lang === "ar" ? "خدمة رقمية" : "Digital service"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#f8faf9", color: "#6b7280" }}
              aria-label={lang === "ar" ? "إغلاق" : "Close"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-0 border-b" style={{ borderColor: "#edf1ee" }}>
            <div className="p-5 text-center">
              <div className="text-sm text-gray-500 mb-1">{lang === "ar" ? "الرسوم" : "Fees"}</div>
              <div className="text-xl font-black text-gray-900">{lang === "ar" ? "حسب المخالفات" : "As per fines"}</div>
              <div className="text-xs text-gray-400 mt-1">AED</div>
            </div>
            <div className="p-5 text-center" style={{ borderInlineStart: "1px solid #edf1ee" }}>
              <div className="text-sm text-gray-500 mb-1">{lang === "ar" ? "المدة" : "Duration"}</div>
              <div className="text-xl font-black text-gray-900">{lang === "ar" ? "فوري" : "Instant"}</div>
              <div className="text-xs text-gray-400 mt-1">{lang === "ar" ? "مباشر" : "Immediate"}</div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-sm leading-7 text-gray-600 mb-5">{lang === "ar" ? "خدمة للاستعلام عن المخالفات المرورية المرتبطة بالمركبة، مع إظهار جميع النتائج المسترجعة بالكامل قبل الانتقال لخطوات السداد." : "A service to inquire about traffic violations linked to the vehicle, while displaying the full set of returned results before continuing to payment steps."}</p>
            <div className="space-y-3">
              {desktopServiceHighlights.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#008755" }} />
                  <p className="text-sm leading-7 text-gray-600">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="rounded-[22px] p-5" style={{ backgroundColor: "#f8fbf9", border: "1px solid #e7efea" }}>
              <div className="flex items-center gap-2 mb-3" style={{ color: "#008755" }}>
                <Info className="w-4 h-4" />
                <span className="text-sm font-bold">{lang === "ar" ? "رسوم الخدمة" : "Service Fees"}</span>
              </div>
              <p className="text-sm leading-7 text-gray-600">{desktopServiceFeesNote}</p>
            </div>
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

        {/* Video hero with plate overlay */}
        <div className="w-full overflow-hidden" style={{ height: "300px", backgroundColor: "#e8e8e8", lineHeight: 0, position: "relative" }}>
          <video
            ref={videoRef}
            autoPlay muted playsInline
            style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", height: "auto", minHeight: "100%", objectFit: "cover", objectPosition: "center 45%", display: "block" }}
            onEnded={(e) => { e.currentTarget.pause(); }}
          >
            <source src={CAR_VIDEO_URL} type="video/mp4" />
          </video>
        </div>

        {/* Form card */}
        <div className="px-4 pt-4 pb-2 max-w-lg mx-auto">
          <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: "#ffffff", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <PlateFormFields
              plateSource={plateSource} setPlateSource={setPlateSource}
              plateNumber={plateNumber} setPlateNumber={setPlateNumber}
              plateCode={plateCode} setPlateCode={setPlateCode}
              selectedPlateCodeId={selectedPlateCodeId} setSelectedPlateCodeId={setSelectedPlateCodeId}
              selectedPlateCategory={selectedPlateCategory} setSelectedPlateCategory={setSelectedPlateCategory}
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
            <><Loader2 className="w-5 h-5 animate-spin" /><span>{t.home.form.checking}</span></>
          ) : (
            <>{isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}<span>{t.home.form.checkButton}</span></>
          )}
        </button>
        <button
          onClick={resetForm}
          className="w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-3 transition-all"
          style={{ backgroundColor: "#ffffff", color: "#374151", border: "1.5px solid #d1d5db" }}
        >
          {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          <span>{t.home.results.backButton}</span>
        </button>
      </div>
    </div>
  );
}
