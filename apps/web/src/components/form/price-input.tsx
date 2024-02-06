import { Controller, FieldPath, FieldValues } from 'react-hook-form';
import { OmittedComponentProps, Props } from '@/components/form/types';
import BasePriceInput from '@/components/price-input';

export default function PriceInput<
  T extends FieldValues = FieldValues,
  U extends FieldPath<T> = FieldPath<T>,
>({
  name,
  control,
  rules,
  onChange,
  onBlur,
  ...rest
}: Props<T, U> & OmittedComponentProps<typeof BasePriceInput>) {
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field, fieldState }) => (
        <BasePriceInput
          {...rest}
          {...field}
          error={fieldState.error?.message}
          onBlur={(e) => {
            field.onBlur();
            onBlur?.(e);
          }}
          onChange={(e) => {
            field.onChange(e);
            onChange?.(e);
          }}
        />
      )}
    />
  );
}
