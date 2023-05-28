import { Ok, Err, Result } from "./api";

export function isOkResult<D extends unknown = unknown>(
  value: unknown
): value is Ok<D> {
  return isResult(value) && value.ok;
}

export function isErrResult(value: unknown): value is Err {
  return isResult(value) && value.err;
}

export function isResult(value: unknown): value is Result {
  if (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    "err" in value
  ) {
    const r = value as Result;
    return typeof r.ok === "boolean" && typeof r.err === "boolean";
  }
  return false;
}

export function someErr(results: Result[]): boolean {
  return results.some((r) => r.err);
}

export function allErr(results: Result[]): boolean {
  return results.length ? results.every((r) => r.err) : false;
}

export function someOk(results: Result[]): boolean {
  return results.some((r) => r.ok);
}

export function allOk(results: Result[]): boolean {
  return results.length ? results.every((r) => r.ok) : false;
}

export function assertIsResult(value: unknown): asserts value is Result {
  if (!isResult(value)) {
    throw new TypeError("value is not a Result");
  }
}

export function assertIsErr(value: unknown): asserts value is Err {
  if (!isErrResult(value)) {
    throw new TypeError("value is not an Err result");
  }
}

export function assertIsOk(value: unknown): asserts value is Ok {
  if (!isOkResult(value)) {
    throw new TypeError("value is not an Ok result");
  }
}
