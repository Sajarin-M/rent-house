import { Control, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Input, ModalRootProps, TextInput as MTextInput } from '@mantine/core';
import dayjs from 'dayjs';
import { trpc } from '@/context/trpc';
import Avatar from '@/components/avatar';
import {
  DatePickerInput,
  NumberInput,
  PriceInput,
  TextInput,
  validation,
  Watcher,
} from '@/components/form';
import ItemTable from '@/components/item-table';
import { Modal, ModalFormProps } from '@/components/modal';
import { UncontrolledSearchableList } from '@/components/searchable-list';
import { formatCurrency, numberOrZero } from '@/utils/fns';
import notification from '@/utils/notification';
import { RentOutVm } from '@/types';

type CreateRentReturnFormProps = ModalFormProps & {
  rentOutId: string;
};

type FormValues = {
  createdAt: string;
  discountAmount: string | number;
  description: string;
  returnItems: {
    quantity: string | number;
    rentPerDay: string | number;
    usedDays: string | number;
    rentOutItem: RentOutVm['rentOutItems'][number];
  }[];
};

function CreateRentReturnForm({ rentOutId, onClose }: CreateRentReturnFormProps) {
  const { data: rentOutData, isLoading: isLoadingRentOutData } = trpc.rentOuts.getRentOut.useQuery({
    id: rentOutId,
  });

  const { control, handleSubmit, setFocus, getValues, setValue } = useForm<FormValues>({
    defaultValues: {
      createdAt: new Date().toISOString(),
      description: '',
      discountAmount: '',
      returnItems: [],
    },
  });

  const returnItems = useFieldArray({ control, name: 'returnItems', keyName: 'key' });

  const utils = trpc.useUtils();

  const { mutateAsync: createRentReturn } = trpc.rentOuts.createRentReturn.useMutation();

  return (
    <Modal.Form
      control={control}
      onCancel={onClose}
      title='Create Rent Return'
      isLoading={isLoadingRentOutData}
      onSubmit={handleSubmit(async (values) => {
        try {
          const submitValues = {
            ...values,
            rentOutId: rentOutId,
            discountAmount: Number(values.discountAmount),
            rentOutItems: values.returnItems.map((item) => ({
              productId: item.rentOutItem.product.id,
              quantity: Number(item.quantity),
              rentPerDay: Number(item.rentPerDay),
            })),
          };
          await createRentReturn(submitValues);
          notification.created('Rent Out');
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
            minDate={rentOutData?.createdAt ? new Date(rentOutData.createdAt) : undefined}
            onChange={(date) => {
              if (date !== null && date instanceof Date) {
                const daysDifference =
                  dayjs(getValues().createdAt).diff(dayjs(rentOutData?.createdAt), 'day') + 1;

                for (let i = 0; i < returnItems.fields.length; i++) {
                  setValue(`returnItems.${i}.usedDays`, daysDifference);
                }
              }
            }}
          />
          <div></div>
          <Input.Label required>Customer</Input.Label>
          <MTextInput readOnly value={rentOutData?.customer.name} />
          <Input.Label required>Description</Input.Label>
          <TextInput control={control} name='description' />
        </div>
        <GrandTotal control={control} />
        <ItemTable.TableWrapper gridTemplateColumns='1.5rem 2.5rem 1fr 8rem 8rem 8rem'>
          <ItemTable.HeadRow>
            <div>#</div>
            <div></div>
            <div>Product</div>
            <div className='text-end'>Rent Per Day</div>
            <div className='text-end'>Used Days</div>
            <div className='text-end'>Quantity</div>
          </ItemTable.HeadRow>
          <ItemTable.DataWrapper>
            {returnItems.fields.map((field, index) => (
              <ItemTable.DataRow key={field.key}>
                <div className='text-xs'>{index + 1}</div>
                <Watcher
                  control={control}
                  name={[`returnItems.${index}.rentOutItem`]}
                  render={([rentOutItem]) => (
                    <>
                      <Avatar
                        text={rentOutItem.product.name}
                        name={rentOutItem.product.image ?? ''}
                        size={40}
                      />
                      <div>{rentOutItem.product.name}</div>
                    </>
                  )}
                />
                <PriceInput
                  size='xs'
                  min={0}
                  control={control}
                  name={`returnItems.${index}.rentPerDay`}
                  classNames={{ input: 'text-end' }}
                />
                <NumberInput
                  size='xs'
                  min={1}
                  control={control}
                  name={`returnItems.${index}.usedDays`}
                  classNames={{ input: 'text-end' }}
                />

                <Watcher
                  control={control}
                  name={[`returnItems.${index}.rentOutItem`]}
                  render={([rentOutItem]) => (
                    <NumberInput
                      size='xs'
                      control={control}
                      classNames={{ input: 'text-end' }}
                      name={`returnItems.${index}.quantity`}
                      min={0}
                      max={rentOutItem.quantity}
                    />
                  )}
                />
              </ItemTable.DataRow>
            ))}
          </ItemTable.DataWrapper>
        </ItemTable.TableWrapper>
        <UncontrolledSearchableList
          keyPath='id'
          items={rentOutData?.rentOutItems ?? []}
          title={(item) => item.product.name}
          avatar={{ name: (item) => item.product.name, image: (item) => item.product.image || '' }}
          filter={(query, item) => item.product.name.toLowerCase().includes(query.toLowerCase())}
          onItemClicked={(item) => {
            const index = returnItems.fields.findIndex((f) => f.rentOutItem.id === item.id);
            if (index === -1) {
              const daysDifference =
                dayjs(getValues().createdAt).diff(dayjs(rentOutData?.createdAt), 'day') + 1;
              returnItems.append(
                {
                  quantity: item.quantity,
                  rentPerDay: item.rentPerDay,
                  usedDays: daysDifference,
                  rentOutItem: item,
                },
                {
                  focusName: `returnItems.${returnItems.fields.length}.quantity`,
                },
              );
            } else {
              setFocus(`returnItems.${index}.quantity`);
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
  const rentOutItems = useWatch({ control, name: 'returnItems' });
  const discountAmount = useWatch({ control, name: 'discountAmount' });

  const total =
    rentOutItems?.reduce(
      (acc, item) => acc + numberOrZero(item.quantity) * numberOrZero(item.rentPerDay),
      0,
    ) ?? 0;

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

export default function CreateRentReturn({
  modalProps,
  ...rest
}: Omit<CreateRentReturnFormProps, 'onClose'> & { modalProps: ModalRootProps }) {
  return (
    <Modal.Root fullScreen={true} {...modalProps}>
      <CreateRentReturnForm {...rest} onClose={modalProps.onClose} />
    </Modal.Root>
  );
}
