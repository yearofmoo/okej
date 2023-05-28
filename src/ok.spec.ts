import { ok } from "./ok";
import { assertResultEquals } from "./testUtils";
import { describe, expect, it } from "vitest";

describe("ok()", () => {
  it("should return an Ok reuslt when called with nothing", () => {
    assertResultEquals(ok(), { ok: true });
    assertResultEquals(ok(), { err: false });
    assertResultEquals(ok(), { data: null });
  });

  it("should return an Ok result with the provided data", () => {
    assertResultEquals(ok(null), { ok: true, data: null });
    assertResultEquals(ok(undefined), { ok: true, data: undefined });
    assertResultEquals(ok(0), { ok: true, data: 0 });
    assertResultEquals(ok(123), { ok: true, data: 123 });
    assertResultEquals(ok(true), { ok: true, data: true });
    assertResultEquals(ok(false), { ok: true, data: false });
    assertResultEquals(ok(""), { ok: true, data: "" });
    assertResultEquals(ok([]), { ok: true, data: [] });
    assertResultEquals(ok({}), { ok: true, data: {} });
    assertResultEquals(ok({ key: "value" }), {
      ok: true,
      data: { key: "value" },
    });
  });

  it("should return an Ok result with the data of an Ok", () => {
    assertResultEquals(ok(ok()), { ok: true, data: null });
    assertResultEquals(ok(ok(1)), { ok: true, data: 1 });
    assertResultEquals(ok(ok("abc")), { ok: true, data: "abc" });
    assertResultEquals(ok(ok(ok(true))), { ok: true, data: true });
  });

  it("should not set any error details on the Ok result", () => {
    expect(ok()).not.toHaveProperty("errCode");
    expect(ok()).not.toHaveProperty("errMessage");
    expect(ok()).not.toHaveProperty("errContext");
    expect(ok()).not.toHaveProperty("errException");
  });
});
