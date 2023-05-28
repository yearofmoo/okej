import { describe, it, expect } from "vitest";
import {
  allErr,
  allOk,
  assertIsErr,
  assertIsOk,
  assertIsResult,
  isErrResult,
  isOkResult,
  isResult,
  someErr,
  someOk,
} from "./helpers";
import { Result } from "./api";
import { ok } from "./ok";
import { err } from "./err";

describe("helpers", () => {
  describe("isResult()", () => {
    it("should return true for an Ok result", () => {
      expect(isResult(ok())).toBeTruthy();
    });

    it("should return true for an Err result", () => {
      expect(isResult(err())).toBeTruthy();
    });

    it("should return true for any non Result input value", () => {
      expect(isResult(null)).toBeFalsy();
      expect(isResult(undefined)).toBeFalsy();
      expect(isResult(false)).toBeFalsy();
      expect(isResult(true)).toBeFalsy();
      expect(isResult({})).toBeFalsy();
      expect(isResult([])).toBeFalsy();
      expect(isResult(0)).toBeFalsy();
      expect(isResult("")).toBeFalsy();
    });
  });

  describe("isOkResult()", () => {
    it("should return true for an Ok result", () => {
      expect(isOkResult(ok())).toBeTruthy();
    });

    it("should return false for an Ok result", () => {
      expect(isOkResult(err())).toBeFalsy();
    });

    it("should return true for any non Result input value", () => {
      expect(isOkResult(null)).toBeFalsy();
      expect(isOkResult(undefined)).toBeFalsy();
      expect(isOkResult(false)).toBeFalsy();
      expect(isOkResult(true)).toBeFalsy();
      expect(isOkResult({})).toBeFalsy();
      expect(isOkResult([])).toBeFalsy();
      expect(isOkResult(0)).toBeFalsy();
      expect(isOkResult("")).toBeFalsy();
    });
  });

  describe("isErrResult()", () => {
    it("should return false for an Ok result", () => {
      expect(isErrResult(ok())).toBeFalsy();
    });

    it("should return true for an Err result", () => {
      expect(isErrResult(err())).toBeTruthy();
    });

    it("should return true for any non Result input value", () => {
      expect(isErrResult(null)).toBeFalsy();
      expect(isErrResult(undefined)).toBeFalsy();
      expect(isErrResult(false)).toBeFalsy();
      expect(isErrResult(true)).toBeFalsy();
      expect(isErrResult({})).toBeFalsy();
      expect(isErrResult([])).toBeFalsy();
      expect(isErrResult(0)).toBeFalsy();
      expect(isErrResult("")).toBeFalsy();
    });
  });

  describe("someErr()", () => {
    it("should return true if one or more errors is falsy", () => {
      expect(someErr([err()])).toBeTruthy();
      expect(someErr([err(), err()])).toBeTruthy();
    });

    it("should return false if zero input values are Err instances", () => {
      expect(someErr([ok()])).toBeFalsy();
      expect(someErr([ok(), ok()])).toBeFalsy();
    });

    it("should return false when an empty array is passed in", () => {
      expect(someErr([])).toBeFalsy();
    });
  });

  describe("someOk()", () => {
    it("should return true if one or more errors is falsy", () => {
      expect(someOk([ok()])).toBeTruthy();
      expect(someOk([ok(), ok()])).toBeTruthy();
    });

    it("should return false if zero input values are Err instances", () => {
      expect(someOk([err()])).toBeFalsy();
      expect(someOk([err(), err()])).toBeFalsy();
    });

    it("should return false when an empty array is passed in", () => {
      expect(someOk([])).toBeFalsy();
    });
  });

  describe("allErr()", () => {
    it("should return true if all input values are Err instances", () => {
      expect(allErr([err()])).toBeTruthy();
      expect(allErr([err(), err()])).toBeTruthy();
    });

    it("should return false if one or more errors is falsy", () => {
      expect(allErr([ok()])).toBeFalsy();
      expect(allErr([ok(), err()])).toBeFalsy();
    });

    it("should return true when an empty array is passed in", () => {
      expect(allErr([])).toBeFalsy();
    });
  });

  describe("allOk()", () => {
    it("should return true if all input values are Ok instances", () => {
      expect(allOk([ok()])).toBeTruthy();
      expect(allOk([ok(), ok()])).toBeTruthy();
    });

    it("should return false if one or more errors is falsy", () => {
      expect(allOk([err()])).toBeFalsy();
      expect(allOk([err(), ok()])).toBeFalsy();
    });

    it("should return true when an empty array is passed in", () => {
      expect(allOk([])).toBeFalsy();
    });
  });

  describe("assertIsResult()", () => {
    it("should throw an error if the provided value is not a Result instance", () => {
      expect(() => assertIsResult(undefined)).toThrow();
      expect(() => assertIsResult(null)).toThrow();
      expect(() => assertIsResult({})).toThrow();
      expect(() => assertIsResult(ok())).not.toThrow();
      expect(() => assertIsResult(err())).not.toThrow();
    });
  });

  describe("assertIsOk()", () => {
    it("should throw an error if the provided value is not an Ok instance", () => {
      expect(() => assertIsOk(err())).toThrow();
      expect(() => assertIsOk(undefined)).toThrow();
      expect(() => assertIsOk(null)).toThrow();
      expect(() => assertIsOk({})).toThrow();
      expect(() => assertIsOk(ok())).not.toThrow();
    });
  });

  describe("assertIsErr()", () => {
    it("should throw an error if the provided value is not an Err instance", () => {
      expect(() => assertIsErr(ok())).toThrow();
      expect(() => assertIsErr(undefined)).toThrow();
      expect(() => assertIsErr(null)).toThrow();
      expect(() => assertIsErr({})).toThrow();
      expect(() => assertIsErr(err())).not.toThrow();
    });
  });
});

export function assertResultEquals<R extends Result>(
  result: R,
  data: Partial<R>
): void {
  expect(result).toEqual(expect.objectContaining(data));
}
