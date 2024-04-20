import { Table } from '@mantine/core';
import { trpc } from '@/context/trpc';
import Avatar from '@/components/avatar';
import { Drawer, GenerateDrawerWrapperProps } from '@/components/drawer';
import { formatCurrency, formatDate } from '@/utils/fns';

type RentReturnInfoContentProps = {
  rentReturnId: string;
};

function RentReturnInfoContent({ rentReturnId }: RentReturnInfoContentProps) {
  const { data: rentReturn, isPending } = trpc.rentReturns.getRentReturnInfo.useQuery({
    id: rentReturnId,
  });

  return (
    <Drawer.Content isLoading={isPending} title='Order Details'>
      {rentReturn && (
        <div>
          <div className='gap-y-xs grid grid-cols-[auto_1fr] items-center gap-x-12'>
            <span className='self-start'>Date</span>
            <span>{formatDate(rentReturn.date)}</span>
            <span className='self-start'>Customer</span>
            <span>{rentReturn.rentOut.customer.name}</span>
            <span className='self-start'>Phone Number</span>
            <span>{rentReturn.rentOut.customer.phoneNumber}</span>
            {rentReturn.description && (
              <>
                <span className='self-start'>Description </span>
                <span>{rentReturn.description}</span>
              </>
            )}
            <span className='self-start'>Address</span>
            <span>
              {[
                rentReturn.rentOut.customer.addressLine1,
                rentReturn.rentOut.customer.addressLine2,
                rentReturn.rentOut.customer.city,
              ]
                .filter(Boolean)
                .join(' , ')}
            </span>
            <span className='self-start'>Total Amount</span>
            <span>{formatCurrency(rentReturn.totalAmount)}</span>
          </div>
          <Drawer.Divider className='my-md' />

          <div className='my-sm font-semibold'>Returned Items</div>
          <div className='border-default-border overflow-hidden rounded-sm border'>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className='py-xs w-0'>No</Table.Th>
                  <Table.Th className='py-xs w-0'></Table.Th>
                  <Table.Th className='py-xs'>Product</Table.Th>
                  <Table.Th className='py-xs'>Quantity</Table.Th>
                  <Table.Th className='py-xs'>Used Days</Table.Th>
                  <Table.Th className='py-xs text-end'>Rent / Day</Table.Th>
                  <Table.Th className='py-xs text-end'>Total Amount</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rentReturn.returnItems.map((item, index) => (
                  <Table.Tr key={item.id}>
                    <Table.Td className='w-0'>{index + 1}</Table.Td>
                    <Table.Td className='w-0'>
                      <Avatar
                        text={item.rentOutItem.product.name}
                        name={item.rentOutItem.product.image ?? ''}
                        className='size-[35px] text-sm'
                      />
                    </Table.Td>
                    <Table.Td>{item.rentOutItem.product.name}</Table.Td>
                    <Table.Td>{item.quantity}</Table.Td>
                    <Table.Td>{item.usedDays}</Table.Td>
                    <Table.Td className='text-end'>{formatCurrency(item.rentPerDay)}</Table.Td>
                    <Table.Td className='text-end'>{formatCurrency(item.totalAmount)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        </div>
      )}
    </Drawer.Content>
  );
}

export default function RentReturnInfo(
  props: GenerateDrawerWrapperProps<RentReturnInfoContentProps>,
) {
  return <Drawer.Wrapper component={RentReturnInfoContent} size='xl' position='right' {...props} />;
}
