import { err } from "./err";
import { from, fromPromise } from "./from";
import { assertIsErr } from "./helpers";
import { ok } from "./ok";
import { describe, expect, it } from "vitest";

describe("", () => {
  describe("from()", () => {
    it("should return a Ok result if all input values are Ok instances", () => {
      const a = ok(1);
      const b = ok(2);
      const c = ok({ value: 3 });
      expect(from([a, b, c])).toEqual(ok([1, 2, { value: 3 }]));
    });

    it("should extract all inner data if there are any ok(ok()) values", () => {
      const a = ok(1);
      const b = ok(ok("yes"));
      const c = ok(ok(ok({ value: "no" })));
      expect(from([a, b, c])).toEqual(ok([1, "yes", { value: "no" }]));
    });

    it("should return a Err result if one or more input values are Err instances", () => {
      expect(from([err()]).err).toBeTruthy();
      expect(from([err(), ok()]).err).toBeTruthy();
    });

    it("should collect expose all the input values on errContext if any errors are detected", () => {
      const a = ok(1);
      const b = err(2);
      const c = err("fail");
      const result = from([a, b, c]);

      assertIsErr(result);
      expect(result.err).toBeTruthy();
      expect(result.errContext).toEqual({ results: [a, b, c] });
    });

    it("should return an Err result if there are zero values passed in", () => {
      expect(from([]).err).toBeTruthy();
    });
  });

  describe("fromPromise()", () => {
    it("should return an Ok result if the promise resolves", async () => {
      const promise = Promise.resolve(1);
      const result = await fromPromise(promise);
      expect(result).toEqual(ok(1));
    });

    it("should return an Err result if the promise rejects", async () => {
      // eslint-disable-next-line prefer-promise-reject-errors
      const promise = Promise.reject(1);
      const result = await fromPromise(promise);
      assertIsErr(result);
      expect(result.err).toBeTruthy();
    });
  });
});
