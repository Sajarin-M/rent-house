import { ChangeEvent, ComponentPropsWithoutRef, useRef, useState } from 'react';
import { Loader } from '@mantine/core';
import { useDidUpdate } from '@mantine/hooks';
import Avatar from '@/components/avatar';
import { FlexScrollArea } from '@/components/scroll-area';
import Search from '@/components/search';
import { cn } from '@/utils/fns';

export type SearchableListProps<T> = Omit<ComponentPropsWithoutRef<'div'>, 'title'> & {
  searchKey: string;
  isLoading?: boolean;
  setSearchKey: (value: string | ChangeEvent<any> | null | undefined) => void;
  avatar: {
    name: (item: T) => string;
    image?: (item: T) => string;
  };
  title: (item: T) => string;
  subtitle?: (item: T) => string;
  rightSection?: (item: T) => string;
  items: T[];
  nothingFound?: string;
  onEndReached?: VoidFunction;
  onItemClicked?: (item: T) => void;
  keyPath: keyof T;
  autoFocus?: boolean;
  'data-autofocus'?: boolean;
};

export default function SearchableList<T>({
  searchKey,
  keyPath,
  setSearchKey,
  isLoading,
  items,
  avatar,
  title,
  rightSection,
  subtitle,
  nothingFound,
  onEndReached,
  onItemClicked,
  autoFocus,
  className,
  'data-autofocus': dataAutoFocus,
  ...rest
}: SearchableListProps<T>) {
  const [hovered, setHovered] = useState(-1);
  const scrollableRef = useRef<HTMLDivElement>(null);

  useDidUpdate(() => {
    setHovered(0);
  }, [searchKey]);

  return (
    <div {...rest} className={cn('flex flex-col rounded-sm', className)}>
      <Search
        fullWidth
        value={searchKey}
        onChange={setSearchKey}
        autoFocus={autoFocus}
        {...(dataAutoFocus ? { 'data-autofocus': true } : {})}
        classNames={{
          input: 'py-lg h-12 rounded-b-none rounded-t-sm',
        }}
        onBlur={() => {
          setHovered(-1);
        }}
        onKeyDown={(e) => {
          switch (e.key) {
            case 'ArrowDown': {
              e.preventDefault();
              setHovered((current) => {
                const nextIndex = current + 1 >= items.length ? current : current + 1;
                scrollableRef.current
                  ?.querySelectorAll('[data-list-item]')
                  ?.[nextIndex]?.scrollIntoView({ block: 'nearest' });
                return nextIndex;
              });
              break;
            }
            case 'ArrowUp': {
              e.preventDefault();
              setHovered((current) => {
                const nextIndex = current - 1 < 0 ? current : current - 1;
                scrollableRef.current
                  ?.querySelectorAll('[data-list-item]')
                  ?.[nextIndex]?.scrollIntoView({ block: 'nearest' });
                return nextIndex;
              });
              break;
            }
            case 'Enter': {
              e.preventDefault();
              onItemClicked?.(items[hovered]);
              setHovered(-1);
            }
          }
        }}
        rightSection={
          isLoading && items.length > 0 ? <Loader size='xs' className='mr-2' /> : undefined
        }
      />

      <FlexScrollArea
        ref={scrollableRef}
        onEndReached={onEndReached}
        className='border-default-border rounded-b-sm border-x border-b'
      >
        {items.length > 0 ? (
          <div className='m-xs space-y-xs'>
            {items.map((item, index) => {
              const itemTitle = title(item);
              const itemSubtitle = subtitle?.(item);
              const itemRightSection = rightSection?.(item);

              return (
                <div
                  data-list-item
                  // @ts-ignore
                  key={item[keyPath]}
                  className={cn(
                    'border-default-border bg-gray-1 scroll-m-sm hover:bg-gray-2 dark:bg-dark-6 dark:hover:bg-dark-5 px-md py-xs gap-x-xs grid cursor-pointer grid-cols-[auto_1fr_auto] items-center rounded-sm border',
                    hovered === index && `bg-gray-1 outline-mantine-default dark:bg-dark-5`,
                  )}
                  onClick={() => onItemClicked?.(item)}
                  data-hovered={hovered === index}
                >
                  <Avatar name={avatar.image?.(item)} text={avatar.name(item)} size={40} />
                  <div className='truncate'>
                    <div className='truncate text-sm' title={itemTitle}>
                      {itemTitle}
                    </div>
                    {itemSubtitle && (
                      <div className='truncate text-xs' title={itemSubtitle}>
                        {itemSubtitle}
                      </div>
                    )}
                  </div>
                  {itemRightSection && <div className='text-xs'>{itemRightSection}</div>}
                </div>
              );
            })}
          </div>
        ) : isLoading ? (
          <div className='pt-xl flex items-center justify-center'>
            <Loader size='sm' />
          </div>
        ) : nothingFound ? (
          <div className='pt-xl text-center text-sm'>{nothingFound}</div>
        ) : undefined}
      </FlexScrollArea>
    </div>
  );
}
