import { z } from 'zod';
import { createNotFound, Prisma, prisma } from '../lib/prisma';
import { infiniteResult, infiniteSchema, searchSchema } from '../lib/utils';
import { publicProcedure, router } from '../trpc';
import { customerSelect } from './customers';
import { productSelect } from './products';

const rentOutSchema = z.object({
  createdAt: z.string(),
  customerId: z.string().min(1),
  rentOutItems: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().positive(),
      rentPerDay: z.number().nonnegative(),
    }),
  ),
});

export const rentOutSelect = {
  id: true,
  customer: { select: customerSelect },
  rentOutItems: {
    select: { id: true, quantity: true, rentPerDay: true, product: { select: productSelect } },
  },
} satisfies Prisma.RentOutSelect;

export const rentOutsRouter = router({
  createRentOut: publicProcedure.input(rentOutSchema).mutation(async ({ input }) => {
    await prisma.rentOut.create({
      data: { ...input, rentOutItems: { create: input.rentOutItems } },
      select: { id: true },
    });
  }),

  editRentOut: publicProcedure
    .input(z.object({ id: z.string().min(1), data: rentOutSchema }))
    .mutation(async ({ input }) => {
      const rentOut = await prisma.rentOut
        .findFirstOrThrow({
          where: { id: input.id },
          select: rentOutSelect,
        })
        .catch(createNotFound('Rent Out'));

      await prisma.rentOut
        .update({
          where: { id: input.id },
          data: {
            ...input.data,
            rentOutItems: {
              deleteMany: {
                id: {
                  in: rentOut.rentOutItems
                    .filter(
                      (item) =>
                        !input.data.rentOutItems.find(
                          (newItem) => newItem.productId === item.product.id,
                        ),
                    )
                    .map((item) => item.id),
                },
              },
              update: input.data.rentOutItems.reduce((acc, newItem) => {
                const oldItem = rentOut.rentOutItems.find(
                  (item) => item.product.id === newItem.productId,
                );
                if (oldItem) {
                  acc.push({
                    where: { id: oldItem.id },
                    data: newItem,
                  });
                }
                return acc;
              }, [] as Prisma.RentOutItemUpdateWithWhereUniqueWithoutRentOutInput[]),
              create: input.data.rentOutItems
                .filter(
                  (newItem) =>
                    !rentOut.rentOutItems.find((item) => newItem.productId === item.product.id),
                )
                .map((item) => item),
            },
          },
          select: { id: true },
        })
        .catch(createNotFound('Rent Out'));
    }),

  // deleteRentOut: confirmedProcedure
  //   .input(z.object({ id: z.string().min(1) }))
  //   .mutation(async ({ input }) => {
  //     await prisma.rentOut
  //       .update({
  //         where: { id: input.id },
  //         data: { deletedAt: new Date() },
  //       })
  //       .catch(createNotFound('Rent Out'));
  //   }),

  // getRentOut: publicProcedure
  //   .input(z.object({ id: z.string().min(1) }))
  //   .query(async ({ input }) => {
  //     const rentOut = await prisma.rentOut
  //       .findFirstOrThrow({
  //         where: { id: input.id, deletedAt: null },
  //         select: rentOutSelect,
  //       })
  //       .catch(createNotFound('Rent Out'));

  //     return rentOut;
  //   }),

  // getAllRentOuts: publicProcedure.query(async () => {
  //   const rentOuts = await prisma.rentOut.findMany({
  //     select: rentOutSelect,
  //     where: { deletedAt: null },
  //   });
  //   return rentOuts;
  // }),

  getRentOuts: publicProcedure
    .input(infiniteSchema.merge(searchSchema))
    .query(async ({ input: { limit, cursor, searchQuery } }) => {
      const rentOuts = await prisma.rentOut.findMany({
        take: limit + 1,
        select: rentOutSelect,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          OR: searchQuery
            ? [
                { customer: { name: { contains: searchQuery, mode: 'insensitive' } } },
                { customer: { addressLine1: { contains: searchQuery, mode: 'insensitive' } } },
                { customer: { addressLine2: { contains: searchQuery, mode: 'insensitive' } } },
                { customer: { city: { contains: searchQuery, mode: 'insensitive' } } },
                { customer: { phoneNumber: { contains: searchQuery, mode: 'insensitive' } } },
                {
                  rentOutItems: {
                    some: { product: { name: { contains: searchQuery, mode: 'insensitive' } } },
                  },
                },
              ]
            : undefined,
        },
      });
      return infiniteResult(rentOuts, limit, 'id');
    }),

  // receivePayment: publicProcedure
  //   .input(
  //     z.object({
  //       rentOutId: z.string().min(1),
  //       discountAmount: z.number().nonnegative(),
  //       receivedAmount: z.number().nonnegative(),
  //     }),
  //   )
  //   .mutation(async ({ input }) => {
  //     await prisma.rentPayment.create({
  //       data: {},
  //       select: { id: true },
  //     });
  //   }),
});
