import { useForm } from 'react-hook-form';
import { Stack } from '@mantine/core';
import { trpc } from '@/context/trpc';
import { DatePickerInput, PriceInput, validation } from '@/components/form';
import { Modal, ModalFormProps } from '@/components/modal';
import notification from '@/utils/notification';

type AddRentPaymentProps = ModalFormProps & {
  rentOutId: string;
};

function AddRentPaymentForm({ rentOutId, onClose }: AddRentPaymentProps) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      createdAt: new Date().toISOString(),
      amount: '',
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
            amount: Number(values.amount),
            rentOutId,
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
        <PriceInput
          name='amount'
          withAsterisk
          data-autofocus
          control={control}
          label='Received Amount'
          classNames={{ input: 'text-end' }}
          rules={validation().required().build()}
        />
      </Stack>
    </Modal.Form>
  );
}

const AddRentPayment = Modal.generateFormModal(AddRentPaymentForm, {
  size: 'calc(30rem*var(--mantine-scale))',
});
export default AddRentPayment;
