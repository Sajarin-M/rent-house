import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Stack } from '@mantine/core';
import { trpc } from '@/context/trpc';
import { NumberInput, PriceInput, TextInput, validation } from '@/components/form';
import { Modal, ModalFormProps } from '@/components/modal';
import { getFormTItle } from '@/utils/fns';
import { ImageUpload, useImageUpload } from '@/utils/images';
import notification from '@/utils/notification';

type EditProductProps = ModalFormProps & {
  id?: string;
};

function EditProductForm({ id, onClose }: EditProductProps) {
  const isEditing = id !== undefined;

  const { data, isLoading } = trpc.products.getProduct.useQuery(
    { id: id! },
    { enabled: isEditing },
  );

  const imageUpload = useImageUpload({ initialValue: data?.image });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      quantity: '',
      rentPerDay: '',
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        quantity: data.quantity.toString(),
        rentPerDay: data.rentPerDay.toString(),
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
      title={getFormTItle('Product', isEditing)}
      checkDirty={(formDirty) => formDirty || imageUpload.isDirty}
      onSubmit={handleSubmit(async (values) => {
        try {
          if (!imageUpload.validate()) {
            return;
          }
          const imageInfo = await imageUpload.upload();
          const submitValues = {
            ...values,
            image: imageInfo,
            quantity: Number(values.quantity),
            rentPerDay: Number(values.rentPerDay),
          };
          if (isEditing) {
            await editProduct({
              id,
              data: submitValues,
            });
            notification.edited('Product');
          } else {
            await createProduct(submitValues);
            notification.created('Product');
          }
          utils.products.getAllProducts.invalidate();
          onClose();
        } catch (error) {}
      })}
    >
      <Stack>
        <ImageUpload.Wrapper
          label='Product Image'
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
        <NumberInput
          withAsterisk
          name='quantity'
          control={control}
          label='Total Quantity'
          rules={validation().required().build()}
        />

        <PriceInput
          name='rentPerDay'
          control={control}
          label='Rent Per Day'
          rules={validation().required().build()}
        />
      </Stack>
    </Modal.Form>
  );
}

const EditProduct = Modal.generateFormModal(EditProductForm, { size: 'lg' });
export default EditProduct;
