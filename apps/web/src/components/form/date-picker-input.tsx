import { Controller, FieldPath, FieldValues } from 'react-hook-form';
import { DatePickerInput as MDatePickerInput } from '@mantine/dates';
import type { OmittedComponentProps, Props } from './types';

export default function DatePickerInput<
  T extends FieldValues = FieldValues,
  U extends FieldPath<T> = FieldPath<T>,
>({ name, control, rules, ...rest }: Props<T, U> & OmittedComponentProps<typeof MDatePickerInput>) {
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field, fieldState }) => (
        <MDatePickerInput
          {...rest}
          {...field}
          error={fieldState.error?.message}
          value={field.value ? new Date(field.value) : null}
          onChange={(date) => {
            field.onChange(Array.isArray(date) ? '' : date ? date.toISOString() : '');
          }}
        />
      )}
    />
  );
}
