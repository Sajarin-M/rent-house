import { Control, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Input, ModalRootProps } from '@mantine/core';
import { trpc } from '@/context/trpc';
import Avatar from '@/components/avatar';
import {
  DatePickerInput,
  NumberInput,
  PriceInput,
  Select,
  TextInput,
  validation,
  Watcher,
} from '@/components/form';
import ItemTable from '@/components/item-table';
import { Modal, ModalFormProps } from '@/components/modal';
import { UncontrolledSearchableList } from '@/components/searchable-list';
import { formatCurrency, getFormTItle } from '@/utils/fns';
import notification from '@/utils/notification';
import { ProductVm } from '@/types';

type EditRentOutFormProps = ModalFormProps & {
  id?: string;
};

type FormValues = {
  createdAt: string;
  customerId: string;
  discount: string;
  description: string;
  rentOutItems: {
    quantity: string | number;
    rentPerDay: string | number;
    product: ProductVm;
  }[];
};

function EditRentOutForm({ id, onClose }: EditRentOutFormProps) {
  const isEditing = id !== undefined;

  // const { data, isLoading } = trpc.rentOuts.getRentOut.useQuery(
  //   { id: id! },
  //   { enabled: isEditing },
  // );

  const { data: products = [] } = trpc.products.getAllProducts.useQuery();
  const { data: customers = [] } = trpc.customers.getAllCustomers.useQuery();

  const { control, handleSubmit, setFocus } = useForm<FormValues>({
    defaultValues: {
      createdAt: new Date().toISOString(),
      description: '',
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
              productId: item.product.id,
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
        <div className='border-default-border p-md gap-md grid grid-cols-[6.5rem_auto_var(--mantine-spacing-sm)_6.5rem_auto] grid-rows-[1fr_1fr] items-center rounded-sm border'>
          <Input.Label required>Date</Input.Label>
          <DatePickerInput
            name='createdAt'
            control={control}
            rules={validation().required().build()}
          />
          <div></div>
          <Input.Label required>Customer</Input.Label>
          <Select
            name='customerId'
            control={control}
            rules={validation().required().build()}
            data={customers.map((c) => ({ label: c.name, value: c.id }))}
            {...(isEditing ? {} : { 'data-autofocus': true })}
          />
          <Input.Label required>Description</Input.Label>
          <TextInput control={control} name='discount' />
        </div>
        <GrandTotal control={control} />
        <ItemTable.TableWrapper gridTemplateColumns='1.5rem 2.5rem 1fr 8rem 8rem'>
          <ItemTable.HeadRow>
            <div>#</div>
            <div></div>
            <div>Product</div>
            <div className='text-end'>Rent Per Day</div>
            <div className='text-end'>Quantity</div>
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
                  control={control}
                  name={`rentOutItems.${index}.rentPerDay`}
                  classNames={{ input: 'text-end' }}
                />
                <NumberInput
                  size='xs'
                  control={control}
                  name={`rentOutItems.${index}.quantity`}
                  classNames={{ input: 'text-end' }}
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
  );
}

type GrandTotalProps = {
  control: Control<FormValues>;
};

function GrandTotal({ control }: GrandTotalProps) {
  const rentOutItems = useWatch({ control, name: 'rentOutItems' });
  const discount = useWatch({ control, name: 'discount' });

  const total = rentOutItems.reduce(
    (acc, item) =>
      acc +
      (isNaN(Number(item.quantity)) ? 0 : Number(item.quantity)) *
        (isNaN(Number(item.rentPerDay)) ? 0 : Number(item.rentPerDay)),
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
        name='discount'
        control={control}
        disabled={total === 0}
        className='ml-auto w-[8rem]'
        classNames={{ input: 'text-md text-end' }}
      />
      <span className='font-semibold'>Grand Total</span>
      <span className='pr-[calc(1.875rem/3)] text-end font-semibold'>
        {formatCurrency(total - (isNaN(Number(discount)) ? 0 : Number(discount)))}
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
