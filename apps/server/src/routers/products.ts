import * as R from 'remeda';
import { z } from 'zod';
import { createNotFound, Prisma, prisma } from '../lib/prisma';
import { getProductQuantityInfo } from '../lib/shared';
import { emptyStringToNull } from '../lib/utils';
import { publicProcedure, router } from '../trpc';

const productSchema = z.object({
  name: z.string().trim().min(1),
  quantity: z.number().positive(),
  rentPerDay: z.number().nonnegative(),
  image: z.string().transform(emptyStringToNull).nullish(),
});

export const productSelect = {
  id: true,
  name: true,
  image: true,
  quantity: true,
  rentPerDay: true,
} satisfies Prisma.ProductSelect;

export const productsRouter = router({
  createProduct: publicProcedure.input(productSchema).mutation(async ({ input }) => {
    const product = await prisma.product.create({
      data: input,
      select: productSelect,
    });
    return product;
  }),

  editProduct: publicProcedure
    .input(z.object({ id: z.string().min(1), data: productSchema }))
    .mutation(async ({ input }) => {
      const product = await prisma.product.update({
        where: { id: input.id },
        data: input.data,
        select: productSelect,
      });
      return product;
    }),

  getProduct: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const products = await prisma.product
        .findFirstOrThrow({
          where: { id: input.id },
          select: productSelect,
        })
        .catch(createNotFound('Product'));
      return products;
    }),

  getAllProducts: publicProcedure.query(async () => {
    const products = await prisma.product.findMany({
      select: productSelect,
      orderBy: { createdAt: 'asc' },
    });
    return products;
  }),

  getAllProductsWithQuantityInfo: publicProcedure.query(async () => {
    const products = await prisma.product.findMany({
      select: {
        ...productSelect,
        ...getProductQuantityInfo.select,
      },
      orderBy: { createdAt: 'asc' },
    });

    const returnData = products.map((product) => ({
      ...R.omit(product, ['rentOutItems']),
      ...getProductQuantityInfo(product),
    }));

    return returnData;
  }),
});
