import { ComponentPropsWithoutRef } from 'react';
import { TbChevronDown } from 'react-icons/tb';
import { UnstyledButton, UnstyledButtonProps } from '@mantine/core';
import { cn } from '@/utils/fns';

type RevealButtonProps = UnstyledButtonProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof UnstyledButtonProps> & {
    revealed?: boolean;
  };

export default function RevealButton({ revealed, className, ...rest }: RevealButtonProps) {
  return (
    <UnstyledButton
      type='button'
      className={cn('flex w-fit items-center gap-1 text-sm', className)}
      {...rest}
    >
      <span>{revealed ? 'Less' : 'More'}</span>
      <TbChevronDown className={cn('transition-all', revealed && 'rotate-180')} />
    </UnstyledButton>
  );
}
