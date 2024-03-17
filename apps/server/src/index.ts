import { existsSync } from 'fs';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { trpc } from '@elysiajs/trpc';
import { Elysia } from 'elysia';
import { env } from './lib/env';
import { ensureDirExistsSync } from './lib/utils';
import { authRouter } from './routers/auth';
import { customersRouter } from './routers/customers';
import { productsRouter } from './routers/products';
import { rentOutsRouter } from './routers/rent-outs';
import { router } from './trpc';

const appRouter = router({
  auth: authRouter,
  products: productsRouter,
  customers: customersRouter,
  rentOuts: rentOutsRouter,
});

export type AppRouter = typeof appRouter;

ensureDirExistsSync(env.IMAGES_DIRECTORY);
ensureDirExistsSync(env.STATIC_DIRECTORY);

if (!existsSync(env.PASSWORD_FILE)) {
  await Bun.write(env.PASSWORD_FILE, 'password');
}

const app = new Elysia()
  .use(cors())
  .use(staticPlugin({ assets: env.STATIC_DIRECTORY, prefix: '/' }))
  .use(staticPlugin({ assets: env.IMAGES_DIRECTORY, prefix: '/api/images' }))
  .post('/api/upload', async ({ body, set }) => {
    if (
      !(
        typeof body === 'object' &&
        body !== null &&
        'file' in body &&
        body.file instanceof File &&
        body.file.type.startsWith('image/')
      )
    ) {
      set.status = 400;
      return JSON.stringify('Invalid request body');
    }

    const extension = body.file.name.split('.').pop();
    const filename = crypto.randomUUID();
    const name = `${filename}.${extension}`;

    await Bun.write(`${env.IMAGES_DIRECTORY}/${name}`, body.file);

    return JSON.stringify(name);
  })
  .use(trpc(appRouter, { endpoint: '/api/trpc' }))
  .onError(({ code, path }) => {
    if (code === 'NOT_FOUND' && !path.startsWith('/api/')) {
      return Bun.file(`${env.STATIC_DIRECTORY}/index.html`);
    }
  })
  .listen(env.PORT);

console.log(
  `🦊 Server is running at \x1b[36mhttp://${app.server?.hostname}:\x1b[1m\x1b[37m${app.server?.port}\x1b[0m`,
);
