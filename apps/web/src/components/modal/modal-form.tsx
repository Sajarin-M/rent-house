import { FormEventHandler, PropsWithChildren, ReactNode } from 'react';
import { Button } from '@mantine/core';
import { SubmitButton, SubmitButtonProps } from '../form';
import ModalContent from './modal-content';
import ModalFooter from './modal-footer';
import ModalHeader from './modal-header';

type Props = Pick<SubmitButtonProps, 'disableOnFresh' | 'checkDirty'> &
  PropsWithChildren & {
    title?: string;
    control?: any;
    isLoading?: boolean;
    onCancel: VoidFunction;
    isSubmitting?: boolean;
    onSubmit: FormEventHandler<HTMLFormElement>;
    footer?: ReactNode;
  };
export default function ModalForm({
  title,
  control,
  onCancel,
  children,
  onSubmit,
  isLoading,
  isSubmitting,
  disableOnFresh,
  checkDirty,
  footer,
}: Props) {
  return (
    <>
      <ModalHeader onClose={onCancel} title={title} />
      <form className='contents' onSubmit={onSubmit}>
        <ModalContent isLoading={isLoading}>{children}</ModalContent>
        <ModalFooter>
          {footer}
          <Button
            className='w-action-btn ml-auto'
            variant='default'
            onClick={onCancel}
            type='button'
          >
            Cancel
          </Button>
          {control ? (
            <SubmitButton
              className='w-action-btn'
              control={control}
              loading={isSubmitting}
              checkDirty={checkDirty}
              disableOnFresh={disableOnFresh}
            >
              Save
            </SubmitButton>
          ) : (
            <Button className='w-action-btn' type='submit' loading={isSubmitting}>
              Save
            </Button>
          )}
        </ModalFooter>
      </form>
    </>
  );
}
