export type Result<
  D extends unknown = unknown,
  C extends number | string = number | string,
> = Ok<D> | Err<C>;

export interface Ok<D extends unknown = null> {
  ok: true;
  err: false;
  data: D;
}

export interface Err<
  C extends number | string = number | string,
  E extends Error = Error,
  X extends { [key: string]: unknown } = { [key: string]: unknown },
> {
  ok: false;
  err: true;
  errCode: C;
  errMessage: string;
  errException: E | null;
  errContext: X | null;
}
