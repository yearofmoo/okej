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
});

function errIsErr(a: Err, b: Err): void {
  expect(a.ok).toEqual(a.ok);
  expect(a.err).toEqual(b.err);
  expect(a.errMessage).toEqual(b.errMessage);
  expect(a.errCode).toEqual(b.errCode);
  expect(a.errContext).toEqual(b.errContext);
  expect(a.errException).toEqual(b.errException);
}
