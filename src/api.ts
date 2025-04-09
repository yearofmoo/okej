export type Result<D = unknown, C extends string | number = number | string> =
  | Ok<D>
  | Err<C>;

export interface Ok<D = null> {
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
