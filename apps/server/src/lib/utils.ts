import { z } from 'zod';

export const infiniteSchema = z.object({
  limit: z.number().min(1).max(500).default(50),
  cursor: z.string().nullish(),
});

export const dateRangeSchema = z.object({
  endDate: z.coerce.date().nullish(),
  startDate: z.coerce.date().nullish(),
});

export const searchSchema = z.object({
  searchQuery: z.string().optional(),
});

export function infiniteResult<T>(items: T[], limit: number, key: keyof T) {
  let nextCursor: string | undefined = undefined;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem![key] as string;
  }
  return { items, nextCursor };
}
