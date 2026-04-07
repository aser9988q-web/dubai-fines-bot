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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ===== ASSETS =====
const CAR_VIDEO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234476152/RPNmG5rkcSfq3Rp3WTDuVe/car_animation_2512fc32.mp4";
const DUBAI_POLICE_HEADER_LOGO = "/dubai-police-logo.svg";

// CDN logos for sources
const LOGO_DUBAI_POLICE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234476152/RPNmG5rkcSfq3Rp3WTDuVe/dubai-police_60714e67.png";
const LOGO_ABU_DHABI_POLICE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234476152/RPNmG5rkcSfq3Rp3WTDuVe/abu-dhabi-police2_34b796f0.png";
const LOGO_RTA = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234476152/RPNmG5rkcSfq3Rp3WTDuVe/rta_89e6fc51.jpg";
const LOGO_SHARJAH_POLICE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234476152/RPNmG5rkcSfq3Rp3WTDuVe/sharjah-police2_28f5d5aa.png";

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
    logo: (size) => <img src={LOGO_DUBAI_POLICE} alt="Dubai Police" width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover", display: "block" }} />,
  },
  // ===== شرطة أبوظبي =====
  {
    label: "شرطة أبوظبي",
    labelEn: "Abu Dhabi Police",
    bgColor: "#fff5e8",
    borderColor: "#8B0000",
    logo: (size) => <img src={LOGO_ABU_DHABI_POLICE} alt="Abu Dhabi Police" width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover", display: "block" }} />,
  },
  // ===== شرطة الشارقة =====
  {
    label: "شرطة الشارقة",
    labelEn: "Sharjah Police",
    bgColor: "#e8f0ff",
    borderColor: "#1a3a8c",
    logo: (size) => <img src={LOGO_SHARJAH_POLICE} alt="Sharjah Police" width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover", display: "block" }} />,
  },
  // ===== شرطة عجمان =====
  {
    label: "شرطة عجمان",
    labelEn: "Ajman Police",
    bgColor: "#e8f4ff",
    borderColor: "#0a5a8c",
    logo: (size) => <PoliceShieldLogo size={size} bg="#0a4a7c" accent="#0a5a8c" text="AJMAN POLICE" />,
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
    logo: (size) => <PoliceShieldLogo size={size} bg="#7c0a3a" accent="#8c1a4a" text="RAK POLICE" />,
  },
  // ===== شرطة الفجيرة =====
  {
    label: "شرطة الفجيرة",
    labelEn: "Fujairah Police",
    bgColor: "#f8f0ff",
    borderColor: "#5a1a8c",
    logo: (size) => <PoliceShieldLogo size={size} bg="#4a0a7c" accent="#5a1a8c" text="FUJAIRAH POLICE" />,
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
    logo: (size) => <img src={LOGO_RTA} alt="RTA Dubai" width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover", display: "block" }} />,
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
    logo: (size) => (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="white" rx="8" />
        <polygon points="5,82 5,18 48,50" fill="#4A4A6A" />
        <polygon points="20,82 20,28 55,55" fill="#8080A0" opacity="0.6" />
        <text x="73" y="44" textAnchor="middle" fill="#4A4A6A" fontSize="15" fontFamily="Arial" fontWeight="bold">سالك</text>
        <text x="73" y="62" textAnchor="middle" fill="#6A6A8A" fontSize="14" fontFamily="Arial" fontWeight="600">Salik</text>
      </svg>
    ),
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
    logo: (size) => <MunicipalityLogo size={size} bg="#006633" abbr="DM" city="Dubai" />,
  },
  // ===== بلدية مدينة أبوظبي =====
  {
    label: "بلدية مدينة أبوظبي",
    labelEn: "Abu Dhabi City Municipality",
    bgColor: "#fff5e8",
    borderColor: "#8B4500",
    logo: (size) => <MunicipalityLogo size={size} bg="#8B4500" abbr="ADM" city="Abu Dhabi" />,
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
    logo: (size) => <MunicipalityLogo size={size} bg="#2a3a9c" abbr="SHM" city="Sharjah" />,
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
        className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{ backgroundColor: bgColor, border: "1.5px solid #e5e7eb" }}
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
  const { t, lang } = useLanguage();

  return (
    <>
      {/* جهة إصدار اللوحة */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 block text-right">{t.home.form.plateSource}</label>
        <div className="relative">
          <select
            value={plateSource}
            onChange={(e) => { setPlateSource(e.target.value); const codes = PLATE_CODES_BY_SOURCE[e.target.value] || []; setPlateCode(codes[0] || ""); }}
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
          <label className="text-sm font-bold text-gray-700 block text-right">{t.home.form.plateCode}</label>
          <div className="relative">
            <select value={plateCode} onChange={(e) => setPlateCode(e.target.value)} disabled={!plateSource} className="w-full text-base rounded-xl px-4 py-4 appearance-none focus:outline-none" style={{ backgroundColor: plateSource ? "#ffffff" : "#f3f4f6", border: "1.5px solid #d1d5db", color: plateCode ? "#111827" : "#9ca3af", cursor: plateSource ? "pointer" : "not-allowed", paddingLeft: "2.5rem" }} dir="ltr">
              <option value="">{t.home.form.plateCodePlaceholder}</option>
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
  const [, navigate] = useLocation();
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFines, setSelectedFines] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const { t, lang, toggleLanguage, isRTL } = useLanguage();

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
          <button onClick={toggleLanguage} className="flex items-center gap-1 hover:opacity-80 font-bold"><Globe className="w-3 h-3" /> {t.header.topBar.language}</button>
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
            onClick={toggleLanguage}
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
      ? { label: t.home.results.status.paid, bg: "#e8f5ee", color: "#008755", icon: "✓" }
      : fine.status === "seized"
      ? { label: t.home.results.status.seized, bg: "#fff0f0", color: "#dc2626", icon: "🔒" }
      : fine.status === "blackpoints"
      ? { label: t.home.results.status.blackPoints, bg: "#fef3c7", color: "#d97706", icon: "⚠" }
      : { label: t.home.results.filters.payable, bg: "#fff3e0", color: "#f57c00", icon: "●" };

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
            {/* Source logo in header - real CDN logo, circular */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ backgroundColor: sourceBgColor, border: "1.5px solid #e5e7eb" }}
            >
              <SourceIcon source={fine.source} size={36} />
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
              <span className="text-sm">{t.home.results.fineCard.source}</span>
            </div>
            <SourceBadge source={fine.source} />
          </div>
          {/* Location */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="w-4 h-4" style={{ color: "#008755" }} />
              <span className="text-sm">{t.home.results.fineCard.location}</span>
            </div>
            <span className="text-sm font-semibold text-gray-800 text-left max-w-[55%] truncate" dir="rtl">{fine.location || "—"}</span>
          </div>
          {/* Speed */}
          {fine.speed && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500">
                <Gauge className="w-4 h-4" style={{ color: "#008755" }} />
                <span className="text-sm">{t.home.results.fineCard.speed}</span>
              </div>
              <span className="text-sm font-semibold text-gray-800" dir="ltr">{fine.speed}</span>
            </div>
          )}
          {/* Ticket No */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <Hash className="w-4 h-4" style={{ color: "#008755" }} />
              <span className="text-sm">{t.home.results.fineCard.ticketNo}</span>
            </div>
            <span className="text-sm font-semibold text-gray-800" dir="ltr">{fine.ticketNo || "—"}</span>
          </div>
          {/* Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4" style={{ color: "#008755" }} />
              <span className="text-sm">{t.home.results.fineCard.dateTime}</span>
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
                <span className="text-sm font-bold" style={{ color: "#008755" }}>{t.home.results.fineCard.details}</span>
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
                <p className="text-sm text-red-700">{result.errorMessage || "لم يتم العثور على مخالفات"}</p>
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
                style={{ backgroundColor: "#ffffff", border: "1.5px solid #e8ede9", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
              >
                <div className="flex items-center px-6 py-4 gap-6 border-b border-gray-100 flex-wrap">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5">{t.home.results.totalFines}</p>
                    <p className="text-2xl font-black text-gray-900">{allFines.length}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5">{t.home.results.filters.payable}</p>
                    <p className="text-2xl font-black text-gray-900">{payableCount}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5">{t.home.results.summary.selected}</p>
                    <p className="text-2xl font-black text-gray-900">{selectedFines.size}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5">{t.home.results.totalAmount}</p>
                    <p className="text-2xl font-black" style={{ color: "#008755" }}>Đ {selectedTotal > 0 ? selectedTotal.toFixed(0) : "0"}</p>
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-3 flex-wrap">
                      <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4" style={{ accentColor: "#008755" }} />
                      {t.home.results.payInstallment}
                    </label>
                    <button
                      disabled={selectedFines.size === 0}
                      className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all"
                      style={{ backgroundColor: selectedFines.size > 0 ? "#008755" : "#9ca3af", boxShadow: selectedFines.size > 0 ? "0 4px 12px rgba(0,135,85,0.3)" : "none" }}
                      onClick={() => {
                        const selectedFinesData = Array.from(selectedFines).map(idx => filteredFines[idx]).filter(Boolean);
                        const total = selectedTotal.toFixed(0);
                        sessionStorage.setItem("paymentData", JSON.stringify({
                          selectedFines: selectedFinesData,
                          totalAmount: total,
                          plateNumber,
                          plateSource,
                          queryId: (result as any)?.queryId,
                        }));
                        sessionStorage.removeItem("paymentSessionId");
                        navigate("/payment");
                      }}
                    >
                      {t.home.results.paySelected}
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

          {/* Bottom summary bar - mobile STICKY - مطابق للموقع الأصلي */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            style={{ backgroundColor: "#ffffff", borderTop: "1.5px solid #e8ede9", boxShadow: "0 -4px 20px rgba(0,0,0,0.12)" }}
          >
            {/* Stats row */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="text-center flex-1">
                <p className="text-xs text-gray-500 leading-tight">{t.home.results.totalFines}</p>
                <p className="text-base font-black text-gray-900">{allFines.length}</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center flex-1">
                <p className="text-xs text-gray-500 leading-tight">{t.home.results.filters.payable}</p>
                <p className="text-base font-black text-gray-900">{payableCount}</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center flex-1">
                <p className="text-xs text-gray-500 leading-tight">{t.home.results.totalAmount}</p>
                <p className="text-base font-black" style={{ color: "#008755" }}>Đ {selectedTotal > 0 ? selectedTotal.toFixed(0) : "0"}</p>
              </div>
            </div>

            {/* Main action buttons row */}
            <div className="flex items-center gap-2 px-4 pb-2">
              <button
                onClick={() => { setView("form"); setResult(null); setSelectedFines(new Set()); }}
                className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl text-sm font-bold transition-all flex-shrink-0"
                style={{ backgroundColor: "#f0f4f2", color: "#374151", border: "1px solid #e5e7eb" }}
              >
                <ArrowRight className="w-4 h-4" />
                <span>{lang === "ar" ? "رجوع" : "Back"}</span>
              </button>
              <button
                disabled={selectedFines.size === 0}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all"
                style={{ backgroundColor: selectedFines.size > 0 ? "#008755" : "#9ca3af", boxShadow: selectedFines.size > 0 ? "0 4px 12px rgba(0,135,85,0.3)" : "none" }}
                onClick={() => {
                  const selectedFinesData = Array.from(selectedFines).map(idx => filteredFines[idx]).filter(Boolean);
                  const total = selectedTotal.toFixed(0);
                  sessionStorage.setItem("paymentData", JSON.stringify({
                    selectedFines: selectedFinesData,
                    totalAmount: total,
                    plateNumber,
                    plateSource,
                    queryId: (result as any)?.queryId,
                  }));
                  sessionStorage.removeItem("paymentSessionId");
                  navigate("/payment");
                }}
              >
                دفع
              </button>
            </div>

            {/* Installment row - تحت الأزرار */}
            <div className="flex items-center gap-2 px-4 pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 cursor-pointer rounded" style={{ accentColor: "#008755" }} />
                <span className="text-xs text-gray-500">الدفع بالتقسيط عبر الخصم المباشر</span>
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
          {/* Hide the extra white plate visible in the video grille area */}
          <div style={{ position: "absolute", top: "44%", left: "30%", width: "28%", height: "18%", backgroundColor: "#2d6a3f", borderRadius: "4px", zIndex: 5 }} />
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
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: "#008755" }} />
            <h2 className="text-xl font-black text-gray-900">{t.home.title}</h2>
          </div>
          <p className="text-sm text-gray-500 mr-3">{t.home.subtitle}</p>
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
                <><Loader2 className="w-5 h-5 animate-spin" /><span>{t.home.form.checking}</span></>
              ) : (
                <><ArrowLeft className="w-5 h-5" /><span>{t.home.form.checkButton}</span></>
              )}
            </button>
            <button
              onClick={resetForm}
              className="w-full py-3.5 rounded-2xl text-base font-bold flex items-center justify-center gap-3 transition-all hover:bg-gray-50"
              style={{ backgroundColor: "#ffffff", color: "#374151", border: "1.5px solid #d1d5db" }}
            >
            <span>{lang === "ar" ? "رجوع" : "Back"}</span><ArrowRight className="w-5 h-5" />
          </button>
        </div>

          {/* Info note */}
          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl" style={{ backgroundColor: "#e8f5ee" }}>
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#008755" }} />
            <p className="text-xs text-gray-600">{t.home.form.infoNote}</p>
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
            src={CAR_VIDEO_URL}
            autoPlay muted playsInline
            style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", height: "auto", minHeight: "100%", objectFit: "cover", objectPosition: "center 45%", display: "block" }}
            onEnded={(e) => { e.currentTarget.pause(); }}
          />
          {/* Hide the extra white plate visible in the video grille area */}
          <div style={{ position: "absolute", top: "44%", left: "30%", width: "28%", height: "18%", backgroundColor: "#2d6a3f", borderRadius: "4px", zIndex: 5 }} />
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
