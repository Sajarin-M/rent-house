import { useState } from 'react';
import { useDisclosure, useInputState } from '@mantine/hooks';
import { trpc } from '@/context/trpc';
import AddButton from '@/components/add-button';
import Content from '@/components/content';
import { menuItems } from '@/components/menu';
import Search from '@/components/search';
import { InfiniteTable } from '@/components/table';
import Toolbar from '@/components/toolbar';
import EditRentOut from '@/pages/rent-outs/edit-rent-out';
import { useDebouncedQuery } from '@/utils/queries';

export default function RentOuts() {
  // const utils = trpc.useUtils();
  const [searchQuery, setSearchQuery] = useInputState('');

  const [opened, handlers] = useDisclosure(false);
  const [selectedRentOutId, setSelectedRentOutId] = useState<string>();

  const queryResult = useDebouncedQuery(
    trpc.rentOuts.getRentOuts,
    { searchQuery },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  // const deleteRentOut = useConfirmedDeletion(
  //   trpc.rentOuts.deleteRentOut.useMutation({
  //     onSuccess: () => {
  //       utils.rentOuts.getAllRentOuts.invalidate();
  //       notification.deleted('Rent Out');
  //     },
  //   }).mutateAsync,
  //   {
  //     entityName: 'Rent Out',
  //   },
  // );

  return (
    <Content>
      <Toolbar>
        <AddButton
          onClick={() => {
            setSelectedRentOutId(undefined);
            handlers.open();
          }}
        >
          Create Rent Out
        </AddButton>
        <Search
          className='ml-auto'
          value={searchQuery}
          onChange={setSearchQuery}
          tooltip='Search by name, address, phone or product'
        />
      </Toolbar>

      <EditRentOut modalProps={{ opened, onClose: handlers.close }} id={selectedRentOutId} />

      <InfiniteTable
        keyPath='id'
        queryResult={queryResult}
        columns={[{ header: 'Customer', cell: (r) => r.customer.name, cellWidth: '1fr' }]}
        menu={(r) => [
          menuItems.edit(() => {
            setSelectedRentOutId(r.id);
            handlers.open();
          }),
          // menuItems.delete(() => deleteRentOut({ id: r.id })),
        ]}
      />
    </Content>
  );
}
