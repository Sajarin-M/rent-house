import {
  createTheme,
  Loader,
  Modal,
  MultiSelect,
  NumberInput,
  ScrollArea,
  Select,
} from '@mantine/core';
import { DateInput, DatePickerInput } from '@mantine/dates';

const selectProps = {
  searchable: true,
  clearable: true,
} as const;

export const defaultDateFormat = 'DD MMM YYYY';

export const theme = createTheme({
  primaryShade: 7,
  components: {
    Modal: Modal.extend({
      defaultProps: {
        classNames: { title: 'font-semibold' },
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
    DateInput: DateInput.extend({
      defaultProps: {
        valueFormat: defaultDateFormat,
        // dateParser: (input) =>
        //   dayjs(
        //     input,
        //     ['D/M/YY', 'D/M/YYYY', 'DD/MM/YY', 'DD/MM/YYYY', 'MM/YY', 'M/YY', 'YYYY'],
        //     true,
        //   ).toDate(),
      },
    }),
    DatePickerInput: DatePickerInput.extend({
      defaultProps: {
        valueFormat: defaultDateFormat,
      },
    }),
  },
});
