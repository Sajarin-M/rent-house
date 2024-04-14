import { ComponentPropsWithoutRef } from 'react';
import { ActionIcon, ActionIconProps, CloseIcon, Tooltip } from '@mantine/core';

export default function ClearButton(
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
        <CloseIcon size='1rem' />
      </ActionIcon>
    </Tooltip>
  );
}
