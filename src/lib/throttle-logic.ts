export const MAX_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

export type ThrottleState = { attempts: number; lockedUntil: Date | null };

export function isLocked(s: ThrottleState, now = new Date()): boolean {
  return !!s.lockedUntil && s.lockedUntil.getTime() > now.getTime();
}

export function nextThrottleState(s: ThrottleState, now = new Date()): ThrottleState {
  const expired = !!s.lockedUntil && !isLocked(s, now);
  const attempts = (expired ? 0 : s.attempts) + 1;
  const lockedUntil =
    attempts >= MAX_ATTEMPTS ? new Date(now.getTime() + LOCK_MINUTES * 60_000) : null;
  return { attempts, lockedUntil };
}
