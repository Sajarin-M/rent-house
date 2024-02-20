import { useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
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
import AddRentPayment from './add-rent-payment';
import RentOutInfo from './rent-out-info';

export default function RentOuts() {
  // const utils = trpc.useUtils();
  const [searchQuery, setSearchQuery] = useInputState('');

  const [editModalOpened, editModalHandlers] = useDisclosure(false);
  const [infoModalOpened, infoModalHandlers] = useDisclosure(false);

  const [selectedRentOutId, setSelectedRentOutId] = useState<string>();

  const [paymentModalOpened, paymentModalHandlers] = useDisclosure(false);
  const [selectedRentOutIdForPayment, setSelectedRentOutIdForPayment] = useState('');

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
            editModalHandlers.open();
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
      <EditRentOut
        modalProps={{ opened: editModalOpened, onClose: editModalHandlers.close }}
        id={selectedRentOutId}
      />
      <AddRentPayment
        modalProps={{ opened: paymentModalOpened, onClose: paymentModalHandlers.close }}
        rentOutId={selectedRentOutIdForPayment}
      />
      <InfiniteTable
        keyPath='id'
        queryResult={queryResult}
        onRowClick={(order) => {
          setSelectedRentOutId(order.id);
          infoModalHandlers.open();
        }}
        columns={[{ header: 'Customer', cell: (r) => r.customer.name, cellWidth: '1fr' }]}
        menu={(r) => [
          menuItems.edit(() => {
            setSelectedRentOutId(r.id);
            editModalHandlers.open();
          }),
          {
            icon: <FaPlus />,
            label: 'Add Payment',
            onClick: () => {
              setSelectedRentOutIdForPayment(r.id);
              paymentModalHandlers.open();
            },
          },

          // menuItems.delete(() => deleteRentOut({ id: r.id })),
        ]}
      />
      <RentOutInfo
        rentOutId={selectedRentOutId!}
        drawerProps={{
          opened: infoModalOpened && selectedRentOutId !== undefined,
          onClose: infoModalHandlers.close,
        }}
      />
    </Content>
  );
}
