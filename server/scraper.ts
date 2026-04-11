import axios from "axios";
import { ProxyAgent } from "proxy-agent";

let cachedProxyUrl: string | null | undefined;
let cachedProxyAgent: ProxyAgent | null | undefined;

function normalizeProxyUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return /^[a-z]+:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
}

function isDubaiPoliceProxyEnabled() {
  const raw = process.env.DUBAI_POLICE_PROXY_ENABLED?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

function getDubaiPoliceProxyUrl() {
  if (!isDubaiPoliceProxyEnabled()) return null;

  const raw = [
    process.env.DUBAI_POLICE_PROXY_URL,
    process.env.OUTBOUND_PROXY_URL,
    process.env.HTTPS_PROXY,
    process.env.HTTP_PROXY,
  ].find((value) => typeof value === "string" && value.trim());

  return raw ? normalizeProxyUrl(raw) : null;
}

function redactProxyUrl(proxyUrl: string | null) {
  if (!proxyUrl) return "none";

  try {
    const parsed = new URL(proxyUrl);
    if (parsed.username) parsed.username = "***";
    if (parsed.password) parsed.password = "***";
    return parsed.toString();
  } catch {
    return "[invalid proxy url]";
  }
}

function getProxyAgent() {
  const proxyUrl = getDubaiPoliceProxyUrl();
  if (!proxyUrl) return null;

  if (cachedProxyUrl === proxyUrl && cachedProxyAgent) {
    return cachedProxyAgent;
  }

  cachedProxyUrl = proxyUrl;
  cachedProxyAgent = new ProxyAgent({
    getProxyForUrl: () => proxyUrl,
  });
  console.log(`[Scraper] Dubai Police proxy enabled via ${redactProxyUrl(proxyUrl)}`);
  return cachedProxyAgent;
}

function getAxiosNetworkConfig() {
  const proxyAgent = getProxyAgent();
  if (!proxyAgent) return {};

  return {
    httpAgent: proxyAgent,
    httpsAgent: proxyAgent,
    proxy: false as const,
  };
}

function getPlaywrightProxyConfig() {
  const proxyUrl = getDubaiPoliceProxyUrl();
  if (!proxyUrl) return undefined;

  const parsed = new URL(proxyUrl);
  const server = `${parsed.protocol}//${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}`;

  return {
    server,
    username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
  };
}

function normalizeBaseUrl(raw: string) {
  return raw.trim().replace(/\/+$/, "");
}

function isDubaiPoliceRelayEnabled() {
  const raw = process.env.DUBAI_POLICE_RELAY_ENABLED?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

function getDubaiPoliceRelayBaseUrl() {
  const raw = process.env.DUBAI_POLICE_RELAY_URL?.trim();
  if (!raw) return null;
  return normalizeBaseUrl(raw);
}

function getDubaiPoliceRelayToken() {
  return process.env.DUBAI_POLICE_RELAY_TOKEN?.trim() || "";
}

async function requestViaRelay<T = AnyRecord>(
  method: "GET" | "POST",
  path: string,
  body?: unknown
): Promise<T | null> {
  if (!isDubaiPoliceRelayEnabled()) return null;

  const relayBaseUrl = getDubaiPoliceRelayBaseUrl();
  if (!relayBaseUrl) {
    throw new Error("Dubai Police relay is enabled but DUBAI_POLICE_RELAY_URL is missing");
  }

  const relayToken = getDubaiPoliceRelayToken();
  if (!relayToken) {
    throw new Error("Dubai Police relay is enabled but DUBAI_POLICE_RELAY_TOKEN is missing");
  }

  const response = await axios.request({
    method,
    url: `${relayBaseUrl}${path}`,
    data: body,
    timeout: 30000,
    validateStatus: () => true,
    headers: {
      "x-relay-token": relayToken,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
  });

  if (response.status >= 400) {
    const message = response.data?.errorMessage || `Relay returned HTTP ${response.status}`;
    throw new Error(message);
  }

  return (response.data?.data ?? null) as T | null;
}

function buildPlaywrightLaunchArgs() {
  return [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
  ];
}

function buildPlaywrightContextOptions() {
  return {
    locale: "ar-AE",
    userAgent: API_HEADERS["User-Agent"],
  };
}


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
  speed?: string;
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

type AnyRecord = Record<string, any>;

interface ResolvedPlateCodeMeta {
  resolvedPlateCodeId: number;
  plateCat: number;
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

// كودات دبي المعروفة محليًا كمرجع سريع عندما ينجح المطابقة المباشرة
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

const DUBAI_POLICE_API = "https://www.dubaipolice.gov.ae/dpapp";

const API_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "ar,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer:
    "https://www.dubaipolice.gov.ae/app/services/fine-payment/details",
  Origin: "https://www.dubaipolice.gov.ae",
};

function normalizeDigits(value: string) {
  return value
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

function normalizeCompare(value: unknown) {
  return normalizeDigits(String(value ?? ""))
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function parsePositiveInt(value: unknown): number | undefined {
  const normalized = normalizeDigits(String(value ?? "")).trim();
  if (!/^\d+$/.test(normalized)) return undefined;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseRawJson(raw: unknown): AnyRecord | null {
  if (raw && typeof raw === "object") return raw as AnyRecord;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith("<")) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function extractCodes(data: AnyRecord | null): AnyRecord[] {
  if (!data) return [];
  const possible = [
    data.codes,
    data.results?.codes,
    data.result?.codes,
    data.data?.codes,
    data.items,
  ];
  for (const candidate of possible) {
    if (Array.isArray(candidate)) return candidate as AnyRecord[];
  }
  return [];
}

function resolvePlateCodeMetaFromList(
  codes: AnyRecord[],
  requestedPlateCode: string
): ResolvedPlateCodeMeta | null {
  const wanted = normalizeCompare(requestedPlateCode);
  if (!wanted) return null;

  const matched = codes.find((code) => {
    const candidates = [
      code.value,
      code.id,
      code.codeId,
      code.plateCodeId,
      code.label,
      code.labelEn,
      code.labelAr,
      code.description,
      code.descriptionEn,
      code.descriptionAr,
      code.name,
      code.code,
    ];
    return candidates.some((candidate) => normalizeCompare(candidate) === wanted);
  });

  const resolvedPlateCodeId = parsePositiveInt(
    matched?.value ?? matched?.id ?? matched?.codeId ?? matched?.plateCodeId ?? requestedPlateCode
  );

  if (!resolvedPlateCodeId) return null;

  const plateCat = parsePositiveInt(
    matched?.categoryId ?? matched?.plateCat ?? matched?.category
  ) ?? 2;

  return { resolvedPlateCodeId, plateCat };
}

function resolvePlateCodeMeta(
  requestedPlateCode: string,
  codesFromApi: AnyRecord[] = []
): ResolvedPlateCodeMeta {
  const fromApi = resolvePlateCodeMetaFromList(codesFromApi, requestedPlateCode);
  if (fromApi) return fromApi;

  const fromStatic = PLATE_CODES.find(
    (code) => normalizeCompare(code.value) === normalizeCompare(requestedPlateCode)
      || normalizeCompare(code.label) === normalizeCompare(requestedPlateCode)
  );
  if (fromStatic) {
    return {
      resolvedPlateCodeId: Number.parseInt(fromStatic.value, 10),
      plateCat: fromStatic.categoryId || 2,
    };
  }

  return {
    resolvedPlateCodeId: parsePositiveInt(requestedPlateCode) ?? 0,
    plateCat: 2,
  };
}

function mapApiDataToScraperResult(data: AnyRecord | null): ScraperResult {
  if (!data) {
    return {
      success: false,
      fines: [],
      errorMessage: "تعذّر قراءة استجابة خدمة شرطة دبي. يرجى المحاولة مرة أخرى.",
    };
  }

  if (!data.resCode) {
    return {
      success: false,
      fines: [],
      errorMessage: data.message || data.errorMessage || "لم يتم العثور على بيانات للوحة المدخلة",
    };
  }

  const results = data.results || {};
  const tickets: AnyRecord[] = Array.isArray(results.tickets) ? results.tickets : [];
  const ownerInfo = results.ownerInfo;

  const fines: FineResult[] = tickets.map((ticket) => {
    const dateTime = ticket.ticketDate && ticket.ticketTime
      ? `${ticket.ticketDate} ${ticket.ticketTime}`
      : ticket.ticketDate || ticket.date || "";

    const violation = ticket.ticketViolation
      || ticket.violationDescriptionAr
      || ticket.violationDescriptionEn
      || ticket.description
      || "";

    const sourceText = ticket.beneficiary
      || ticket.trafficDepartmentEn
      || ticket.trafficDepartment
      || "";

    const speedValue = ticket.ticketSpeed?.toString()
      || ticket.vehicleSpeed?.toString()
      || ticket.measuredSpeed?.toString()
      || ticket.speed?.toString()
      || "";

    return {
      fineNumber: ticket.ticketNo?.toString(),
      fineDate: dateTime,
      description: violation,
      descriptionAr: ticket.violationDescriptionAr || ticket.ticketViolation,
      amount: ticket.ticketTotalFine?.toString()
        || ticket.ticketFine?.toString()
        || ticket.totalFine?.toString()
        || ticket.amount?.toString(),
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
      speed: speedValue || undefined,
    };
  });

  const totalAmount = fines.reduce((sum, fine) => {
    return sum + Number.parseFloat(fine.amount?.replace(/[^0-9.]/g, "") || "0");
  }, 0);

  return {
    success: true,
    fines,
    totalAmount: totalAmount.toFixed(2),
    ownerInfo: ownerInfo
      ? { maskedMobileNumber: ownerInfo.maskedMobileNumber }
      : undefined,
  };
}

async function performHttpQuery(
  plateSrcCode: string,
  plateNo: string,
  resolvedPlateCodeId: number,
  plateCat: number
): Promise<AnyRecord | null> {
  if (isDubaiPoliceRelayEnabled()) {
    return await requestViaRelay<AnyRecord>("POST", "/relay/search-fines", {
      inquiryType: 3,
      plateNo,
      plateCat,
      plateSrcCode,
      plateCodeId: resolvedPlateCodeId,
    });
  }

  const response = await axios.post(
    `${DUBAI_POLICE_API}/finespayment/searchFines`,
    {
      inquiryType: 3,
      plateNo,
      plateCat,
      plateSrcCode,
      plateCodeId: resolvedPlateCodeId,
    },
    {
      headers: API_HEADERS,
      timeout: 20000,
      responseType: "text",
      transformResponse: [(data) => data],
      validateStatus: () => true,
      ...getAxiosNetworkConfig(),
    }
  );

  if (response.status >= 400) {
    throw new Error(`Dubai Police API returned HTTP ${response.status}`);
  }

  return parseRawJson(response.data);
}

export async function fetchPlateCodesFromApi(plateSrcCode: string) {
  try {
    if (isDubaiPoliceRelayEnabled()) {
      const relayData = await requestViaRelay<AnyRecord>(
        "GET",
        `/relay/plate-data/${encodeURIComponent(plateSrcCode)}`
      );
      return extractCodes(relayData);
    }

    const response = await axios.get(
      `${DUBAI_POLICE_API}/finespayment/getPlateData/${plateSrcCode}`,
      {
        headers: API_HEADERS,
        timeout: 10000,
        responseType: "text",
        transformResponse: [(data) => data],
        validateStatus: () => true,
        ...getAxiosNetworkConfig(),
      }
    );

    if (response.status >= 400) return [];
    return extractCodes(parseRawJson(response.data));
  } catch {
    return [];
  }
}

export async function scrapeDubaiFines(
  plateSrcCode: string,
  plateNo: string,
  plateCodeId: string
): Promise<ScraperResult> {
  const normalizedPlateSrcCode = normalizeCompare(plateSrcCode);
  const normalizedPlateNo = normalizeDigits(String(plateNo ?? "")).trim();
  const normalizedPlateCode = normalizeDigits(String(plateCodeId ?? "")).trim();

  if (isDubaiPoliceRelayEnabled()) {
    const relayResult = await requestViaRelay<ScraperResult>("POST", "/relay/scrape", {
      plateSource: normalizedPlateSrcCode,
      plateNumber: normalizedPlateNo,
      plateCode: normalizedPlateCode,
    });

    if (relayResult) {
      return relayResult;
    }
  }

  const apiCodes = await fetchPlateCodesFromApi(normalizedPlateSrcCode);
  const { resolvedPlateCodeId, plateCat } = resolvePlateCodeMeta(normalizedPlateCode, apiCodes);

  console.log(
    `[Scraper] Querying fines: plateNo=${normalizedPlateNo} plateSrcCode=${normalizedPlateSrcCode} requestedPlateCode=${normalizedPlateCode} resolvedPlateCodeId=${resolvedPlateCodeId} plateCat=${plateCat}`
  );

  try {
    const data = await performHttpQuery(
      normalizedPlateSrcCode,
      normalizedPlateNo,
      resolvedPlateCodeId,
      plateCat
    );

    if (data) {
      console.log("[Scraper] API response:", JSON.stringify(data).substring(0, 300));
      return mapApiDataToScraperResult(data);
    }

    console.warn("[Scraper] Direct HTTP response was not parseable JSON, switching to browser fallback");
    return await tryPlaywrightFallback(
      normalizedPlateSrcCode,
      normalizedPlateNo,
      normalizedPlateCode,
      plateCat,
      resolvedPlateCodeId
    );
  } catch (err: any) {
    console.error("[Scraper] Error:", err?.message || err);
    return await tryPlaywrightFallback(
      normalizedPlateSrcCode,
      normalizedPlateNo,
      normalizedPlateCode,
      plateCat,
      resolvedPlateCodeId
    );
  }
}

async function tryPlaywrightFallback(
  plateSrcCode: string,
  plateNo: string,
  requestedPlateCode: string,
  initialPlateCat: number,
  initialResolvedPlateCodeId?: number
): Promise<ScraperResult> {
  let browser: any = null;

  try {
    const { chromium } = await import("playwright");
    const executablePaths = [
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
      "/usr/bin/google-chrome",
      undefined,
    ];

    for (const execPath of executablePaths) {
      try {
        const launchOpts: AnyRecord = {
          headless: true,
          args: buildPlaywrightLaunchArgs(),
        };
        const playwrightProxy = getPlaywrightProxyConfig();
        if (playwrightProxy) {
          launchOpts.proxy = playwrightProxy;
          console.log(`[Scraper] Playwright proxy enabled via ${redactProxyUrl(getDubaiPoliceProxyUrl())}`);
        }
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

    const page = await browser.newPage(buildPlaywrightContextOptions());

    await page.goto(
      "https://www.dubaipolice.gov.ae/app/services/fine-payment/details",
      { waitUntil: "domcontentloaded", timeout: 30000 }
    );
    await page.waitForTimeout(3500);

    const browserResult = await page.evaluate(async (params: {
      plateSrcCode: string;
      plateNo: string;
      requestedPlateCode: string;
      initialPlateCat?: number;
      initialResolvedPlateCodeId?: number;
    }) => {
      const {
        plateSrcCode,
        plateNo,
        requestedPlateCode,
        initialPlateCat,
        initialResolvedPlateCodeId,
      } = params;
      const normalizeDigits = (value: string) => value
        .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
        .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

      const normalizeCompare = (value: unknown) => normalizeDigits(String(value ?? ""))
        .trim()
        .toUpperCase()
        .replace(/\s+/g, " ");

      const parsePositiveInt = (value: unknown) => {
        const normalized = normalizeDigits(String(value ?? "")).trim();
        if (!/^\d+$/.test(normalized)) return undefined;
        const parsed = Number.parseInt(normalized, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
      };

      const parseJsonResponse = async (response: Response) => {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          return { __raw: text, __status: response.status };
        }
      };

      let codes: any[] = [];
      try {
        const codesResponse = await fetch(`/dpapp/finespayment/getPlateData/${plateSrcCode}`, {
          headers: { Accept: "application/json, text/plain, */*" },
          credentials: "include",
        });
        const codesData = await parseJsonResponse(codesResponse);
        codes = Array.isArray(codesData?.codes)
          ? codesData.codes
          : Array.isArray(codesData?.results?.codes)
            ? codesData.results.codes
            : [];
      } catch {
        codes = [];
      }

      const wanted = normalizeCompare(requestedPlateCode);
      const matched = codes.find((code) => {
        const candidates = [
          code.value,
          code.id,
          code.codeId,
          code.plateCodeId,
          code.label,
          code.labelEn,
          code.labelAr,
          code.description,
          code.descriptionEn,
          code.descriptionAr,
          code.name,
          code.code,
        ];
        return candidates.some((candidate) => normalizeCompare(candidate) === wanted);
      });

      const resolvedPlateCodeId = parsePositiveInt(
        matched?.value ?? matched?.id ?? matched?.codeId ?? matched?.plateCodeId ?? initialResolvedPlateCodeId ?? requestedPlateCode
      ) ?? 0;
      const resolvedPlateCat = parsePositiveInt(
        matched?.categoryId ?? matched?.plateCat ?? matched?.category ?? initialPlateCat
      ) ?? 2;

      const searchResponse = await fetch("/dpapp/finespayment/searchFines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        credentials: "include",
        body: JSON.stringify({
          inquiryType: 3,
          plateNo,
          plateCat: resolvedPlateCat,
          plateSrcCode,
          plateCodeId: resolvedPlateCodeId,
        }),
      });

      const searchData = await parseJsonResponse(searchResponse);
      return {
        resolvedPlateCodeId,
        resolvedPlateCat,
        searchData,
      };
    }, {
      plateSrcCode,
      plateNo,
      requestedPlateCode,
      initialPlateCat,
      initialResolvedPlateCodeId: initialResolvedPlateCodeId ?? null,
    });

    await browser.close().catch(() => {});
    browser = null;

    const parsed = parseRawJson(browserResult?.searchData);
    if (parsed) {
      console.log(
        `[Scraper] Browser fallback resolved plateCodeId=${browserResult?.resolvedPlateCodeId} plateCat=${browserResult?.resolvedPlateCat}`
      );
      return mapApiDataToScraperResult(parsed);
    }

    return {
      success: false,
      fines: [],
      errorMessage: "تعذّر الاتصال بموقع شرطة دبي. يرجى المحاولة مرة أخرى.",
    };
  } catch (err: any) {
    console.error("[Scraper] Playwright fallback error:", err?.message || err);
    return {
      success: false,
      fines: [],
      errorMessage: "تعذّر الاتصال بموقع شرطة دبي. يرجى المحاولة مرة أخرى لاحقاً.",
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
