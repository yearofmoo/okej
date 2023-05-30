import type { Err, Ok, Result } from "./api";
import { err } from "./err";
import { ok } from "./ok";
import { isJsError } from "./shared";

export function toResult<
  D extends unknown,
  T extends { ok: true; data?: D } | { err: false; data?: D },
>(value: T): Ok<T>;
export function toResult<
  C extends unknown,
  T extends { ok: false; errCode?: C } | { err: true; errCode?: C },
>(value: T): Err<T["errCode"]>;
export function toResult<D extends false | "" | 0 | null | undefined>(
  value: D,
): Err;
export function toResult<
  D extends true | unknown[] | Record<string, unknown> | number | string,
>(value: D): Ok<D>;
export function toResult(value: unknown): Result {
  if (value === undefined || value === null) {
    return err();
  }

  if (typeof value === "object") {
    if (("ok" in value && value.ok) || ("err" in value && !value.err)) {
      const data = (value as Ok).data ?? null;
      return ok(data);
    } else if (("err" in value && value.err) || ("ok" in value && !value.ok)) {
      const e = value as Err;
      const errCode = e.errCode ?? 0;
      const errMessage = e.errMessage || "";
      const errContext = e.errContext ?? null;
      const errException = isJsError(e.errException) ? e.errException : null;
      return err({
        errCode,
        errMessage,
        errContext,
        errException,
      });
    }

    // fallback for any {} object
    return value ? ok(value) : err();
  }

  switch (typeof value) {
    case "boolean":
      return value ? ok(value) : err();

    case "number":
      return value === 0 ? err() : ok(value);

    case "string":
      return value === "" ? err() : ok(value);

    default:
      return err();
  }
}
