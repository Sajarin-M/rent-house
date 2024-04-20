import { FaMoon, FaSun } from 'react-icons/fa6';
import {
  TbChevronCompactLeft,
  TbHammer,
  TbHome,
  TbLogout,
  TbMoneybag,
  TbRotateClockwise,
  TbShoppingBag,
  TbUsers,
} from 'react-icons/tb';
import { Link, useLocation } from 'react-router-dom';
import { Button, Code, px, useMantineColorScheme } from '@mantine/core';
import { useHotkeys, useLocalStorage, useMouse } from '@mantine/hooks';
import { cn } from '@/utils/fns';

const sidebarItems = [
  { href: '/', label: 'Home', icon: TbHome },
  { href: '/customers', label: 'Customers', icon: TbUsers, size: '1.3rem' },
  { href: '/products', label: 'Products', icon: TbShoppingBag },
  { href: '/rent-outs', label: 'Rent Outs', icon: TbHammer },
  { href: '/rent-returns', label: 'Rent Returns', icon: TbRotateClockwise },
  { href: '/payments', label: 'Payments', icon: TbMoneybag },
];
export default function Sidebar() {
  const { pathname } = useLocation();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [opened, setOpened] = useLocalStorage({
    key: 'sidebar-opened',
    defaultValue: true,
    getInitialValueInEffect: false,
  });

  useHotkeys([['mod+k', () => toggleColorScheme()]]);

  const mouse = useMouse();

  return (
    <div className='relative'>
      <div
        className={cn(
          'border-default-border flex h-screen flex-col border-r border-solid transition-all',
          opened && 'p-sm w-sidebar',
          !opened && 'invisible w-0 !p-0 opacity-0 *:hidden',
        )}
      >
        <div className='flex-grow'>
          <div className='border-default-border py-sm mb-sm -mt-sm h-toolbar flex items-center justify-between border-b border-solid'>
            <img src='/logo.png' className='h-8' />
            <Code fw={700}>v1.0.0</Code>
          </div>
          {sidebarItems.map((item) => {
            const isActive = item.href === pathname;
            return (
              <SidebarItem
                icon={item.icon}
                size={item.size}
                href={item.href}
                key={item.label}
                label={item.label}
                isActive={isActive ? true : undefined}
              />
            );
          })}
        </div>
        <Button
          variant='outline'
          onClick={() => toggleColorScheme()}
          leftSection={colorScheme === 'dark' ? <FaSun /> : <FaMoon />}
          color={colorScheme === 'dark' ? 'yellow' : 'dark'}
        >
          {colorScheme === 'dark' ? 'Light' : 'Dark'} Mode
        </Button>
        <div className='border-default-border mt-sm py-sm -mb-sm border-t border-solid'>
          <SidebarItem icon={TbLogout} href='/logout' label='Logout' />
        </div>
      </div>
      <button
        type='button'
        onClick={() => setOpened((prev) => !prev)}
        className={cn(
          'dark:bg-dark-6 bg-gray-2 border-default-border absolute right-0 top-1/2 flex h-[2rem] w-[1rem] translate-x-1/2 cursor-pointer items-center justify-center rounded-sm border transition-all',
          !opened && 'invisible translate-x-full opacity-0',
          mouse.x < Number(px('1rem')) && 'visible opacity-100',
        )}
      >
        <TbChevronCompactLeft
          size='1.3rem'
          className={cn('transition-all', !opened && 'rotate-180')}
        />
      </button>
    </div>
  );
}

type SidebarItemProps = {
  isActive?: boolean;
  href: string;
  icon: React.FC<{ className?: string; size?: string | number }>;
  label: string;
  size?: string;
};

function SidebarItem({ href, icon: Icon, label, isActive, size = '1.35rem' }: SidebarItemProps) {
  return (
    <Link
      data-active={isActive}
      className={
        'text-gray-7 gap-sm dark:text-dark-1 px-sm py-xs hover:bg-gray-0 dark:hover:bg-dark-6 data-[active]:text-primary-light-color data-[active]:hover:text-primary-light-color data-[active]:bg-primary-light data-[active]:hover:bg-primary-light group flex items-center rounded-sm text-sm font-semibold no-underline hover:text-black dark:hover:text-white'
      }
      to={href}
    >
      <Icon
        size={size}
        className='group-data-[active]:text-primary-light-color group-hover:text-black dark:group-hover:text-white'
      />
      <span>{label}</span>
    </Link>
  );
}
