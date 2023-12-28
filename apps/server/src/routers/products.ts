import { z } from 'zod';
import { Prisma, prisma } from '../lib/prisma';
import { publicProcedure, router } from '../trpc';

const productSchema = z.object({
  name: z.string().min(1),
  image: z.string().optional(),
  quantity: z.number().min(0),
  rentPerDay: z.number().min(0),
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

  getAllProducts: publicProcedure.query(async () => {
    const products = await prisma.product.findMany({
      select: productSelect,
    });
    return products;
  }),
});
