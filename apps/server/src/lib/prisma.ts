import { Prisma, PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { $ } from 'bun';
import { env } from './env';

if (env.AUTO_MIGRATE) {
  await $`bunx prisma migrate deploy`.cwd(process.cwd());
}

export const prisma = new PrismaClient();
export * from '@prisma/client';

export const createNotFound = (entityName: string) => (error: unknown) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === 'P2025' || error.code === 'P2015' || error.code === 'P2018')
  ) {
    throw new TRPCError({ code: 'NOT_FOUND', message: `${entityName} not found`, cause: error });
  }
  throw error;
};
