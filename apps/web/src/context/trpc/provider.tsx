import { lazy, PropsWithChildren, useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient, trpc, trpcClient } from './clients';

const ReactQueryDevtoolsProduction = lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then((d) => ({
    default: d.ReactQueryDevtools,
  })),
);

export default function TrpcProvider({ children }: PropsWithChildren) {
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
