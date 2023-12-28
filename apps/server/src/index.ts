import { cors } from '@elysiajs/cors';
import { trpc } from '@elysiajs/trpc';
import { Elysia } from 'elysia';
import { env } from './lib/env';
import { customersRouter } from './routers/customers';
import { productsRouter } from './routers/products';
import { router } from './trpc';

const appRouter = router({
  products: productsRouter,
  customers: customersRouter,
});

export type AppRouter = typeof appRouter;

const app = new Elysia()
  .use(cors())
  .get('/', () => 'Hello Elysia')
  .use(trpc(appRouter))
  .listen(env.PORT);

console.log(
  `🦊 Server is running at \x1b[36mhttp://${app.server?.hostname}:\x1b[1m\x1b[37m${app.server?.port}\x1b[0m`,
);
