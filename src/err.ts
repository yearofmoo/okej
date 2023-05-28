import { Err } from "./api";
import { isResult } from "./helpers";

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
>(
  e: E | unknown,
  errMessage?: string,
  errCode?: N,
  errContext?: X
): Err<N, E, X>;
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
          if (isJsError(a)) {
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

function isJsError(e: unknown): e is Error {
  return (
    e instanceof Error ||
    (typeof e === "object" &&
      e !== null &&
      typeof (e as { message?: unknown }).message === "string")
  );
}
