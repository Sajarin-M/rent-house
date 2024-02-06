import { useForm } from 'react-hook-form';
import { Stack } from '@mantine/core';
import { trpc } from '@/context/trpc';
import { DatePickerInput, PriceInput, validation, Watcher } from '@/components/form';
import { Modal, ModalFormProps, ModalRootProps } from '@/components/modal';
import { formatCurrency, numberOrZero } from '@/utils/fns';
import notification from '@/utils/notification';

type AddRentPaymentFormProps = ModalFormProps & {
  rentOutId: string;
};

type FormValues = {
  createdAt: string;
  amount: string | number;
  discountAmount: string | number;
};

function AddRentPaymentForm({ rentOutId, onClose }: AddRentPaymentFormProps) {
  const { control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      createdAt: new Date().toISOString(),
      amount: '',
      discountAmount: '',
    },
  });

  const { mutateAsync: addRentPayment } = trpc.rentOuts.addRentPayment.useMutation();

  return (
    <Modal.Form
      control={control}
      onCancel={onClose}
      title='Add Payment'
      onSubmit={handleSubmit(async (values) => {
        try {
          const submitValues = {
            ...values,
            rentOutId,
            discountAmount: Number(values.discountAmount),
            totalAmount: Number(values.amount),
            receivedAmount: Number(values.amount) - Number(values.discountAmount),
          };

          await addRentPayment(submitValues);
          notification.created('Payment');

          onClose();
        } catch (error) {}
      })}
    >
      <Stack>
        <DatePickerInput
          withAsterisk
          label='Date'
          name='createdAt'
          control={control}
          rules={validation().required().build()}
        />
        <Watcher
          control={control}
          name={['discountAmount']}
          render={([discountAmount]) => (
            <PriceInput
              name='amount'
              withAsterisk
              data-autofocus
              control={control}
              label='Amount'
              classNames={{ input: 'text-end' }}
              rules={validation().required().build()}
              onChange={(value) => {
                const amount = numberOrZero(value);
                if (amount < numberOrZero(discountAmount)) {
                  setValue('discountAmount', 0);
                }
              }}
            />
          )}
        />

        <Watcher
          control={control}
          name={['amount']}
          render={([amount]) => (
            <PriceInput
              min={0}
              control={control}
              name='discountAmount'
              label='Discount Amount'
              max={numberOrZero(amount)}
              disabled={numberOrZero(amount) <= 0}
              classNames={{ input: 'text-end' }}
            />
          )}
        />
        <div className='flex justify-between'>
          <div className='font-semibold'>Received Amount</div>
          <Watcher
            control={control}
            name={['amount', 'discountAmount']}
            render={([amount, discountAmount]) => (
              <div className='pr-[calc(1.875rem/3)] text-end font-semibold'>
                {formatCurrency(numberOrZero(amount) - numberOrZero(discountAmount))}
              </div>
            )}
          />
        </div>
      </Stack>
    </Modal.Form>
  );
}

export default function AddRentPayment({
  modalProps,
  ...rest
}: Omit<AddRentPaymentFormProps, 'onClose'> & { modalProps: ModalRootProps }) {
  return (
    <Modal.Root size='calc(30rem*var(--mantine-scale))' {...modalProps}>
      <AddRentPaymentForm {...rest} onClose={modalProps.onClose} />
    </Modal.Root>
  );
}
