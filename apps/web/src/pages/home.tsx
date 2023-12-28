import { Button } from '@mantine/core';
import Content from '@/components/content';

export default function Home() {
  return (
    <Content>
      <div className='grid grid-cols-4 gap-4'>
        <Button
          className='flex h-24 flex-col items-center shadow-lg'
          // component={Link}
          // to='sliders'
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
            <span>Rent In</span>
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
            <span>Customers</span>
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
            <span>Tools</span>
          </div>
        </Button>
      </div>
    </Content>
  );
}
