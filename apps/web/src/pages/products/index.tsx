import { useState } from 'react';
import { useDisclosure, useInputState } from '@mantine/hooks';
import { trpc } from '@/context/trpc';
import AddButton from '@/components/add-button';
import Content from '@/components/content';
import { menuItems } from '@/components/menu';
import Search from '@/components/search';
import { Table } from '@/components/table';
import Toolbar from '@/components/toolbar';
import EditProduct from './edit-products';

export default function Products() {
  const [searchQuery, setSearchQuery] = useInputState('');

  const [opened, handlers] = useDisclosure(false);
  const [selectedProductId, setSelectedProductId] = useState<string>();

  const { data: products = [] } = trpc.products.getAllProducts.useQuery();

  const filteredProducts = products.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // const deleteCustomer = useConfirmedDeletion(
  //   trpc.customers.deleteCustomer.useMutation({
  //     onSuccess: () => {
  //       utils.customers.getAllCustomers.invalidate();
  //       notification.deleted('Customer');
  //     },
  //   }).mutateAsync,
  //   {
  //     entityName: 'Customer',
  //   },
  // );

  return (
    <Content>
      <Toolbar>
        <AddButton
          onClick={() => {
            setSelectedProductId(undefined);
            handlers.open();
          }}
        >
          Create Products
        </AddButton>
        <Search
          className='ml-auto'
          value={searchQuery}
          onChange={setSearchQuery}
          tooltip='Search by name, address or phone'
        />
      </Toolbar>

      <EditProduct modalProps={{ opened, onClose: handlers.close }} id={selectedProductId} />

      <Table
        keyPath='id'
        data={filteredProducts}
        columns={[
          { header: 'Name', cell: (c) => c.name, cellWidth: '2fr' },
          {
            header: 'Quantity',
            cell: (c) => c.quantity,
            cellWidth: '2fr',
          },
          {
            header: 'Rent Per Day',
            cell: (c) => c.rentPerDay,
            cellWidth: '2fr',
          },
        ]}
        menu={(c) => [
          menuItems.edit(() => {
            setSelectedProductId(c.id);
            handlers.open();
          }),
          // menuItems.delete(() => deleteCustomer({ id: c.id })),
        ]}
      />
    </Content>
  );
}
