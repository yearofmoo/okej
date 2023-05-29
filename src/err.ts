import type { Err } from "./api";

/**
 * Creates an Err result.
 */
export function err(): Err;
export function err(err: null | undefined | boolean): Err;
export function err<T extends Err>(err: T): T;
export function err<N extends number>(errCode: N): Err<N>;
export function err(errMessage: string): Err;
export function err<C extends number | string>(
  errMessage: string,
  errCode: C,
): Err<C>;
export function err<X extends { [key: string]: unknown }>(
  errMessage: string,
  errCode: number,
  errContext: X,
): Err<number, Error, X>;
export function err<
  E extends Error,
  N extends number,
  X extends { [key: string]: unknown },
>(
  e: E | Partial<Err> | unknown,
  errMessage?: string,
  errCode?: N,
  errContext?: X,
): Err<N, E, X>;
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
        if (isJsError(a)) {
          // err(Error, message?, code?, context?)
          exception = a;
          message = typeof b === "string" ? b : a.message || "";
          code = typeof c === "number" || typeof c === "string" ? c : 0;
          context =
            typeof d === "object" ? (d as { [key: string]: unknown }) : null;
        } else {
          // err({ errMessage?, errCode?, errContext?, errException? })
          const { errCode, errMessage, errContext, errException } =
            a as Partial<Err>;
          exception = errException ?? null;
          code =
            typeof c === "number"
              ? c
              : typeof errCode === "number"
              ? errCode
              : 0;
          message = isValidString(b)
            ? b
            : isValidString(errMessage)
            ? errMessage
            : exception
            ? exception.message
            : "";
          context = isErrContext(d) ? d : errContext ?? null;
        }
        break;
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

function isJsError(e: unknown): e is Error {
  return (
    e instanceof Error ||
    (typeof e === "object" &&
      e !== null &&
      typeof (e as { message?: unknown }).message === "string")
  );
}

function isValidString(value: unknown): value is string {
  return typeof value === "string" && value.length !== 0;
}

function isErrContext(value: unknown): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null;
}
