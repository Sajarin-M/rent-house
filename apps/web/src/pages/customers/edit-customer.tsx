import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Stack } from '@mantine/core';
import { trpc } from '@/context/trpc';
import AddButton from '@/components/add-button';
import { CameraView } from '@/components/camera';
import { TextInput, validation } from '@/components/form';
import ImageUpload from '@/components/image-upload';
import { GenerateModalWrapperProps, Modal, ModalCommonProps } from '@/components/modal';
import { getFormTItle } from '@/utils/fns';
import { useImageUpload } from '@/utils/images';
import notification from '@/utils/notification';
import { RouterOutput } from '@/types';

type EditCustomerFormProps = ModalCommonProps & {
  id?: string;
  onCustomerCreated?: (customer: RouterOutput['customers']['createCustomer']) => void;
};

function EditCustomerForm({ id, onClose, onCustomerCreated }: EditCustomerFormProps) {
  const isEditing = id !== undefined;

  const { data, isPending } = trpc.customers.getCustomer.useQuery(
    { id: id! },
    { enabled: isEditing },
  );

  const imageUpload = useImageUpload({
    required: (index) => index > 0,
    initialValues: data && data.images.length > 0 ? data.images : [null],
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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

  console.log(imageUpload.files);

  return (
    <Modal.Form
      control={control}
      onCancel={onClose}
      disableOnFresh={isEditing}
      isLoading={isEditing && isPending}
      title={getFormTItle('Customer', isEditing)}
      checkDirty={(formDirty) => formDirty || imageUpload.isDirty}
      onSubmit={handleSubmit(async (values) => {
        try {
          if (!imageUpload.validateAll()) {
            return;
          }
          const imagesInfo = await imageUpload.uploadAll();

          const submitValues = {
            ...values,
            images: imagesInfo.filter(Boolean),
          };

          if (isEditing) {
            await editCustomer({
              id,
              data: submitValues,
            });
            notification.edited('Customer');
          } else {
            const createdCustomer = await createCustomer(submitValues);
            onCustomerCreated?.(createdCustomer);
            notification.created('Customer');
          }
          utils.customers.getAllCustomers.invalidate();
          onClose();
        } catch (error) {}
      })}
    >
      <CameraView
        onCapture={(imageFile) => {
          if (selectedImageIndex === null) {
            if (imageUpload.files.length > 0) {
              const nextImageIndex = imageUpload.files.findIndex(
                (file, index) =>
                  file === null && (!imageUpload.imageNames[index] || imageUpload.cleared[index]),
              );
              if (nextImageIndex !== -1) {
                return imageUpload.onChange(nextImageIndex, imageFile);
              }
            }
            return imageUpload.addImage(imageFile);
          }

          imageUpload.onChange(selectedImageIndex, imageFile);
          setSelectedImageIndex(null);
        }}
      />
      <Stack>
        <ImageUpload.Group label='Images' error={imageUpload.errors.find(Boolean) ?? undefined}>
          {imageUpload.files.map((_, index) => {
            const { url, revokeUrl, setUploadRef, onChange, onClear, onDelete } =
              imageUpload.getImageProps(index);
            return (
              <ImageUpload.Wrapper
                key={index}
                clear={<ImageUpload.ClearButton onClick={onClear} />}
                select={<ImageUpload.SelectButton ref={setUploadRef} onChange={onChange} />}
                preview={
                  <ImageUpload.Preview
                    src={url}
                    onLoad={revokeUrl}
                    isSelected={selectedImageIndex === index}
                    onClick={() => {
                      setSelectedImageIndex(index);
                    }}
                  />
                }
                delete={
                  imageUpload.files.length === 1 && index === 0 ? undefined : (
                    <ImageUpload.DeleteButton onClick={onDelete} />
                  )
                }
              />
            );
          })}
        </ImageUpload.Group>
        <AddButton
          className='self-start'
          onClick={() => {
            imageUpload.addImage();
          }}
        >
          Add Image
        </AddButton>

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

export default function EditCustomer(props: GenerateModalWrapperProps<EditCustomerFormProps>) {
  return <Modal.Wrapper component={EditCustomerForm} size='lg' {...props} />;
}
