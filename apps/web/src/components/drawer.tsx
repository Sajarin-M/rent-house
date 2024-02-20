import { PropsWithChildren, ReactNode } from 'react';
import { cn } from '@/utils/fns';
import {
  DividerProps,
  Loader,
  Divider as MDivider,
  Drawer as MDrawer,
  DrawerProps as MDrawerProps,
  ScrollArea,
} from '@mantine/core';

type DrawerRootProps = Omit<MDrawerProps, 'title' | 'withCloseButton'>;

export type GenerateDrawerProps = { onClose: VoidFunction };

function generateDrawer<TProps>(
  Component: (props: TProps) => JSX.Element,
  defaultProps?: Pick<DrawerRootProps, 'size' | 'position'>,
) {
  return ({ drawerProps, ...rest }: Omit<TProps, 'onClose'> & { drawerProps: DrawerRootProps }) => (
    <DrawerRoot {...defaultProps} {...drawerProps}>
      <Component {...(rest as any)} onClose={drawerProps.onClose} />
    </DrawerRoot>
  );
}

function DrawerRoot({ ...props }: DrawerRootProps) {
  return (
    <MDrawer
      {...props}
      padding={0}
      withCloseButton={false}
      classNames={{
        body: 'flex grow flex-col overflow-hidden',
        content: 'flex max-h-full overflow-hidden',
      }}
    />
  );
}

type DrawerContentProps = PropsWithChildren & {
  title: string;
  titleSlot?: ReactNode;
  isLoading?: boolean;
};

function DrawerContent({ isLoading, title, titleSlot, children }: DrawerContentProps) {
  return (
    <>
      <MDrawer.Header className='px-lg py-md'>
        <MDrawer.Title className='font-semibold'>{title}</MDrawer.Title>
        {titleSlot}
        <MDrawer.CloseButton className='-mr-2' />
      </MDrawer.Header>
      <Divider />
      {isLoading ? (
        <div className='flex grow items-center justify-center'>
          <Loader type='bars' size='sm' />
        </div>
      ) : (
        <ScrollArea className='grow'>
          <div className='p-lg'>{children}</div>
        </ScrollArea>
      )}
    </>
  );
}

function Divider({ className, ...rest }: DividerProps) {
  return <MDivider className={cn('-mx-lg', className)} {...rest} />;
}

const Drawer = {
  Divider,
  Root: DrawerRoot,
  Content: DrawerContent,
  generateDrawer,
};

export default Drawer;
