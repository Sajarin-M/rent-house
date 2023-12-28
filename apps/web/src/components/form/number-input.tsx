import { Controller, FieldPath, FieldValues } from 'react-hook-form';
import { NumberInput as MNumberInput } from '@mantine/core';
import { OmittedComponentProps, Props } from './types';

export default function NumberInput<
  T extends FieldValues = FieldValues,
  U extends FieldPath<T> = FieldPath<T>,
>({ name, control, rules, ...rest }: Props<T, U> & OmittedComponentProps<typeof MNumberInput>) {
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field, fieldState }) => (
        <MNumberInput {...rest} {...field} error={fieldState.error?.message} />
      )}
    />
  );
}
