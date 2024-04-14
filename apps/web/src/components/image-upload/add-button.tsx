import { FaPlus } from 'react-icons/fa6';
import { UnstyledButton } from '@mantine/core';

type AddButtonProps = {
  onClick?: VoidFunction;
};

export default function AddButton({ onClick }: AddButtonProps) {
  return (
    <UnstyledButton
      type='button'
      className='border-default-border dark:bg-dark-6 relative flex size-20 items-center justify-center overflow-hidden rounded-sm border ring-1'
      onClick={onClick}
    >
      <FaPlus size='2rem' />
    </UnstyledButton>
  );
}
