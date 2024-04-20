import { z } from 'zod';
import { createNotFound, prisma } from '../lib/prisma';
import { emptyStringToNull, infiniteResult, infiniteSchema, searchSchema } from '../lib/utils';
import { publicProcedure, router } from '../trpc';

export const paymentsRouter = router({
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

  getPayments: publicProcedure
    .input(infiniteSchema.merge(searchSchema))
    .query(async ({ input: { limit, cursor, searchQuery } }) => {
      const validateNumberResult = z.coerce.number().safeParse(searchQuery);

      const [payments, meta] = await prisma.rentPayment
        .paginate({
          select: {
            id: true,
            date: true,
            type: true,
            totalAmount: true,
            receivedAmount: true,
            discountAmount: true,
            description: true,
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
                  ...(validateNumberResult.success
                    ? [
                        {
                          totalAmount: { equals: validateNumberResult.data },
                        },
                        {
                          discountAmount: { equals: validateNumberResult.data },
                        },
                        {
                          receivedAmount: { equals: validateNumberResult.data },
                        },
                      ]
                    : []),
                ]
              : undefined,
          },
        })
        .withCursor({ limit, after: cursor });

      return infiniteResult(payments, meta);
    }),
});
