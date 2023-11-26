const heights = {
  navbar: 'var(--h-navbar)',
  content: 'var(--h-content)',
};

const widths = {
  'action-btn': 'var(--w-action-btn)',
  'sidebar-open': 'var(--w-sidebar-open)',
  'sidebar-closed': 'var(--w-sidebar-closed)',
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
  plugins: [require('tailwindcss-animate'), require('@rent-house/tailwind-mantine')],
};
