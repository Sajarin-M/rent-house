import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Stack } from '@mantine/core';
import { trpc } from '@/context/trpc';
import { TextInput, validation } from '@/components/form';
import { Modal, ModalFormProps } from '@/components/modal';
import { getFormTItle } from '@/utils/fns';
import { ImageUpload, useImageUpload } from '@/utils/images';
import notification from '@/utils/notification';

type EditProductProps = ModalFormProps & {
  id?: string;
};

function EditProductForm({ id, onClose }: EditProductProps) {
  const isEditing = id !== undefined;

  const { data, isLoading } = trpc.products.getProducts.useQuery(
    { id: id! },
    { enabled: isEditing },
  );

  const imageUpload = useImageUpload({ initialValue: data?.image });
  //   const documentImageUpload = useImageUpload({ initialValue: data?.documentImage });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      quantity: 0,
      rentPerDay: 0,
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        quantity: data.quantity,
        rentPerDay: data.rentPerDay,
      });
    }
  }, [data]);

  const utils = trpc.useUtils();

  const { mutateAsync: createProduct } = trpc.products.createProduct.useMutation();
  const { mutateAsync: editProduct } = trpc.products.editProduct.useMutation();

  return (
    <Modal.Form
      control={control}
      onCancel={onClose}
      disableOnFresh={isEditing}
      isLoading={isEditing && isLoading}
      title={getFormTItle('Products', isEditing)}
      checkDirty={(formDirty) => formDirty || imageUpload.isDirty}
      onSubmit={handleSubmit(async (values) => {
        try {
          if (!imageUpload.validate()) {
            return;
          }
          const imageInfo = await imageUpload.upload();
          //   const documentImageInfo = await documentImageUpload.upload();
          if (isEditing) {
            await editProduct({
              id,
              data: {
                ...values,
                image: imageInfo,
                // documentImage: documentImageInfo,
              },
            });
            notification.edited('Customer');
          } else {
            await createProduct({
              ...values,
              image: imageInfo,
              //   documentImage: documentImageInfo,
            });
            notification.created('Customer');
          }
          utils.customers.getAllCustomers.invalidate();
          onClose();
        } catch (error) {}
      })}
    >
      <Stack>
        <ImageUpload.Wrapper
          label='Profile Image'
          error={imageUpload.error}
          preview={<imageUpload.Preview />}
          clear={<imageUpload.ClearButton />}
          select={<imageUpload.SelectButton />}
        />

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
          name='quantity'
          control={control}
          label='Quantity'
          rules={validation().required().build()}
        />

        <TextInput name='rentPerDay' control={control} label='Rent Per Day' />
      </Stack>
    </Modal.Form>
  );
}

const EditProduct = Modal.generateFormModal(EditProductForm, { size: 'lg' });
export default EditProduct;
