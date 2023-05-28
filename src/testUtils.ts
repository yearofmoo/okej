import type { Result } from "./api";
import { expect } from "vitest";

export function assertResultEquals<R extends Result>(
  result: R,
  data: Partial<R>,
): void {
  expect(result).toEqual(expect.objectContaining(data));
}
