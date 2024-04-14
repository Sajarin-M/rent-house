import { PropsWithChildren } from 'react';
import { Input, Group as MGroup } from '@mantine/core';

type WrapperProps = PropsWithChildren & {
  label?: string;
  withAsterisk?: boolean;
  error?: string;
};

export default function Group({ label, withAsterisk, error, children }: WrapperProps) {
  return (
    <Input.Wrapper withAsterisk={withAsterisk} className='space-y-1'>
      {label && <Input.Label required={withAsterisk}>{label}</Input.Label>}
      <MGroup>{children}</MGroup>
      <Input.Error>{error}</Input.Error>
    </Input.Wrapper>
  );
}
