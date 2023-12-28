import { FormEventHandler, PropsWithChildren } from 'react';
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
}: Props) {
  return (
    <>
      <ModalHeader onClose={onCancel} title={title} />
      <form className='contents' onSubmit={onSubmit}>
        <ModalContent isLoading={isLoading}>{children}</ModalContent>
        <ModalFooter>
          <Button w='7rem' variant='light' onClick={onCancel} type='button'>
            Cancel
          </Button>
          {control ? (
            <SubmitButton
              w='7rem'
              control={control}
              loading={isSubmitting}
              checkDirty={checkDirty}
              disableOnFresh={disableOnFresh}
            >
              Save
            </SubmitButton>
          ) : (
            <Button w='7rem' type='submit' loading={isSubmitting}>
              Save
            </Button>
          )}
        </ModalFooter>
      </form>
    </>
  );
}
