import { ComponentProps, forwardRef } from 'react';
import { TextInput, Tooltip } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

type SearchProps = ComponentProps<typeof TextInput> & {
  tooltip?: string;
  fullWidth?: boolean;
};

const Search = forwardRef<HTMLInputElement, SearchProps>(
  ({ tooltip, fullWidth, ...props }, ref) => {
    return (
      <Tooltip
        withArrow
        withinPortal
        label={tooltip}
        position='bottom'
        openDelay={1500}
        disabled={tooltip === undefined}
      >
        <TextInput
          ref={ref}
          radius='md'
          variant='filled'
          leftSectionWidth={48}
          leftSection={<IconSearch size='1.3rem' />}
          w={!fullWidth ? '20rem' : undefined}
          classNames={{
            input: 'border-default-border border',
            section: 'text-primary-filled pl-1',
          }}
          placeholder='Search...'
          {...props}
        />
      </Tooltip>
    );
  },
);

export default Search;
