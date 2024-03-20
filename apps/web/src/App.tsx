import AuthProvider from '@/context/auth';
import { ThemeProvider } from '@/context/theme';
import { TrpcProvider } from '@/context/trpc';
import Pages from '@/pages';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TrpcProvider>
          <Pages />
        </TrpcProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
