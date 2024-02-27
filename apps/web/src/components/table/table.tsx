import { ComponentProps, memo, PropsWithChildren, useState } from 'react';
import { Components, Virtuoso, VirtuosoProps } from 'react-virtuoso';
import { Button, CssVariables, Loader, Stack } from '@mantine/core';
import { Menu, MenuButton, MenuItem } from '@/components/menu';
import { cn } from '@/utils/fns';
import { useElementHeight } from '@/utils/use-element-size';
import classes from './table.module.css';
import { ColumnSizes } from './types';

export type TableColumn<TData extends Record<any, any>> = {
  key?: string;
  header?: string;
  cell: (row: TData, index: number, isScrolling: boolean) => React.ReactNode;
  cellWidth: string;
  truncate?: boolean;
  classNames?: {
    cell?: string;
    dataCell?: string;
    headCell?: string;
  };
};

export type TableProps<TData extends Record<any, any>, TContext = unknown> = Omit<
  VirtuosoProps<TData, TContext>,
  'className' | 'components' | 'itemContent' | 'isScrolling' | 'data'
> & {
  data: readonly TData[];
  rowHeight?: number;
  keyPath: keyof TData;
  isLoading?: boolean;
  columns: TableColumn<TData>[];
  isError?: boolean;
  resetError?: VoidFunction;
  noDataMessage?: string;
  showSerialNo?: boolean;
  menu?: (rowData: TData) => MenuItem[];
  components?: Omit<Components<TData, TContext>, 'Item'>;
  onRowClick?: (rowData: TData) => void;
};

const TableRow = memo((props: ComponentProps<'div'>) => (
  <div
    className='hover:bg-gray-2 dark:hover:bg-dark-5 grid h-[var(--rowHeight)] items-center gap-x-8 px-4 py-2'
    {...props}
  />
));

function TableRowWrapper(props: ComponentProps<'div'>) {
  return <div {...props} className={classes.rowWrapper} />;
}

function TableMenuWrapper({ children }: PropsWithChildren) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className='-mx-4 -my-2 flex h-[calc(100%+1rem)] items-center justify-center px-4'
    >
      {children}
    </div>
  );
}

function EmptyTableMenu() {
  return null;
}

type TableMenuProps<T> = {
  row: T;
  menuFn: (rowData: T) => MenuItem[];
};

function TableMenu<T>({ row, menuFn }: TableMenuProps<T>) {
  return (
    <TableMenuWrapper>
      <Menu items={menuFn(row)} portalProps={{}} />
    </TableMenuWrapper>
  );
}

function ScrollingMenu() {
  return (
    <TableMenuWrapper>
      <MenuButton />
    </TableMenuWrapper>
  );
}

export default function Table<TData extends Record<any, any>, TContext = unknown>({
  data,
  menu,
  columns,
  keyPath,
  isError,
  isLoading,
  resetError,
  rowHeight = 48,
  showSerialNo = true,
  noDataMessage = 'No data found',
  onRowClick,
  components,
  ...rest
}: TableProps<TData, TContext>) {
  const { ref, height } = useElementHeight([data.length]);
  const [isScrolling, setIsScrolling] = useState(false);

  if (isLoading) {
    return (
      <div className={classes.infoWrapper}>
        <Loader size='md' />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={classes.infoWrapper}>
        <Stack align='center'>
          <div>Something went wrong while loading the page</div>
          {resetError && (
            <Button color='red.6' onClick={resetError}>
              Retry
            </Button>
          )}
        </Stack>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={classes.infoWrapper}>
        <div>{noDataMessage}</div>
      </div>
    );
  }

  if (showSerialNo) {
    columns = [
      {
        header: 'Sl.No.',
        cell: (_, index) => {
          const slNo = (index + 1).toString();
          return (
            <div className='text-[calc(0.8rem*var(--mantine-scale))]'>
              <span title={slNo}>{slNo}</span>
            </div>
          );
        },
        cellWidth: ColumnSizes.Serial,
      },
      ...columns,
    ];
  }

  let gridTemplateColumns = columns.reduce<string>((w, c) => w + c.cellWidth + ' ', '');

  let MenuComponent: any = EmptyTableMenu;

  if (menu) {
    gridTemplateColumns += ' ' + ColumnSizes.Menu;

    if (isScrolling) {
      MenuComponent = ScrollingMenu;
    } else {
      MenuComponent = TableMenu;
    }
  }

  const rowStyle = { gridTemplateColumns };

  return (
    <div
      ref={ref}
      className='flex grow flex-col'
      style={
        {
          '--height': `min(${height}px,calc(${data.length + 1} * ${rowHeight}px + ${
            data.length
          } * 1px + 0.5px`,
          '--rowHeight': `${rowHeight}px`,
        } satisfies CssVariables as CssVariables
      }
    >
      <Virtuoso
        {...rest}
        className={cn(
          classes.table,
          'border-default-border !h-[var(--height)] rounded-sm border text-sm [scrollbar-gutter:stable]',
        )}
        components={{
          Item: TableRowWrapper,
          ...components,
        }}
        topItemCount={1}
        totalCount={data.length + 1}
        fixedItemHeight={rowHeight}
        defaultItemHeight={rowHeight}
        isScrolling={(newScrolling) => {
          if (newScrolling !== isScrolling) setIsScrolling(newScrolling);
        }}
        itemContent={(index) => {
          if (index === 0) {
            return (
              <div
                style={rowStyle}
                className='border-default-border bg-gray-1 text-gray-8 dark:bg-dark-6 dark:text-dark-0 grid h-[var(--rowHeight)] items-center  gap-x-8 border-b px-4 py-2 font-semibold'
              >
                {columns.map((column) => (
                  <div
                    key={column.key || column.header}
                    className={cn(column.classNames?.cell, column.classNames?.headCell)}
                  >
                    {column.header}
                  </div>
                ))}
              </div>
            );
          }

          const rowData = data[index - 1];

          return (
            <TableRow
              style={rowStyle}
              key={rowData[keyPath]}
              onClick={() => {
                onRowClick?.(rowData);
              }}
            >
              {columns.map((column) => {
                const cell = column.cell(rowData, index - 1, isScrolling);
                const truncate = column.truncate ?? true ? 'truncate' : '';

                return (
                  <div
                    key={column.key || column.header}
                    className={cn(
                      'flex h-full items-center',
                      column.classNames?.cell,
                      column.classNames?.dataCell,
                      truncate,
                    )}
                  >
                    <span className={truncate} title={typeof cell === 'string' ? cell : undefined}>
                      {cell}
                    </span>
                  </div>
                );
              })}
              <MenuComponent row={rowData} menuFn={menu} />
            </TableRow>
          );
        }}
      />
    </div>
  );
}
