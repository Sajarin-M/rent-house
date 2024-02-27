import { Card } from '@mantine/core';
import { trpc } from '@/context/trpc';
import Avatar from '@/components/avatar';
import Drawer from '@/components/drawer';

type OrderInfoContentProps = {
  rentOutId: string;
};

function RentOutInfoContent({ rentOutId }: OrderInfoContentProps) {
  const { data } = trpc.rentOuts.getRentOutInfo.useQuery({ id: rentOutId });

  return (
    <Drawer.Content title='Order Details'>
      <div className='gap-y-xs grid grid-cols-[auto_1fr] items-center gap-x-12'>
        <span className='text-dimmed'>Date</span>
        {/* <span>{formatDate(data?.createdAt)}</span> */}
        <span>date</span>
        <span className='text-dimmed'>Name</span>
        <span>{data?.customer.name}</span>
        <span className='text-dimmed self-start'>Phone Number </span>
        <span>{data?.customer.phoneNumber}</span>
        <span className='text-dimmed'>Address 1</span>
        <span>
          {data?.customer.addressLine1} , {data?.customer.addressLine2} , {data?.customer.city}
        </span>
      </div>
      <Drawer.Divider className='my-md' />
      <p className='mb-3 text-center'>Items</p>
      <Card className='w-full min-w-0' radius='md' padding={0} withBorder>
        <div className='divide-default-border divide-y p-0'>
          {data?.rentOutItems.map((item) => {
            return (
              <div key={item.id} className='p-4'>
                <div className='flex gap-x-4 '>
                  <Avatar text={item.product.name} name={item.product.image ?? ''} size={55} />

                  <div className='mt-1 flex flex-col gap-1 truncate text-sm'>
                    <h4 className='truncate font-semibold'>{item.product.name}</h4>
                    {/* <div className='flex gap-2 font-semibold'>
                      {discountPercentage > 0 && (
                        <>
                          <span className='text-green-9 dark:text-green-7'>
                            {discountPercentage}% off
                          </span>
                          <span className='text-muted-foreground line-through'>
                            {formatMoney(item.subtotal)}
                          </span>
                        </>
                      )}
                      <span className='text-green-9 dark:text-green-7'>
                        {formatMoney(item.total)}
                      </span>
                    </div> */}
                    <span className='truncate font-semibold'>Quantity : {item.quantity}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {/* {order.lineItems.map((item) => {
              const discountPercentage = Math.floor(
                (100 * (item.subtotal - item.total)) / item.subtotal,
              );
              return (
                <div key={item.id} className='p-4'>
                  <div className='flex gap-4'>
                    {item.product.images[0] && (
                      <Image
                        src={getImageUrl(item.product.images[0].image.name)}
                        className='h-24 w-24 shrink-0 rounded-md object-contain'
                      />
                    )}
                    <div className='mt-1 flex flex-col gap-1 truncate text-sm'>
                      <h4 className='truncate font-semibold'>{item.product.name}</h4>
                      <div className='flex gap-2 font-semibold'>
                        {discountPercentage > 0 && (
                          <>
                            <span className='text-green-9 dark:text-green-7'>
                              {discountPercentage}% off
                            </span>
                            <span className='text-muted-foreground line-through'>
                              {formatMoney(item.subtotal)}
                            </span>
                          </>
                        )}
                        <span className='text-green-9 dark:text-green-7'>
                          {formatMoney(item.total)}
                        </span>
                      </div>
                      <span className='truncate font-semibold'>Quantity : {item.quantity}</span>
                    </div>
                  </div>
                </div>
              );
            })} */}
        </div>
      </Card>
      <Drawer.Divider className='my-md' />
      <p className='text-center'>Rent Amount Received</p>
    </Drawer.Content>
  );
}
const RentOutInfo = Drawer.generateDrawer(RentOutInfoContent, { size: 'lg', position: 'right' });
export default RentOutInfo;
