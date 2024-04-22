import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Collapse, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { trpc } from '@/context/trpc';
import { DatePickerInput, PriceInput, TextInput, validation, Watcher } from '@/components/form';
import { GenerateModalWrapperProps, Modal, ModalCommonProps } from '@/components/modal';
import RevealButton from '@/components/reveal-button';
import { formatCurrency, numberOrZero } from '@/utils/fns';
import notification from '@/utils/notification';

type AddRentPaymentFormProps = ModalCommonProps & {
  rentOutId: string;
};

type FormValues = {
  date: string;
  totalAmount: string | number;
  discountAmount: string | number;
  description: string;
};

function AddRentPaymentForm({ rentOutId, onClose }: AddRentPaymentFormProps) {
  const utils = trpc.useUtils();

  const { control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      date: new Date().toISOString(),
      totalAmount: '',
      discountAmount: '',
    },
  });

  const { mutateAsync: addRentPayment } = trpc.payments.addRentPayment.useMutation();

  const { data: rentAmountInfo, isPending } = trpc.rentOuts.getRentAmountInfo.useQuery(
    {
      rentOutId,
    },
    {
      gcTime: 0,
      staleTime: 0,
    },
  );

  const [moreOpened, moreHandlers] = useDisclosure(false);

  useEffect(() => {
    if (rentAmountInfo && rentAmountInfo.pendingAmount !== 0) {
      setValue('totalAmount', rentAmountInfo.pendingAmount, { shouldDirty: true });
    }
  }, [rentAmountInfo]);

  return (
    <Modal.Form
      control={control}
      onCancel={onClose}
      title='Add Payment'
      isLoading={isPending}
      onSubmit={handleSubmit(async (values) => {
        try {
          await addRentPayment({
            ...values,
            rentOutId,
            discountAmount: numberOrZero(values.discountAmount),
            totalAmount: numberOrZero(values.totalAmount),
            receivedAmount: numberOrZero(values.totalAmount) - numberOrZero(values.discountAmount),
          });
          notification.created('Payment');
          utils.rentOuts.getRentOuts.invalidate();
          utils.customers.getCustomerStatus.invalidate({ customerId: rentAmountInfo!.customerId });
          utils.rentOuts.getRentOutInfo.invalidate({ id: rentOutId });
          utils.rentOuts.getRentAmountInfo.invalidate({ rentOutId });
          onClose();
        } catch (error) {}
      })}
    >
      <Stack>
        {rentAmountInfo && (
          <div className='bg-gray-2 gap-xs dark:bg-dark-6 border-default-border p-xs grid grid-cols-[1fr_auto] rounded-sm border text-sm font-semibold [&>*:nth-child(even)]:text-end'>
            <div className='flex items-center gap-1'>
              <div>Total Rent Amount</div>
              <div className='text-xs'>
                {rentAmountInfo.status === 'Returned'
                  ? 'Items fully returned'
                  : rentAmountInfo.status === 'Pending'
                    ? 'Items not returned Yet'
                    : 'Items partially returned'}
              </div>
            </div>
            <div>{formatCurrency(rentAmountInfo.totalAmount)}</div>
            <div>Total Paid Amount</div>
            <div>{formatCurrency(rentAmountInfo.paidAmount)}</div>
            <div>Total Amount Due</div>
            <div>{formatCurrency(rentAmountInfo.pendingAmount)}</div>
          </div>
        )}
        <DatePickerInput
          withAsterisk
          label='Date'
          name='date'
          control={control}
          rules={validation().required().build()}
        />
        <Watcher
          control={control}
          name={['discountAmount']}
          render={([discountAmount]) => (
            <PriceInput
              min={0}
              name='totalAmount'
              withAsterisk
              data-autofocus
              control={control}
              label='Amount'
              classNames={{ input: 'text-end' }}
              rules={validation().required().build()}
              onChange={(value) => {
                const amount = numberOrZero(value);
                if (amount < numberOrZero(discountAmount)) {
                  setValue('discountAmount', 0, { shouldDirty: true });
                }
              }}
            />
          )}
        />

        <RevealButton
          className='ml-auto'
          revealed={moreOpened}
          onClick={() => {
            moreHandlers.toggle();
          }}
        />
        <Collapse in={moreOpened}>
          <Stack>
            <Watcher
              control={control}
              name={['totalAmount']}
              render={([totalAmount]) => (
                <PriceInput
                  min={0}
                  control={control}
                  name='discountAmount'
                  label='Discount Amount'
                  max={numberOrZero(totalAmount)}
                  disabled={numberOrZero(totalAmount) <= 0}
                  classNames={{ input: 'text-end' }}
                />
              )}
            />

            <TextInput control={control} name='description' label='Description' />

            <div className='flex justify-between'>
              <div className='text-sm font-semibold'>Received Amount</div>
              <Watcher
                control={control}
                name={['totalAmount', 'discountAmount']}
                render={([totalAmount, discountAmount]) => (
                  <div className='pr-[calc(1.875rem/3)] text-end text-sm font-semibold'>
                    {formatCurrency(numberOrZero(totalAmount) - numberOrZero(discountAmount))}
                  </div>
                )}
              />
            </div>
          </Stack>
        </Collapse>
      </Stack>
    </Modal.Form>
  );
}

export default function AddRentPayment(props: GenerateModalWrapperProps<AddRentPaymentFormProps>) {
  return (
    <Modal.Wrapper
      component={AddRentPaymentForm}
      size='calc(30rem*var(--mantine-scale))'
      {...props}
    />
  );
}
