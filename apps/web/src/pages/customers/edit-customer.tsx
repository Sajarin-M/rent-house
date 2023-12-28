import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Group, Stack } from '@mantine/core';
import pick from 'lodash/pick';
import { trpc } from '@/context/trpc';
import { TextInput, validation } from '@/components/form';
import { Modal, ModalFormProps } from '@/components/modal';
import { getFormTItle } from '@/utils/fns';
import { ImageUpload, useImageUpload } from '@/utils/images';
import notification from '@/utils/notification';

type EditCustomerProps = ModalFormProps & {
  id?: string;
};

function EditCustomerForm({ id, onClose }: EditCustomerProps) {
  const isEditing = id !== undefined;

  const { data, isLoading } = trpc.customers.getCustomer.useQuery(
    { id: id! },
    { enabled: isEditing },
  );

  const imageUpload = useImageUpload({ initialValue: data?.image });
  const documentImageUpload = useImageUpload({ initialValue: data?.documentImage });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
    },
  });

  useEffect(() => {
    if (data) {
      pick(data, ['name', 'addressLine1', 'addressLine2', 'city', 'phoneNumber']);
      reset({
        name: data.name,
        phoneNumber: data.phoneNumber,
        addressLine1: data.addressLine1 ?? '',
        addressLine2: data.addressLine2 ?? '',
        city: data.city ?? '',
      });
    }
  }, [data]);

  const utils = trpc.useUtils();

  const { mutateAsync: createCustomer } = trpc.customers.createCustomer.useMutation();
  const { mutateAsync: editCustomer } = trpc.customers.editCustomer.useMutation();

  return (
    <Modal.Form
      control={control}
      onCancel={onClose}
      disableOnFresh={isEditing}
      isLoading={isEditing && isLoading}
      title={getFormTItle('Customer', isEditing)}
      checkDirty={(formDirty) => formDirty || imageUpload.isDirty}
      onSubmit={handleSubmit(async (values) => {
        try {
          imageUpload.validate();
          documentImageUpload.validate();
          const imageInfo = await imageUpload.upload();
          const documentImageInfo = await documentImageUpload.upload();
          if (isEditing) {
            await editCustomer({
              id,
              data: {
                ...values,
                image: imageInfo,
                documentImage: documentImageInfo,
              },
            });
            notification.edited('Customer');
          } else {
            await createCustomer({
              ...values,
              image: imageInfo,
              documentImage: documentImageInfo,
            });
            notification.created('Customer');
          }
          utils.customers.getAllCustomers.invalidate();
          onClose();
        } catch (error) {}
      })}
    >
      <Stack>
        <Group gap='5rem'>
          <ImageUpload.Wrapper
            label='Profile Image'
            preview={<imageUpload.Preview />}
            clear={<imageUpload.ClearButton />}
            select={<imageUpload.SelectButton />}
          />
          <ImageUpload.Wrapper
            label='Document Image'
            preview={<documentImageUpload.Preview />}
            clear={<documentImageUpload.ClearButton />}
            select={<documentImageUpload.SelectButton />}
          />
        </Group>

        <TextInput
          withAsterisk
          name='name'
          data-autofocus
          control={control}
          label='Name'
          rules={validation().required().build()}
        />
        <TextInput
          withAsterisk
          name='phoneNumber'
          control={control}
          label='Phone Number'
          rules={validation().required().build()}
        />

        <TextInput name='addressLine1' control={control} label='Address Line 1' />
        <TextInput name='addressLine2' control={control} label='Address Line 2' />
        <TextInput name='city' control={control} label='City' />
      </Stack>
    </Modal.Form>
  );
}

const EditCustomer = Modal.generateFormModal(EditCustomerForm, { size: 'lg' });
export default EditCustomer;
