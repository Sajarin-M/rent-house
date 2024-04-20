import { useInputState } from '@mantine/hooks';
import { trpc } from '@/context/trpc';
import Content from '@/components/content';
import Search from '@/components/search';
import { InfiniteTable } from '@/components/table';
import Toolbar from '@/components/toolbar';
import { formatCurrency, formatDateWithTime } from '@/utils/fns';
import { getNextPageParam, useDebouncedQuery } from '@/utils/queries';

export default function Payments() {
  const [searchQuery, setSearchQuery] = useInputState('');

  const queryResult = useDebouncedQuery(
    trpc.payments.getPayments,
    { searchQuery },
    {
      getNextPageParam,
    },
  );

  return (
    <Content>
      <Toolbar>
        <Search
          className='ml-auto'
          value={searchQuery}
          onChange={setSearchQuery}
          tooltip='Search by name, address, phone'
        />
      </Toolbar>

      <InfiniteTable
        keyPath='id'
        queryResult={queryResult}
        columns={[
          { header: 'Date', cell: (p) => formatDateWithTime(p.date), cellWidth: '10rem' },
          { header: 'Customer', cell: (p) => p.rentOut.customer.name, cellWidth: '1fr' },
          {
            header: 'Received Amount',
            cell: (p) => formatCurrency(p.receivedAmount),
            cellWidth: '1fr',
            classNames: {
              cell: 'text-right justify-end',
            },
          },
          {
            header: 'Discount Amount',
            cell: (p) => (p.discountAmount === 0 ? '-' : formatCurrency(p.discountAmount)),
            cellWidth: '1fr',
            classNames: {
              cell: 'text-right justify-end',
            },
          },
          {
            header: 'Total Amount',
            cell: (p) => formatCurrency(p.totalAmount),
            cellWidth: '1fr',
            classNames: {
              cell: 'text-right justify-end',
            },
          },
        ]}
      />
    </Content>
  );
}
