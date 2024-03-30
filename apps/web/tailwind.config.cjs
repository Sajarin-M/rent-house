const pluginAnimate = require('tailwindcss-animate');
const pluginMantine = require('@devoss/tailwind-plugin-mantine');
const mantineTheme = require('./src/context/theme/theme').theme;

const heights = {
  toolbar: 'var(--h-toolbar)',
  content: 'var(--h-content)',
};

const widths = {
  'action-btn': 'var(--w-action-btn)',
  sidebar: 'var(--w-sidebar)',
  scrollbar: 'var(--w-scrollbar)',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      height: heights,
      width: widths,
      minWidth: widths,
      maxWidth: widths,
      minHeight: heights,
      maxHeight: heights,
      scrollMargin: heights,
    },
  },
  plugins: [pluginAnimate, pluginMantine(mantineTheme)],
};
