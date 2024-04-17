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
    buttonLabels?: {
      submit?: string;
      cancel?: string;
    };
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
  buttonLabels,
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
            {buttonLabels?.cancel || 'Cancel'}
          </Button>
          {control ? (
            <SubmitButton
              className='w-action-btn'
              control={control}
              loading={isSubmitting}
              checkDirty={checkDirty}
              disableOnFresh={disableOnFresh}
            >
              {buttonLabels?.submit || 'Save'}
            </SubmitButton>
          ) : (
            <Button className='w-action-btn' type='submit' loading={isSubmitting}>
              {buttonLabels?.submit || 'Save'}
            </Button>
          )}
        </ModalFooter>
      </form>
    </>
  );
}
