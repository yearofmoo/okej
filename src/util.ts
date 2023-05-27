import { Ok, Err, Result } from "./api";

type OkData<O extends Ok<D> | D, D extends unknown = unknown> = O extends {
  ok: boolean;
  data: D;
}
  ? OkData<O["data"]>
  : O;

export function ok(): Ok<null>;
export function ok(value: undefined): Ok<undefined>;
export function ok<T extends Ok<D>, D extends unknown, ID extends OkData<T>>(
  data: T
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

export function err(): Err;
export function err(err: null | undefined | boolean): Err;
export function err<T extends Err>(err: T): T;
export function err<N extends number>(errCode: N): Err<N>;
export function err(errMessage: string): Err;
export function err<C extends number | string>(
  errMessage: string,
  errCode: C
): Err<C>;
export function err<X extends { [key: string]: unknown }>(
  errMessage: string,
  errCode: number,
  errContext: X
): Err<number, Error, X>;
export function err<
  E extends Error,
  N extends number,
  X extends { [key: string]: unknown }
>(e: E, errMessage?: string, errCode?: N, errContext?: X): Err<N, E, X>;
export function err<
  N extends number,
  E extends Error,
  X extends { [key: string]: unknown }
>(err: {
  errMessage?: string;
  errCode?: N;
  errContext?: X;
  errException?: E;
}): Err<N, E, X>;
export function err(a?: unknown, b?: unknown, c?: unknown, d?: unknown): Err {
  let code: number | string = 0;
  let message: string = "";
  let context: { [key: string]: unknown } | null = null;
  let exception: Error | null = null;

  // err()
  // err(null | undefined)
  // --
  // otherwise...
  if (a !== null && a !== undefined) {
    if (isResult(a)) {
      if (a.err) {
        // err(Err)
        code = a.errCode;
        message = a.errMessage;
        context = a.errContext;
        exception = a.errException;
      }
    } else {
      switch (typeof a) {
        // err(number)
        case "number":
          code = a;
          break;

        // err(string, number?, context?)
        case "string":
          message = a;
          if (typeof b === "number" || typeof b === "string") {
            code = b;
          }
          if (c && typeof c === "object") {
            context = c as { [key: string]: unknown };
          }
          break;

        case "object":
          if (a instanceof Error) {
            // err(Error, message?, code?, context?)
            exception = a;
            message = typeof b === "string" ? b : a.message || "";
            code = typeof c === "number" || typeof c === "string" ? c : 0;
            context =
              typeof d === "object" ? (d as { [key: string]: unknown }) : null;
          } else {
            // err({ errMessage?, errCode?, errContext?, errException? })
            const { errCode, errMessage, errContext, errException } = a as Err;
            exception = errException || null;
            code = errCode || 0;
            message = errMessage || (exception ? exception.message : "");
            context = errContext || null;
          }
      }
    }
  }

  return {
    ok: false,
    err: true,
    errCode: code,
    errContext: context,
    errMessage: message,
    errException: exception,
  };
}

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

export function from<D extends unknown, R extends Result<D>[]>(
  results: R
): Ok<D[]> | Err<number, Error, { results: R }> {
  if (allOk(results)) {
    const data = (results as Ok<D>[]).map((r) => {
      let data = r.data;
      while (isResult(data)) {
        if (data.err) {
          data = null as D;
          break;
        }
        data = (data as Ok<D>).data;
      }
      return data;
    });
    return ok(data);
  } else {
    const context = { results };
    return err({ errContext: context });
  }
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
