import { Control, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa6';
import { ActionIcon, Input, ModalRootProps, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { trpc } from '@/context/trpc';
import Avatar from '@/components/avatar';
import {
  DatePickerInput,
  NumberInput,
  PriceInput,
  Select,
  TextInput,
  Watcher,
} from '@/components/form';
import ItemTable from '@/components/item-table';
import { Modal, ModalFormProps } from '@/components/modal';
import { UncontrolledSearchableList } from '@/components/searchable-list';
import { formatCurrency, getFormTItle, numberOrZero } from '@/utils/fns';
import notification from '@/utils/notification';
import { ProductVm } from '@/types';
import EditCustomer from '../customers/edit-customer';

type EditRentOutFormProps = ModalFormProps & {
  rentOutId?: string;
};

type FormValues = {
  createdAt: string;
  customerId: string;
  discountAmount: string | number;
  description: string;
  rentOutItems: {
    quantity: string | number;
    rentPerDay: string | number;
    product: ProductVm;
  }[];
};

function EditRentOutForm({ rentOutId, onClose }: EditRentOutFormProps) {
  const isEditing = rentOutId !== undefined;
  const [opened, handlers] = useDisclosure(false);
  // const [selectedCustomerId, setSelectedCustomerId] = useState<string>();

  // const { data, isLoading } = trpc.rentOuts.getRentOut.useQuery(
  //   { id: id! },
  //   { enabled: isEditing },
  // );

  const { data: products = [] } = trpc.products.getAllProducts.useQuery();
  const { data: customers = [] } = trpc.customers.getAllCustomers.useQuery();

  const { control, handleSubmit, setFocus, setValue } = useForm<FormValues>({
    defaultValues: {
      createdAt: new Date().toISOString(),
      description: '',
      discountAmount: '',
      customerId: '',
      rentOutItems: [],
    },
  });

  const rentOutItems = useFieldArray({ control, name: 'rentOutItems', keyName: 'key' });

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
    <>
      <EditCustomer
        modalProps={{ opened, onClose: handlers.close }}
        onCustomerCreated={(customer) => {
          setValue('createdAt', customer.id);
        }}
      />

      <Modal.Form
        control={control}
        onCancel={onClose}
        disableOnFresh={isEditing}
        // isLoading={isEditing && isLoading}
        title={getFormTItle('Rent Out', isEditing)}
        onSubmit={handleSubmit(async (values) => {
          try {
            if (!values.customerId) {
              setFocus('customerId');
              return notification.error({ message: 'Please select a customer' });
            }
            if (!values.createdAt) {
              setFocus('createdAt');
              return notification.error({ message: 'Please select a date' });
            }
            if (values.rentOutItems.length === 0) {
              return notification.error({ message: 'Please add at least one item' });
            }
            for (let i = 0; i < values.rentOutItems.length; i++) {
              const item = values.rentOutItems[i];
              if (numberOrZero(item.quantity) <= 0) {
                return notification.error({
                  message: `Please add a quantity for ${item.product.name.toLowerCase()}`,
                });
              }
              if (numberOrZero(item.rentPerDay) < 0) {
                return notification.error({
                  message: `Please add a rent per day for ${item.product.name.toLowerCase()}`,
                });
              }
            }
            const submitValues = {
              ...values,
              discountAmount: Number(values.discountAmount),
              rentOutItems: values.rentOutItems.map((item) => ({
                productId: item.product.id,
                quantity: Number(item.quantity),
                rentPerDay: Number(item.rentPerDay),
              })),
            };
            if (isEditing) {
              await editRentOut({
                id: rentOutId,
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
          <div className='border-default-border p-md gap-md grid grid-cols-[6.5rem_1fr_var(--mantine-spacing-sm)_6.5rem_1fr] grid-rows-[1fr_1fr] items-center rounded-sm border'>
            <Input.Label required>Date</Input.Label>
            <DatePickerInput name='createdAt' control={control} />
            <div></div>
            <Input.Label required>Customer</Input.Label>
            <div className='gap-xs grid grid-cols-[1fr_auto] items-center'>
              <Select
                name='customerId'
                control={control}
                data={customers.map((c) => ({ label: c.name, value: c.id }))}
                {...(isEditing ? {} : { 'data-autofocus': true })}
              />
              <Tooltip label='Create new customer' position='bottom' withArrow>
                <ActionIcon variant='outline' size='lg' onClick={() => handlers.open()}>
                  <FaPlus />
                </ActionIcon>
              </Tooltip>
            </div>
            <Input.Label required>Description</Input.Label>
            <TextInput control={control} name='description' />
          </div>
          <GrandTotal control={control} />
          <ItemTable.TableWrapper gridTemplateColumns='1.5rem 2.5rem 1fr 8rem 8rem 2rem'>
            <ItemTable.HeadRow>
              <div>#</div>
              <div></div>
              <div>Product</div>
              <div className='text-end'>Rent Per Day</div>
              <div className='text-end'>Quantity</div>
              <div></div>
            </ItemTable.HeadRow>
            <ItemTable.DataWrapper>
              {rentOutItems.fields.map((field, index) => (
                <ItemTable.DataRow key={field.key}>
                  <div className='text-xs'>{index + 1}</div>
                  <Watcher
                    control={control}
                    name={[`rentOutItems.${index}.product`]}
                    render={([product]) => (
                      <>
                        <Avatar text={product.name} name={product.image ?? ''} size={40} />
                        <div>{product.name}</div>
                      </>
                    )}
                  />
                  <PriceInput
                    size='xs'
                    min={0}
                    control={control}
                    name={`rentOutItems.${index}.rentPerDay`}
                    classNames={{ input: 'text-end' }}
                  />
                  <NumberInput
                    size='xs'
                    min={0}
                    control={control}
                    name={`rentOutItems.${index}.quantity`}
                    classNames={{ input: 'text-end' }}
                  />
                  <ItemTable.RemoveRowButton
                    className='ml-auto'
                    onClick={() => {
                      rentOutItems.remove(index);
                    }}
                  />
                </ItemTable.DataRow>
              ))}
            </ItemTable.DataWrapper>
          </ItemTable.TableWrapper>
          <UncontrolledSearchableList
            keyPath='id'
            items={products}
            title={(p) => p.name}
            avatar={{ name: (p) => p.name, image: (p) => p.image || '' }}
            filter={(query, p) => p.name.toLowerCase().includes(query.toLowerCase())}
            {...(isEditing ? { 'data-autofocus': true } : {})}
            onItemClicked={(p) => {
              const index = rentOutItems.fields.findIndex((f) => f.product.id === p.id);
              if (index === -1) {
                rentOutItems.append(
                  {
                    quantity: 1,
                    product: p,
                    rentPerDay: p.rentPerDay,
                  },
                  {
                    focusName: `rentOutItems.${rentOutItems.fields.length}.quantity`,
                  },
                );
              } else {
                setFocus(`rentOutItems.${index}.quantity`);
              }
            }}
          />
        </div>
      </Modal.Form>
    </>
  );
}

type GrandTotalProps = {
  control: Control<FormValues>;
};

function GrandTotal({ control }: GrandTotalProps) {
  const rentOutItems = useWatch({ control, name: 'rentOutItems' });
  const discountAmount = useWatch({ control, name: 'discountAmount' });

  const total = rentOutItems.reduce(
    (acc, item) => acc + numberOrZero(item.quantity) * numberOrZero(item.rentPerDay),
    0,
  );

  return (
    <div className='border-default-border p-sm gap-y-xs grid grid-cols-2 items-center rounded-sm border'>
      <span>Total</span>
      <span className='pr-[calc(1.875rem/3)] text-end'>{formatCurrency(total)}</span>
      <span>Discount</span>
      <PriceInput
        size='xs'
        min={0}
        max={total}
        name='discountAmount'
        control={control}
        disabled={total === 0}
        className='ml-auto w-[8rem]'
        classNames={{ input: 'text-end text-sm' }}
      />
      <span className='font-semibold'>Grand Total</span>
      <span className='pr-[calc(1.875rem/3)] text-end font-semibold'>
        {formatCurrency(total - numberOrZero(discountAmount))}
      </span>
    </div>
  );
}

export default function EditRentOut({
  modalProps,
  ...rest
}: Omit<EditRentOutFormProps, 'onClose'> & { modalProps: ModalRootProps }) {
  return (
    <Modal.Root fullScreen={true} {...modalProps}>
      <EditRentOutForm {...rest} onClose={modalProps.onClose} />
    </Modal.Root>
  );
}
