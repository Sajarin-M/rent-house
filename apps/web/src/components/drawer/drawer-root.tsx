import { Drawer as MDrawer, DrawerProps as MDrawerProps } from '@mantine/core';

export type DrawerRootProps = Omit<MDrawerProps, 'title' | 'withCloseButton'>;

export type DrawerCommonProps = { onClose: VoidFunction };

export default function DrawerRoot({ ...props }: DrawerRootProps) {
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
