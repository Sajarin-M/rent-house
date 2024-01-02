import { Route, Routes } from 'react-router-dom';
import Dashboard from '@/components/dashboard';
import Customers from '@/pages/customers';
import Home from '@/pages/home';
import Login from '@/pages/login';
import Logout from '@/pages/logout';
import RentOuts from '@/pages/rent-outs';
import Test from '@/pages/test';
import Products from './products';

export default function Pages() {
  return (
    <Routes>
      <Route path='/' element={<Dashboard />}>
        <Route index element={<Home />} />
        <Route path='/customers' element={<Customers />} />
        <Route path='/rent-outs' element={<RentOuts />} />
        <Route path='/products' element={<Products />} />
      </Route>
      <Route path='/login' element={<Login />} />
      <Route path='/logout' element={<Logout />} />
      <Route path='/test' element={<Test />} />
    </Routes>
  );
}
