import { useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { TbRotateClockwise } from 'react-icons/tb';
import { useDisclosure, useInputState } from '@mantine/hooks';
import { trpc } from '@/context/trpc';
import AddButton from '@/components/add-button';
import Content from '@/components/content';
import Search from '@/components/search';
import { InfiniteTable } from '@/components/table';
import Toolbar from '@/components/toolbar';
import CreateRentOut from '@/pages/rent-outs/create-rent-out';
import { formatDateWithTime } from '@/utils/fns';
import { useDebouncedQuery } from '@/utils/queries';
import AddRentPayment from './add-rent-payment';
import CreateRentReturn from './create-rent-return';
import RentOutInfo from './rent-out-info';
import RentOutPaymentStatusBadge from './rent-out-payment-status-badge';
import RentOutStatusBadge from './rent-out-status-badge';

export default function RentOuts() {
  // const utils = trpc.useUtils();
  const [searchQuery, setSearchQuery] = useInputState('');

  const [createModalOpened, createModalHandlers] = useDisclosure(false);
  const [infoModalOpened, infoModalHandlers] = useDisclosure(false);
  const [paymentModalOpened, paymentModalHandlers] = useDisclosure(false);
  const [returnModalOpened, returnModalHandlers] = useDisclosure(false);

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
            createModalHandlers.open();
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

      <CreateRentOut
        modalProps={{ opened: createModalOpened, onClose: createModalHandlers.close }}
      />

      <AddRentPayment
        modalProps={{
          onClose: paymentModalHandlers.close,
          opened: paymentModalOpened && selectedRentOutId !== undefined,
        }}
        rentOutId={selectedRentOutId!}
      />

      <CreateRentReturn
        rentOutId={selectedRentOutId!}
        modalProps={{
          onClose: returnModalHandlers.close,
          opened: returnModalOpened && selectedRentOutId !== undefined,
        }}
      />

      <InfiniteTable
        keyPath='id'
        queryResult={queryResult}
        onRowClick={(order) => {
          setSelectedRentOutId(order.id);
          infoModalHandlers.open();
        }}
        columns={[
          { header: 'Date', cell: (r) => formatDateWithTime(r.date), cellWidth: '11rem' },
          { header: 'Customer', cell: (r) => r.customer.name, cellWidth: '1fr' },
          {
            header: 'Phone',
            cell: (r) => r.customer.phoneNumber,
            cellWidth: '1fr',
          },
          {
            header: 'Return Status',
            cell: (r) => <RentOutStatusBadge status={r.status} />,
            cellWidth: '10rem',
            classNames: {
              cell: 'text-center justify-center',
            },
          },
          {
            header: 'Payment Status',
            cell: (r) => <RentOutPaymentStatusBadge status={r.paymentStatus} />,
            cellWidth: '10rem',
            classNames: {
              cell: 'text-center justify-center',
            },
          },
        ]}
        menu={(r) => {
          const items = [
            {
              icon: <FaPlus />,
              label: 'Add Payment',
              onClick: () => {
                setSelectedRentOutId(r.id);
                paymentModalHandlers.open();
              },
            },
            // menuItems.delete(() => deleteRentOut({ id: r.id })),
          ];

          if (r.status !== 'Returned') {
            items.unshift({
              icon: <TbRotateClockwise />,
              label: 'Return',
              onClick: () => {
                setSelectedRentOutId(r.id);
                returnModalHandlers.open();
              },
            });
          }

          return items;
        }}
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
