import { Controller, FieldPath, FieldValues } from 'react-hook-form';
import { Textarea as MTextarea } from '@mantine/core';
import type { OmittedComponentProps, Props } from './types';

export default function Textarea<
  T extends FieldValues = FieldValues,
  U extends FieldPath<T> = FieldPath<T>,
>({
  name,
  control,
  rules,
  minRows = 3,
  maxRows = 6,
  autosize = true,
  ...rest
}: Props<T, U> & OmittedComponentProps<typeof MTextarea>) {
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field, fieldState }) => (
        <MTextarea
          {...rest}
          {...field}
          minRows={minRows}
          maxRows={maxRows}
          autosize={autosize}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
