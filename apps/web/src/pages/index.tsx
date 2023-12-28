import { Route, Routes } from 'react-router-dom';
import Sidebar from '@/components/sidebar';
import Customers from '@/pages/customers';
import Home from '@/pages/home';

export default function Pages() {
  return (
    <div className='flex h-screen w-screen'>
      <Sidebar />
      <div className='h-screen grow'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/customers' element={<Customers />} />
        </Routes>
      </div>
    </div>
  );
}
