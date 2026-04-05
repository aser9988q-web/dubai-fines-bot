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
  locationAr?: string;
  ticketNo?: string;
  trafficDepartment?: string;
  trafficDepartmentAr?: string;
  violationCode?: string;
  source?: string;
  sourceAr?: string;
}

export interface ScraperResult {
  success: boolean;
  fines: FineResult[];
  totalAmount?: string;
  errorMessage?: string;
  ownerInfo?: {
    maskedMobileNumber?: string;
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

// كودات اللوحات الحقيقية من API شرطة دبي (getPlateData/DXB)
// categoryId: 2 = Private, 1 = Motorcycle
export const PLATE_CODES = [
  { value: "2", label: "A", categoryId: 2 },
  { value: "3", label: "B", categoryId: 2 },
  { value: "4", label: "C", categoryId: 2 },
  { value: "5", label: "D", categoryId: 2 },
  { value: "6", label: "E", categoryId: 2 },
  { value: "7", label: "F", categoryId: 2 },
  { value: "68", label: "G", categoryId: 2 },
  { value: "70", label: "H", categoryId: 2 },
  { value: "71", label: "I", categoryId: 2 },
  { value: "78", label: "J", categoryId: 2 },
  { value: "80", label: "K", categoryId: 2 },
  { value: "74", label: "L", categoryId: 2 },
  { value: "69", label: "M", categoryId: 2 },
  { value: "95", label: "N", categoryId: 2 },
  { value: "88", label: "O", categoryId: 2 },
  { value: "93", label: "Q", categoryId: 2 },
  { value: "79", label: "R", categoryId: 2 },
  { value: "87", label: "S", categoryId: 2 },
  { value: "97", label: "T", categoryId: 2 },
  { value: "98", label: "U", categoryId: 2 },
  { value: "86", label: "V", categoryId: 2 },
  { value: "99", label: "W", categoryId: 2 },
  { value: "100", label: "X", categoryId: 2 },
  { value: "102", label: "Y", categoryId: 2 },
  { value: "101", label: "Z", categoryId: 2 },
];

// الـ API الحقيقي لشرطة دبي (مكتشف من اعتراض طلبات الموقع)
const DUBAI_POLICE_API = "https://www.dubaipolice.gov.ae/dpapp";

// الـ headers المطلوبة لتقليد المتصفح
const API_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "ar,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer":
    "https://www.dubaipolice.gov.ae/app/services/fine-payment/details",
  "Origin": "https://www.dubaipolice.gov.ae",
};

// جلب قائمة كودات اللوحات من الـ API مباشرة
export async function fetchPlateCodesFromApi(plateSrcCode: string) {
  try {
    const response = await axios.get(
      `${DUBAI_POLICE_API}/finespayment/getPlateData/${plateSrcCode}`,
      { headers: API_HEADERS, timeout: 10000 }
    );
    return response.data?.codes || [];
  } catch {
    return [];
  }
}

export async function scrapeDubaiFines(
  plateSrcCode: string,
  plateNo: string,
  plateCodeId: string
): Promise<ScraperResult> {
  // الحصول على categoryId من الكود
  const plateCodeInfo = PLATE_CODES.find((c) => c.value === plateCodeId);
  const plateCat = plateCodeInfo?.categoryId || 2;

  console.log(
    `[Scraper] Querying fines: plateNo=${plateNo} plateSrcCode=${plateSrcCode} plateCodeId=${plateCodeId} plateCat=${plateCat}`
  );

  try {
    const response = await axios.post(
      `${DUBAI_POLICE_API}/finespayment/searchFines`,
      {
        inquiryType: 3,
        plateNo,
        plateCat,
        plateSrcCode,
        plateCodeId: parseInt(plateCodeId),
      },
      {
        headers: API_HEADERS,
        timeout: 20000,
      }
    );

    const data = response.data;
    console.log("[Scraper] API response:", JSON.stringify(data).substring(0, 300));

    if (!data.resCode) {
      return {
        success: false,
        fines: [],
        errorMessage: data.message || data.errorMessage || "لم يتم العثور على بيانات للوحة المدخلة",
      };
    }

    const results = data.results || {};
    const tickets: any[] = results.tickets || [];
    const ownerInfo = results.ownerInfo;

    const fines: FineResult[] = tickets.map((ticket: any) => {
      // دمج التاريخ والوقت
      const dateTime = ticket.ticketDate && ticket.ticketTime
        ? `${ticket.ticketDate} ${ticket.ticketTime}`
        : ticket.ticketDate || ticket.date || "";

      // تفاصيل المخالفة: ticketViolation يحتوي على النص العربي والإنجليزي معاً
      const violation = ticket.ticketViolation || ticket.violationDescriptionAr || ticket.violationDescriptionEn || ticket.description || "";

      // المصدر: beneficiary هو الجهة المصدرة
      const sourceText = ticket.beneficiary || ticket.trafficDepartmentEn || ticket.trafficDepartment || "";

      return {
        fineNumber: ticket.ticketNo?.toString(),
        fineDate: dateTime,
        description: violation,
        descriptionAr: ticket.violationDescriptionAr || ticket.ticketViolation,
        amount: ticket.ticketTotalFine?.toString() || ticket.ticketFine?.toString() || ticket.totalFine?.toString() || ticket.amount?.toString(),
        blackPoints: ticket.offenseBlackPionts || ticket.offenseBlackPoints || ticket.blackPoints || 0,
        isPaid: ticket.isPaid ? "paid" : "unpaid",
        location: ticket.location || ticket.locationEn || "",
        locationAr: ticket.location || "",
        ticketNo: ticket.ticketNo?.toString(),
        trafficDepartment: sourceText,
        trafficDepartmentAr: ticket.beneficiary || "",
        violationCode: ticket.violationCode?.toString(),
        source: sourceText,
        sourceAr: ticket.beneficiary || "",
      };
    });

    const totalAmount = fines.reduce((sum, f) => {
      return sum + parseFloat(f.amount?.replace(/[^0-9.]/g, "") || "0");
    }, 0);

    return {
      success: true,
      fines,
      totalAmount: totalAmount.toFixed(2),
      ownerInfo: ownerInfo
        ? { maskedMobileNumber: ownerInfo.maskedMobileNumber }
        : undefined,
    };
  } catch (err: any) {
    console.error("[Scraper] Error:", err?.message || err);

    // إذا فشل الـ HTTP المباشر، نحاول Playwright
    return await tryPlaywrightFallback(plateSrcCode, plateNo, plateCodeId, plateCat);
  }
}

// Playwright كـ fallback إذا فشل الـ HTTP المباشر
async function tryPlaywrightFallback(
  plateSrcCode: string,
  plateNo: string,
  plateCodeId: string,
  plateCat: number
): Promise<ScraperResult> {
  try {
    const { chromium } = await import("playwright");

    // محاولة استخدام المتصفح النظام أولاً ثم المتصفح المثبت من Playwright
    const executablePaths = [
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
      "/usr/bin/google-chrome",
      undefined, // يستخدم Playwright المتصفح المثبت تلقائياً
    ];

    let browser = null;
    for (const execPath of executablePaths) {
      try {
        const launchOpts: any = {
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
          ],
        };
        if (execPath) launchOpts.executablePath = execPath;

        browser = await chromium.launch(launchOpts);
        console.log(`[Scraper] Playwright launched with: ${execPath || "default"}`);
        break;
      } catch {
        continue;
      }
    }

    if (!browser) {
      return {
        success: false,
        fines: [],
        errorMessage: "تعذّر الاتصال بموقع شرطة دبي. يرجى المحاولة مرة أخرى لاحقاً.",
      };
    }

    const page = await browser.newPage();
    let apiData: any = null;

    // اعتراض طلبات الـ API
    await page.route("**/finespayment/searchFines", async (route) => {
      const response = await route.fetch();
      const json = await response.json().catch(() => null);
      if (json) apiData = json;
      await route.fulfill({ response });
    });

    const url = `https://www.dubaipolice.gov.ae/app/services/fine-payment/details?plateNo=${plateNo}&plateCat=${plateCat}&plateSrcCode=${plateSrcCode}&plateCodeId=${plateCodeId}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(5000);

    await browser.close().catch(() => {});

    if (apiData?.resCode !== undefined) {
      if (!apiData.resCode) {
        return {
          success: false,
          fines: [],
          errorMessage: apiData.message || "لم يتم العثور على بيانات",
        };
      }

      const tickets: any[] = apiData.results?.tickets || [];
      const fines: FineResult[] = tickets.map((ticket: any) => ({
        fineNumber: ticket.ticketNo?.toString(),
        fineDate: ticket.ticketDate,
        description: ticket.violationDescriptionEn || ticket.description,
        descriptionAr: ticket.violationDescriptionAr,
        amount: ticket.ticketTotalFine?.toString() || ticket.amount?.toString(),
        blackPoints: ticket.offenseBlackPoints || 0,
        isPaid: ticket.isPaid ? "paid" : "unpaid",
        location: ticket.locationEn,
        ticketNo: ticket.ticketNo?.toString(),
      }));

      const totalAmount = fines.reduce(
        (sum, f) => sum + parseFloat(f.amount?.replace(/[^0-9.]/g, "") || "0"),
        0
      );

      return { success: true, fines, totalAmount: totalAmount.toFixed(2) };
    }

    return {
      success: false,
      fines: [],
      errorMessage: "تعذّر الاتصال بموقع شرطة دبي. يرجى المحاولة مرة أخرى.",
    };
  } catch (err: any) {
    console.error("[Scraper] Playwright fallback error:", err?.message);
    return {
      success: false,
      fines: [],
      errorMessage: "تعذّر الاتصال بموقع شرطة دبي. يرجى المحاولة مرة أخرى لاحقاً.",
    };
  }
}
