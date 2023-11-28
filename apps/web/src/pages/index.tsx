import { useLocation } from 'react-router-dom';
import { Code } from '@mantine/core';
import {
  Icon2fa,
  IconBellRinging,
  IconDatabaseImport,
  IconFingerprint,
  IconKey,
  IconLogout,
  IconReceipt2,
  IconSettings,
} from '@tabler/icons-react';

const sidebarItems = [
  { href: '', label: 'Notifications', icon: IconBellRinging },
  { href: '', label: 'Billing', icon: IconReceipt2 },
  { href: '', label: 'Security', icon: IconFingerprint },
  { href: '', label: 'SSH Keys', icon: IconKey },
  { href: '', label: 'Databases', icon: IconDatabaseImport },
  { href: '', label: 'Authentication', icon: Icon2fa },
  { href: '', label: 'Other Settings', icon: IconSettings },
];
export default function Pages() {
  const { pathname } = useLocation();

  return (
    <nav className='border-default-border p-md flex h-screen w-[17.5rem] flex-col border-r border-solid'>
      <div className='flex-grow'>
        <div className='border-default-border pb-md mb-md flex items-center justify-between border-b border-solid'>
          {/* <MantineLogo size={28} /> */}
          <Code fw={700}>v1.0.0</Code>
        </div>
        {sidebarItems.map((item) => {
          const isActive = item.href === pathname;
          return (
            <SidebarItem
              icon={item.icon}
              href={item.href}
              key={item.label}
              label={item.label}
              isActive={isActive ? true : undefined}
            />
          );
        })}
      </div>

      <div className='border-default-border mt-md pt-md border-t border-solid'>
        <SidebarItem icon={IconLogout} href='/logout' label='Logout' />
      </div>
    </nav>
  );
}

type SidebarItemProps = {
  isActive?: boolean;
  href: string;
  icon: React.FC<{ className?: string; stroke?: number }>;
  label: string;
};

function SidebarItem({ href, icon: Icon, label, isActive }: SidebarItemProps) {
  return (
    <a
      data-active={isActive}
      className={
        'text-gray-7 gap-sm dark:text-dark-1 px-sm py-xs hover:bg-gray-0 dark:hover:bg-dark-6 data-[active]:text-primary-light-color data-[active]:hover:text-primary-light-color data-[active]:bg-primary-light data-[active]:hover:bg-primary-light group flex items-center rounded-sm text-sm font-semibold no-underline hover:text-black dark:hover:text-white'
      }
      href={href}
    >
      <Icon
        stroke={1.5}
        className='group-data-[active]:text-primary-light-color group-hover:text-black dark:group-hover:text-white'
      />
      <span>{label}</span>
    </a>
  );
}
