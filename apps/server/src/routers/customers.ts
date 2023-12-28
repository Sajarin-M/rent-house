import { z } from 'zod';
import { createNotFound, Prisma, prisma } from '../lib/prisma';
import { publicProcedure, router } from '../trpc';

const customerSchema = z.object({
  name: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().min(1),
  city: z.string().min(1),
  phoneNumber: z.string().min(1),
  image: z.string(),
  documentImage: z.string(),
});

export const customerSelect = {
  id: true,
  name: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  phoneNumber: true,
  image: true,
  documentImage: true,
} satisfies Prisma.CustomerSelect;

export const customersRouter = router({
  createCustomer: publicProcedure.input(customerSchema).mutation(async ({ input }) => {
    await prisma.customer.create({
      data: input,
      select: { id: true },
    });
  }),

  editCustomer: publicProcedure
    .input(z.object({ id: z.string().min(1), data: customerSchema }))
    .mutation(async ({ input }) => {
      await prisma.customer
        .update({
          where: { id: input.id, deletedAt: null },
          data: input.data,
          select: { id: true },
        })
        .catch(createNotFound('Customer'));
    }),

  deleteCustomer: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      await prisma.customer
        .update({
          where: { id: input.id },
          data: { deletedAt: new Date() },
        })
        .catch(createNotFound('Customer'));
    }),

  getCustomer: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const customer = await prisma.customer
        .findFirstOrThrow({
          where: { id: input.id, deletedAt: null },
          select: customerSelect,
        })
        .catch(createNotFound('Customer'));

      return customer;
    }),

  getAllCustomers: publicProcedure.query(async () => {
    const customers = await prisma.customer.findMany({
      select: customerSelect,
      where: { deletedAt: null },
    });
    return customers;
  }),

  // getCustomers: publicProcedure
  //   .input(infiniteSchema.merge(searchSchema))
  //   .query(async ({ input: { limit, cursor, searchQuery } }) => {
  //     const customers = await prisma.customer.findMany({
  //       take: limit + 1,
  //       cursor: cursor ? { id: cursor } : undefined,
  //       orderBy: {
  //         createdAt: 'desc',
  //       },
  //       where: {
  //         OR: searchQuery
  //           ? [
  //               { name: { contains: searchQuery, mode: 'insensitive' } },
  //               { addressLine1: { contains: searchQuery, mode: 'insensitive' } },
  //               { addressLine2: { contains: searchQuery, mode: 'insensitive' } },
  //               { city: { contains: searchQuery, mode: 'insensitive' } },
  //               { phoneNumber: { contains: searchQuery, mode: 'insensitive' } },
  //               {},
  //             ]
  //           : undefined,
  //       },
  //     });
  //     return infiniteResult(customers, limit, 'id');
  //   }),
});
