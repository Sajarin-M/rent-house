import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createNotFound, Prisma, prisma } from '../lib/prisma';
import { infiniteResult, infiniteSchema, searchSchema } from '../lib/utils';
import { publicProcedure, router } from '../trpc';
import { customerSelect } from './customers';
import { productSelect } from './products';

const rentOutSchema = z.object({
  date: z.string(),
  customerId: z.string().min(1),
  description: z.string().optional(),
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
  date: true,
  customer: { select: customerSelect },
  rentOutItems: {
    select: {
      id: true,
      quantity: true,
      rentPerDay: true,
      product: { select: productSelect },
      returnItems: { select: { quantity: true } },
    },
  },
  rentPayments: { select: { id: true } },
} satisfies Prisma.RentOutSelect;

export const rentOutsRouter = router({
  createRentOut: publicProcedure.input(rentOutSchema).mutation(async ({ input }) => {
    await prisma.rentOut.create({
      data: {
        ...input,
        rentOutItems: { create: input.rentOutItems },
      },
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

  getRentOut: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const rentOut = await prisma.rentOut
        .findFirstOrThrow({
          where: { id: input.id },
          select: rentOutSelect,
        })
        .catch(createNotFound('Rent Out'));
      return rentOut;
    }),

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
        orderBy: [
          {
            date: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
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

  addRentPayment: publicProcedure
    .input(
      z
        .object({
          date: z.string(),
          rentOutId: z.string().min(1),
          receivedAmount: z.number().positive(),
          discountAmount: z.number().nonnegative().optional().default(0),
          totalAmount: z.number().positive(),
        })
        .refine((data) => data.receivedAmount + data.discountAmount === data.totalAmount, {
          message: 'Total amount should be equal to received amount and discount amount',
          path: ['receivedAmount', 'discountAmount', 'totalAmount'],
        }),
    )
    .mutation(async ({ input }) => {
      await prisma.rentPayment.create({
        data: input,
        select: { id: true },
      });
    }),
  getRentOutInfo: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const info = await prisma.rentOut
        .findFirstOrThrow({
          where: { id: input.id },
          select: rentOutSelect,
        })
        .catch(createNotFound('Product'));
      return info;
    }),

  createRentReturn: publicProcedure
    .input(
      z
        .object({
          date: z.string(),
          rentOutId: z.string().min(1),
          description: z.string().optional(),
          returnItems: z.array(
            z.object({
              rentOutItemId: z.string().min(1),
              quantity: z.number().positive(),
              usedDays: z.number().nonnegative(),
              rentPerDay: z.number().nonnegative(),
              totalAmount: z.number().nonnegative(),
            }),
          ),
          totalAmount: z.number().nonnegative(),
          withPayment: z.boolean(),
          payment: z
            .object({
              receivedAmount: z.number().nonnegative(),
              discountAmount: z.number().nonnegative().optional().default(0),
              totalAmount: z.number().nonnegative(),
              description: z.string().optional(),
            })
            .nullable(),
        })
        .refine(
          (data) => {
            for (const item of data.returnItems) {
              if (item.totalAmount !== item.quantity * item.rentPerDay * item.usedDays) {
                return false;
              }
            }
            return true;
          },
          {
            message: 'Total rent should be equal to quantity * rent per day * used days',
            path: ['returnItems.totalAmount'],
          },
        )
        .refine(
          (data) =>
            data.totalAmount === data.returnItems.reduce((acc, item) => acc + item.totalAmount, 0),
          {
            message: 'Total rent should be equal to quantity * rent per day * used days',
            path: ['totalAmount'],
          },
        ),
    )
    .mutation(async ({ input }) => {
      const rentOut = await prisma.rentOut
        .findFirstOrThrow({
          where: { id: input.rentOutId },
          select: rentOutSelect,
        })
        .catch(createNotFound('Rent Out'));

      for (const returnItem of input.returnItems) {
        const rentOutItem = rentOut.rentOutItems.find(
          (item) => item.id === returnItem.rentOutItemId,
        );

        if (!rentOutItem) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Rent out item is not found',
          });
        }

        const alreadyReturnedQuantity = rentOutItem.returnItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );

        const remainingQuantity = rentOutItem.quantity - alreadyReturnedQuantity;

        if (returnItem.quantity > remainingQuantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "Return quantity can't be greater than remaining quantity",
          });
        }
      }

      await prisma.rentReturn.create({
        data: {
          date: input.date,
          rentOutId: input.rentOutId,
          totalAmount: input.totalAmount,
          description: input.description,
          rentPayment: input.withPayment
            ? {
                create: input.payment
                  ? {
                      date: input.date,
                      rentOutId: input.rentOutId,
                      discountAmount: input.payment.discountAmount,
                      receivedAmount: input.payment.receivedAmount,
                      totalAmount: input.payment.totalAmount,
                      description: input.payment.description?.trim() || undefined,
                    }
                  : {
                      date: input.date,
                      rentOutId: input.rentOutId,
                      discountAmount: 0,
                      receivedAmount: input.totalAmount,
                      totalAmount: input.totalAmount,
                    },
              }
            : undefined,
          returnItems: {
            create: input.returnItems.map((item) => ({
              quantity: item.quantity,
              rentOutItemId: item.rentOutItemId,
              totalAmount: item.totalAmount,
            })),
          },
        },
        select: { id: true },
      });
    }),
});
