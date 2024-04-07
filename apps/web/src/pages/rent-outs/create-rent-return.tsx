import { useState } from 'react';
import { Control, Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { TbSettings } from 'react-icons/tb';
import { ActionIcon, Button, Input, TextInput as MTextInput, Popover, Switch } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import { defaultDateFormat } from '@/context/theme';
import { trpc } from '@/context/trpc';
import Avatar from '@/components/avatar';
import { DatePickerInput, NumberInput, TextInput, validation, Watcher } from '@/components/form';
import ItemTable from '@/components/item-table';
import { GenerateModalWrapperProps, Modal, ModalCommonProps } from '@/components/modal';
import { UncontrolledSearchableList } from '@/components/searchable-list';
import { formatCurrency, numberOrZero } from '@/utils/fns';
import notification from '@/utils/notification';
import { RouterOutput } from '@/types';
import EditReturnPayment, { ReturnPaymentFormValues } from './edit-return-payment';

type CreateRentReturnFormProps = ModalCommonProps & {
  rentOutId: string;
};

type FormValues = {
  date: string;
  description: string;
  withPayment: boolean;
  returnItems: {
    quantity: string | number;
    usedDays: string | number;
    rentOutItem: RouterOutput['rentOuts']['getRentOutInfo']['rentOutItems'][number];
  }[];
  payment: ReturnPaymentFormValues | null;
};

function CreateRentReturnForm({ rentOutId, onClose }: CreateRentReturnFormProps) {
  const [paymentModalOpened, paymentModalHandlers] = useDisclosure(false);
  const [settingsPopoverOpened, settingsPopoverHandlers] = useDisclosure(false);
  const [paymentDefaultValues, setPaymentDefaultValues] =
    useState<Partial<ReturnPaymentFormValues>>();

  const { data: rentOutData, isLoading: isLoadingRentOutData } =
    trpc.rentOuts.getRentOutInfo.useQuery({
      id: rentOutId,
    });

  const { control, handleSubmit, setFocus, getValues, setValue } = useForm<FormValues>({
    defaultValues: {
      date: new Date().toISOString(),
      description: '',
      returnItems: [],
      withPayment: true,
      payment: null,
    },
  });

  const returnItems = useFieldArray({ control, name: 'returnItems', keyName: 'key' });

  const utils = trpc.useUtils();

  const { mutateAsync: createRentReturn } = trpc.rentOuts.createRentReturn.useMutation();

  function getDaysDifference() {
    return (
      dayjs(getValues().date).startOf('day').diff(dayjs(rentOutData!.date).startOf('day'), 'day') +
      1
    );
  }

  const notificationId = 'rent-return-form-notification';

  return (
    <>
      <EditReturnPayment
        defaultValues={paymentDefaultValues}
        modalProps={{
          onClose: paymentModalHandlers.close,
          opened: paymentModalOpened,
        }}
        onSubmit={(values) => {
          setValue('payment', values, { shouldDirty: true });
          paymentModalHandlers.close();
        }}
      />
      <Modal.Form
        control={control}
        onCancel={onClose}
        title='Create Rent Return'
        isLoading={isLoadingRentOutData}
        onSubmit={handleSubmit(async (values) => {
          try {
            const submitValues: Parameters<typeof createRentReturn>[0] = {
              ...values,
              rentOutId: rentOutId,
              returnItems: values.returnItems.map((item) => ({
                rentOutItemId: item.rentOutItem.id,
                rentPerDay: item.rentOutItem.rentPerDay,
                totalAmount: getItemTotal(item),
                quantity: numberOrZero(item.quantity),
                usedDays: numberOrZero(item.usedDays),
              })),
              totalAmount: getGrandTotal(values.returnItems),
              payment: values.payment
                ? {
                    totalAmount: numberOrZero(values.payment.totalAmount),
                    discountAmount: numberOrZero(values.payment.discountAmount),
                    description: values.payment.description,
                    receivedAmount:
                      numberOrZero(values.payment.totalAmount) -
                      numberOrZero(values.payment.discountAmount),
                  }
                : null,
            };
            await createRentReturn(submitValues);
            notification.created('Return', { id: notificationId });
            utils.rentOuts.getRentOuts.invalidate();
            utils.rentOuts.getRentOutInfo.invalidate({ id: rentOutId });
            onClose();
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
                  name='withPayment'
                  render={({ field }) => (
                    <div className='gap-xl flex items-center'>
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        label='Receive Payment'
                      />
                      <Button
                        size='compact-sm'
                        disabled={!field.value}
                        variant='outline'
                        onClick={() => {
                          const values = getValues();
                          if (values.payment === null) {
                            setPaymentDefaultValues({
                              totalAmount: getGrandTotal(values.returnItems),
                            });
                          } else {
                            setPaymentDefaultValues(values.payment);
                          }
                          paymentModalHandlers.open();
                        }}
                      >
                        <span className='text-xs'>Edit Payment</span>
                      </Button>
                    </div>
                  )}
                />
                <Watcher
                  control={control}
                  name={['returnItems']}
                  render={([returnItems]) => {
                    const isFullyReturning =
                      rentOutData &&
                      rentOutData.rentOutItems.every((item) => {
                        const returnItem = returnItems.find((i) => i.rentOutItem.id === item.id);
                        if (!returnItem) {
                          if (item.remainingQuantity === 0) {
                            return true;
                          }
                          return false;
                        }

                        if (item.remainingQuantity !== returnItem.quantity) {
                          return false;
                        }

                        return true;
                      });
                    return (
                      <Switch
                        label='Return All'
                        checked={isFullyReturning}
                        onChange={() => {
                          if (!isFullyReturning && rentOutData) {
                            setValue(
                              'returnItems',
                              rentOutData.rentOutItems
                                .filter((item) => item.remainingQuantity > 0)
                                .map((item) => ({
                                  rentOutItem: item,
                                  usedDays: getDaysDifference(),
                                  quantity: item.remainingQuantity,
                                })),
                            );
                          }
                        }}
                      />
                    );
                  }}
                />
              </div>
            </Popover.Dropdown>
          </Popover>
        }
      >
        <div className='-m-md p-md gap-md grid h-[calc(100vh-2*4.2rem)] grow grid-cols-[1fr_25rem] grid-rows-[auto_1fr]'>
          <div className='border-default-border p-md gap-md grid grid-cols-[6.5rem_auto_var(--mantine-spacing-sm)_6.5rem_auto] grid-rows-[1fr_1fr] items-center rounded-sm border'>
            <Input.Label required>Rented Date</Input.Label>
            <MTextInput readOnly value={dayjs(rentOutData?.date).format(defaultDateFormat)} />
            <div></div>
            <Input.Label required>Customer</Input.Label>
            <MTextInput readOnly value={rentOutData?.customer.name} />
            <Input.Label required>Return Date</Input.Label>
            <DatePickerInput
              name='date'
              control={control}
              rules={validation().required().build()}
              minDate={rentOutData?.date ? new Date(rentOutData.date) : undefined}
              onChange={(date) => {
                if (date !== null && date instanceof Date) {
                  for (let i = 0; i < returnItems.fields.length; i++) {
                    setValue(`returnItems.${i}.usedDays`, getDaysDifference(), {
                      shouldDirty: true,
                    });
                  }
                }
              }}
            />{' '}
            <div></div>
            <Input.Label required>Description</Input.Label>
            <TextInput control={control} name='description' />
          </div>
          <GrandTotal control={control} />
          <ItemTable.TableWrapper gridTemplateColumns='1.5rem 2.5rem 1fr 8rem 8rem 8rem 8rem 2rem'>
            <ItemTable.HeadRow>
              <div>#</div>
              <div></div>
              <div>Product</div>
              <div className='text-end'>Rent Per Day</div>
              <div className='text-end'>Used Days</div>
              <div className='text-end'>Quantity</div>
              <div className='text-end'>Total</div>
              <div></div>
            </ItemTable.HeadRow>
            <ItemTable.DataWrapper>
              {returnItems.fields.map((field, index) => (
                <ItemTable.DataRow key={field.key}>
                  <div className='text-xs'>{index + 1}</div>
                  <Watcher
                    control={control}
                    name={[`returnItems.${index}.rentOutItem`]}
                    render={([rentOutItem]) => (
                      <>
                        <Avatar
                          text={rentOutItem.product.name}
                          name={rentOutItem.product.image ?? ''}
                          size={40}
                        />
                        <div>{rentOutItem.product.name}</div>
                      </>
                    )}
                  />
                  <Watcher
                    control={control}
                    name={[`returnItems.${index}.rentOutItem`]}
                    render={([rentOutItem]) => (
                      <div className='mr-1 text-end text-xs'>
                        {formatCurrency(rentOutItem.rentPerDay)}
                      </div>
                    )}
                  />
                  <NumberInput
                    size='xs'
                    min={0}
                    control={control}
                    name={`returnItems.${index}.usedDays`}
                    classNames={{ input: 'text-end' }}
                  />
                  <Watcher
                    control={control}
                    name={[`returnItems.${index}.rentOutItem`]}
                    render={([rentOutItem]) => (
                      <NumberInput
                        size='xs'
                        control={control}
                        classNames={{ input: 'text-end' }}
                        name={`returnItems.${index}.quantity`}
                        min={1}
                        max={rentOutItem.remainingQuantity}
                      />
                    )}
                  />
                  <Watcher
                    control={control}
                    name={[`returnItems.${index}`]}
                    render={([returnItem]) => (
                      <div className='text-end text-sm font-semibold'>
                        {formatCurrency(getItemTotal(returnItem))}
                      </div>
                    )}
                  />
                  <ItemTable.RemoveRowButton
                    className='ml-auto'
                    onClick={() => {
                      returnItems.remove(index);
                    }}
                  />
                </ItemTable.DataRow>
              ))}
            </ItemTable.DataWrapper>
          </ItemTable.TableWrapper>
          <UncontrolledSearchableList
            keyPath='id'
            data-autofocus
            items={rentOutData?.rentOutItems ?? []}
            title={(item) => item.product.name}
            avatar={{
              name: (item) => item.product.name,
              image: (item) => item.product.image || '',
            }}
            filter={(query, item) => item.product.name.toLowerCase().includes(query.toLowerCase())}
            nothingFound='No items found'
            onItemClicked={(item) => {
              if (item.quantity === item.returnedQuantity) {
                return notification.error({
                  id: notificationId,
                  message: 'Product is fully returned',
                });
              }

              const index = returnItems.fields.findIndex((f) => f.rentOutItem.id === item.id);
              if (index !== -1) {
                return setFocus(`returnItems.${index}.quantity`);
              }

              returnItems.append(
                {
                  rentOutItem: item,
                  usedDays: getDaysDifference(),
                  quantity: item.remainingQuantity,
                },
                {
                  focusName: `returnItems.${returnItems.fields.length}.quantity`,
                },
              );
            }}
          />
        </div>
      </Modal.Form>
    </>
  );
}

function getItemTotal(returnItem: FormValues['returnItems'][number]) {
  return (
    numberOrZero(returnItem.quantity) *
    numberOrZero(returnItem.rentOutItem.rentPerDay) *
    numberOrZero(returnItem.usedDays)
  );
}

function getGrandTotal(returnItems: FormValues['returnItems']) {
  return returnItems.reduce((acc, item) => acc + getItemTotal(item), 0);
}

type GrandTotalProps = {
  control: Control<FormValues>;
};

function GrandTotal({ control }: GrandTotalProps) {
  const returnItems = useWatch({ control, name: 'returnItems' });

  const total = getGrandTotal(returnItems);

  return (
    <div className='border-default-border p-sm gap-y-xs grid grid-cols-2 items-center rounded-sm border font-semibold'>
      <span>Total</span>
      <span className='pr-[calc(1.875rem/3)] text-end'>{formatCurrency(total)}</span>
    </div>
  );
}

export default function CreateRentReturn(
  props: GenerateModalWrapperProps<CreateRentReturnFormProps>,
) {
  return <Modal.Wrapper component={CreateRentReturnForm} fullScreen {...props} />;
}
