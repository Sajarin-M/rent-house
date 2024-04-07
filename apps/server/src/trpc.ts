import { initTRPC, TRPCError } from '@trpc/server';
import { z, ZodError } from 'zod';
import { env, isDev } from './lib/env';

export const t = initTRPC.create({
  isDev: isDev,
  errorFormatter(opts) {
    const { shape, error } = opts;
    if (error.cause instanceof ZodError) {
      return {
        ...shape,
        message: error.cause.issues[0]?.message ?? 'Some validation error occurred',
      };
    } else if (error instanceof TRPCError) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        console.log('❌ Internal server error : ', error);
      }
      return shape;
    } else {
      console.log('❌ Internal server error : ', error);
      return {
        ...shape,
        message: 'Internal server error',
      };
    }
  },
});

const confirmSchema = z.object({ password: z.string().min(3).max(50) });

const isUserConfirmed = t.middleware(async ({ next, ctx, getRawInput }) => {
  const result = confirmSchema.safeParse(await getRawInput());
  if (!result.success) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Please verify password' });
  }

  let password = '';

  try {
    password = await Bun.file(env.PASSWORD_FILE).text();
    console.log('Password', password);
  } catch (error) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Please verify password' });
  }

  if (!password || password !== result.data.password) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid password' });
  }

  return next({
    ctx,
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const confirmedProcedure = t.procedure.use(isUserConfirmed);
