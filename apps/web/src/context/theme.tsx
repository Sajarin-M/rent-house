import { PropsWithChildren } from 'react';
import {
  createTheme,
  Loader,
  MantineProvider as MMantineProvider,
  Modal,
  MultiSelect,
  NumberInput,
  ScrollArea,
  Select,
} from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

const selectProps = {
  searchable: true,
  clearable: true,
} as const;

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
    Select: Select.extend({
      defaultProps: selectProps,
    }),
    MultiSelect: MultiSelect.extend({
      defaultProps: selectProps,
    }),
    ScrollArea: ScrollArea.extend({
      defaultProps: {
        scrollbarSize: '0.45rem',
      },
    }),
    ScrollAreaAutosize: ScrollArea.Autosize.extend({
      defaultProps: {
        scrollbarSize: '0.45rem',
      },
    }),
    NumberInput: NumberInput.extend({
      defaultProps: {
        hideControls: true,
        clampBehavior: 'strict',
      },
    }),
  },
});

export default function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <MMantineProvider theme={theme}>
      <DatesProvider settings={{ firstDayOfWeek: 0, weekendDays: [0], consistentWeeks: true }}>
        <Notifications position='top-right' />
        <ModalsProvider labels={{ cancel: 'Cancel', confirm: 'Confirm' }}>
          {children}
        </ModalsProvider>
      </DatesProvider>
    </MMantineProvider>
  );
}
