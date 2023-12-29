import { TbHome, TbLogout, TbShoppingBag, TbUsers } from 'react-icons/tb';
import { Link, useLocation } from 'react-router-dom';
import { Code } from '@mantine/core';

const sidebarItems = [
  { href: '/', label: 'Home', icon: TbHome },
  { href: '/customers', label: 'Customers', icon: TbUsers, size: '1.3rem' },
  { href: '/rent-outs', label: 'Rent Outs', icon: TbShoppingBag },
];
export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <nav className='border-default-border p-sm w-sidebar flex h-screen flex-col border-r border-solid'>
      <div className='flex-grow'>
        <div className='border-default-border py-sm mb-sm -mt-sm h-toolbar flex items-center justify-between border-b border-solid'>
          {/* <MantineLogo size={28} /> */}
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

      <div className='border-default-border mt-sm py-sm -mb-sm border-t border-solid'>
        <SidebarItem icon={TbLogout} href='/logout' label='Logout' />
      </div>
    </nav>
  );
}

type SidebarItemProps = {
  isActive?: boolean;
  href: string;
  icon: React.FC<{ className?: string; stroke?: number; size: string }>;
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
