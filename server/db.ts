import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, fineQueries, fines, paymentSessions, InsertFineQuery, InsertFine, FineQuery, Fine, PaymentSession, InsertPaymentSession } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ========== Fine Queries ==========

export async function createFineQuery(data: InsertFineQuery): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Skipping fine query persistence: database not available");
    return 0;
  }
  const result = await db.insert(fineQueries).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateFineQuery(
  id: number,
  data: Partial<InsertFineQuery>
): Promise<void> {
  const db = await getDb();
  if (!db || !id) {
    if (!db) console.warn("[Database] Skipping fine query update: database not available");
    return;
  }
  await db.update(fineQueries).set(data).where(eq(fineQueries.id, id));
}

export async function getFineQueryById(id: number): Promise<FineQuery | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(fineQueries).where(eq(fineQueries.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRecentFineQueries(limit = 20): Promise<FineQuery[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fineQueries).orderBy(desc(fineQueries.createdAt)).limit(limit);
}

export async function getFineQueriesByUserId(userId: number, limit = 20): Promise<FineQuery[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(fineQueries)
    .where(eq(fineQueries.userId, userId))
    .orderBy(desc(fineQueries.createdAt))
    .limit(limit);
}

// ========== Fines ==========

export async function createFines(finesData: InsertFine[]): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Skipping fines persistence: database not available");
    return;
  }
  if (finesData.length === 0) return;
  await db.insert(fines).values(finesData);
}

export async function getFinesByQueryId(queryId: number): Promise<Fine[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fines).where(eq(fines.queryId, queryId));
}

// ========== Payment Sessions ==========

export async function createPaymentSession(data: InsertPaymentSession): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(paymentSessions).values(data);
  return (result[0] as any).insertId as number;
}

export async function getPaymentSessionBySessionId(sessionId: string): Promise<PaymentSession | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(paymentSessions).where(eq(paymentSessions.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentSession(
  sessionId: string,
  data: Partial<InsertPaymentSession>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(paymentSessions).set(data).where(eq(paymentSessions.sessionId, sessionId));
}

export async function getAllPaymentSessions(limit = 50): Promise<PaymentSession[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentSessions).orderBy(desc(paymentSessions.createdAt)).limit(limit);
}

export async function getUnreadPaymentSessionsCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(paymentSessions).where(eq(paymentSessions.statusRead, 0));
  return result.length;
}
