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
import AddRent from './add-rent-payment';

export default function RentOuts() {
  // const utils = trpc.useUtils();
  const [searchQuery, setSearchQuery] = useInputState('');

  const [editModalOpened, editModalHandlers] = useDisclosure(false);
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
        {/* <AddButton
          onClick={() => {
            setSelectedRentOutIdForPayment(undefined);
            handlers.open();
          }}
        >
          Add Rent Payment
        </AddButton> */}
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
      paymentModalOpened
      <AddRent
        modalProps={{ opened: paymentModalOpened, onClose: paymentModalHandlers.close }}
        rentOutId={selectedRentOutIdForPayment}
      />
      <InfiniteTable
        keyPath='id'
        queryResult={queryResult}
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
    </Content>
  );
}
