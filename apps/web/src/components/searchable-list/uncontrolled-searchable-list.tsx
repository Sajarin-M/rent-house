import { useInputState } from '@mantine/hooks';
import SearchableList, { SearchableListProps } from './controlled-searchable-list';

type UncontrolledSearchableListProps<T> = Omit<
  SearchableListProps<T>,
  'searchKey' | 'setSearchKey' | 'nothingFound'
> & {
  filter?: (searchQuery: string, item: T) => boolean;
  nothingFound?: string | ((searchKey: string) => string | undefined);
};

export default function UncontrolledSearchableList<T>({
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
