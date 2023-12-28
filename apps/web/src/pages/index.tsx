import { Route, Routes } from 'react-router-dom';
import Dashboard from '@/components/dashboard';
import Customers from '@/pages/customers';
import Home from '@/pages/home';
import Login from '@/pages/login';
import Logout from '@/pages/logout';

export default function Pages() {
  return (
    <Routes>
      <Route path='/' element={<Dashboard />}>
        <Route index element={<Home />} />
        <Route path='/customers' element={<Customers />} />
      </Route>
      <Route path='/login' element={<Login />} />
      <Route path='/logout' element={<Logout />} />
    </Routes>
  );
}
