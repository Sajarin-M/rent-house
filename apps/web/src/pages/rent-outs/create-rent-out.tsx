import { Control, Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa6';
import { TbCheck, TbInfoTriangle, TbSettings } from 'react-icons/tb';
import { Fragment } from 'react/jsx-runtime';
import {
  ActionIcon,
  Button,
  Divider,
  HoverCard,
  Input,
  Loader,
  Popover,
  Switch,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { trpc } from '@/context/trpc';
import Avatar from '@/components/avatar';
import {
  DatePickerInput,
  NumberInput,
  PriceInput,
  Select,
  TextInput,
  Watcher,
} from '@/components/form';
import ItemTable from '@/components/item-table';
import { GenerateModalWrapperProps, Modal, ModalCommonProps } from '@/components/modal';
import { UncontrolledSearchableList } from '@/components/searchable-list';
import { formatCurrency, getFormTItle, numberOrZero } from '@/utils/fns';
import notification from '@/utils/notification';
import { RouterOutput } from '@/types';
import EditCustomer from '../customers/edit-customer';
import EditAdvancePayment, { AdvancePaymentFormValues } from './edit-advance-payment';

type CreateRentOutFormProps = ModalCommonProps & {};

type CreateRentOutFormValues = {
  date: string;
  customerId: string;
  description: string;
  rentOutItems: {
    quantity: string | number;
    rentPerDay: string | number;
    product: RouterOutput['products']['getAllProductsWithQuantityInfo'][number];
  }[];
  withAdvance: boolean;
  advance: AdvancePaymentFormValues | null;
};

function CreateRentOutForm({ onClose }: CreateRentOutFormProps) {
  const utils = trpc.useUtils();

  const [opened, handlers] = useDisclosure(false);
  const [paymentModalOpened, paymentModalHandlers] = useDisclosure(false);
  const [settingsPopoverOpened, settingsPopoverHandlers] = useDisclosure(false);

  const { data: customers = [] } = trpc.customers.getAllCustomers.useQuery();
  const { data: products = [] } = trpc.products.getAllProductsWithQuantityInfo.useQuery();

  const { control, handleSubmit, setFocus, setValue, getValues } = useForm<CreateRentOutFormValues>(
    {
      defaultValues: {
        date: new Date().toISOString(),
        description: '',
        customerId: '',
        rentOutItems: [],
        advance: null,
      },
    },
  );

  const customerId = useWatch({ control, name: 'customerId' });

  const { data: customerStatus, isPending: isCustomerStatusLoading } =
    trpc.customers.getCustomerStatus.useQuery(
      { customerId },
      {
        enabled: !!customerId,
      },
    );

  const rentOutItems = useFieldArray({ control, name: 'rentOutItems', keyName: 'key' });

  const { mutateAsync: createRentOut, isPending: isCreateRentOutLoading } =
    trpc.rentOuts.createRentOut.useMutation();

  const notificationId = 'rent-out-form-notification';

  async function onSubmit(values: CreateRentOutFormValues) {
    await createRentOut({
      ...values,
      rentOutItems: values.rentOutItems.map((item) => ({
        productId: item.product.id,
        quantity: Number(item.quantity),
        rentPerDay: Number(item.rentPerDay),
      })),
      advance:
        values.advance === null || !values.withAdvance
          ? null
          : {
              totalAmount: numberOrZero(values.advance.totalAmount),
              discountAmount: numberOrZero(values.advance.discountAmount),
              description: values.advance.description,
              receivedAmount:
                numberOrZero(values.advance.totalAmount) -
                numberOrZero(values.advance.discountAmount),
            },
    });
    notification.created('Rent out', { id: notificationId });
    utils.rentOuts.getRentOuts.invalidate();
    utils.products.getAllProductsWithQuantityInfo.invalidate();
    utils.customers.getCustomerStatus.invalidate({ customerId: values.customerId });
    onClose();
  }

  return (
    <>
      <EditCustomer
        modalProps={{ opened, onClose: handlers.close }}
        onCustomerCreated={(customer) => {
          setValue('customerId', customer.id, { shouldDirty: true });
        }}
      />

      <Watcher
        control={control}
        name={['advance']}
        render={([advance]) => (
          <EditAdvancePayment
            defaultValues={advance === null ? undefined : advance}
            modalProps={{
              opened: paymentModalOpened,
              onClose: () => {
                paymentModalHandlers.close();
                if (getValues().advance === null) {
                  setValue('withAdvance', false);
                }
              },
            }}
            onSubmit={(values) => {
              setValue('advance', values);
              paymentModalHandlers.close();
            }}
          />
        )}
      />

      <Modal.Form
        control={control}
        onCancel={onClose}
        title={getFormTItle('Rent Out')}
        isSubmitting={isCreateRentOutLoading}
        onSubmit={handleSubmit(async (values) => {
          try {
            if (!values.customerId) {
              setFocus('customerId');
              return notification.error({
                id: notificationId,
                message: 'Please select a customer',
              });
            }
            if (!values.date) {
              setFocus('date');
              return notification.error({ id: notificationId, message: 'Please select a date' });
            }
            if (values.rentOutItems.length === 0) {
              return notification.error({
                id: notificationId,
                message: 'Please add at least one item',
              });
            }
            for (let i = 0; i < values.rentOutItems.length; i++) {
              const item = values.rentOutItems[i];
              if (numberOrZero(item.quantity) <= 0) {
                return notification.error({
                  id: notificationId,
                  message: `Please add a quantity for ${item.product.name.toLowerCase()}`,
                });
              }
              if (numberOrZero(item.rentPerDay) < 0) {
                return notification.error({
                  id: notificationId,
                  message: `Please add a rent per day for ${item.product.name.toLowerCase()}`,
                });
              }
            }

            if (customerStatus && !customerStatus.isSafe) {
              return modals.openConfirmModal({
                title: 'Are you sure ?',
                children: (
                  <div>
                    <CustomerStatus customerStatus={customerStatus} />
                    <div className='my-sm'>
                      Are you sure you want to rent again to this customer?
                    </div>
                  </div>
                ),
                onConfirm: () => {
                  onSubmit(values);
                },
              });
            }

            await onSubmit(values);
          } catch (error) {}
        })}
        footer={
          <Popover
            withArrow
            position='top-start'
            opened={settingsPopoverOpened}
            onChange={settingsPopoverHandlers.toggle}
          >
            <Popover.Target>
              <ActionIcon variant='default' size='lg' onClick={settingsPopoverHandlers.toggle}>
                <TbSettings />
              </ActionIcon>
            </Popover.Target>

            <Popover.Dropdown>
              <div className='space-y-sm'>
                <Controller
                  control={control}
                  name='withAdvance'
                  render={({ field }) => (
                    <div className='gap-xl flex items-center'>
                      <Switch
                        checked={field.value}
                        label='Receive Advance'
                        onChange={(e) => {
                          field.onChange(e);
                          if (e.target.checked) {
                            paymentModalHandlers.open();
                          } else {
                            paymentModalHandlers.close();
                            setValue('advance', null);
                          }
                        }}
                      />
                      <Button
                        size='compact-sm'
                        disabled={!field.value}
                        variant='outline'
                        onClick={() => {
                          paymentModalHandlers.open();
                        }}
                      >
                        <span className='text-xs'>Edit Payment</span>
                      </Button>
                    </div>
                  )}
                />
              </div>
            </Popover.Dropdown>
          </Popover>
        }
      >
        <div className='-m-md p-md gap-md grid h-[calc(100vh-2*4.2rem)] grow grid-cols-[1fr_25rem] grid-rows-[auto_1fr]'>
          <div className='border-default-border p-md gap-md grid grid-cols-[6.5rem_1fr_var(--mantine-spacing-sm)_6.5rem_1fr] grid-rows-[1fr_1fr] items-center rounded-sm border'>
            <Input.Label required>Date</Input.Label>
            <DatePickerInput name='date' control={control} />
            <div></div>
            <Input.Label required>Customer</Input.Label>
            <div className='gap-xs grid grid-cols-[1fr_auto] items-center'>
              <Select
                data-autofocus
                name='customerId'
                control={control}
                data={customers.map((c) => ({ label: c.name, value: c.id }))}
                rightSection={
                  !!customerId && isCustomerStatusLoading ? (
                    <Loader />
                  ) : customerStatus ? (
                    <HoverCard
                      withArrow
                      arrowOffset={15}
                      position='bottom-end'
                      offset={{ crossAxis: 10, mainAxis: 25 }}
                    >
                      <HoverCard.Target>
                        <div>
                          {customerStatus.isSafe ? (
                            <TbCheck className='text-teal-6' />
                          ) : (
                            <TbInfoTriangle className='text-red-6' />
                          )}
                        </div>
                      </HoverCard.Target>
                      <HoverCard.Dropdown
                        px='xs'
                        py='0.5rem'
                        className='flex justify-center text-sm'
                      >
                        <CustomerStatus customerStatus={customerStatus} />
                      </HoverCard.Dropdown>
                    </HoverCard>
                  ) : undefined
                }
              />
              <Tooltip
                withArrow
                openDelay={1000}
                position='bottom'
                offset={{ mainAxis: 15 }}
                label='Create new customer'
              >
                <ActionIcon variant='outline' size='lg' onClick={() => handlers.open()}>
                  <FaPlus />
                </ActionIcon>
              </Tooltip>
            </div>
            <Input.Label>Description</Input.Label>
            <TextInput control={control} name='description' />
          </div>
          <GrandTotal control={control} />
          <ItemTable.TableWrapper gridTemplateColumns='1.5rem 2.5rem 1fr 8rem 8rem 2rem'>
            <ItemTable.HeadRow>
              <div>#</div>
              <div></div>
              <div>Product</div>
              <div className='text-end'>Rent Per Day</div>
              <div className='text-end'>Quantity</div>
              <div></div>
            </ItemTable.HeadRow>
            <ItemTable.DataWrapper>
              {rentOutItems.fields.map((field, index) => (
                <ItemTable.DataRow key={field.key}>
                  <div className='text-xs'>{index + 1}</div>
                  <Watcher
                    control={control}
                    name={[`rentOutItems.${index}.product`]}
                    render={([product]) => (
                      <>
                        <Avatar
                          className='size-[40px]'
                          text={product.name}
                          name={product.image ?? ''}
                        />
                        <div>{product.name}</div>
                      </>
                    )}
                  />
                  <PriceInput
                    size='xs'
                    min={0}
                    control={control}
                    name={`rentOutItems.${index}.rentPerDay`}
                    classNames={{ input: 'text-end' }}
                  />
                  <Watcher
                    control={control}
                    name={[`rentOutItems.${index}.product`]}
                    render={([product]) => (
                      <NumberInput
                        size='xs'
                        min={1}
                        control={control}
                        name={`rentOutItems.${index}.quantity`}
                        classNames={{ input: 'text-end' }}
                        max={product.remainingQuantity}
                      />
                    )}
                  />
                  <ItemTable.RemoveRowButton
                    className='ml-auto'
                    onClick={() => {
                      rentOutItems.remove(index);
                    }}
                  />
                </ItemTable.DataRow>
              ))}
            </ItemTable.DataWrapper>
          </ItemTable.TableWrapper>
          <UncontrolledSearchableList
            keyPath='id'
            items={products}
            title={(p) => p.name}
            avatar={{ name: (p) => p.name, image: (p) => p.image || '' }}
            filter={(query, p) => p.name.toLowerCase().includes(query.toLowerCase())}
            nothingFound='No items found'
            onItemClicked={(p) => {
              if (p.remainingQuantity === 0) {
                return notification.error({
                  id: notificationId,
                  message: 'Product is out of stock',
                });
              }

              const index = rentOutItems.fields.findIndex((f) => f.product.id === p.id);
              if (index !== -1) {
                return setFocus(`rentOutItems.${index}.quantity`);
              }

              rentOutItems.append(
                {
                  quantity: 1,
                  product: p,
                  rentPerDay: p.rentPerDay,
                },
                {
                  focusName: `rentOutItems.${rentOutItems.fields.length}.quantity`,
                },
              );
            }}
          />
        </div>
      </Modal.Form>
    </>
  );
}

type GrandTotalProps = {
  control: Control<CreateRentOutFormValues>;
};

function GrandTotal({ control }: GrandTotalProps) {
  const [rentOutItems, advance] = useWatch({
    control,
    name: ['rentOutItems', 'advance'],
  });

  const total = rentOutItems.reduce(
    (acc, item) => acc + numberOrZero(item.quantity) * numberOrZero(item.rentPerDay),
    0,
  );

  return (
    <div className='border-default-border p-sm gap-y-xs grid grid-cols-2 items-center rounded-sm border'>
      <span className='font-semibold'>Total</span>
      <span className='pr-[calc(1.875rem/3)] text-end font-semibold'>
        {formatCurrency(total)} / Day
      </span>
      {advance !== null && (
        <>
          <span className='text-sm'>Advance Amount</span>
          <span className='pr-[calc(1.875rem/3)] text-end text-sm'>
            {formatCurrency(numberOrZero(advance.totalAmount))}
          </span>
        </>
      )}
    </div>
  );
}

function CustomerStatus({
  customerStatus,
}: {
  customerStatus: RouterOutput['customers']['getCustomerStatus'];
}) {
  if (customerStatus.isSafe) {
    return (
      <div>
        {customerStatus.hasRentedBefore
          ? "This customer has'nt rented anything before"
          : 'This customer has rented previously and returned all of them'}
      </div>
    );
  }

  return (
    <div>
      {customerStatus.pendingItems.length > 0 && (
        <>
          <div>This customer has'nt returned the following items</div>
          <div className='mt-xs gap-x-xl grid grid-cols-[1fr_auto] gap-y-1'>
            {customerStatus.pendingItems.map((product) => (
              <Fragment key={product.id}>
                <div>{product.name}</div>
                <div className='text-end'>{product.remainingQuantity}</div>
              </Fragment>
            ))}
          </div>
        </>
      )}

      {customerStatus.pendingItems.length > 0 && customerStatus.pendingAmount > 0 && (
        <Divider my='xs' />
      )}

      {customerStatus.pendingAmount > 0 && (
        <div className='gap-x-xl grid grid-cols-[1fr_auto] gap-y-1'>
          <div>This customer has payment due</div>
          <div className='text-end'>{formatCurrency(customerStatus.pendingAmount)}</div>
        </div>
      )}
    </div>
  );
}

export default function CreateRentOut(props: GenerateModalWrapperProps<CreateRentOutFormProps>) {
  return <Modal.Wrapper component={CreateRentOutForm} fullScreen {...props} />;
}
