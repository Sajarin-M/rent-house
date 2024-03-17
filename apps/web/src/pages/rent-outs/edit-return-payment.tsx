import { useForm } from 'react-hook-form';
import { Stack } from '@mantine/core';
import { PriceInput, TextInput, validation, Watcher } from '@/components/form';
import { Modal, ModalFormProps, ModalRootProps } from '@/components/modal';
import { formatCurrency, numberOrZero } from '@/utils/fns';

export type ReturnPaymentFormValues = {
  totalAmount: string | number;
  discountAmount: string | number;
  description: string;
};

export type EditReturnPaymentFormProps = ModalFormProps & {
  defaultValues?: Partial<ReturnPaymentFormValues>;
  onSubmit: (values: ReturnPaymentFormValues) => void;
};

function EditReturnPaymentForm({ onClose, onSubmit, defaultValues }: EditReturnPaymentFormProps) {
  const { control, handleSubmit, setValue } = useForm<ReturnPaymentFormValues>({
    defaultValues: {
      totalAmount: '',
      discountAmount: '',
      description: '',
      ...defaultValues,
    },
  });

  return (
    <Modal.Form
      title='Payment'
      disableOnFresh
      control={control}
      onCancel={onClose}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Stack>
        <Watcher
          control={control}
          name={['discountAmount']}
          render={([discountAmount]) => (
            <PriceInput
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
                  setValue('discountAmount', 0);
                }
              }}
            />
          )}
        />

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
    </Modal.Form>
  );
}

export type EditReturnPaymentProps = Omit<EditReturnPaymentFormProps, 'onClose'> & {
  modalProps: ModalRootProps;
};

export default function EditReturnPayment({ modalProps, ...rest }: EditReturnPaymentProps) {
  return (
    <Modal.Root size='calc(30rem*var(--mantine-scale))' {...modalProps}>
      <EditReturnPaymentForm {...rest} onClose={modalProps.onClose} />
    </Modal.Root>
  );
}
