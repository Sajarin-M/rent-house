import { useForm } from 'react-hook-form';
import { trpc } from '@/context/trpc';
import { DatePickerInput, PriceInput, Select, validation } from '@/components/form';
import { Modal, ModalFormProps } from '@/components/modal';
import { getFormTItle } from '@/utils/fns';
import notification from '@/utils/notification';

type EditRentOutProps = ModalFormProps & {
  id?: string;
};

type FormValues = {
  createdAt: string;
  customerId: string;
  discount: string;
  items: {
    productId: string;
    quantity: string;
    rentPerDay: string;
  }[];
};

function EditRentOutForm({ id, onClose }: EditRentOutProps) {
  const isEditing = id !== undefined;

  // const { data, isLoading } = trpc.rentOuts.getRentOut.useQuery(
  //   { id: id! },
  //   { enabled: isEditing },
  // );

  const { data: customers = [] } = trpc.customers.getAllCustomers.useQuery();

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      createdAt: new Date().toISOString(),
      customerId: '',
      discount: '',
      items: [],
    },
  });

  // useEffect(() => {
  //   if (data) {
  //     reset({
  //       name: data.name,
  //       phoneNumber: data.phoneNumber,
  //       addressLine1: data.addressLine1 ?? '',
  //       addressLine2: data.addressLine2 ?? '',
  //       city: data.city ?? '',
  //     });
  //   }
  // }, [data]);

  const utils = trpc.useUtils();

  const { mutateAsync: createRentOut } = trpc.rentOuts.createRentOut.useMutation();
  const { mutateAsync: editRentOut } = trpc.rentOuts.editRentOut.useMutation();

  return (
    <Modal.Form
      control={control}
      onCancel={onClose}
      disableOnFresh={isEditing}
      // isLoading={isEditing && isLoading}
      title={getFormTItle('Rent Out', isEditing)}
      onSubmit={handleSubmit(async (values) => {
        try {
          const submitValues = {
            ...values,
            discount: Number(values.discount),
            items: values.items.map((item) => ({
              ...item,
              quantity: Number(item.quantity),
              rentPerDay: Number(item.rentPerDay),
            })),
          };

          if (isEditing) {
            await editRentOut({
              id,
              data: submitValues,
            });
            notification.edited('Rent Out');
          } else {
            await createRentOut(submitValues);
            notification.created('Rent Out');
          }
          utils.rentOuts.getRentOuts.invalidate();
          onClose();
        } catch (error) {}
      })}
    >
      <div className='-m-md p-md gap-md grid h-[calc(100vh-2*4.2rem)] grow grid-cols-[1fr_20rem] grid-rows-[auto_1fr]'>
        <div className='border-default-border p-md gap-md grid grid-cols-3 rounded-md border'>
          <DatePickerInput
            withAsterisk
            label='Date'
            name='createdAt'
            control={control}
            rules={validation().required().build()}
          />
          <Select
            withAsterisk
            data-autofocus
            label='Customer'
            name='customerId'
            control={control}
            rules={validation().required().build()}
            data={customers.map((c) => ({ label: c.name, value: c.id }))}
          />
          <PriceInput
            min={0}
            name='discount'
            label='Discount'
            control={control}
            rules={validation().min(0).build()}
            classNames={{ input: 'text-end' }}
          />
        </div>
        <div className='border-default-border rounded-md border'></div>
        <div className='border-default-border rounded-md border'></div>
        <div className='border-default-border rounded-md border'></div>
        {/* <TextInput
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
        <TextInput name='city' control={control} label='City' /> */}
      </div>
    </Modal.Form>
  );
}

const EditRentOut = Modal.generateFormModal(EditRentOutForm, { fullScreen: true, size: 'lg' });
export default EditRentOut;
