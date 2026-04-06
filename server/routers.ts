import { z } from "zod";
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
} from "./db";
import { scrapeDubaiFines, PLATE_SOURCES, PLATE_CODES } from "./scraper";

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
        // إنشاء سجل الاستعلام في قاعدة البيانات
        const queryId = await createFineQuery({
          plateSource: input.plateSource,
          plateNumber: input.plateNumber,
          plateCode: input.plateCode,
          status: "pending",
          userId: ctx.user?.id ?? null,
        });

        try {
          // تنفيذ الـ Web Scraping
          const result = await scrapeDubaiFines(
            input.plateSource,
            input.plateNumber,
            input.plateCode
          );

          if (!result.success) {
            // تحديث الاستعلام بحالة الفشل
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

          // تحديث الاستعلام بالنتائج
          await updateFineQuery(queryId, {
            status,
            totalFines: finesCount,
            totalAmount: result.totalAmount ?? "0",
            rawResults: result.fines as any,
          });

          // تخزين تفاصيل المخالفات
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

          // تحويل بيانات المخالفات لتتوافق مع واجهة المستخدم
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
});

export type AppRouter = typeof appRouter;
