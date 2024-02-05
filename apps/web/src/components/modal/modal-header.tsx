import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { CloseButton } from '@mantine/core';
import { cn } from '@/utils/fns';

type ModalHeaderProps = Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children'> & {
  onClose: VoidFunction;
  title?: string | ReactNode;
  withCloseButton?: boolean;
  withDivider?: boolean;
};

export default function ModalHeader({
  title,
  onClose,
  withDivider = true,
  withCloseButton = true,
  ...rest
}: ModalHeaderProps) {
  return (
    <div
      className={cn('px-md flex h-[4.2rem] shrink-0 items-center justify-between', {
        'border-default-border border-b': withDivider,
      })}
      {...rest}
    >
      {typeof title === 'string' ? <div className='font-semibold'>{title}</div> : title}

      {withCloseButton && <CloseButton iconSize={16} onClick={onClose} className='-mr-2 ml-auto' />}
    </div>
  );
}
