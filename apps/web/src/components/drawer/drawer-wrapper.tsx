import DrawerRoot, { DrawerRootProps } from './drawer-root';

export type DrawerWrapperProps<TProps> = Omit<TProps, 'onClose'> &
  Partial<Pick<DrawerRootProps, 'size' | 'position'>> & {
    component: (props: TProps) => JSX.Element;
    drawerProps: DrawerRootProps;
  };

export type GenerateDrawerWrapperProps<TProps> = Omit<DrawerWrapperProps<TProps>, 'component'>;

export default function DrawerWrapper<TProps>({
  component: Component,
  drawerProps,
  position,
  size,
  ...rest
}: DrawerWrapperProps<TProps>) {
  return (
    <DrawerRoot size={size} position={position} {...drawerProps}>
      <Component {...(rest as any)} onClose={drawerProps.onClose} />
    </DrawerRoot>
  );
}
