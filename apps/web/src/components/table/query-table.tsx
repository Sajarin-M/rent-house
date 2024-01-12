import type { UseTRPCQueryResult } from '@trpc/react-query/shared';
import Table, { TableProps } from './table';

export type QueryTableProps<TData extends Record<any, any>> = Omit<TableProps<TData>, 'data'> & {
  data?: readonly TData[];
  queryResult: UseTRPCQueryResult<TData[], unknown>;
};

export default function QueryTable<TData extends Record<any, any>>({
  data,
  queryResult,
  resetError: extendedResetError,
  isError: extendedError,
  isLoading: extendedLoading,
  ...rest
}: QueryTableProps<TData>) {
  const { data: queryData = [], isLoadingError, refetch, isPending } = queryResult;

  return (
    <Table<TData>
      resetError={() => {
        refetch();
        extendedResetError?.();
      }}
      isLoading={isPending || extendedLoading}
      isError={isLoadingError || extendedError}
      data={data || queryData}
      {...rest}
    />
  );
}
