import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';
import { isDev } from './lib/env';

export const t = initTRPC.create({
  isDev: isDev,
  errorFormatter(opts) {
    const { shape, error } = opts;
    if (error.cause instanceof ZodError) {
      return {
        ...shape,
        message: error.cause.issues[0]?.message ?? 'Some validation error occurred',
      };
    } else {
      console.log('❌ Internal server error : ', error);
      return {
        ...shape,
        message: 'Internal server error',
      };
    }
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
