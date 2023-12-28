import ThemeProvider from '@/context/theme';
import { TrpcProvider } from '@/context/trpc';
import Pages from '@/pages';

export default function App() {
  return (
    <ThemeProvider>
      <TrpcProvider>
        <Pages />
      </TrpcProvider>
    </ThemeProvider>
  );
}
