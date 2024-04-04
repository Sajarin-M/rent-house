import { Card } from '@mantine/core';
import { trpc } from '@/context/trpc';
import Avatar from '@/components/avatar';
import { Drawer, GenerateDrawerWrapperProps } from '@/components/drawer';

type CustomerInfoProps = {
  customerId: string;
};

function CustomerInfoContent({ customerId }: CustomerInfoProps) {
  const { data: customer, isPending } = trpc.customers.getCustomer.useQuery({
    id: customerId,
  });
  const { data: renOut } = trpc.customers.getRentOutInfo.useQuery({
    id: customerId,
  });

  return (
    <Drawer.Content isLoading={isPending} title='Customer Details'>
      {customer && (
        <div>
          <div className='gap-y-xs grid grid-cols-[auto_1fr] items-center gap-x-12'>
            <span className='text-dimmed'>User Image</span>
            <Avatar
              radius={0}
              size='8rem'
              className='rounded-[4px]'
              text={customer?.name}
              name={customer?.image ?? ''}
              classNames={{ placeholder: 'text-[1.6rem]' }}
            />
            <span className='text-dimmed'>Doc Image</span>

            <Avatar
              radius={0}
              size='8rem'
              className='rounded-[4px]'
              text={customer?.name}
              name={customer?.image ?? ''}
              classNames={{ placeholder: 'text-[1.6rem]' }}
            />
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
          </div>

          <Drawer.Divider className='my-md' />

          <p className='mb-3 font-semibold'>Items</p>

          <Card className='w-full min-w-0' radius='md' padding={0} withBorder>
            <div className='divide-default-border divide-y p-0'>
              {renOut?.rentOutItems.map((item) => {
                return (
                  <div key={item.id} className='p-4'>
                    <div className='flex gap-x-4 '>
                      <Avatar text={item.product.name} name={item.product.image ?? ''} size={55} />
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
        </div>
      )}
    </Drawer.Content>
  );
}
export default function CustomerInfo(props: GenerateDrawerWrapperProps<CustomerInfoProps>) {
  return <Drawer.Wrapper component={CustomerInfoContent} size='lg' position='right' {...props} />;
}
