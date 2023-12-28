import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { env } from '../lib/env';
import { publicProcedure, router } from '../trpc';

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ password: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const storedPassword = await Bun.file(env.PASSWORD_FILE).text();
      if (storedPassword === input.password) {
        return true;
      }
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid password' });
    }),

  changePassword: publicProcedure
    .input(z.object({ oldPassword: z.string().min(1), newPassword: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const storedPassword = await Bun.file(env.PASSWORD_FILE).text();
      if (storedPassword === input.oldPassword) {
        await Bun.write(env.PASSWORD_FILE, input.newPassword);
        return true;
      }
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid password' });
    }),
});
