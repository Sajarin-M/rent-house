import { createContext, PropsWithChildren, useContext } from 'react';
import { useLocalStorage } from '@mantine/hooks';

const tokenKey = 'rent-house-auth-token';

type Context = {
  isLoggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
};

const AuthContext = createContext<Context | null>(null);
AuthContext.displayName = 'Auth Context';

export default function AuthProvider({ children }: PropsWithChildren) {
  const [isLoggedIn, setLoggedIn] = useLocalStorage({
    key: tokenKey,
    defaultValue: false,
    getInitialValueInEffect: false,
  });

  return (
    <AuthContext.Provider
      value={
        {
          isLoggedIn,
          setLoggedIn,
        } as Context
      }
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
