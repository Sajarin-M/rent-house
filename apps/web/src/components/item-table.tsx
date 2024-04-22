import { createContext, PropsWithChildren, useContext } from 'react';
import { FaMinus } from 'react-icons/fa6';
import { ActionIcon, ActionIconProps } from '@mantine/core';
import { FlexScrollArea } from '@/components/scroll-area';

const ItemTableContext = createContext<{ gridTemplateColumns: string } | null>(null);
ItemTableContext.displayName = 'ItemTableContext';

function TableWrapper({
  children,
  gridTemplateColumns,
}: PropsWithChildren & { gridTemplateColumns: string }) {
  return (
    <ItemTableContext.Provider value={{ gridTemplateColumns }}>
      <div className='border-default-border flex flex-col rounded-sm border'>{children}</div>
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
      className='gap-x-sm border-default-border bg-gray-1 px-md py-xs focus-within:outline-mantine-default dark:bg-dark-6 grid items-center rounded-sm border text-sm'
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

export type RemoveRowButtonProps = ActionIconProps &
  Omit<React.ComponentPropsWithoutRef<'button'>, keyof ActionIconProps>;

function RemoveRowButton(props: RemoveRowButtonProps) {
  return (
    <ActionIcon tabIndex={-1} size={16} radius='lg' color='red' variant='filled' {...props}>
      <FaMinus size={9} />
    </ActionIcon>
  );
}

const ItemTable = {
  TableWrapper,
  HeadRow,
  DataRow,
  DataWrapper,
  RemoveRowButton,
};

export default ItemTable;
