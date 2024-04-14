import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Stack } from '@mantine/core';
import { trpc } from '@/context/trpc';
import { CameraView } from '@/components/camera';
import { NumberInput, PriceInput, TextInput, validation } from '@/components/form';
import ImageUpload from '@/components/image-upload';
import { GenerateModalWrapperProps, Modal, ModalCommonProps } from '@/components/modal';
import { getFormTItle } from '@/utils/fns';
import { useImageUpload } from '@/utils/images';
import notification from '@/utils/notification';

type EditProductFormProps = ModalCommonProps & {
  id?: string;
};

function EditProductForm({ id, onClose }: EditProductFormProps) {
  const isEditing = id !== undefined;

  const { data, isLoading } = trpc.products.getProduct.useQuery(
    { id: id! },
    { enabled: isEditing },
  );

  const imageUpload = useImageUpload({ initialValues: data && data.image ? [data.image] : [null] });

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

  const { url, revokeUrl, setUploadRef, onChange, onClear } = imageUpload.getImageProps(0);

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
          if (!imageUpload.validateAll()) {
            return;
          }
          const imageInfo = await imageUpload.uploadAll();
          const submitValues:
            | Parameters<typeof createProduct>[0]
            | Parameters<typeof editProduct>[0]['data'] = {
            ...values,
            image: imageInfo[0] || null,
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
          utils.products.getAllProductsWithQuantityInfo.invalidate();
          onClose();
        } catch (error) {}
      })}
    >
      <CameraView
        onCapture={(imageFile) => {
          imageUpload.onChange(0, imageFile);
        }}
      />
      <Stack>
        <ImageUpload.Wrapper
          label='Product Image'
          error={imageUpload.errors[0]}
          clear={<ImageUpload.ClearButton onClick={onClear} />}
          select={<ImageUpload.SelectButton ref={setUploadRef} onChange={onChange} />}
          preview={<ImageUpload.Preview src={url} onLoad={revokeUrl} />}
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
          rules={validation().required().min(1).build()}
          min={1}
        />

        <PriceInput
          name='rentPerDay'
          control={control}
          label='Rent Per Day'
          rules={validation().required().min(0).build()}
          min={0}
        />
      </Stack>
    </Modal.Form>
  );
}

export default function EditProduct(props: GenerateModalWrapperProps<EditProductFormProps>) {
  return <Modal.Wrapper component={EditProductForm} size='lg' {...props} />;
}
