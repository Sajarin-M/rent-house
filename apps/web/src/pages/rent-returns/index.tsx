import { useState } from 'react';
import { useDisclosure, useInputState } from '@mantine/hooks';
import { trpc } from '@/context/trpc';
import Content from '@/components/content';
import Search from '@/components/search';
import { InfiniteTable } from '@/components/table';
import Toolbar from '@/components/toolbar';
import { formatCurrency, formatDateWithTime } from '@/utils/fns';
import { getNextPageParam, useDebouncedQuery } from '@/utils/queries';
import RentReturnInfo from './rent-return-info';

export default function RentReturns() {
  const [searchQuery, setSearchQuery] = useInputState('');
  const [infoModalOpened, infoModalHandlers] = useDisclosure(false);
  const [selectedRentReturnId, setSelectedRentReturnId] = useState<string>();

  const queryResult = useDebouncedQuery(
    trpc.rentReturns.getRentReturns,
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
        onRowClick={(order) => {
          setSelectedRentReturnId(order.id);
          infoModalHandlers.open();
        }}
        columns={[
          { header: 'Date', cell: (r) => formatDateWithTime(r.date), cellWidth: '10rem' },
          { header: 'Customer', cell: (r) => r.rentOut.customer.name, cellWidth: '1fr' },
          {
            header: 'Phone',
            cell: (r) => r.rentOut.customer.phoneNumber,
            cellWidth: '1fr',
          },
          {
            header: 'Amount',
            cell: (r) => formatCurrency(r.totalAmount),
            cellWidth: '1fr',
            classNames: {
              cell: 'text-right justify-end',
            },
          },
        ]}
      />
      <RentReturnInfo
        rentReturnId={selectedRentReturnId!}
        drawerProps={{
          opened: infoModalOpened && selectedRentReturnId !== undefined,
          onClose: infoModalHandlers.close,
        }}
      />
    </Content>
  );
}
