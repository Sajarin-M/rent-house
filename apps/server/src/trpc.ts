// trpc.ts
import { initTRPC } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { z } from 'zod';

export const createContext = async (_: FetchCreateContextFnOptions) => {
  return {
    name: 'elysia',
  };
};

const t = initTRPC.context<Awaited<ReturnType<typeof createContext>>>().create();

export const router = t.router({
  mirror: t.procedure.input(z.string()).query(({ input }) => input),
});

export type Router = typeof router;
