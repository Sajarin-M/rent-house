import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { CloseButton, Divider } from '@mantine/core';

type ModalHeaderProps = Omit<ComponentPropsWithoutRef<'div'>, 'className'> & {
  onClose: VoidFunction;
  title?: string | ReactNode;
  withCloseButton?: boolean;
  withDivider?: boolean;
};

export default function ModalHeader({
  title,
  onClose,
  children,
  withDivider = true,
  withCloseButton = true,
  ...rest
}: ModalHeaderProps) {
  return (
    <>
      <div className='flex items-center justify-between p-5' {...rest}>
        {typeof title === 'string' ? <div className='font-semibold'>{title}</div> : title}

        {withCloseButton && <CloseButton iconSize={16} onClick={onClose} className='-mr-2' />}
      </div>
      {children}
      {withDivider && <Divider />}
    </>
  );
}
