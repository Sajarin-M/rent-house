import { ComponentProps, forwardRef } from 'react';
import { TbSearch } from 'react-icons/tb';
import { TextInput, Tooltip } from '@mantine/core';
import { cn } from '@/utils/fns';

export type SearchProps = ComponentProps<typeof TextInput> & {
  tooltip?: string;
  fullWidth?: boolean;
};

const Search = forwardRef<HTMLInputElement, SearchProps>(
  ({ tooltip, fullWidth, classNames, ...props }, ref) => {
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
            input: cn(
              '[&:not(:focus-within)]:border-default-border dark:bg-dark-6 border',
              (classNames as any)?.input,
            ),
            section: cn('text-primary-filled pl-1', (classNames as any)?.section),
          }}
          placeholder='Search...'
          {...props}
        />
      </Tooltip>
    );
  },
);

export default Search;
