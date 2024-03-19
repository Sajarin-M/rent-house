import { TRPCError } from '@trpc/server';
import { omit } from 'remeda';
import { z } from 'zod';
import { createNotFound, prisma } from '../lib/prisma';
import { infiniteResult, infiniteSchema, searchSchema } from '../lib/utils';
import { confirmedProcedure, publicProcedure, router } from '../trpc';
import { customerSelect } from './customers';
import { getProductQuantityInfo, productSelect } from './products';

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

function getRentOutItemQuantityInfo(rentOutItem: {
  quantity: number;
  returnItems: {
    quantity: number;
  }[];
}) {
  const returnedQuantity = rentOutItem.returnItems.reduce((sum, item) => sum + item.quantity, 0);
  return {
    returnedQuantity,
    remainingQuantity: rentOutItem.quantity - returnedQuantity,
  };
}

export const rentOutsRouter = router({
  createRentOut: publicProcedure.input(rentOutSchema).mutation(async ({ input }) => {
    const products = await prisma.product.findMany({
      where: { id: { in: input.rentOutItems.map((item) => item.productId) } },
      select: { id: true, name: true, ...getProductQuantityInfo.select },
    });

    if (products.length !== input.rentOutItems.length) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'One or more products do not exist' });
    }

    // check if product is in stock
    for (const rentOutItem of input.rentOutItems) {
      const product = products.find((product) => product.id === rentOutItem.productId);
      if (!product) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'One or more products do not exist' });
      }

      const { remainingQuantity } = getProductQuantityInfo(product);
      if (remainingQuantity < rentOutItem.quantity) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Product ${product.name} is out of stock`,
        });
      }
    }

    await prisma.rentOut.create({
      data: {
        ...input,
        rentOutItems: { create: input.rentOutItems },
      },
      select: { id: true },
    });
  }),

  deleteRentOut: confirmedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      await prisma.rentOut
        .update({
          where: { id: input.id },
          data: { deletedAt: new Date() },
        })
        .catch(createNotFound('Rent out'));
    }),

  getRentOuts: publicProcedure
    .input(infiniteSchema.merge(searchSchema))
    .query(async ({ input: { limit, cursor, searchQuery } }) => {
      const rentOuts = await prisma.rentOut.findMany({
        take: limit + 1,
        select: {
          id: true,
          date: true,
          customer: { select: { name: true } },
          status: true,
          paymentStatus: true,
        },
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
          deletedAt: null,
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
      const rentOut = await prisma.rentOut
        .findFirstOrThrow({
          where: { id: input.rentOutId, deletedAt: null },
          select: {
            status: true,
            rentReturns: { select: { totalAmount: true } },
            rentPayments: { select: { totalAmount: true } },
          },
        })
        .catch(createNotFound('Rent out'));

      const isFullyPaying =
        rentOut.status === 'Returned' &&
        input.totalAmount >=
          rentOut.rentReturns.reduce((sum, returns) => sum + returns.totalAmount, 0) -
            rentOut.rentPayments.reduce((sum, payment) => sum + payment.totalAmount, 0);

      await prisma.$transaction([
        prisma.rentOut.update({
          where: { id: input.rentOutId },
          data: { paymentStatus: isFullyPaying ? 'Paid' : 'Partially_Paid' },
        }),
        prisma.rentPayment.create({
          data: input,
          select: { id: true },
        }),
      ]);
    }),

  getRentOutInfo: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const rentOut = await prisma.rentOut
        .findFirstOrThrow({
          where: { id: input.id, deletedAt: null },
          select: {
            id: true,
            date: true,
            customer: { select: customerSelect },
            rentOutItems: {
              select: {
                id: true,
                quantity: true,
                rentPerDay: true,
                product: { select: productSelect },
              },
            },
            rentPayments: { select: { id: true } },
          },
        })
        .catch(createNotFound('Rent out'));
      return rentOut;
    }),

  getRentOutWithQuantityInfo: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const rentOut = await prisma.rentOut
        .findFirstOrThrow({
          where: { id: input.id, deletedAt: null },
          select: {
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
          },
        })
        .catch(createNotFound('Rent out'));

      const returnData = {
        ...rentOut,
        rentOutItems: rentOut.rentOutItems.map((item) => ({
          ...omit(item, ['returnItems']),
          ...getRentOutItemQuantityInfo(item),
        })),
      };

      return returnData;
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
          where: { id: input.rentOutId, deletedAt: null },
          select: {
            rentOutItems: {
              select: {
                id: true,
                quantity: true,
                returnItems: { select: { quantity: true } },
              },
            },
            rentReturns: { select: { totalAmount: true } },
            rentPayments: { select: { totalAmount: true } },
          },
        })
        .catch(createNotFound('Rent out'));

      let isFullyReturning = true;

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

        if (remainingQuantity !== rentOutItem.quantity) {
          isFullyReturning = false;
        }
      }

      const isFullyPaying =
        isFullyReturning &&
        input.withPayment &&
        (input.payment === null || input.payment.totalAmount >= input.totalAmount) &&
        rentOut.rentPayments.reduce((sum, payment) => sum + payment.totalAmount, 0) >=
          rentOut.rentReturns.reduce((sum, returns) => sum + returns.totalAmount, 0);

      await prisma.$transaction(async (tx) => {
        if (isFullyReturning || isFullyPaying) {
          await tx.rentOut
            .update({
              where: { id: input.rentOutId },
              data: {
                status: isFullyReturning ? 'Returned' : undefined,
                paymentStatus: isFullyPaying ? 'Paid' : undefined,
              },
            })
            .catch(createNotFound('Rent out'));
        }

        await tx.rentReturn.create({
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
      });
    }),
});
