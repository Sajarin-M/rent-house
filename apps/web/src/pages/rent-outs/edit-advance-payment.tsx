import { useForm } from 'react-hook-form';
import { Collapse, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { PriceInput, TextInput, validation, Watcher } from '@/components/form';
import { GenerateModalWrapperProps, Modal, ModalCommonProps } from '@/components/modal';
import RevealButton from '@/components/reveal-button';
import { formatCurrency, numberOrZero } from '@/utils/fns';

export type AdvancePaymentFormValues = {
  totalAmount: string | number;
  discountAmount: string | number;
  description: string;
};

export type EditAdvancePaymentFormProps = ModalCommonProps & {
  defaultValues?: Partial<AdvancePaymentFormValues>;
  onSubmit: (values: AdvancePaymentFormValues) => void;
};

function EditAdvancePaymentForm({ onClose, onSubmit, defaultValues }: EditAdvancePaymentFormProps) {
  const { control, handleSubmit, setValue } = useForm<AdvancePaymentFormValues>({
    defaultValues: {
      totalAmount: '',
      discountAmount: '',
      description: '',
      ...defaultValues,
    },
  });

  const [moreOpened, moreHandlers] = useDisclosure(
    defaultValues?.description || defaultValues?.discountAmount ? true : false,
  );

  return (
    <Modal.Form
      title='Payment'
      disableOnFresh
      control={control}
      onCancel={onClose}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Stack>
        <Watcher
          control={control}
          name={['discountAmount']}
          render={([discountAmount]) => (
            <PriceInput
              min={0}
              name='totalAmount'
              withAsterisk
              data-autofocus
              control={control}
              label='Amount'
              classNames={{ input: 'text-end' }}
              rules={validation().required().build()}
              onChange={(value) => {
                const amount = numberOrZero(value);
                if (amount < numberOrZero(discountAmount)) {
                  setValue('discountAmount', 0, { shouldDirty: true });
                }
              }}
            />
          )}
        />

        <RevealButton
          className='ml-auto'
          revealed={moreOpened}
          onClick={() => {
            moreHandlers.toggle();
          }}
        />
        <Collapse in={moreOpened}>
          <Stack>
            <Watcher
              control={control}
              name={['totalAmount']}
              render={([totalAmount]) => (
                <PriceInput
                  min={0}
                  control={control}
                  name='discountAmount'
                  label='Discount Amount'
                  max={numberOrZero(totalAmount)}
                  disabled={numberOrZero(totalAmount) <= 0}
                  classNames={{ input: 'text-end' }}
                />
              )}
            />

            <TextInput control={control} name='description' label='Description' />

            <div className='flex justify-between'>
              <div className='text-sm font-semibold'>Received Amount</div>
              <Watcher
                control={control}
                name={['totalAmount', 'discountAmount']}
                render={([totalAmount, discountAmount]) => (
                  <div className='pr-[calc(1.875rem/3)] text-end text-sm font-semibold'>
                    {formatCurrency(numberOrZero(totalAmount) - numberOrZero(discountAmount))}
                  </div>
                )}
              />
            </div>
          </Stack>
        </Collapse>
      </Stack>
    </Modal.Form>
  );
}

export default function EditAdvancePayment(
  props: GenerateModalWrapperProps<EditAdvancePaymentFormProps>,
) {
  return (
    <Modal.Wrapper
      component={EditAdvancePaymentForm}
      size='calc(30rem*var(--mantine-scale))'
      {...props}
    />
  );
}
