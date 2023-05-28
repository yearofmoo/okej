import { expect } from "vitest";
import { Result } from "./api";

export function assertResultEquals<R extends Result>(
  result: R,
  data: Partial<R>
): void {
  expect(result).toEqual(expect.objectContaining(data));
}
