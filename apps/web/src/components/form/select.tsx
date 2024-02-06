import { Controller, FieldPath, FieldValues } from 'react-hook-form';
import { Select as MSelect } from '@mantine/core';
import { OmittedComponentProps, Props } from './types';

export type SelectProps<
  T extends FieldValues = FieldValues,
  U extends FieldPath<T> = FieldPath<T>,
> = Props<T, U> & OmittedComponentProps<typeof MSelect>;

export default function Select<
  T extends FieldValues = FieldValues,
  U extends FieldPath<T> = FieldPath<T>,
>({ name, control, rules, onChange, onBlur, ...rest }: SelectProps<T, U>) {
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field, fieldState }) => (
        <MSelect
          {...rest}
          {...field}
          error={fieldState.error?.message}
          onBlur={(e) => {
            field.onBlur();
            onBlur?.(e);
          }}
          onChange={(v, option) => {
            field.onChange(v === null ? '' : v);
            onChange?.(v, option);
          }}
        />
      )}
    />
  );
}
