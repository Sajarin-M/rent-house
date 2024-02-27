import { Link } from 'react-router-dom';
import { Button } from '@mantine/core';
import Content from '@/components/content';

export default function Home() {
  return (
    <Content>
      <div className='grid grid-cols-4 gap-4'>
        <Button
          className='flex h-24 flex-col items-center shadow-lg'
          component={Link}
          to='/rent-outs'
          variant='outline'
          size='lg'
        >
          <div className='flex flex-col items-center'>
            {/* <TbSlideshow size='1.8rem' className='mb-sm' /> */}
            <span>Rent Out</span>
          </div>
        </Button>
        <Button
          className='flex h-24 flex-col items-center shadow-lg'
          // component={Link}
          // to='sliders'
          variant='outline'
          size='lg'
        >
          <div className='flex flex-col items-center'>
            {/* <TbSlideshow size='1.8rem' className='mb-sm' /> */}
            <span>Rent Return </span>
          </div>
        </Button>
        <Button
          className='flex h-24 flex-col items-center shadow-lg'
          component={Link}
          to='/customers'
          variant='outline'
          size='lg'
        >
          <div className='flex flex-col items-center'>
            {/* <TbSlideshow size='1.8rem' className='mb-sm' /> */}
            <span>Customers</span>
          </div>
        </Button>
        <Button
          className='flex h-24 flex-col items-center shadow-lg'
          component={Link}
          to='/products'
          variant='outline'
          size='lg'
        >
          <div className='flex flex-col items-center'>
            {/* <TbSlideshow size='1.8rem' className='mb-sm' /> */}
            <span>Products</span>
          </div>
        </Button>
      </div>
    </Content>
  );
}
