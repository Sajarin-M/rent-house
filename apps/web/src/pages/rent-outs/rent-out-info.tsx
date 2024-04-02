import { Card } from '@mantine/core';
import { trpc } from '@/context/trpc';
import Avatar from '@/components/avatar';
import { Drawer, GenerateDrawerWrapperProps } from '@/components/drawer';
import { formatDate } from '@/utils/fns';

type RentOutInfoContentProps = {
  rentOutId: string;
};

function RentOutInfoContent({ rentOutId }: RentOutInfoContentProps) {
  const { data: renOut, isPending } = trpc.rentOuts.getRentOutInfo.useQuery({
    id: rentOutId,
  });
  const { data: renOutPaymentInfo } = trpc.rentOuts.getRentAmountInfo.useQuery({
    rentOutId,
  });

  return (
    <Drawer.Content isLoading={isPending} title='Order Details'>
      {renOut && (
        <div>
          <div className='gap-y-xs grid grid-cols-[auto_1fr] items-center gap-x-12'>
            <span className='text-dimmed'>Date</span>
            <span>{formatDate(renOut.date)}</span>
            <span className='text-dimmed'>Name</span>
            <span>{renOut.customer.name}</span>
            <span className='text-dimmed self-start'>Phone Number </span>
            <span>{renOut.customer.phoneNumber}</span>
            <span className='text-dimmed'>Address</span>
            <span>
              {[renOut.customer.addressLine1, renOut.customer.addressLine2, renOut.customer.city]
                .filter(Boolean)
                .join(' , ')}
            </span>
            {/* <span className='text-dimmed'>Total Amount</span>
            <span>{renOutPaymentInfo?.totalAmount}</span> */}
            <span className='text-dimmed'>Paid Amount</span>
            <span>{renOutPaymentInfo?.paidAmount}</span>
            {/* <span className='text-dimmed'>Pending Amount</span>
            <span>{renOutPaymentInfo?.pendingAmount}</span> */}
          </div>
          <Drawer.Divider className='my-md' />
          <p className='mb-3 font-semibold'>Items :</p>
          <Card className='w-full min-w-0' radius='md' padding={0} withBorder>
            <div className='divide-default-border divide-y p-0'>
              {renOut?.rentOutItems.map((item) => {
                return (
                  <div key={item.id} className='p-4'>
                    <div className='flex gap-x-4 '>
                      <Avatar text={item.product.name} name={item.product.image ?? ''} size={60} />
                      <div className='mt-1 flex flex-col gap-1 truncate text-sm'>
                        <h4 className='truncate font-semibold'>{item.product.name}</h4>
                        <span className='truncate font-semibold'>Rent/Day : {item.rentPerDay}</span>
                        <span className='truncate font-semibold'>Quantity : {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Drawer.Divider className='my-md' />
          <p className='font-semibold'>Rent Returned Items :</p>
        </div>
      )}
    </Drawer.Content>
  );
}

export default function RentOutInfo(props: GenerateDrawerWrapperProps<RentOutInfoContentProps>) {
  return <Drawer.Wrapper component={RentOutInfoContent} size='lg' position='right' {...props} />;
}
