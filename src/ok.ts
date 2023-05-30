import type { Err, Ok } from "./api";
import { isOkResult } from "./helpers";

/**
 * Creates an Ok result.
 */
export function ok(): Ok<null>;
export function ok(value: undefined): Ok<undefined>;
export function ok<T extends Err>(value: T): Ok<null>;
export function ok<T extends { ok: true; err: false }>(value: T): T;
export function ok<T extends unknown>(value: T): Ok<T>;
export function ok(value?: unknown): Ok<unknown> {
  let resultData: any = value;
  if (resultData === undefined) {
    // special case for undefined actually being
    // passed in as undefined
    resultData = arguments.length === 1 ? undefined : null;
  } else if (isOkResult(value)) {
    // no need for a loop since ok(ok()) does this
    // by way of the function call stack
    resultData = value.data;
  }
  return { ok: true, err: false, data: resultData };
}
