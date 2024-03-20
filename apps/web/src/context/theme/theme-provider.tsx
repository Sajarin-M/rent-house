import { PropsWithChildren } from 'react';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { theme } from './theme';

export default function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <MantineProvider theme={theme}>
      <DatesProvider settings={{ firstDayOfWeek: 0, weekendDays: [0], consistentWeeks: true }}>
        <Notifications position='top-right' />
        <ModalsProvider labels={{ cancel: 'Cancel', confirm: 'Confirm' }}>
          {children}
        </ModalsProvider>
      </DatesProvider>
    </MantineProvider>
  );
}
