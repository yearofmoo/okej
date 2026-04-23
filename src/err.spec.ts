import type { Err, Result } from "./api";
import { err } from "./err";
import { assertResultEquals } from "./testUtils";
import { describe, expect, it } from "vitest";

describe("err()", () => {
  it("should return an Err result when called with nothing", () => {
    assertResultEquals(err(), { ok: false });
    assertResultEquals(err(), { err: true });
    assertResultEquals(err(), { errMessage: "" });
    assertResultEquals(err(), { errCode: 0 });
    assertResultEquals(err(), { errContext: null });
  });

  it("should return an Err result when called with null or undefined or boolean value", () => {
    const target = err();
    errIsErr(err(null), target);
    errIsErr(err(undefined), target);
    errIsErr(err(true), target);
    errIsErr(err(false), target);
  });

  it("should always treat the Err result as an Err", () => {
    expect(err(1).errCode).not.toEqual(1);
    expect(err(1).errMessage).not.toEqual("1");
  });

  it("should return an Err result with a string", () => {
    expect(err("fail").errMessage).toEqual("fail");
  });

  it("should return an Err result with a string/number", () => {
    assertResultEquals(err("fail", 123), {
      errCode: 123,
      errMessage: "fail",
    });
    assertResultEquals(err("fail", 0), { errCode: 0, errMessage: "fail" });
    assertResultEquals(err("fail", -1), { errCode: -1, errMessage: "fail" });
  });

  it("should return an Err result with a string/string", () => {
    assertResultEquals(err("fail", "BAD_ERROR"), {
      errCode: "BAD_ERROR",
      errMessage: "fail",
    });
  });

  it("should return an Err result with a string/number/context", () => {
    const ctx = { some: "data" };
    assertResultEquals(err("fail", 123, ctx), {
      errCode: 123,
      errMessage: "fail",
      errContext: ctx,
    });
  });

  it("should return an Err result with the data extracted out of a Err input value", () => {
    expect(err(err()).errCode).toEqual(0);
    expect(err(err("x", 123)).errCode).toEqual(123);
    expect(err(err(err("x", 456))).errCode).toEqual(456);
  });

  it("should return an Err result with an Error value passed in as the input param", () => {
    const e = new Error("fail");
    expect(err(e).errException).toEqual(e);
    expect(err(e).errCode).toEqual(0);
    expect(err(e).errMessage).toEqual("fail");
  });

  it("should populate an err exception even if nothing is provided", () => {
    const error = new Error("something broke");
    expect(err("something broke").errException).toEqual(error);
  });

  it("should override values if more params are passed in after the Error value", () => {
    const e = new Error("fail");
    assertResultEquals(err(e, "mega fail"), {
      errMessage: "mega fail",
      errException: e,
    });
    assertResultEquals(err(e, "mega fail", 456), {
      errMessage: "mega fail",
      errException: e,
      errCode: 456,
    });
    assertResultEquals(err(e, "mega fail", 456, { data: "123" }), {
      errMessage: "mega fail",
      errException: e,
      errCode: 456,
      errContext: { data: "123" },
    });
  });

  it("should allow the entire object as data to be passed in", () => {
    const e = new Error("fail");
    assertResultEquals(
      err({
        errCode: 123,
        errMessage: "not good",
        errContext: { some: "data" },
        errException: e,
      }),
      {
        errCode: 123,
        errMessage: "not good",
        errContext: { some: "data" },
        errException: e,
      },
    );
  });

  it("should allow the entire object as data to be passed in but use the exception's error message if not overridden", () => {
    const e = new Error("error123: fail");
    assertResultEquals(
      err({
        errCode: 123,
        errContext: { some: "data" },
        errException: e,
      }),
      {
        errCode: 123,
        errMessage: "error123: fail",
        errContext: { some: "data" },
        errException: e,
      },
    );
  });

  it("should allow a partial object as data to be passed in", () => {
    assertResultEquals(
      err({
        errContext: { some: "data" },
      }),
      {
        errCode: 0,
        errMessage: "",
        errContext: { some: "data" },
      },
    );
  });

  it("should not set any data on the Err result", () => {
    expect(err()).not.toHaveProperty("data");
  });

  it("should support enums as error codes", () => {
    enum StringEnum {
      BAD_ERROR = "BAD_ERROR",
      GOOD_ERROR = "GOOD_ERROR",
    }
    enum NumEnum {
      BAD_ERROR = 1,
      GOOD_ERROR = 2,
    }
    const strError: Result<unknown, StringEnum> = err(
      "something broke abc",
      StringEnum.BAD_ERROR,
    );
    expect(strError.errCode).toEqual(StringEnum.BAD_ERROR);

    const numError: Result<unknown, NumEnum> = err(
      "something broke 123",
      NumEnum.BAD_ERROR,
    );
    expect(numError.errCode).toEqual(NumEnum.BAD_ERROR);
  });

  it("should allow an Err object to be passed in with overrides", () => {
    const e = err("fail", 555, { old: "data" });

    // no overrides
    assertResultEquals(err(e), {
      errMessage: "fail",
      errCode: 555,
      errContext: { old: "data" },
    });

    // just the message
    assertResultEquals(err(e, "super fail"), {
      errMessage: "super fail",
      errCode: 555,
      errContext: { old: "data" },
    });

    // message and number
    assertResultEquals(err(e, "super fail", 999), {
      errMessage: "super fail",
      errCode: 999,
      errContext: { old: "data" },
    });

    // message, number and context
    assertResultEquals(err(e, "super fail", 999, { some: "data" }), {
      errMessage: "super fail",
      errCode: 999,
      errContext: { some: "data" },
    });
  });

  it("should extend an err object", () => {
    const error = new Error("something broke");
    const sourceErr = err(error);
    const updatedError = err({
      ...sourceErr,
      errCode: 456,
      errContext: { new: "data" },
    });

    // no overrides
    assertResultEquals(updatedError, {
      errException: error,
      errMessage: "something broke",
      errCode: 456,
      errContext: { new: "data" },
    });
  });

  it("should support enums as error codes", () => {
    enum X {
      A = "1",
      B = 2,
    }

    const e = err("fail", X.A);
    assertResultEquals(e, {
      errCode: X.A,
    });

    const e2: Err<X> = err("fail", X.B);
    assertResultEquals(e2, {
      errCode: X.B,
    });
  });

  describe("normalization", () => {
    it("should preserve a string errCode from a passed-in Err object", () => {
      assertResultEquals(err({ errCode: "BAD_ERROR", errMessage: "nope" }), {
        errCode: "BAD_ERROR",
        errMessage: "nope",
      });
    });

    it("should allow a string errCode override when passing an Err object", () => {
      const base = err("fail", 123);
      assertResultEquals(err(base, "still fail", "NEW_CODE"), {
        errCode: "NEW_CODE",
        errMessage: "still fail",
      });
    });

    it("should ignore arrays passed as context in the string input branch", () => {
      const e = err("fail", 1, [1, 2, 3] as unknown as {
        [key: string]: unknown;
      });
      expect(e.errContext).toBeNull();
    });

    it("should ignore arrays passed as context in the Error input branch", () => {
      const e = err(
        new Error("x"),
        "msg",
        1,
        [1, 2, 3] as unknown as { [key: string]: unknown },
      );
      expect(e.errContext).toBeNull();
    });
  });

  describe("stack", () => {
    it("should attach a stack when no exception is provided", () => {
      const e = err("fail");
      expect(typeof e.stack).toEqual("string");
      expect(e.stack).not.toEqual("");
    });

    it("should not include the err() frame in the captured stack", () => {
      const e = err("fail");
      expect(e.stack).not.toMatch(/\bat err\b/);
    });

    it("should use the exception's stack when an Error is passed in", () => {
      const ex = new Error("boom");
      const e = err(ex);
      expect(e.stack).toEqual(ex.stack);
    });

    it("should use the exception's stack when errException is provided via object", () => {
      const ex = new Error("boom");
      const e = err({ errException: ex });
      expect(e.stack).toEqual(ex.stack);
    });

    it("should omit the stack when JSON.stringified (no exception)", () => {
      const e = err("fail");
      const parsed = JSON.parse(JSON.stringify(e));
      expect(parsed).not.toHaveProperty("stack");
    });

    it("should omit the stack when JSON.stringified (with exception)", () => {
      const e = err(new Error("boom"));
      const parsed = JSON.parse(JSON.stringify(e));
      expect(parsed).not.toHaveProperty("stack");
    });

    it("should not include the stack string in the JSON.stringify output", () => {
      const e = err("fail", 123, { some: "data" });
      expect(typeof e.stack).toEqual("string");
      const serialized = JSON.stringify(e);
      expect(serialized).not.toContain("stack");
      expect(serialized).not.toContain(e.stack as string);
      expect(serialized).toContain("errMessage");
      expect(serialized).toContain("errCode");
    });
  });
});

function errIsErr(a: Err, b: Err): void {
  expect(a.ok).toEqual(a.ok);
  expect(a.err).toEqual(b.err);
  expect(a.errMessage).toEqual(b.errMessage);
  expect(a.errCode).toEqual(b.errCode);
  expect(a.errContext).toEqual(b.errContext);
  expect(a.errException).toEqual(b.errException);
}
