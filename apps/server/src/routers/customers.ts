import { z } from 'zod';
import { createNotFound, Prisma, prisma } from '../lib/prisma';
import { getRentOutItemQuantityInfo, getRentOutPaymentInfo } from '../lib/shared';
import { emptyStringToNull } from '../lib/utils';
import { confirmedProcedure, publicProcedure, router } from '../trpc';

const customerSchema = z.object({
  name: z.string().trim().min(1),
  phoneNumber: z.string().trim().min(1),
  addressLine1: z.string().trim().transform(emptyStringToNull).nullish(),
  addressLine2: z.string().trim().transform(emptyStringToNull).nullish(),
  city: z.string().trim().transform(emptyStringToNull).nullish(),
  image: z.string().transform(emptyStringToNull).nullish(),
  documentImage: z.string().transform(emptyStringToNull).nullish(),
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
  createdAt: true,
} satisfies Prisma.CustomerSelect;

export const customersRouter = router({
  createCustomer: publicProcedure.input(customerSchema).mutation(async ({ input }) => {
    const customer = await prisma.customer.create({
      data: input,
      select: customerSelect,
    });
    return customer;
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

  deleteCustomer: confirmedProcedure
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

  getCustomerStatus: publicProcedure
    .input(z.object({ customerId: z.string().min(1) }))
    .query(async ({ input }) => {
      const pendingRentOutByCustomer = await prisma.rentOut.findMany({
        where: {
          customerId: input.customerId,
          OR: [
            {
              status: { in: ['Pending', 'Partially_Returned'] },
            },
            {
              paymentStatus: { in: ['Pending', 'Partially_Paid'] },
            },
          ],
        },
        select: {
          rentOutItems: {
            select: {
              id: true,
              quantity: true,
              product: { select: { id: true, name: true, image: true } },
              returnItems: { select: { quantity: true } },
            },
          },
          rentReturns: { select: { totalAmount: true } },
          rentPayments: { select: { totalAmount: true } },
        },
      });

      const pendingItems = pendingRentOutByCustomer.reduce(
        (items, rentOut) => {
          for (const rentOutItem of rentOut.rentOutItems) {
            const quantityInfo = getRentOutItemQuantityInfo(rentOutItem);
            if (quantityInfo.remainingQuantity > 0) {
              const existing = items.find((item) => item.id === rentOutItem.product.id);
              if (existing) {
                existing.remainingQuantity += quantityInfo.remainingQuantity;
              } else {
                items.push({
                  ...rentOutItem.product,
                  remainingQuantity: quantityInfo.remainingQuantity,
                });
              }
            }
          }
          return items;
        },
        [] as ((typeof pendingRentOutByCustomer)[number]['rentOutItems'][number]['product'] & {
          remainingQuantity: number;
        })[],
      );

      const returnData = {
        pendingItems,
        isSafe: pendingRentOutByCustomer.length === 0,
        hasRentedBefore:
          pendingRentOutByCustomer.length !== 0
            ? (await prisma.rentOut.count({ where: { customerId: input.customerId } })) > 0
            : true,
        pendingAmount: pendingRentOutByCustomer.reduce(
          (sum, rentOut) => sum + getRentOutPaymentInfo(rentOut).pendingAmount,
          0,
        ),
      };

      return returnData;
    }),
});
