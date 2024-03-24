import DrawerContent from './drawer-content';
import DrawerDivider from './drawer-divider';
import DrawerRoot from './drawer-root';
import DrawerWrapper from './drawer-wrapper';

export const Drawer = {
  Root: DrawerRoot,
  Content: DrawerContent,
  Wrapper: DrawerWrapper,
  Divider: DrawerDivider,
};

export { default as DrawerContent } from './drawer-content';
export { default as DrawerDivider } from './drawer-divider';
export { default as DrawerRoot, type DrawerCommonProps, type DrawerRootProps } from './drawer-root';
export {
  default as DrawerWrapper,
  type DrawerWrapperProps,
  type GenerateDrawerWrapperProps,
} from './drawer-wrapper';
