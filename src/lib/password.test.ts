import { describe, it, expect } from "vitest";
import { newPasswordSchema, changePasswordSchema } from "./password";

describe("newPasswordSchema", () => {
  it("odrzuca hasła krótsze niż 10 znaków", () => {
    expect(newPasswordSchema.safeParse("Abc12345").success).toBe(false);
  });
  it("wymaga litery i cyfry", () => {
    expect(newPasswordSchema.safeParse("abcdefghijkl").success).toBe(false);
    expect(newPasswordSchema.safeParse("1234567890123").success).toBe(false);
  });
  it("odrzuca hasła dłuższe niż 72 znaki (limit bcrypt)", () => {
    expect(newPasswordSchema.safeParse("a1".repeat(40)).success).toBe(false);
  });
  it("akceptuje poprawne hasło", () => {
    expect(newPasswordSchema.safeParse("Kotek12345x").success).toBe(true);
  });
});

describe("changePasswordSchema", () => {
  const base = {
    currentPassword: "Stare12345x",
    newPassword: "Nowe12345xyz",
    confirmPassword: "Nowe12345xyz",
  };
  it("akceptuje poprawne dane", () => {
    expect(changePasswordSchema.safeParse(base).success).toBe(true);
  });
  it("odrzuca niezgodne potwierdzenie", () => {
    expect(changePasswordSchema.safeParse({ ...base, confirmPassword: "inne" }).success).toBe(false);
  });
  it("odrzuca nowe hasło równe obecnemu", () => {
    expect(
      changePasswordSchema.safeParse({
        ...base,
        newPassword: base.currentPassword,
        confirmPassword: base.currentPassword,
      }).success
    ).toBe(false);
  });
});
