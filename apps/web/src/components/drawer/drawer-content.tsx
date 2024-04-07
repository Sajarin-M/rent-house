import { PropsWithChildren, ReactNode } from 'react';
import { Loader, Drawer as MDrawer, ScrollArea } from '@mantine/core';
import Divider from './drawer-divider';

type DrawerContentProps = PropsWithChildren & {
  title: string;
  titleSlot?: ReactNode;
  isLoading?: boolean;
};

export default function DrawerContent({
  isLoading,
  title,
  titleSlot,
  children,
}: DrawerContentProps) {
  return (
    <>
      <MDrawer.Header className='p-md'>
        <MDrawer.Title className='font-semibold'>{title}</MDrawer.Title>
        {titleSlot}
        <MDrawer.CloseButton className='-mr-2' />
      </MDrawer.Header>

      <Divider />

      {isLoading ? (
        <div className='flex grow items-center justify-center'>
          <Loader size='md' />
        </div>
      ) : (
        <ScrollArea className='grow'>
          <div className='p-md'>{children}</div>
        </ScrollArea>
      )}
    </>
  );
}
