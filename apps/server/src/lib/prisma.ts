import { Prisma, PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';

export const prisma = new PrismaClient({ log: ['query'] });
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
