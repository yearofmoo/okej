import {describe, it, expect} from 'vitest';
import { allErr, allOk, assertIsErr, assertIsResult, err, from, isErrResult, isOkResult, isResult, ok, someErr, someOk } from './util';
import { Result } from './api';
import { assertIsOk } from './util';

describe('util', () => {
	describe('ok()', () => {
		it('should return an Ok reuslt when called with nothing', () => {
			assertResultEquals(ok(), { ok: true });
			assertResultEquals(ok(), { err: false });
			assertResultEquals(ok(), { data: null });
		});

		it('should return an Ok result with the provided data', () => {
			assertResultEquals(ok(null), { ok: true, data: null });
			assertResultEquals(ok(undefined), { ok: true, data: undefined });
			assertResultEquals(ok(0), { ok: true, data: 0 });
			assertResultEquals(ok(123), { ok: true, data: 123 });
			assertResultEquals(ok(true), { ok: true, data: true });
			assertResultEquals(ok(false), { ok: true, data: false });
			assertResultEquals(ok(""), { ok: true, data: "" });
			assertResultEquals(ok([]), { ok: true, data: [] });
			assertResultEquals(ok({}), { ok: true, data: {} });
			assertResultEquals(ok({ key: 'value' }), { ok: true, data: { key: 'value' } });
		});

		it('should return an Ok result with the data of an Ok', () => {
			assertResultEquals(ok(ok()), { ok: true, data: null });
			assertResultEquals(ok(ok(1)), { ok: true, data: 1 });
			assertResultEquals(ok(ok("abc")), { ok: true, data: "abc" });
			assertResultEquals(ok(ok(ok(true))), { ok: true, data: true });
		});

		it('should not set any error details on the Ok result', () => {
			expect(ok()).not.toHaveProperty("errCode");
			expect(ok()).not.toHaveProperty("errMessage");
			expect(ok()).not.toHaveProperty("errContext");
			expect(ok()).not.toHaveProperty("errException");
		});
	});

	describe('err()', () => {
		it('should return an Err result when called with nothing', () => {
			assertResultEquals(err(), { ok: false });
			assertResultEquals(err(), { err: true });
			assertResultEquals(err(), { errMessage: "" });
			assertResultEquals(err(), { errCode: 0 });
			assertResultEquals(err(), { errContext: null });
			assertResultEquals(err(), { errException: null });
		});

		it('should return an Err result when called with null or undefined or boolean value', () => {
			const target = err();
			expect(err(null)).toEqual(target);
			expect(err(undefined)).toEqual(target);
			expect(err(true)).toEqual(target);
			expect(err(false)).toEqual(target);
		});

		it('should return an Err result with a number', () => {
			expect(err(0).errCode).toEqual(0);
			expect(err(0).errMessage).toEqual("");
			expect(err(1).errCode).toEqual(1);
			expect(err(1).errMessage).toEqual("");
		});

		it('should return an Err result with a string', () => {
			expect(err("fail").errMessage).toEqual("fail");
		});

		it('should return an Err result with a string/number', () => {
			assertResultEquals(err("fail", 123), { errCode: 123, errMessage: "fail" });
			assertResultEquals(err("fail", 0), { errCode: 0, errMessage: "fail" });
			assertResultEquals(err("fail", -1), { errCode: -1, errMessage: "fail" });
		});

		it('should return an Err result with a string/number/context', () => {
			const ctx = { some: 'data' };
			assertResultEquals(err("fail", 123, ctx), { errCode: 123, errMessage: "fail", errContext: ctx });
		});

		it('should return an Err result with the data extracted out of a Err input value', () => {
			expect(err(err()).errCode).toEqual(0);
			expect(err(err(123)).errCode).toEqual(123);
			expect(err(err(err(456))).errCode).toEqual(456);
		});

		it('should return an Err result with an Error value passed in as the input param', () => {
			const e = new Error("fail");
			expect(err(e).errException).toEqual(e);
			expect(err(e).errCode).toEqual(0);
			expect(err(e).errMessage).toEqual("fail");
		});

		it('should override values if more params are passed in after the Error value', () => {
			const e = new Error("fail");
			assertResultEquals(err(e, "mega fail"), { errMessage: "mega fail", errException: e });
			assertResultEquals(err(e, "mega fail", 456), { errMessage: "mega fail", errException: e, errCode: 456 });
			assertResultEquals(err(e, "mega fail", 456, {data: "123"}), { errMessage: "mega fail", errException: e, errCode: 456, errContext: {data: "123"} });
		});

		it('should allow the entire object as data to be passed in', () => {
			const e = new Error("fail");
			assertResultEquals(err({
				errCode: 123,
				errMessage: "not good",
				errContext: { some: 'data' },
				errException: e,
			}), { 
				errCode: 123,
				errMessage: "not good",
				errContext: { some: 'data' },
				errException: e,
			});
		});

		it('should allow the entire object as data to be passed in but use the exception\'s error message if not overridden', () => {
			const e = new Error("error123: fail");
			assertResultEquals(err({
				errCode: 123,
				errContext: { some: 'data' },
				errException: e,
			}), { 
				errCode: 123,
				errMessage: "error123: fail",
				errContext: { some: 'data' },
				errException: e,
			});
		});

		it('should allow a partial object as data to be passed in', () => {
			assertResultEquals(err({
				errContext: { some: 'data' },
			}), { 
				errCode: 0,
				errMessage: "",
				errContext: { some: 'data' },
				errException: null,
			});
		});

		it('should not set any data on the Err result', () => {
			expect(err()).not.toHaveProperty("data");
		});
	});

	describe('isResult()', () => {
		it('should return true for an Ok result', () => {
			expect(isResult(ok())).toBeTruthy();
		});

		it('should return true for an Err result', () => {
			expect(isResult(err())).toBeTruthy();
		});

		it('should return true for any non Result input value', () => {
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

	describe('isOkResult()', () => {
		it('should return true for an Ok result', () => {
			expect(isOkResult(ok())).toBeTruthy();
		});

		it('should return false for an Ok result', () => {
			expect(isOkResult(err())).toBeFalsy();
		});

		it('should return true for any non Result input value', () => {
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

	describe('isErrResult()', () => {
		it('should return false for an Ok result', () => {
			expect(isErrResult(ok())).toBeFalsy();
		});

		it('should return true for an Err result', () => {
			expect(isErrResult(err())).toBeTruthy();
		});

		it('should return true for any non Result input value', () => {
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

	describe('someErr()', () => {
		it('should return true if one or more errors is falsy', () => {
			expect(someErr([err()])).toBeTruthy();
			expect(someErr([err(), err()])).toBeTruthy();
		});

		it('should return false if zero input values are Err instances', () => {
			expect(someErr([ok()])).toBeFalsy();
			expect(someErr([ok(), ok()])).toBeFalsy();
		});

		it('should return false when an empty array is passed in', () => {
			expect(someErr([])).toBeFalsy();
		});
	});

	describe('someOk()', () => {
		it('should return true if one or more errors is falsy', () => {
			expect(someOk([ok()])).toBeTruthy();
			expect(someOk([ok(), ok()])).toBeTruthy();
		});

		it('should return false if zero input values are Err instances', () => {
			expect(someOk([err()])).toBeFalsy();
			expect(someOk([err(), err()])).toBeFalsy();
		});

		it('should return false when an empty array is passed in', () => {
			expect(someOk([])).toBeFalsy();
		});
	});

	describe('allErr()', () => {
		it('should return true if all input values are Err instances', () => {
			expect(allErr([err()])).toBeTruthy();
			expect(allErr([err(), err()])).toBeTruthy();
		});

		it('should return false if one or more errors is falsy', () => {
			expect(allErr([ok()])).toBeFalsy();
			expect(allErr([ok(), err()])).toBeFalsy();
		});

		it('should return true when an empty array is passed in', () => {
			expect(allErr([])).toBeFalsy();
		});
	});

	describe('allOk()', () => {
		it('should return true if all input values are Ok instances', () => {
			expect(allOk([ok()])).toBeTruthy();
			expect(allOk([ok(), ok()])).toBeTruthy();
		});

		it('should return false if one or more errors is falsy', () => {
			expect(allOk([err()])).toBeFalsy();
			expect(allOk([err(), ok()])).toBeFalsy();
		});

		it('should return true when an empty array is passed in', () => {
			expect(allOk([])).toBeFalsy();
		});
	});

	describe('assertIsResult()', () => {
		it('should throw an error if the provided value is not a Result instance', () => {
			expect(() => assertIsResult(undefined)).toThrow();
			expect(() => assertIsResult(null)).toThrow();
			expect(() => assertIsResult({})).toThrow();
			expect(() => assertIsResult(ok())).not.toThrow();
			expect(() => assertIsResult(err())).not.toThrow();
		});
	});

	describe('assertIsOk()', () => {
		it('should throw an error if the provided value is not an Ok instance', () => {
			expect(() => assertIsOk(err())).toThrow();
			expect(() => assertIsOk(undefined)).toThrow();
			expect(() => assertIsOk(null)).toThrow();
			expect(() => assertIsOk({})).toThrow();
			expect(() => assertIsOk(ok())).not.toThrow();
		});
	});

	describe('assertIsErr()', () => {
		it('should throw an error if the provided value is not an Err instance', () => {
			expect(() => assertIsErr(ok())).toThrow();
			expect(() => assertIsErr(undefined)).toThrow();
			expect(() => assertIsErr(null)).toThrow();
			expect(() => assertIsErr({})).toThrow();
			expect(() => assertIsErr(err())).not.toThrow();
		});
	});

	describe('from()', () => {
		it('should return a Ok result if all input values are Ok instances', () => {
			const a = ok(1);
			const b = ok(2);
			const c = ok({ value: 3 });
			expect(from([a, b, c])).toEqual(ok([1, 2, { value: 3 }]));
		});

		it('should extract all inner data if there are any ok(ok()) values', () => {
			const a = ok(1);
			const b = ok(ok("yes"));
			const c = ok(ok(ok(({ value: "no"}))));
			expect(from([a, b, c])).toEqual(ok([1, "yes", { value: "no" }]));
		});

		it('should return a Err result if one or more input values are Err instances', () => {
			expect(from([ err() ]).err).toBeTruthy();
			expect(from([ err(), ok() ]).err).toBeTruthy();
		});

		it('should collect expose all the input values on errContext if any errors are detected', () => {
			const a = ok(1);
			const b = err(2);
			const c = err("fail");
			const result = from([a, b, c]);

			assertIsErr(result);
			expect(result.err).toBeTruthy();
			expect(result.errContext).toEqual({ results: [a, b, c] });
		});

		it('should return an Err result if there are zero values passed in', () => {
			expect(from([]).err).toBeTruthy();
		});
	});
});

export function assertResultEquals<R extends Result>(result: R, data: Partial<R>): void {
	expect(result).toEqual(expect.objectContaining(data));
}
