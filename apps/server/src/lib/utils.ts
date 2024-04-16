import { existsSync, mkdirSync } from 'fs';
import { z } from 'zod';
import type { CursorPaginationMeta } from './prisma';

export const infiniteSchema = z.object({
  limit: z.number().min(1).max(500).default(50),
  cursor: z.string().optional(),
});

export const dateRangeSchema = z.object({
  endDate: z.coerce.date().nullish(),
  startDate: z.coerce.date().nullish(),
});

export const searchSchema = z.object({
  searchQuery: z.string().optional(),
});

export function infiniteResult<T>(items: T[], meta: CursorPaginationMeta) {
  return { items, meta };
}

export function ensureDirExistsSync(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

export function emptyStringToNull(value: string): string | null {
  if (value === '') {
    return null;
  }
  return value;
}
