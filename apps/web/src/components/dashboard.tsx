import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import Sidebar from '@/components/sidebar';

export default function Dashboard() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return (
      <Navigate
        to='/login'
        state={{
          from: location.pathname,
        }}
        replace
      />
    );
  }

  return (
    <div className='flex h-screen w-screen'>
      <Sidebar />
      <div className='h-screen grow'>
        <Outlet />
      </div>
    </div>
  );
}
