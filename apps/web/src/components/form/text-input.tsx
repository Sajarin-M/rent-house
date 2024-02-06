import { Controller, FieldPath, FieldValues } from 'react-hook-form';
import { TextInput as MTextInput } from '@mantine/core';
import type { OmittedComponentProps, Props } from './types';

export default function TextInput<
  T extends FieldValues = FieldValues,
  U extends FieldPath<T> = FieldPath<T>,
>({
  name,
  control,
  rules,
  onChange,
  onBlur,
  ...rest
}: Props<T, U> & OmittedComponentProps<typeof MTextInput>) {
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field, fieldState }) => (
        <MTextInput
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
