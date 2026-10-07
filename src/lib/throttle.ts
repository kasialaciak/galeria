import { db } from "@/db";
import { authThrottle } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isLocked, nextThrottleState, type ThrottleState } from "./throttle-logic";

async function load(key: string): Promise<ThrottleState> {
  const [row] = await db.select().from(authThrottle).where(eq(authThrottle.key, key)).limit(1);
  return row
    ? { attempts: row.attempts, lockedUntil: row.lockedUntil }
    : { attempts: 0, lockedUntil: null };
}

/** true = klucz jest zablokowany */
export async function checkThrottle(key: string): Promise<boolean> {
  return isLocked(await load(key));
}

export async function recordFailure(key: string): Promise<void> {
  const next = nextThrottleState(await load(key));
  await db
    .insert(authThrottle)
    .values({ key, ...next })
    .onConflictDoUpdate({
      target: authThrottle.key,
      set: { ...next, updatedAt: new Date() },
    });
}

export async function clearThrottle(key: string): Promise<void> {
  await db.delete(authThrottle).where(eq(authThrottle.key, key));
}
