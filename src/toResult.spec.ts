import type { Result } from "./api";
import { err } from "./err";
import { assertIsErr } from "./helpers";
import { ok } from "./ok";
import { toResult } from "./toResult";
import { describe, expect, it } from "vitest";

describe("toResult()", () => {
  it("should convert a simple {ok:true} or {err:false} object to an Ok result", () => {
    expect(toResult({ ok: true })).toEqual(ok());
    expect(toResult({ ok: true, err: false })).toEqual(ok());
    expect(toResult({ err: false })).toEqual(ok());
    expect(toResult({ err: false, ok: false })).toEqual(ok());
  });

  it("should retain any data when accepting an ok-like input value", () => {
    expect(toResult({ ok: true, data: "123" })).toEqual(ok("123"));
    expect(toResult({ ok: true, data: { value: "456" } })).toEqual(
      ok({ value: "456" }),
    );
    expect(toResult({ err: false, data: "123" })).toEqual(ok("123"));
    expect(toResult({ err: false, data: { value: "456" } })).toEqual(
      ok({ value: "456" }),
    );
  });

  it("should convert a simple {ok:false} or {err:true} object to an Err result", () => {
    expect(toResult({ ok: false })).toEqual(err());
    expect(toResult({ err: true })).toEqual(err());
  });

  it("should retain the errMessage, errCode, errContext and errException when accepting an err-like input value", () => {
    expect(toResult({ ok: false, errMessage: "noo" })).toEqual(err("noo"));
    expect(toResult({ err: true, errMessage: "noo!" })).toEqual(err("noo!"));

    expect(toResult({ err: true, errCode: 999 })).toEqual(err("", 999));
    expect(toResult({ ok: false, errCode: 999 })).toEqual(err("", 999));
    expect(toResult({ err: true, errCode: "FFF" })).toEqual(
      err({ errCode: "FFF" }),
    );
    expect(toResult({ ok: false, errCode: "FFF" })).toEqual(
      err({ errCode: "FFF" }),
    );

    const ctx = { a: 1 };
    expect(toResult({ err: true, errContext: ctx })).toEqual(
      err({ errContext: ctx }),
    );
    expect(toResult({ ok: false, errContext: ctx })).toEqual(
      err({ errContext: ctx }),
    );

    const e = new Error("!!!");
    expect(toResult({ err: true, errException: e })).toEqual(
      err({ errException: e, errMessage: "!!!" }),
    );
    expect(toResult({ ok: false, errException: e })).toEqual(
      err({ errException: e, errMessage: "!!!" }),
    );

    expect(
      toResult({
        ok: false,
        errMessage: "it broke",
        errCode: 999,
        errContext: ctx,
        errException: e,
      }),
    ).toEqual(
      err({
        errMessage: "it broke",
        errCode: 999,
        errContext: ctx,
        errException: e,
      }),
    );

    expect(
      toResult({
        err: true,
        errMessage: "it broke",
        errCode: 999,
        errContext: ctx,
        errException: e,
      }),
    ).toEqual(
      err({
        errMessage: "it broke",
        errCode: 999,
        errContext: ctx,
        errException: e,
      }),
    );
  });

  it("should convert an input-value of false / empty string / zero / null / undefined to an Err result", () => {
    expect(toResult(false)).toEqual(err());
    expect(toResult("")).toEqual(err());
    expect(toResult(0)).toEqual(err());
    expect(toResult(null)).toEqual(err());
    expect(toResult(undefined)).toEqual(err());
  });

  it("should convert an input-value of true / string / number / object / array to an Ok result", () => {
    expect(toResult(true)).toEqual(ok(true));
    expect(toResult("abc")).toEqual(ok("abc"));
    expect(toResult(123)).toEqual(ok(123));
    expect(toResult({})).toEqual(ok({}));
    expect(toResult({ a: 1 })).toEqual(ok({ a: 1 }));
    expect(toResult([])).toEqual(ok([]));
    expect(toResult([1, 2, 3])).toEqual(ok([1, 2, 3]));
  });

  it("should support enums in result objects", () => {
    enum XEnum {
      A = "a",
      B = 2,
    }

    let result: Result<null, XEnum>;
    result = err("message", XEnum.A);

    assertIsErr(result);
    expect(result.ok).toEqual(false);
    expect(result.errCode).toEqual(XEnum.A);

    result = err("message", XEnum.B);

    assertIsErr(result);
    expect(result.ok).toEqual(false);
    expect(result.errCode).toEqual(XEnum.B);
  });
});
