import type { Err } from "./api";
import { isJsError } from "./shared";

// this is used to make sure that at least one of the
// properties of an object is defined (becausePartial
// makes all properties optional))
type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

/**
 * Creates an Err result.
 */
export function err(): Err;
export function err(err: null | undefined): Err;
export function err<T extends Err>(err: T): T;
export function err(errMessage: string): Err;
export function err<C extends number | string = number | string>(
  errMessage: string,
  errCode: C,
): Err<C>;
export function err<
  C extends string | number = string | number,
  X extends { [key: string]: unknown } = { [key: string]: unknown },
>(errMessage: string, errCode: C, errContext: X): Err<number, Error, X>;
export function err<
  E extends Err,
  C extends string | number = string | number,
  X extends { [key: string]: unknown } = { [key: string]: unknown },
>(
  e: AtLeastOne<Partial<E>>,
  errMessage?: string,
  errCode?: C,
  errContext?: X,
): Err<C, NonNullable<E["errException"]>, X>;
export function err<
  E extends Error,
  C extends string | number = string | number,
  X extends { [key: string]: unknown } = { [key: string]: unknown },
>(
  e: E | { stack: string; message: string } | unknown,
  errMessage?: string,
  errCode?: C,
  errContext?: X,
): Err<C, E, X>;
export function err(a?: unknown, b?: unknown, c?: unknown, d?: unknown): Err {
  let code: number | string = 0;
  let message = "";
  let context: { [key: string]: unknown } | null = null;
  let exception: Error | null = null;

  // err()
  // err(null | undefined)
  // --
  // otherwise...
  if (a !== null && a !== undefined) {
    switch (typeof a) {
      // err(string, code?, context?)
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

  // we want the stack trace of the error to be listed
  exception = exception ?? new Error(message);

  return {
    ok: false,
    err: true,
    errCode: code,
    errContext: context,
    errMessage: message,
    errException: exception,
  };
}

function isValidString(value: unknown): value is string {
  return typeof value === "string" && value.length !== 0;
}

function isErrContext(value: unknown): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null;
}
