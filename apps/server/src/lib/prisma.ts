import { Prisma, PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { $ } from 'bun';
import { createPaginator } from 'prisma-extension-pagination';
import { env } from './env';

if (env.AUTO_MIGRATE) {
  await $`bunx prisma migrate deploy`.cwd(process.cwd());
}

const paginate = createPaginator({
  cursor: {
    limit: 50,
    getCursor: (user) => user.id,
    parseCursor: (cursor) => ({ id: cursor }),
  },
});

export const prisma = new PrismaClient().$extends({
  model: {
    rentOut: { paginate },
    rentReturn: { paginate },
    rentPayment: { paginate },
  },
});

export type * from '@prisma/client';
export type * from 'prisma-extension-pagination';

export const createNotFound = (entityName: string) => (error: unknown) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === 'P2025' || error.code === 'P2015' || error.code === 'P2018')
  ) {
    throw new TRPCError({ code: 'NOT_FOUND', message: `${entityName} not found`, cause: error });
  }
  throw error;
};
