import { forwardRef, ReactNode } from 'react';
import { TbCopy, TbDots, TbEdit, TbEye, TbPrinter, TbTrash } from 'react-icons/tb';
import {
  ActionIcon,
  ActionIconProps,
  MenuDropdownProps,
  Menu as MMenu,
  MenuProps as MMenuProps,
} from '@mantine/core';

export type MenuItem = {
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  onClick: VoidFunction;
};

export type MenuProps = MMenuProps & {
  items: MenuItem[];
  buttonProps?: MenuButtonProps;
  dropDownProps?: MenuDropdownProps;
};

const menuPortal = document.createElement('div');
menuPortal.id = 'menu-portal';
document.body.appendChild(menuPortal);

export function Menu({ items, buttonProps, dropDownProps, ...rest }: MenuProps) {
  return (
    <MMenu
      {...rest}
      shadow='xl'
      withArrow
      offset={-4}
      withinPortal
      position='left-end'
      portalProps={{ target: menuPortal }}
      transitionProps={{ transition: 'skew-down' }}
    >
      <MMenu.Target>
        <MenuButton {...buttonProps} />
      </MMenu.Target>

      <MMenu.Dropdown {...dropDownProps}>
        {items.map((item) => (
          <MMenu.Item
            key={item.label}
            onClick={item.onClick}
            leftSection={item.icon}
            disabled={Boolean(item.disabled)}
          >
            {item.label}
          </MMenu.Item>
        ))}
      </MMenu.Dropdown>
    </MMenu>
  );
}

type MenuButtonProps = Partial<
  ActionIconProps & Omit<React.ComponentPropsWithoutRef<'button'>, keyof ActionIconProps>
>;

export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>((props, ref) => {
  return (
    <ActionIcon ref={ref} {...props} variant='transparent' className='text-text'>
      <TbDots size='1.2rem' />
    </ActionIcon>
  );
});

export const menuItems: Record<
  'edit' | 'delete' | 'print' | 'clone' | 'view',
  (handler: VoidFunction, disabled?: boolean) => MenuItem
> = {
  edit: (handler, disabled) => ({
    label: 'Edit',
    icon: <TbEdit />,
    onClick: handler,
    disabled,
  }),
  delete: (handler, disabled) => ({
    label: 'Delete',
    icon: <TbTrash />,
    onClick: handler,
    disabled,
  }),
  print: (handler, disabled) => ({
    label: 'Print',
    icon: <TbPrinter />,
    onClick: handler,
    disabled,
  }),
  clone: (handler, disabled) => ({
    label: 'Clone',
    icon: <TbCopy />,
    onClick: handler,
    disabled,
  }),
  view: (handler, disabled) => ({
    icon: <TbEye />,
    label: 'View',
    onClick: handler,
    disabled,
  }),
} as const;
