import { useState } from 'react';
import { Code, Group } from '@mantine/core';
import {
  Icon2fa,
  IconBellRinging,
  IconDatabaseImport,
  IconFingerprint,
  IconKey,
  IconLogout,
  IconReceipt2,
  IconSettings,
  IconSwitchHorizontal,
} from '@tabler/icons-react';

const data = [
  { link: '', label: 'Notifications', icon: IconBellRinging },
  { link: '', label: 'Billing', icon: IconReceipt2 },
  { link: '', label: 'Security', icon: IconFingerprint },
  { link: '', label: 'SSH Keys', icon: IconKey },
  { link: '', label: 'Databases', icon: IconDatabaseImport },
  { link: '', label: 'Authentication', icon: Icon2fa },
  { link: '', label: 'Other Settings', icon: IconSettings },
];
export default function Pages() {
  const [active, setActive] = useState('Billing');

  const links = data.map((item) => (
    <a
      className='text-gray-7 hover:bg-gray-0 data-[active]:bg-blue data-[active]:text-blue  dark:text-dark-1 dark:hover:bg-dark-6 px-sm py-xs group flex items-center rounded-sm text-sm font-medium no-underline hover:text-black dark:hover:text-white'
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
    >
      <item.icon className='mr-sm text-gray-6 dark:text-dark-2 h-[25px] w-[25px]' stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className='d-flex border-gray-3 p-md dark:border-dark-4 h-screen w-[300px] flex-col border-r border-solid'>
      <div className='flex-grow'>
        <Group
          className='border-gray-3 dark:border-dark-4 mb-6 border-b border-solid pb-4'
          justify='space-between'
        >
          {/* <MantineLogo size={28} /> */}
          <Code fw={700}>v3.1.2</Code>
        </Group>
        {links}
      </div>

      <div className='border-gray-3 dark:border-dark-4 mt-4 border-t border-solid pt-4'>
        <a
          href='#'
          className='text-gray-7 hover:bg-gray-0 data-[active]:bg-blue data-[active]:text-blue dark:text-dark-1 dark:hover:bg-dark-6 group flex items-center rounded-sm px-2 py-1 text-sm font-medium no-underline hover:text-black dark:hover:text-white'
          onClick={(event) => event.preventDefault()}
        >
          <IconSwitchHorizontal className='group-hover:text-black' stroke={1.5} />
          <span>Change account</span>
        </a>

        <a
          href='#'
          className='text-gray-7 hover:bg-gray-0 data-[active]:bg-blue data-[active]:text-blue  dark:text-dark-1 dark:hover:bg-dark-6 group flex items-center rounded-sm px-2 py-1 text-sm font-medium no-underline hover:text-black dark:hover:text-white'
          onClick={(event) => event.preventDefault()}
        >
          <IconLogout
            className='mr-sm text-gray-6 dark:text-dark-2 h-[25px] w-[25px]'
            stroke={1.5}
          />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}
