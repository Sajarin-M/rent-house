import { forwardRef } from 'react';
import { FaUpload } from 'react-icons/fa6';
import { ActionIcon, FileButton, FileButtonProps, Tooltip } from '@mantine/core';

const SelectButton = forwardRef<HTMLButtonElement, Omit<FileButtonProps, 'children'>>(
  (props, ref) => {
    return (
      <FileButton accept='image/*' {...props}>
        {(props) => (
          <Tooltip label='Select' withArrow position='right'>
            <ActionIcon
              {...props}
              ref={ref}
              size='md'
              radius='sm'
              variant='default'
              className='text-blue-filled'
            >
              <FaUpload size='0.8rem' />
            </ActionIcon>
          </Tooltip>
        )}
      </FileButton>
    );
  },
);

export default SelectButton;
