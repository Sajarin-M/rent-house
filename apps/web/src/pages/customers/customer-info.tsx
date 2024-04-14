import { Badge } from '@mantine/core';
import { trpc } from '@/context/trpc';
import Avatar from '@/components/avatar';
import { Drawer, GenerateDrawerWrapperProps } from '@/components/drawer';
import { formatCurrency, formatDateWithTime } from '@/utils/fns';
import { getImageUrl } from '@/utils/images';

type CustomerInfoProps = {
  customerId: string;
};

function CustomerInfoContent({ customerId }: CustomerInfoProps) {
  const { data: customer, isPending: isCustomerPending } = trpc.customers.getCustomer.useQuery({
    id: customerId,
  });

  const { data: customerStatus, isPending: isCustomerStatusPending } =
    trpc.customers.getCustomerStatus.useQuery({
      customerId,
    });

  const isPending = isCustomerPending || isCustomerStatusPending;

  return (
    <Drawer.Content isLoading={isPending} title='Customer Details'>
      {customer && customerStatus && (
        <div>
          {customer.images.length > 0 && (
            <div className='gap-md mb-md flex flex-wrap items-center'>
              {customer.images.map((image) => (
                <img
                  key={image}
                  src={getImageUrl(image)}
                  className='border-default-border aspect-auto h-[8rem] rounded-sm object-contain'
                />
              ))}
            </div>
          )}
          <div className='gap-y-sm grid grid-cols-[10rem_1fr] items-center'>
            <span className='self-start'>Name</span>
            <span>{customer.name}</span>
            <span className='self-start'>Phone Number </span>
            <span>{customer.phoneNumber}</span>
            <span className='self-start'>Address</span>
            <span>
              {[customer.addressLine1, customer.addressLine2, customer.city]
                .filter(Boolean)
                .join(' , ')}
            </span>
            <span className='self-start'>Registered On</span>
            <span>{formatDateWithTime(customer.createdAt)}</span>
            <span className='self-start'>About</span>
            <span>
              {customerStatus.isSafe
                ? customerStatus.hasRentedBefore
                  ? "This customer has'nt rented anything before"
                  : 'This customer has rented previously and returned all of them'
                : 'This customer has some settlements pending'}
            </span>
          </div>

          {(customerStatus.pendingAmount > 0 || customerStatus.pendingItems.length > 0) && (
            <Drawer.Divider className='my-md' />
          )}

          {customerStatus.pendingAmount > 0 && (
            <div className='grid grid-cols-[10rem_1fr] items-center font-semibold'>
              <div className='font-semibold'>Pending Amount</div>
              <div>₹ {formatCurrency(customerStatus.pendingAmount)}</div>
            </div>
          )}

          {customerStatus.pendingItems.length > 0 && (
            <>
              <div className='my-sm font-semibold'>Pending Items</div>
              <div className='divide-default-border border-default-border bg-gray-1 dark:bg-dark-6/50 divide-y rounded-sm border'>
                {customerStatus.pendingItems.map((item) => {
                  return (
                    <div key={item.id} className='p-md'>
                      <div className='gap-x-md flex items-center'>
                        <Avatar text={item.name} name={item.image ?? ''} size={50} />
                        <div className='truncate text-sm font-semibold'>{item.name}</div>
                        <Badge size='lg' variant='default' className='ml-auto'>
                          {item.remainingQuantity}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </Drawer.Content>
  );
}
export default function CustomerInfo(props: GenerateDrawerWrapperProps<CustomerInfoProps>) {
  return <Drawer.Wrapper component={CustomerInfoContent} size='lg' position='right' {...props} />;
}
