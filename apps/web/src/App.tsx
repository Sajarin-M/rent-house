import { MantineProvider } from '@mantine/core';
import Pages from '@/pages';

export default function App() {
  return (
    <MantineProvider>
      <Pages />
    </MantineProvider>
  );
}
