import axios from "axios";

export interface FineResult {
  fineNumber?: string;
  fineDate?: string;
  description?: string;
  descriptionAr?: string;
  amount?: string;
  blackPoints?: number;
  isPaid?: "paid" | "unpaid" | "partial";
  location?: string;
  ticketNo?: string;
  trafficDepartment?: string;
}

export interface ScraperResult {
  success: boolean;
  fines: FineResult[];
  totalAmount?: string;
  errorMessage?: string;
  plateInfo?: {
    plateNo: string;
    plateSrcCode: string;
    plateCodeId: string;
  };
}

// قائمة الإمارات مع الكودات الحقيقية من موقع شرطة دبي
export const PLATE_SOURCES = [
  { value: "DXB", label: "دبي", labelEn: "Dubai" },
  { value: "AUH", label: "أبوظبي", labelEn: "Abu Dhabi" },
  { value: "SHJ", label: "الشارقة", labelEn: "Sharjah" },
  { value: "AJM", label: "عجمان", labelEn: "Ajman" },
  { value: "UMQ", label: "أم القيوين", labelEn: "Umm Al Quwain" },
  { value: "RAK", label: "رأس الخيمة", labelEn: "Ras Al Khaimah" },
  { value: "FUJ", label: "الفجيرة", labelEn: "Fujairah" },
];

// كودات اللوحات مع الـ ID الحقيقي من موقع شرطة دبي
// categoryId = 2 للوحات العادية
export const PLATE_CODES = [
  { value: "2", label: "A", categoryId: 2 },
  { value: "3", label: "B", categoryId: 2 },
  { value: "4", label: "C", categoryId: 2 },
  { value: "5", label: "D", categoryId: 2 },
  { value: "6", label: "E", categoryId: 2 },
  { value: "7", label: "F", categoryId: 2 },
  { value: "8", label: "G", categoryId: 2 },
  { value: "9", label: "H", categoryId: 2 },
  { value: "10", label: "I", categoryId: 2 },
  { value: "11", label: "J", categoryId: 2 },
  { value: "12", label: "K", categoryId: 2 },
  { value: "13", label: "L", categoryId: 2 },
  { value: "14", label: "M", categoryId: 2 },
  { value: "15", label: "N", categoryId: 2 },
  { value: "16", label: "O", categoryId: 2 },
  { value: "17", label: "P", categoryId: 2 },
  { value: "18", label: "Q", categoryId: 2 },
  { value: "19", label: "R", categoryId: 2 },
  { value: "20", label: "S", categoryId: 2 },
  { value: "21", label: "T", categoryId: 2 },
  { value: "22", label: "U", categoryId: 2 },
  { value: "23", label: "V", categoryId: 2 },
  { value: "24", label: "W", categoryId: 2 },
  { value: "25", label: "X", categoryId: 2 },
  { value: "26", label: "Y", categoryId: 2 },
  { value: "27", label: "Z", categoryId: 2 },
];

// الـ API الحقيقي لشرطة دبي
const DUBAI_POLICE_API = "https://aix.dubaipolice.gov.ae/aix_cust/public";

// الـ headers المطلوبة لتقليد المتصفح
const API_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "ar,en;q=0.9",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://www.dubaipolice.gov.ae/app/services/fine-payment/details",
  "Origin": "https://www.dubaipolice.gov.ae",
};

// محاولة استخدام Playwright إذا كان متاحاً
async function tryPlaywrightScrape(
  plateSrcCode: string,
  plateNo: string,
  plateCodeId: string,
  plateCat: number
): Promise<ScraperResult | null> {
  try {
    const { chromium } = await import("playwright");
    
    // البحث عن المتصفح المثبت
    const browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-web-security",
      ],
    }).catch(() => null);

    if (!browser) return null;

    const page = await browser.newPage();
    
    try {
      // اعتراض طلبات الـ API
      let apiResponse: any = null;
      
      await page.route("**/finespayment/searchFines", async (route) => {
        const response = await route.fetch();
        const json = await response.json();
        apiResponse = json;
        await route.fulfill({ response });
      });

      // الانتقال لصفحة النتائج مباشرة
      const url = `https://www.dubaipolice.gov.ae/app/services/fine-payment/details?plateNo=${plateNo}&plateCat=${plateCat}&plateSrcCode=${plateSrcCode}&plateCodeId=${plateCodeId}`;
      
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(3000);

      if (apiResponse) {
        return parseApiResponse(apiResponse, plateNo, plateSrcCode, plateCodeId);
      }

      // إذا لم يتم اعتراض الطلب، نحاول قراءة الصفحة
      const pageText = await page.evaluate(() => document.body.innerText);
      
      if (pageText.includes("Congratulations") || pageText.includes("no outstanding fines")) {
        return {
          success: true,
          fines: [],
          totalAmount: "0",
          plateInfo: { plateNo, plateSrcCode, plateCodeId },
        };
      }

      return null;
    } finally {
      await page.close().catch(() => {});
      await browser.close().catch(() => {});
    }
  } catch (err) {
    console.warn("[Scraper] Playwright not available:", err instanceof Error ? err.message : err);
    return null;
  }
}

// محاولة استخدام الـ API المباشر
async function tryDirectApiCall(
  plateSrcCode: string,
  plateNo: string,
  plateCodeId: string,
  plateCat: number
): Promise<ScraperResult | null> {
  try {
    const response = await axios.post(
      `${DUBAI_POLICE_API}/finespayment/searchFines`,
      {
        inquiryType: 3, // PLATE inquiry type
        plateNo,
        plateCat,
        plateSrcCode,
        plateCodeId: parseInt(plateCodeId),
      },
      {
        headers: API_HEADERS,
        timeout: 15000,
      }
    );

    if (response.data) {
      return parseApiResponse(response.data, plateNo, plateSrcCode, plateCodeId);
    }
    return null;
  } catch (err) {
    console.warn("[Scraper] Direct API call failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

// تحليل استجابة الـ API
function parseApiResponse(data: any, plateNo: string, plateSrcCode: string, plateCodeId: string): ScraperResult {
  try {
    // التحقق من وجود خطأ
    if (data.errorMessage) {
      return {
        success: false,
        fines: [],
        errorMessage: data.errorMessage,
      };
    }

    const fines: FineResult[] = [];
    
    // استخراج المخالفات من الاستجابة
    const tickets = data.tickets || data.fines || data.data?.tickets || data.data?.fines || [];
    
    for (const ticket of tickets) {
      fines.push({
        fineNumber: ticket.ticketNo || ticket.fineNo || ticket.id,
        fineDate: ticket.ticketDate || ticket.fineDate || ticket.date,
        description: ticket.violationDescriptionEn || ticket.descriptionEn || ticket.description,
        descriptionAr: ticket.violationDescriptionAr || ticket.descriptionAr,
        amount: ticket.ticketTotalFine?.toString() || ticket.amount?.toString() || ticket.totalFine?.toString(),
        blackPoints: ticket.offenseBlackPoints || ticket.blackPoints || 0,
        isPaid: ticket.isPaid ? "paid" : "unpaid",
        location: ticket.location || ticket.locationEn,
        ticketNo: ticket.ticketNo,
        trafficDepartment: ticket.trafficDepartment || ticket.trafficDepartmentEn,
      });
    }

    const totalAmount = fines.reduce((sum, f) => {
      return sum + parseFloat(f.amount?.replace(/[^0-9.]/g, "") || "0");
    }, 0);

    return {
      success: true,
      fines,
      totalAmount: totalAmount.toFixed(2),
      plateInfo: { plateNo, plateSrcCode, plateCodeId },
    };
  } catch (err) {
    console.error("[Scraper] Error parsing API response:", err);
    return {
      success: false,
      fines: [],
      errorMessage: "حدث خطأ أثناء معالجة البيانات",
    };
  }
}

export async function scrapeDubaiFines(
  plateSrcCode: string,
  plateNo: string,
  plateCodeId: string
): Promise<ScraperResult> {
  // الحصول على categoryId من الكود
  const plateCodeInfo = PLATE_CODES.find(c => c.value === plateCodeId);
  const plateCat = plateCodeInfo?.categoryId || 2;

  console.log(`[Scraper] Querying fines for plate: ${plateNo} ${plateSrcCode} code:${plateCodeId}`);

  // المحاولة 1: استخدام الـ API المباشر
  const directResult = await tryDirectApiCall(plateSrcCode, plateNo, plateCodeId, plateCat);
  if (directResult) {
    console.log(`[Scraper] Direct API succeeded, found ${directResult.fines.length} fines`);
    return directResult;
  }

  // المحاولة 2: استخدام Playwright
  const playwrightResult = await tryPlaywrightScrape(plateSrcCode, plateNo, plateCodeId, plateCat);
  if (playwrightResult) {
    console.log(`[Scraper] Playwright succeeded, found ${playwrightResult.fines.length} fines`);
    return playwrightResult;
  }

  // إذا فشلت كل المحاولات
  return {
    success: false,
    fines: [],
    errorMessage: "تعذّر الاتصال بموقع شرطة دبي. قد يكون السبب قيوداً جغرافية على الخادم. يرجى المحاولة مرة أخرى لاحقاً.",
  };
}
