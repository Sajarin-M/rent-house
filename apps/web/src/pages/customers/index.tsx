import { useState } from 'react';
import { useDisclosure, useInputState } from '@mantine/hooks';
import { trpc } from '@/context/trpc';
import AddButton from '@/components/add-button';
import Content from '@/components/content';
import { menuItems } from '@/components/menu';
import Search from '@/components/search';
import { QueryTable } from '@/components/table';
import Toolbar from '@/components/toolbar';
import EditCustomer from '@/pages/customers/edit-customer';
import notification from '@/utils/notification';
import { useConfirmedDeletion } from '@/utils/queries';
import CustomerInfo from './customer-info';

export default function Customers() {
  const utils = trpc.useUtils();
  const [searchQuery, setSearchQuery] = useInputState('');

  const [opened, handlers] = useDisclosure(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>();
  const [CustomerInfoModalOpened, CustomerInfoModalHandlers] = useDisclosure(false);

  const queryResult = trpc.customers.getAllCustomers.useQuery();
  const { data: customers = [] } = queryResult;

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.addressLine1?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.addressLine2?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const deleteCustomer = useConfirmedDeletion(
    trpc.customers.deleteCustomer.useMutation({
      onSuccess: () => {
        utils.customers.getAllCustomers.invalidate();
        notification.deleted('Customer');
      },
    }).mutateAsync,
    {
      entityName: 'Customer',
    },
  );

  return (
    <Content>
      <Toolbar>
        <AddButton
          onClick={() => {
            setSelectedCustomerId(undefined);
            handlers.open();
          }}
        >
          Create Customer
        </AddButton>
        <Search
          className='ml-auto'
          value={searchQuery}
          onChange={setSearchQuery}
          tooltip='Search by name, address or phone'
        />
      </Toolbar>

      <EditCustomer modalProps={{ opened, onClose: handlers.close }} id={selectedCustomerId} />

      <QueryTable
        keyPath='id'
        data={filteredCustomers}
        queryResult={queryResult}
        onRowClick={(order) => {
          setSelectedCustomerId(order.id);
          CustomerInfoModalHandlers.open();
        }}
        columns={[
          { header: 'Name', cell: (c) => c.name, cellWidth: '2fr' },
          {
            header: 'Phone',
            cell: (c) => c.phoneNumber,
            cellWidth: '2fr',
          },
          {
            header: 'Address',
            cell: (c) => [c.addressLine1, c.addressLine2, c.city].filter(Boolean).join(', '),
            cellWidth: '3fr',
          },
        ]}
        menu={(c) => [
          menuItems.edit(() => {
            setSelectedCustomerId(c.id);
            handlers.open();
          }),
          menuItems.delete(() => deleteCustomer({ id: c.id })),
        ]}
      />
      <CustomerInfo
        customerId={selectedCustomerId!}
        drawerProps={{
          opened: CustomerInfoModalOpened && selectedCustomerId !== undefined,
          onClose: CustomerInfoModalHandlers.close,
        }}
      />
    </Content>
  );
}
