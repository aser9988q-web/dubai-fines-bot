import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the scraper and db modules
vi.mock("./scraper", () => ({
  scrapeDubaiFines: vi.fn(),
  PLATE_SOURCES: [
    { value: "DXB", label: "دبي", labelEn: "Dubai" },
    { value: "AUH", label: "أبوظبي", labelEn: "Abu Dhabi" },
  ],
  PLATE_CODES: [
    { value: "2", label: "A", categoryId: 2 },
    { value: "3", label: "B", categoryId: 2 },
  ],
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    createFineQuery: vi.fn().mockResolvedValue(1),
    updateFineQuery: vi.fn().mockResolvedValue(undefined),
    getFineQueryById: vi.fn().mockResolvedValue(null),
    getRecentFineQueries: vi.fn().mockResolvedValue([]),
    getFineQueriesByUserId: vi.fn().mockResolvedValue([]),
    createFines: vi.fn().mockResolvedValue(undefined),
    getFinesByQueryId: vi.fn().mockResolvedValue([]),
  };
});

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("fines.getOptions", () => {
  it("يجب أن يعيد قوائم الإمارات وكودات اللوحات", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.fines.getOptions();
    expect(result.plateSources).toBeDefined();
    expect(result.plateCodes).toBeDefined();
    expect(result.plateSources.length).toBeGreaterThan(0);
    expect(result.plateCodes.length).toBeGreaterThan(0);
  });
});

describe("fines.getHistory", () => {
  it("يجب أن يعيد قائمة فارغة للمستخدم غير المسجل", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.fines.getHistory({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("fines.query - validation", () => {
  it("يجب أن يرفض الإدخال الفارغ", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.fines.query({ plateSource: "", plateNumber: "12345", plateCode: "2" })
    ).rejects.toThrow();
  });

  it("يجب أن يرفض رقم اللوحة الفارغ", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.fines.query({ plateSource: "DXB", plateNumber: "", plateCode: "2" })
    ).rejects.toThrow();
  });
});

describe("fines.query - success", () => {
  it("يجب أن يعيد نتيجة ناجحة مع لا مخالفات", async () => {
    const { scrapeDubaiFines } = await import("./scraper");
    vi.mocked(scrapeDubaiFines).mockResolvedValueOnce({
      success: true,
      fines: [],
      totalAmount: "0",
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.fines.query({
      plateSource: "DXB",
      plateNumber: "12345",
      plateCode: "2",
    });

    expect(result.success).toBe(true);
    expect(result.totalFines).toBe(0);
  });

  it("يجب أن يعيد نتيجة فاشلة عند خطأ الـ scraper", async () => {
    const { scrapeDubaiFines } = await import("./scraper");
    vi.mocked(scrapeDubaiFines).mockResolvedValueOnce({
      success: false,
      fines: [],
      errorMessage: "خطأ في الاتصال",
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.fines.query({
      plateSource: "DXB",
      plateNumber: "99999",
      plateCode: "3",
    });

    expect(result.success).toBe(false);
    expect(result.errorMessage).toBeDefined();
  });

  it("يجب أن يعيد status=paid للمخالفة المدفوعة", async () => {
    const { scrapeDubaiFines } = await import("./scraper");
    vi.mocked(scrapeDubaiFines).mockResolvedValueOnce({
      success: true,
      fines: [
        {
          fineNumber: "F001",
          fineDate: "2024-01-01",
          description: "تجاوز السرعة",
          amount: "400",
          blackPoints: 0,
          isPaid: "paid",
          location: "شارع الشيخ زايد",
          ticketNo: "T001",
          source: "Dubai Police",
          trafficDepartment: "Dubai Police",
        },
      ],
      totalAmount: "400",
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.fines.query({
      plateSource: "DXB",
      plateNumber: "12345",
      plateCode: "2",
    });

    expect(result.success).toBe(true);
    expect(result.fines).toHaveLength(1);
    expect(result.fines[0].status).toBe("paid");
    expect(result.fines[0].isPaid).toBe(true);
    expect(result.fines[0].source).toBe("Dubai Police");
  });

  it("يجب أن يعيد status=blackpoints للمخالفة ذات النقاط السوداء", async () => {
    const { scrapeDubaiFines } = await import("./scraper");
    vi.mocked(scrapeDubaiFines).mockResolvedValueOnce({
      success: true,
      fines: [
        {
          fineNumber: "F002",
          fineDate: "2024-01-02",
          description: "تجاوز الإشارة الحمراء",
          amount: "800",
          blackPoints: 4,
          isPaid: "unpaid",
          location: "دوار الإمارات",
          ticketNo: "T002",
          source: "RTA",
          trafficDepartment: "RTA",
        },
      ],
      totalAmount: "800",
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.fines.query({
      plateSource: "DXB",
      plateNumber: "12345",
      plateCode: "2",
    });

    expect(result.success).toBe(true);
    expect(result.fines[0].status).toBe("blackpoints");
    expect(result.fines[0].isPaid).toBe(false);
    expect(result.fines[0].source).toBe("RTA");
  });

  it("يجب أن يعيد status=payable للمخالفة غير المدفوعة بدون نقاط سوداء", async () => {
    const { scrapeDubaiFines } = await import("./scraper");
    vi.mocked(scrapeDubaiFines).mockResolvedValueOnce({
      success: true,
      fines: [
        {
          fineNumber: "F003",
          fineDate: "2024-01-03",
          description: "وقوف خاطئ",
          amount: "200",
          blackPoints: 0,
          isPaid: "unpaid",
          location: "مركز دبي التجاري",
          ticketNo: "T003",
          source: "Salik",
          trafficDepartment: "Salik",
        },
      ],
      totalAmount: "200",
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.fines.query({
      plateSource: "DXB",
      plateNumber: "12345",
      plateCode: "2",
    });

    expect(result.success).toBe(true);
    expect(result.fines[0].status).toBe("payable");
    expect(result.fines[0].isPaid).toBe(false);
    expect(result.fines[0].source).toBe("Salik");
  });
});
