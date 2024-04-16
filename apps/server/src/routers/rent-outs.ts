import { TRPCError } from '@trpc/server';
import * as R from 'remeda';
import { z } from 'zod';
import { createNotFound, prisma } from '../lib/prisma';
import {
  getProductQuantityInfo,
  getRentOutItemQuantityInfo,
  getRentOutPaymentInfo,
} from '../lib/shared';
import { emptyStringToNull, infiniteResult, infiniteSchema, searchSchema } from '../lib/utils';
import { confirmedProcedure, publicProcedure, router } from '../trpc';
import { customerSelect } from './customers';
import { productSelect } from './products';

export const rentOutsRouter = router({
  createRentOut: publicProcedure
    .input(
      z.object({
        date: z.string(),
        customerId: z.string().min(1),
        description: z.string().trim().transform(emptyStringToNull).nullish(),
        rentOutItems: z.array(
          z.object({
            productId: z.string().min(1),
            quantity: z.number().positive(),
            rentPerDay: z.number().nonnegative(),
          }),
        ),
        advance: z
          .object({
            receivedAmount: z.number().nonnegative(),
            discountAmount: z.number().nonnegative().optional().default(0),
            totalAmount: z.number().nonnegative(),
            description: z.string().trim().transform(emptyStringToNull).nullish(),
          })
          .nullable(),
      }),
    )
    .mutation(async ({ input }) => {
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
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'One or more products do not exist',
          });
        }

        const { remainingQuantity } = getProductQuantityInfo(product);
        if (remainingQuantity < rentOutItem.quantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Product ${product.name} is out of stock`,
          });
        }
      }

      await prisma.rentOut
        .create({
          data: {
            date: input.date,
            description: input.description,
            rentOutItems: { create: input.rentOutItems },
            customer: { connect: { id: input.customerId, deletedAt: null } },
            rentPayments: {
              create: input.advance
                ? {
                    date: input.date,
                    type: 'Advance',
                    discountAmount: input.advance.discountAmount,
                    receivedAmount: input.advance.receivedAmount,
                    totalAmount: input.advance.totalAmount,
                    description: input.advance.description,
                  }
                : undefined,
            },
            paymentStatus: input.advance ? 'Partially_Paid' : undefined,
          },
          select: { id: true },
        })
        .catch(createNotFound('Customer'));
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
      const [rentOuts, meta] = await prisma.rentOut
        .paginate({
          select: {
            id: true,
            date: true,
            status: true,
            paymentStatus: true,
            customer: { select: { name: true, phoneNumber: true } },
          },
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
                  {
                    description: { contains: searchQuery, mode: 'insensitive' },
                  },
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
        })
        .withCursor({ limit, after: cursor });

      return infiniteResult(rentOuts, meta);
    }),

  addRentPayment: publicProcedure
    .input(
      z
        .object({
          date: z.string(),
          rentOutId: z.string().min(1),
          receivedAmount: z.number().nonnegative(),
          discountAmount: z.number().nonnegative().optional().default(0),
          totalAmount: z.number().positive(),
          description: z.string().trim().transform(emptyStringToNull).nullish(),
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
        rentOut.rentPayments.reduce((sum, paymentItem) => sum + paymentItem.totalAmount, 0) +
          input.totalAmount >=
          rentOut.rentReturns.reduce((sum, returnItem) => sum + returnItem.totalAmount, 0);

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
            status: true,
            description: true,
            paymentStatus: true,
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
            rentReturns: {
              select: {
                id: true,
                date: true,
                description: true,
                totalAmount: true,
                returnItems: {
                  select: {
                    id: true,
                    quantity: true,
                    totalAmount: true,
                    rentOutItem: {
                      select: { product: { select: { name: true } } },
                    },
                  },
                },
              },
            },
          },
        })
        .catch(createNotFound('Rent out'));

      const returnData = {
        ...rentOut,
        rentOutItems: rentOut.rentOutItems.map((item) => ({
          ...R.omit(item, ['returnItems']),
          ...getRentOutItemQuantityInfo(item),
        })),
      };

      return returnData;
    }),

  getRentAmountInfo: publicProcedure
    .input(z.object({ rentOutId: z.string().min(1) }))
    .query(async ({ input }) => {
      const rentOut = await prisma.rentOut
        .findFirstOrThrow({
          where: { id: input.rentOutId, deletedAt: null },
          select: {
            status: true,
            customerId: true,
            paymentStatus: true,
            rentReturns: { select: { totalAmount: true } },
            rentPayments: { select: { totalAmount: true } },
          },
        })
        .catch(createNotFound('Rent out'));

      return {
        status: rentOut.status,
        customerId: rentOut.customerId,
        paymentStatus: rentOut.paymentStatus,
        ...getRentOutPaymentInfo(rentOut),
      };
    }),

  createRentReturn: publicProcedure
    .input(
      z
        .object({
          date: z.string(),
          rentOutId: z.string().min(1),
          description: z.string().trim().transform(emptyStringToNull).nullish(),
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
              description: z.string().trim().transform(emptyStringToNull).nullish(),
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

        if (returnItem.quantity > getRentOutItemQuantityInfo(rentOutItem).remainingQuantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "Return quantity can't be greater than remaining quantity",
          });
        }
      }

      const isFullyReturning = rentOut.rentOutItems.every((rentOutItem) => {
        const returnItem = input.returnItems.find((i) => i.rentOutItemId === rentOutItem.id);
        const quantityInfo = getRentOutItemQuantityInfo(rentOutItem);

        if (!returnItem) {
          if (quantityInfo.remainingQuantity === 0) {
            return true;
          }
          return false;
        }

        if (quantityInfo.remainingQuantity !== returnItem.quantity) {
          return false;
        }
        return true;
      });

      const isFullyPaying =
        isFullyReturning &&
        rentOut.rentPayments.reduce((sum, paymentItem) => sum + paymentItem.totalAmount, 0) +
          (input.payment ? input.payment.totalAmount : 0) >=
          rentOut.rentReturns.reduce((sum, returnItem) => sum + returnItem.totalAmount, 0) +
            input.totalAmount;

      await prisma.$transaction(async (tx) => {
        await tx.rentOut
          .update({
            where: { id: input.rentOutId },
            data: {
              status: isFullyReturning ? 'Returned' : 'Partially_Returned',
              paymentStatus: isFullyPaying
                ? 'Paid'
                : input.withPayment
                  ? 'Partially_Paid'
                  : undefined,
            },
          })
          .catch(createNotFound('Rent out'));

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
                        description: input.payment.description,
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
