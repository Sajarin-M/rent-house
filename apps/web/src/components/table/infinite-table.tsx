import { ComponentType } from 'react';
import { Components } from 'react-virtuoso';
import { Button, Group, Loader } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import type { UseTRPCInfiniteQueryResult } from '@trpc/react-query/shared';
import { getCombinedData, PageVm } from '@/utils/queries';
import Table, { TableProps } from './table';

export type InfiniteTableProps<TData extends Record<any, any>> = Omit<
  TableProps<TData>,
  'data' | 'context'
> & {
  data?: readonly TData[];
  queryResult: UseTRPCInfiniteQueryResult<PageVm<TData>, unknown, unknown>;
  components?: Omit<Components<TData, InfiniteTableContext>, 'Item' | 'Footer'>;
};

export type InfiniteTableContext = {
  loadMore: {
    isError: boolean;
    isLoading: boolean;
    load: VoidFunction;
    retry: VoidFunction;
  };
};

export default function InfiniteTable<TData extends Record<any, any>>({
  data,
  queryResult,
  resetError: extendedResetError,
  isError: extendedError,
  isLoading: extendedLoading,
  atBottomStateChange,
  atBottomThreshold = 400,
  components,
  ...rest
}: InfiniteTableProps<TData>) {
  const {
    data: queryData,
    isPending,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    isError,
    isLoadingError,
    refetch,
  } = queryResult;

  const loadMore: InfiniteTableContext['loadMore'] = {
    isLoading: isFetchingNextPage,
    isError: isError && !isLoadingError,
    load: () => {
      if (hasNextPage && !isFetching && !isError) fetchNextPage();
    },
    retry: () => {
      if (hasNextPage && !isFetching) fetchNextPage();
    },
  };

  return (
    <Table<TData, InfiniteTableContext>
      resetError={() => {
        refetch();
        extendedResetError?.();
      }}
      isLoading={isPending || extendedLoading}
      isError={isLoadingError || extendedError}
      data={data || getCombinedData(queryData?.pages)}
      context={{ loadMore }}
      atBottomThreshold={atBottomThreshold}
      components={{ ...components, Footer: LoadingMoreIndicator }}
      atBottomStateChange={(atBottom) => {
        if (atBottom) loadMore.load();
        atBottomStateChange?.(atBottom);
      }}
      {...rest}
    />
  );
}

const LoadingMoreIndicator: ComponentType<{ context?: InfiniteTableContext }> = ({ context }) => {
  const [debouncedIsLoading] = useDebouncedValue(context!.loadMore.isLoading, 1500);
  const [debouncedIsError] = useDebouncedValue(context!.loadMore.isError, 1500);

  if (
    !(
      (context!.loadMore.isLoading && debouncedIsLoading) ||
      (context!.loadMore.isError && debouncedIsError)
    )
  )
    return null;

  return (
    <div className='border-default-border grid h-[var(--rowHeight)] place-items-center gap-x-4 border-t px-4 py-2'>
      {context!.loadMore.isError ? (
        <Group>
          <p className='text-sm'>Something went wrong while loading </p>{' '}
          <Button size='xs' color='red.6' onClick={() => context!.loadMore.retry()}>
            Retry
          </Button>
        </Group>
      ) : (
        <Loader type='bars' size='xs' />
      )}
    </div>
  );
};
