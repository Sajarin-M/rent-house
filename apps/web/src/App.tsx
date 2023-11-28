import { MantineProvider } from '@mantine/core';
// import Pages from '@/pages';
import Home from './pages/home/Home';

export default function App() {
  return (
    <MantineProvider>
      {/* <Pages /> */}
      <Home />
    </MantineProvider>
  );
}
