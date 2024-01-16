import { useForm } from 'react-hook-form';
import { trpc } from '@/context/trpc';
import { DatePickerInput, Select, validation } from '@/components/form';
import ItemTable from '@/components/item-table';
import { Modal, ModalFormProps } from '@/components/modal';
import { UncontrolledSearchableList } from '@/components/searchable-list';
import { getFormTItle } from '@/utils/fns';
import notification from '@/utils/notification';

type EditRentOutProps = ModalFormProps & {
  id?: string;
};

type FormValues = {
  createdAt: string;
  customerId: string;
  discount: string;
  rentOutItems: {
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

  const { data: products = [] } = trpc.products.getAllProducts.useQuery();
  const { data: customers = [] } = trpc.customers.getAllCustomers.useQuery();

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      createdAt: new Date().toISOString(),
      customerId: '',
      rentOutItems: [],
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
            rentOutItems: values.rentOutItems.map((item) => ({
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
      <div className='-m-md p-md gap-md grid h-[calc(100vh-2*4.2rem)] grow grid-cols-[1fr_25rem] grid-rows-[auto_1fr]'>
        <div className='border-default-border p-md gap-md grid grid-cols-2 rounded-md border'>
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
        </div>
        <div className='border-default-border rounded-md border'></div>
        <ItemTable.TableWrapper gridTemplateColumns='1fr 1fr 1fr'>
          <ItemTable.HeadRow></ItemTable.HeadRow>
          <ItemTable.DataWrapper>
            <ItemTable.DataRow></ItemTable.DataRow>
          </ItemTable.DataWrapper>
        </ItemTable.TableWrapper>
        <UncontrolledSearchableList
          keyPath='id'
          items={products}
          title={(p) => p.name}
          avatar={{ name: (p) => p.name, image: (p) => p.image || '' }}
          filter={(query, p) => p.name.toLowerCase().includes(query.toLowerCase())}
        />
      </div>
    </Modal.Form>
  );
}

const EditRentOut = Modal.generateFormModal(EditRentOutForm, { fullScreen: true, size: 'lg' });
export default EditRentOut;
