import { describe, expect, it } from "vitest";
import { assertResultEquals } from "./testUtils";
import { err } from "./err";

describe("err()", () => {
  it("should return an Err result when called with nothing", () => {
    assertResultEquals(err(), { ok: false });
    assertResultEquals(err(), { err: true });
    assertResultEquals(err(), { errMessage: "" });
    assertResultEquals(err(), { errCode: 0 });
    assertResultEquals(err(), { errContext: null });
    assertResultEquals(err(), { errException: null });
  });

  it("should return an Err result when called with null or undefined or boolean value", () => {
    const target = err();
    expect(err(null)).toEqual(target);
    expect(err(undefined)).toEqual(target);
    expect(err(true)).toEqual(target);
    expect(err(false)).toEqual(target);
  });

  it("should return an Err result with a number", () => {
    expect(err(0).errCode).toEqual(0);
    expect(err(0).errMessage).toEqual("");
    expect(err(1).errCode).toEqual(1);
    expect(err(1).errMessage).toEqual("");
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
    expect(err(err(123)).errCode).toEqual(123);
    expect(err(err(err(456))).errCode).toEqual(456);
  });

  it("should return an Err result with an Error value passed in as the input param", () => {
    const e = new Error("fail");
    expect(err(e).errException).toEqual(e);
    expect(err(e).errCode).toEqual(0);
    expect(err(e).errMessage).toEqual("fail");
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
      }
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
      }
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
        errException: null,
      }
    );
  });

  it("should not set any data on the Err result", () => {
    expect(err()).not.toHaveProperty("data");
  });
});
