import { cors } from '@elysiajs/cors';
import { trpc } from '@elysiajs/trpc';
import { Elysia } from 'elysia';
import { env } from '@/lib/env';
import { createContext, router } from './trpc';

const app = new Elysia()
  .use(cors())
  .get('/', () => 'Hello Elysia')
  .use(
    trpc(router, {
      createContext,
    }),
  )
  .listen(env.PORT);

console.log(
  `🦊 Server is running at \x1b[36mhttp://${app.server?.hostname}:\x1b[1m\x1b[37m${app.server?.port}\x1b[0m`,
);
