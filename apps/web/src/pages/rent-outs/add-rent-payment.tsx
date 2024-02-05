import { useForm } from 'react-hook-form';
import { Stack } from '@mantine/core';
import { trpc } from '@/context/trpc';
import { DatePickerInput, PriceInput, validation } from '@/components/form';
import { Modal, ModalFormProps } from '@/components/modal';
import notification from '@/utils/notification';

type AddRentProps = ModalFormProps & {
  rentOutId: string;
};

function AddRentPayment({ rentOutId, onClose }: AddRentProps) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      createdAt: '',
      amount: '',
    },
  });

  const { mutateAsync: addRentPayment } = trpc.rentOuts.addRentPayment.useMutation();

  return (
    <Modal.Form
      control={control}
      onCancel={onClose}
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
          control={control}
          label='Received Amount'
          rules={validation().required().build()}
        />
      </Stack>
    </Modal.Form>
  );
}

const AddRent = Modal.generateFormModal(AddRentPayment, { size: 'lg' });
export default AddRent;
