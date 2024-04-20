import { Table } from '@mantine/core';
import { trpc } from '@/context/trpc';
import Avatar from '@/components/avatar';
import { Drawer, GenerateDrawerWrapperProps } from '@/components/drawer';
import { formatCurrency, formatDate } from '@/utils/fns';
import RentOutPaymentStatusBadge from './rent-out-payment-status-badge';
import RentOutStatusBadge from './rent-out-status-badge';

type RentOutInfoContentProps = {
  rentOutId: string;
};

function RentOutInfoContent({ rentOutId }: RentOutInfoContentProps) {
  const { data: rentOut, isPending } = trpc.rentOuts.getRentOutInfo.useQuery({
    id: rentOutId,
  });
  const { data: renOutPaymentInfo } = trpc.rentOuts.getRentAmountInfo.useQuery({
    rentOutId,
  });

  return (
    <Drawer.Content isLoading={isPending} title='Order Details'>
      {rentOut && renOutPaymentInfo && (
        <div>
          <div className='gap-y-xs grid grid-cols-[auto_1fr] items-center gap-x-12'>
            <span className='self-start'>Date</span>
            <span>{formatDate(rentOut.date)}</span>
            <span className='self-start'>Customer</span>
            <span>{rentOut.customer.name}</span>
            <span className='self-start'>Phone Number </span>
            <span>{rentOut.customer.phoneNumber}</span>
            {rentOut.description && (
              <>
                <span className='self-start'>Description </span>
                <span>{rentOut.description}</span>
              </>
            )}
            <span className='self-start'>Address</span>
            <span>
              {[rentOut.customer.addressLine1, rentOut.customer.addressLine2, rentOut.customer.city]
                .filter(Boolean)
                .join(' , ')}
            </span>
            <span className='self-start'>Status</span>
            <span>
              <RentOutStatusBadge status={rentOut.status} />
            </span>
            <span className='self-start'>Payment Status</span>
            <span>
              <RentOutPaymentStatusBadge status={rentOut.paymentStatus} />
            </span>
            {renOutPaymentInfo.paidAmount > 0 && (
              <>
                <span className='self-start'>Paid Amount</span>
                <span>{formatCurrency(renOutPaymentInfo.paidAmount)}</span>
              </>
            )}
            {renOutPaymentInfo.pendingAmount > 0 && (
              <>
                <span className='self-start'>Paid Amount</span>
                <span>{formatCurrency(renOutPaymentInfo.pendingAmount)}</span>
              </>
            )}
          </div>
          <Drawer.Divider className='my-md' />

          <div className='my-sm font-semibold'>Items</div>
          <div className='border-default-border overflow-hidden rounded-sm border'>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className='py-xs w-0'>No</Table.Th>
                  <Table.Th className='py-xs w-0'></Table.Th>
                  <Table.Th className='py-xs'>Product</Table.Th>
                  <Table.Th className='py-xs w-0'>Quantity</Table.Th>
                  <Table.Th className='py-xs text-end'>Rent / Day</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rentOut.rentOutItems.map((item, index) => (
                  <Table.Tr key={item.id}>
                    <Table.Td className='w-0'>{index + 1}</Table.Td>
                    <Table.Td className='w-0'>
                      <Avatar
                        text={item.product.name}
                        name={item.product.image ?? ''}
                        className='size-[35px] text-sm'
                      />
                    </Table.Td>
                    <Table.Td>{item.product.name}</Table.Td>
                    <Table.Td className='w-0'>
                      {rentOut.status === 'Partially_Returned' ? (
                        <div className='gap-x-xs grid grid-cols-[auto_auto]'>
                          <div>Rented</div>
                          <div>{item.quantity}</div>
                          <div>Returned</div>
                          <div>{item.returnedQuantity}</div>
                          <div>Remaining</div>
                          <div>{item.remainingQuantity}</div>
                        </div>
                      ) : (
                        item.quantity
                      )}
                    </Table.Td>
                    <Table.Td className='text-end'>{formatCurrency(item.rentPerDay)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>

          {/* <>
            <Drawer.Divider className='my-md' />
            <div className='my-sm font-semibold'>Returns</div>
            {rentOut.status === 'Returned' && rentOut.rentReturns.length === 1 ? (
              <div>Fully returned on {formatDateWithTime(rentOut.rentReturns[0].date)}</div>
            ) : null}
          </> */}
        </div>
      )}
    </Drawer.Content>
  );
}

export default function RentOutInfo(props: GenerateDrawerWrapperProps<RentOutInfoContentProps>) {
  return <Drawer.Wrapper component={RentOutInfoContent} size='lg' position='right' {...props} />;
}
