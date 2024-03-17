import { QueryClient } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from 'rent-house-server';
import notification from '@/utils/notification';

export const trpc = createTRPCReact<AppRouter>({});

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `/api/trpc`,
    }),
  ],
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'always',
      refetchOnWindowFocus: false,

      // onError: (error: any) => {
      //   if ('message' in error && typeof error.message === 'string') {
      //     notification.error({ message: error.message });
      //   }
      // },
    },
    mutations: {
      networkMode: 'always',
      onError: (error: any) => {
        if (
          'message' in error &&
          typeof error.message === 'string' &&
          error.message !== 'Invalid password'
        ) {
          notification.error({ message: error.message });
        }
      },
    },
  },
});
