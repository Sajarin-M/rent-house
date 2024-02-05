import { createContext, PropsWithChildren, useContext } from 'react';
import { FlexScrollArea } from '@/components/scroll-area';

const ItemTableContext = createContext<{ gridTemplateColumns: string } | null>(null);
ItemTableContext.displayName = 'ItemTableContext';

function TableWrapper({
  children,
  gridTemplateColumns,
}: PropsWithChildren & { gridTemplateColumns: string }) {
  return (
    <ItemTableContext.Provider value={{ gridTemplateColumns }}>
      <div className='border-default-border flex flex-col rounded-sm border'>{children}</div>{' '}
    </ItemTableContext.Provider>
  );
}

function HeadRow({ children }: PropsWithChildren) {
  const context = useContext(ItemTableContext);
  return (
    <div className='border-default-border px-sm h-12 border-b'>
      <div
        style={{ gridTemplateColumns: context?.gridTemplateColumns }}
        className='gap-x-sm px-md text-gray-7 dark:text-dark-0 grid h-full items-center font-semibold'
      >
        {children}
      </div>
    </div>
  );
}

function DataRow({ children }: PropsWithChildren) {
  const context = useContext(ItemTableContext);
  return (
    <div
      style={{ gridTemplateColumns: context?.gridTemplateColumns }}
      className='gap-x-sm border-default-border bg-gray-1 px-md py-xs focus-within:outline-mantine-default dark:bg-dark-5 grid items-center rounded-sm border text-sm'
    >
      {children}
    </div>
  );
}

function DataWrapper({ children }: PropsWithChildren) {
  return (
    <FlexScrollArea>
      <div className='space-y-xs p-sm'>{children}</div>
    </FlexScrollArea>
  );
}

const ItemTable = {
  TableWrapper,
  HeadRow,
  DataRow,
  DataWrapper,
};

export default ItemTable;
