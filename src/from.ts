import type { Err, Ok, Result } from "./api";
import { err } from "./err";
import { allOk, isResult } from "./helpers";
import { ok } from "./ok";

export function from<D, C, R extends Result<D>[]>(
  results: R,
): Ok<D[]> | Err<C, Error, { results: R }> {
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
  }

  const context = { results };
  return err({ errContext: context });
}

export async function fromPromise<D>(promise: Promise<D>): Promise<Result<D>> {
  try {
    const data = await promise;
    return ok(data);
  } catch (e) {
    return err(e);
  }
}
