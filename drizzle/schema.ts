import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// جدول الاستعلامات - يخزن كل استعلام تم إجراؤه
export const fineQueries = mysqlTable("fine_queries", {
  id: int("id").autoincrement().primaryKey(),
  // مصدر اللوحة (الإمارة)
  plateSource: varchar("plateSource", { length: 100 }).notNull(),
  // رقم اللوحة
  plateNumber: varchar("plateNumber", { length: 50 }).notNull(),
  // كود اللوحة (الحروف)
  plateCode: varchar("plateCode", { length: 50 }).notNull(),
  // حالة الاستعلام
  status: mysqlEnum("status", ["pending", "success", "failed", "no_fines"]).default("pending").notNull(),
  // رسالة الخطأ إن وجدت
  errorMessage: text("errorMessage"),
  // إجمالي المخالفات
  totalFines: int("totalFines").default(0),
  // إجمالي المبلغ
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }),
  // النتائج الكاملة كـ JSON
  rawResults: json("rawResults"),
  // معرف المستخدم (اختياري)
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FineQuery = typeof fineQueries.$inferSelect;
export type InsertFineQuery = typeof fineQueries.$inferInsert;

// جدول المخالفات - يخزن تفاصيل كل مخالفة
export const fines = mysqlTable("fines", {
  id: int("id").autoincrement().primaryKey(),
  // معرف الاستعلام المرتبط
  queryId: int("queryId").notNull(),
  // رقم المخالفة
  fineNumber: varchar("fineNumber", { length: 100 }),
  // تاريخ المخالفة
  fineDate: varchar("fineDate", { length: 50 }),
  // وصف المخالفة
  description: text("description"),
  // مبلغ المخالفة
  amount: decimal("amount", { precision: 10, scale: 2 }),
  // النقاط السوداء
  blackPoints: int("blackPoints").default(0),
  // حالة الدفع
  isPaid: mysqlEnum("isPaid", ["paid", "unpaid", "partial"]).default("unpaid"),
  // الموقع
  location: text("location"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Fine = typeof fines.$inferSelect;
export type InsertFine = typeof fines.$inferInsert;
