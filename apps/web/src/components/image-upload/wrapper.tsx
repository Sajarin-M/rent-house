import { ReactNode } from 'react';
import { Group, Input, Stack } from '@mantine/core';

type WrapperProps = {
  label?: string;
  withAsterisk?: boolean;
  preview: ReactNode;
  select: ReactNode;
  delete?: ReactNode;
  clear: ReactNode;
  error?: string;
};

export default function Wrapper({
  label,
  withAsterisk,
  clear,
  preview,
  select,
  error,
  delete: _delete,
}: WrapperProps) {
  return (
    <Input.Wrapper withAsterisk={withAsterisk} className='space-y-1'>
      {label && <Input.Label required={withAsterisk}>{label}</Input.Label>}

      <Group>
        {preview}
        <Stack gap='xs'>
          {select}
          {clear}
          {_delete || null}
        </Stack>
      </Group>
      <Input.Error>{error}</Input.Error>
    </Input.Wrapper>
  );
}
