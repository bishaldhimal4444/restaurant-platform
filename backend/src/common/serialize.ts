import { Decimal } from '@prisma/client/runtime/client.js';

type WithDecimals<T> = T extends Decimal
  ? number
  : T extends (infer U)[]
    ? WithDecimals<U>[]
    : T extends object
      ? { [K in keyof T]: WithDecimals<T[K]> }
      : T;

export function serializeDecimals<T>(value: T): WithDecimals<T> {
  if (value instanceof Decimal) {
    return value.toNumber() as WithDecimals<T>;
  }
  if (value instanceof Date) {
    return value as WithDecimals<T>;
  }
  if (Array.isArray(value)) {
    return value.map(serializeDecimals) as WithDecimals<T>;
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = serializeDecimals(val);
    }
    return result as WithDecimals<T>;
  }
  return value as WithDecimals<T>;
}
