import { lazy, PropsWithChildren, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from 'rent-house-server';
import notification from '@/utils/notification';

export const trpc = createTRPCReact<AppRouter>({});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_API_URL}/api/trpc`,
    }),
  ],
});

const ReactQueryDevtoolsProduction = lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then((d) => ({
    default: d.ReactQueryDevtools,
  })),
);

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

export function TrpcProvider({ children }: PropsWithChildren) {
  const [showDevtools, setShowDevtools] = useState(false);

  useEffect(() => {
    // @ts-ignore
    window.toggleQueryDevtools = () => setShowDevtools((prev) => !prev);
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools buttonPosition='bottom-left' />
        {showDevtools && <ReactQueryDevtoolsProduction buttonPosition='bottom-left' />}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
