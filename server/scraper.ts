import { chromium, Browser, Page } from "playwright";

export interface FineResult {
  fineNumber?: string;
  fineDate?: string;
  description?: string;
  amount?: string;
  blackPoints?: number;
  isPaid?: "paid" | "unpaid" | "partial";
  location?: string;
}

export interface ScraperResult {
  success: boolean;
  fines: FineResult[];
  totalAmount?: string;
  errorMessage?: string;
  rawHtml?: string;
}

// قائمة الإمارات المتاحة في موقع شرطة دبي
export const PLATE_SOURCES = [
  { value: "Dubai", label: "دبي" },
  { value: "Abu Dhabi", label: "أبوظبي" },
  { value: "Sharjah", label: "الشارقة" },
  { value: "Ajman", label: "عجمان" },
  { value: "Umm Al Quwain", label: "أم القيوين" },
  { value: "Ras Al Khaimah", label: "رأس الخيمة" },
  { value: "Fujairah", label: "الفجيرة" },
];

// كودات اللوحات الشائعة في دبي
export const PLATE_CODES = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "E", label: "E" },
  { value: "F", label: "F" },
  { value: "G", label: "G" },
  { value: "H", label: "H" },
  { value: "I", label: "I" },
  { value: "J", label: "J" },
  { value: "K", label: "K" },
  { value: "L", label: "L" },
  { value: "M", label: "M" },
  { value: "N", label: "N" },
  { value: "O", label: "O" },
  { value: "P", label: "P" },
  { value: "Q", label: "Q" },
  { value: "R", label: "R" },
  { value: "S", label: "S" },
  { value: "T", label: "T" },
  { value: "U", label: "U" },
  { value: "V", label: "V" },
  { value: "W", label: "W" },
  { value: "X", label: "X" },
  { value: "Y", label: "Y" },
  { value: "Z", label: "Z" },
];

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
  }
  return browserInstance;
}

export async function scrapeDubaiFines(
  plateSource: string,
  plateNumber: string,
  plateCode: string
): Promise<ScraperResult> {
  let page: Page | null = null;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // إعداد timeout
    page.setDefaultTimeout(30000);

    // الانتقال إلى صفحة الاستعلام
    await page.goto("https://www.dubaipolice.gov.ae/app/services/fine-payment/search", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // انتظار تحميل النموذج
    await page.waitForSelector('[role="tab"]', { timeout: 15000 });

    // التأكد من أن تبويب "Plate" محدد
    const plateTab = page.locator('[role="tab"]').filter({ hasText: "Plate" });
    await plateTab.click();
    await page.waitForTimeout(1000);

    // ملء حقل Plate Source (الإمارة)
    const sourceInputs = page.locator('input[role="combobox"]');
    const sourceInput = sourceInputs.first();
    await sourceInput.click();
    await page.waitForTimeout(500);

    // البحث عن الخيار المناسب في القائمة المنسدلة
    await sourceInput.fill(plateSource);
    await page.waitForTimeout(500);

    // اختيار الخيار من القائمة
    const sourceOption = page.locator(`[role="option"]`).filter({ hasText: plateSource }).first();
    if (await sourceOption.isVisible()) {
      await sourceOption.click();
    } else {
      // محاولة بديلة
      const allOptions = page.locator(`[role="option"]`);
      const count = await allOptions.count();
      for (let i = 0; i < count; i++) {
        const text = await allOptions.nth(i).textContent();
        if (text && text.toLowerCase().includes(plateSource.toLowerCase())) {
          await allOptions.nth(i).click();
          break;
        }
      }
    }
    await page.waitForTimeout(500);

    // ملء حقل رقم اللوحة
    const plateNumberInput = page.locator('input[placeholder="Plate Number"]');
    await plateNumberInput.fill(plateNumber);
    await page.waitForTimeout(300);

    // ملء حقل Plate Code
    const codeInputs = page.locator('input[role="combobox"]');
    const codeInput = codeInputs.last();
    await codeInput.click();
    await page.waitForTimeout(500);

    await codeInput.fill(plateCode);
    await page.waitForTimeout(500);

    const codeOption = page.locator(`[role="option"]`).filter({ hasText: plateCode }).first();
    if (await codeOption.isVisible()) {
      await codeOption.click();
    }
    await page.waitForTimeout(500);

    // الضغط على زر "Check Fines"
    const checkButton = page.locator('button').filter({ hasText: "Check Fines" });
    await checkButton.click();

    // انتظار النتائج
    await page.waitForTimeout(3000);

    // محاولة انتظار ظهور النتائج أو رسالة "لا توجد مخالفات"
    try {
      await page.waitForSelector('[class*="result"], [class*="fine"], [class*="violation"], table, .MuiTable-root', {
        timeout: 10000,
      });
    } catch {
      // قد لا تكون هناك مخالفات
    }

    // جلب HTML الصفحة للتحليل
    const pageContent = await page.content();

    // تحليل النتائج
    const fines = await extractFines(page);

    if (fines.length === 0) {
      // التحقق من وجود رسالة "لا توجد مخالفات"
      const noFinesText = await page.evaluate(() => {
        const body = document.body.innerText.toLowerCase();
        return (
          body.includes("no fines") ||
          body.includes("no violation") ||
          body.includes("no result") ||
          body.includes("لا توجد") ||
          body.includes("0 fine")
        );
      });

      if (noFinesText) {
        return {
          success: true,
          fines: [],
          totalAmount: "0",
          rawHtml: pageContent,
        };
      }
    }

    // حساب إجمالي المبلغ
    let totalAmount = "0";
    if (fines.length > 0) {
      const total = fines.reduce((sum, fine) => {
        const amount = parseFloat(fine.amount?.replace(/[^0-9.]/g, "") || "0");
        return sum + amount;
      }, 0);
      totalAmount = total.toFixed(2);
    }

    return {
      success: true,
      fines,
      totalAmount,
      rawHtml: pageContent,
    };
  } catch (error) {
    console.error("[Scraper] Error:", error);
    return {
      success: false,
      fines: [],
      errorMessage: error instanceof Error ? error.message : "حدث خطأ غير متوقع أثناء الاستعلام",
    };
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}

async function extractFines(page: Page): Promise<FineResult[]> {
  try {
    // محاولة استخراج البيانات من الجداول
    const fines = await page.evaluate(() => {
      const results: Array<{
        fineNumber?: string;
        fineDate?: string;
        description?: string;
        amount?: string;
        blackPoints?: number;
        isPaid?: string;
        location?: string;
      }> = [];

      // البحث عن صفوف الجدول
      const rows = document.querySelectorAll("tr, [class*='row'], [class*='item']");

      rows.forEach((row) => {
        const cells = row.querySelectorAll("td, [class*='cell'], [class*='col']");
        if (cells.length >= 2) {
          const rowData: Record<string, string> = {};
          cells.forEach((cell, index) => {
            rowData[`col${index}`] = cell.textContent?.trim() || "";
          });

          // تحقق من أن الصف يحتوي على بيانات مخالفة
          const text = row.textContent || "";
          if (
            text.includes("AED") ||
            text.includes("Fine") ||
            text.includes("Violation") ||
            /\d{4}-\d{2}-\d{2}/.test(text)
          ) {
            results.push({
              description: rowData["col0"] || rowData["col1"],
              amount: rowData["col2"] || rowData["col3"],
              fineDate: rowData["col1"] || rowData["col2"],
            });
          }
        }
      });

      // البحث عن عناصر بيانات المخالفات بشكل مباشر
      const fineElements = document.querySelectorAll(
        "[class*='fine'], [class*='violation'], [class*='penalty']"
      );
      fineElements.forEach((el) => {
        const text = el.textContent?.trim();
        if (text && text.length > 5) {
          results.push({ description: text });
        }
      });

      return results;
    });

    return fines.map((f) => ({
      ...f,
      isPaid: (f.isPaid as "paid" | "unpaid" | "partial") || "unpaid",
    }));
  } catch {
    return [];
  }
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
    browserInstance = null;
  }
}
