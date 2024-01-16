import { ChangeEvent, ComponentPropsWithoutRef, useRef, useState } from 'react';
import { Loader, px, Text, useMantineTheme } from '@mantine/core';
import { useDidUpdate, useInputState, useScrollIntoView } from '@mantine/hooks';
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
};

export function SearchableList<T>({
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
  ...rest
}: SearchableListProps<T>) {
  const [hovered, setHovered] = useState(-1);
  const itemsRefs = useRef<Record<string, HTMLDivElement>>({});
  const theme = useMantineTheme();

  const { scrollIntoView, targetRef, scrollableRef } = useScrollIntoView<
    HTMLDivElement,
    HTMLDivElement
  >({
    duration: 0,
    isList: true,
    cancelable: false,
    offset: Number(px(theme.spacing.sm)),
  });

  useDidUpdate(() => {
    setHovered(0);
  }, [searchKey]);

  return (
    <div
      {...rest}
      className={cn('border-default-border flex flex-col rounded-sm border', className)}
    >
      <Search
        fullWidth
        value={searchKey}
        onChange={setSearchKey}
        autoFocus={autoFocus}
        className='border-default-border border-b'
        classNames={{
          input: 'py-lg h-12 rounded-b-none rounded-t-sm',
        }}
        onBlur={() => {
          setHovered(-1);
        }}
        onKeyDown={(e) => {
          switch (e.key) {
            case 'ArrowUp': {
              e.preventDefault();
              let newIndex = hovered - 1;
              const minIndex = 0;
              if (newIndex < minIndex) newIndex = minIndex;
              setHovered(newIndex);
              // @ts-ignore
              targetRef.current = itemsRefs.current[items[newIndex][keyPath]];
              scrollIntoView({ alignment: 'start' });
              break;
            }
            case 'ArrowDown': {
              e.preventDefault();
              let newIndex = hovered + 1;
              const maxIndex = items.length - 1;
              if (newIndex > maxIndex) newIndex = maxIndex;
              setHovered(newIndex);
              // @ts-ignore
              targetRef.current = itemsRefs.current[items[newIndex][keyPath]];
              scrollIntoView({ alignment: 'end' });
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
          isLoading && items.length > 0 ? <Loader size='0.85rem' className='mr-2' /> : undefined
        }
      />

      {items.length > 0 ? (
        <FlexScrollArea className='' ref={scrollableRef} onEndReached={onEndReached}>
          <div className='m-xs space-y-xs'>
            {items.map((item, index) => {
              const itemTitle = title(item);
              const itemSubtitle = subtitle?.(item);
              const itemRightSection = rightSection?.(item);

              return (
                <div
                  className={cn(
                    'border-default-border bg-gray-1 hover:bg-gray-2 dark:bg-dark-5 dark:hover:bg-dark-5 px-md py-xs gap-x-xs grid cursor-pointer grid-cols-[auto_1fr_auto] items-center rounded-sm border',
                    hovered === index && `bg-gray-2 outline-mantine-default dark:bg-dark-4`,
                  )}
                  // @ts-ignore
                  key={item[keyPath]}
                  ref={(node) => {
                    if (itemsRefs && itemsRefs.current) {
                      // @ts-ignore
                      itemsRefs.current[item[keyPath]] = node;
                    }
                  }}
                  onClick={() => onItemClicked?.(item)}
                  data-hovered={hovered === index}
                >
                  <Avatar name={avatar.image?.(item)} text={avatar.name(item)} size={40} />
                  <Text truncate>
                    <Text truncate title={itemTitle} size='sm'>
                      {itemTitle}
                    </Text>
                    {itemSubtitle && (
                      <Text truncate title={itemSubtitle} size='xs'>
                        {itemSubtitle}
                      </Text>
                    )}
                  </Text>
                  {itemRightSection && <Text size='xs'>{itemRightSection}</Text>}
                </div>
              );
            })}
          </div>
        </FlexScrollArea>
      ) : isLoading ? (
        <div className='pt-xl flex items-center justify-center'>
          <Loader />
        </div>
      ) : nothingFound ? (
        <p className='pt-xl text-center text-sm'>{nothingFound}</p>
      ) : undefined}
    </div>
  );
}

type UncontrolledSearchableListProps<T> = Omit<
  SearchableListProps<T>,
  'searchKey' | 'setSearchKey' | 'nothingFound'
> & {
  filter?: (searchQuery: string, item: T) => boolean;
  nothingFound?: string | ((searchKey: string) => string | undefined);
};

export function UncontrolledSearchableList<T>({
  items,
  filter,
  nothingFound,
  ...rest
}: UncontrolledSearchableListProps<T>) {
  const [searchKey, setSearchKey] = useInputState('');

  let filteredItems = items;
  if (filter) {
    const searchKeyLowerCase = searchKey.toLowerCase();
    filteredItems = items.filter((i) => filter(searchKeyLowerCase, i));
  }

  return (
    <SearchableList
      {...rest}
      searchKey={searchKey}
      items={filteredItems}
      setSearchKey={setSearchKey}
      nothingFound={typeof nothingFound === 'function' ? nothingFound(searchKey) : nothingFound}
    />
  );
}
