import { describe, it, expect } from "vitest";
import { nextThrottleState, isLocked, MAX_ATTEMPTS, LOCK_MINUTES } from "./throttle-logic";

const now = new Date("2026-01-01T12:00:00Z");
const fresh = () => ({ attempts: 0, lockedUntil: null as Date | null });

describe("throttle", () => {
  it("zlicza nieudane próby bez blokady poniżej limitu", () => {
    let s = fresh();
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) s = nextThrottleState(s, now);
    expect(isLocked(s, now)).toBe(false);
  });
  it("blokuje po przekroczeniu limitu", () => {
    let s = fresh();
    for (let i = 0; i < MAX_ATTEMPTS; i++) s = nextThrottleState(s, now);
    expect(isLocked(s, now)).toBe(true);
  });
  it("odblokowuje po upływie czasu blokady", () => {
    let s = fresh();
    for (let i = 0; i < MAX_ATTEMPTS; i++) s = nextThrottleState(s, now);
    const later = new Date(now.getTime() + (LOCK_MINUTES + 1) * 60_000);
    expect(isLocked(s, later)).toBe(false);
  });
  it("po wygaśnięciu blokady licznik startuje od nowa", () => {
    let s = fresh();
    for (let i = 0; i < MAX_ATTEMPTS; i++) s = nextThrottleState(s, now);
    const later = new Date(now.getTime() + (LOCK_MINUTES + 1) * 60_000);
    s = nextThrottleState(s, later);
    expect(s.attempts).toBe(1);
    expect(isLocked(s, later)).toBe(false);
  });
});
