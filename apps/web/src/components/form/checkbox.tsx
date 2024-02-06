import { Controller, FieldPath, FieldValues } from 'react-hook-form';
import { Checkbox as MCheckbox } from '@mantine/core';
import type { OmittedComponentProps, Props } from './types';

export default function Checkbox<
  T extends FieldValues = FieldValues,
  U extends FieldPath<T> = FieldPath<T>,
>({
  name,
  control,
  rules,
  onChange,
  onBlur,
  ...rest
}: Props<T, U> & OmittedComponentProps<typeof MCheckbox>) {
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field }) => (
        <MCheckbox
          {...rest}
          {...field}
          checked={field.value}
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
