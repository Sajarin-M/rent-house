import { ComponentProps, forwardRef } from 'react';
import { TbSearch } from 'react-icons/tb';
import { TextInput, Tooltip } from '@mantine/core';

export type SearchProps = ComponentProps<typeof TextInput> & {
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
          radius='sm'
          variant='filled'
          leftSectionWidth={48}
          leftSection={<TbSearch />}
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
