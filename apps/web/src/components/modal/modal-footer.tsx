import { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/fns';

export type ModalFooterProps = ComponentPropsWithoutRef<'div'> & {
  withDivider?: boolean;
};

export default function ModalFooter({ withDivider = true, ...rest }: ModalFooterProps) {
  return (
    <div
      className={cn('gap-md px-md flex h-[4.2rem] shrink-0 items-center justify-end', {
        'border-default-border border-t': withDivider,
      })}
      {...rest}
    />
  );
}
