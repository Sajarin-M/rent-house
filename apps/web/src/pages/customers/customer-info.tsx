import { trpc } from '@/context/trpc';
import Avatar from '@/components/avatar';
import { Drawer, GenerateDrawerWrapperProps } from '@/components/drawer';
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
          <div className='gap-sm flex items-center'>
            {customer.image && (
              <img
                className='border-default-border size-[9rem] rounded-sm'
                src={getImageUrl(customer.image)}
                alt='Customer Image'
              />
            )}
            {customer.documentImage && (
              <img
                className='border-default-border size-[9rem] rounded-sm'
                src={getImageUrl(customer.documentImage)}
                alt='Customer Image'
              />
            )}
          </div>
          <div className='gap-y-xs grid grid-cols-[auto_1fr] items-center gap-x-12'>
            <span className='text-dimmed'>Name</span>
            <span>{customer.name}</span>
            <span className='text-dimmed self-start'>Phone Number </span>
            <span>{customer.phoneNumber}</span>
            <span className='text-dimmed'>Address</span>
            <span>
              {[customer.addressLine1, customer.addressLine2, customer.city]
                .filter(Boolean)
                .join(' , ')}
            </span>
            d
          </div>

          <Drawer.Divider className='my-md' />

          <p className='mb-3 font-semibold'>Pending Items</p>

          <div className='divide-default-border border-default-border divide-y rounded-sm border'>
            {customerStatus.pendingItems.map((item) => {
              return (
                <div key={item.id} className='p-4'>
                  <div className='flex gap-x-4 '>
                    <Avatar text={item.name} name={item.image ?? ''} size={55} />
                    <div className='mt-1 flex flex-col gap-1 truncate text-sm'>
                      <h4 className='truncate font-semibold'>{item.name}</h4>
                      <span className='truncate font-semibold'>
                        Quantity : {item.remainingQuantity}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Drawer.Content>
  );
}
export default function CustomerInfo(props: GenerateDrawerWrapperProps<CustomerInfoProps>) {
  return <Drawer.Wrapper component={CustomerInfoContent} size='lg' position='right' {...props} />;
}
