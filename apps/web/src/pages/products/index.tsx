import { useState } from 'react';
import { useDisclosure, useInputState } from '@mantine/hooks';
import { trpc } from '@/context/trpc';
import AddButton from '@/components/add-button';
import Content from '@/components/content';
import { menuItems } from '@/components/menu';
import Search from '@/components/search';
import { QueryTable } from '@/components/table';
import Toolbar from '@/components/toolbar';
import { formatCurrency } from '@/utils/fns';
import EditProduct from './edit-product';

export default function Products() {
  const [searchQuery, setSearchQuery] = useInputState('');

  const [opened, handlers] = useDisclosure(false);
  const [selectedProductId, setSelectedProductId] = useState<string>();

  const queryResult = trpc.products.getAllProductsWithQuantityInfo.useQuery();
  const { data: products = [] } = queryResult;

  const filteredProducts = products.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // const deleteProduct = useConfirmedDeletion(
  //   trpc.products.deleteProduct.useMutation({
  //     onSuccess: () => {
  //       utils.products.getAllProducts.invalidate();
  //       notification.deleted('Product');
  //     },
  //   }).mutateAsync,
  //   {
  //     entityName: 'Product',
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
          Create Product
        </AddButton>
        <Search
          className='ml-auto'
          value={searchQuery}
          onChange={setSearchQuery}
          tooltip='Search by name'
        />
      </Toolbar>

      <EditProduct modalProps={{ opened, onClose: handlers.close }} id={selectedProductId} />

      <QueryTable
        keyPath='id'
        queryResult={queryResult}
        data={filteredProducts}
        columns={[
          { header: 'Name', cell: (c) => c.name, cellWidth: '3fr' },
          {
            header: 'Total Quantity',
            cell: (c) => c.quantity,
            cellWidth: '2fr',
          },
          {
            header: 'Remaining Quantity',
            cell: (c) => c.remainingQuantity,
            cellWidth: '2fr',
          },
          {
            header: 'Rent Per Day',
            cell: (c) => formatCurrency(c.rentPerDay),
            cellWidth: '2fr',
          },
        ]}
        menu={(c) => [
          menuItems.edit(() => {
            setSelectedProductId(c.id);
            handlers.open();
          }),
          // menuItems.delete(() => deleteProduct({ id: c.id })),
        ]}
      />
    </Content>
  );
}
