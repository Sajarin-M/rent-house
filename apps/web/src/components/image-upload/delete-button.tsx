import { ComponentPropsWithoutRef } from 'react';
import { TbTrash } from 'react-icons/tb';
import { ActionIcon, ActionIconProps, Tooltip } from '@mantine/core';

export default function DeleteButton(
  props: ActionIconProps & Omit<ComponentPropsWithoutRef<'button'>, keyof ActionIconProps>,
) {
  return (
    <Tooltip label='Clear' withArrow position='right'>
      <ActionIcon
        {...props}
        color='red'
        size='md'
        radius='sm'
        variant='default'
        className='text-red-7'
      >
        <TbTrash size='1rem' />
      </ActionIcon>
    </Tooltip>
  );
}
