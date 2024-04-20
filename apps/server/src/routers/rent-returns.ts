import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createNotFound, prisma } from '../lib/prisma';
import { getRentOutItemQuantityInfo } from '../lib/shared';
import { emptyStringToNull, infiniteResult, infiniteSchema, searchSchema } from '../lib/utils';
import { publicProcedure, router } from '../trpc';
import { customerSelect } from './customers';
import { productSelect } from './products';

export const rentReturnsRouter = router({
  getRentReturns: publicProcedure
    .input(infiniteSchema.merge(searchSchema))
    .query(async ({ input: { limit, cursor, searchQuery } }) => {
      const validateNumberResult = z.coerce.number().safeParse(searchQuery);

      const [rentReturns, meta] = await prisma.rentReturn
        .paginate({
          select: {
            id: true,
            date: true,
            totalAmount: true,
            rentOut: { select: { customer: { select: { name: true, phoneNumber: true } } } },
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
            rentOut: { deletedAt: null },
            OR: searchQuery
              ? [
                  {
                    description: { contains: searchQuery, mode: 'insensitive' },
                  },
                  {
                    rentOut: { customer: { name: { contains: searchQuery, mode: 'insensitive' } } },
                  },
                  {
                    rentOut: {
                      customer: { addressLine1: { contains: searchQuery, mode: 'insensitive' } },
                    },
                  },
                  {
                    rentOut: {
                      customer: { addressLine2: { contains: searchQuery, mode: 'insensitive' } },
                    },
                  },
                  {
                    rentOut: { customer: { city: { contains: searchQuery, mode: 'insensitive' } } },
                  },
                  {
                    rentOut: {
                      customer: { phoneNumber: { contains: searchQuery, mode: 'insensitive' } },
                    },
                  },
                  {
                    rentOut: {
                      rentOutItems: {
                        some: { product: { name: { contains: searchQuery, mode: 'insensitive' } } },
                      },
                    },
                  },
                  {
                    totalAmount: validateNumberResult.success
                      ? { equals: validateNumberResult.data }
                      : undefined,
                  },
                ]
              : undefined,
          },
        })
        .withCursor({ limit, after: cursor });

      return infiniteResult(rentReturns, meta);
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
              paymentStatus: isFullyPaying ? 'Paid' : input.payment ? 'Partially_Paid' : undefined,
            },
          })
          .catch(createNotFound('Rent out'));

        await tx.rentReturn.create({
          data: {
            date: input.date,
            rentOutId: input.rentOutId,
            totalAmount: input.totalAmount,
            description: input.description,
            rentPayment: input.payment
              ? {
                  create: {
                    date: input.date,
                    rentOutId: input.rentOutId,
                    discountAmount: input.payment.discountAmount,
                    receivedAmount: input.payment.receivedAmount,
                    totalAmount: input.payment.totalAmount,
                    description: input.payment.description,
                  },
                }
              : undefined,
            returnItems: {
              create: input.returnItems.map((item) => ({
                quantity: item.quantity,
                usedDays: item.usedDays,
                rentPerDay: item.rentPerDay,
                rentOutItemId: item.rentOutItemId,
                totalAmount: item.totalAmount,
              })),
            },
          },
          select: { id: true },
        });
      });
    }),

  getRentReturnInfo: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const rentOut = await prisma.rentReturn
        .findFirstOrThrow({
          where: { id: input.id, rentOut: { deletedAt: null } },
          select: {
            id: true,
            date: true,
            description: true,
            totalAmount: true,
            rentOut: { select: { customer: { select: customerSelect } } },
            returnItems: {
              select: {
                id: true,
                quantity: true,
                rentPerDay: true,
                usedDays: true,
                totalAmount: true,
                rentOutItem: { select: { product: { select: productSelect } } },
              },
            },
          },
        })
        .catch(createNotFound('Rent return'));

      return rentOut;
    }),
});
