import { PropsWithChildren } from 'react';
import { createTheme, Loader, MantineProvider as MMantineProvider, Modal } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

export const theme = createTheme({
  components: {
    Modal: Modal.extend({
      defaultProps: {
        classNames: { title: 'font-semibold' },
        closeOnEscape: false,
        closeOnClickOutside: false,
      },
    }),
    Loader: Loader.extend({
      defaultProps: {
        type: 'dots',
        size: 'xs',
      },
    }),
  },
});

export default function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <MMantineProvider theme={theme}>
      <Notifications position='top-right' />
      <ModalsProvider labels={{ cancel: 'Cancel', confirm: 'Confirm' }}>{children}</ModalsProvider>
    </MMantineProvider>
  );
}
