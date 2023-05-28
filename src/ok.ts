import type { Ok } from "./api";
import { isOkResult } from "./helpers";

type OkData<O extends Ok<D> | D, D extends unknown = unknown> = O extends {
  ok: boolean;
  data: D;
}
  ? OkData<O["data"]>
  : O;

export function ok(): Ok<null>;
export function ok(value: undefined): Ok<undefined>;
export function ok<T extends Ok<D>, D extends unknown, ID extends OkData<T>>(
  data: T,
): Ok<ID>;
export function ok<T extends unknown>(data: T): Ok<T>;
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
