import { useState } from 'react';
import { TbMinimize } from 'react-icons/tb';
import { ActionIcon } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { cn } from '@/utils/fns';
import { useCamera } from './use-camera';

export type CameraViewProps = {
  onCapture?: (image: File) => void;
};

export default function CameraView({ onCapture }: CameraViewProps) {
  const { videoRef, captureImage } = useCamera();
  const [fullScreen, setFullScreen] = useState(false);

  async function handleCapture() {
    try {
      const imageFile = await captureImage();
      onCapture?.(imageFile);
      setFullScreen(false);
    } catch (error) {
      console.log(error);
    }
  }

  useHotkeys([['alt+c', handleCapture]]);

  return (
    <div
      className={cn(
        'bg-dark-6 fixed bottom-4 right-4 z-50 aspect-video w-[10rem] origin-bottom-right rounded-sm transition-all duration-200',
        fullScreen && 'bottom-0 right-0 h-screen w-screen rounded-none',
      )}
      onClick={() => {
        if (!fullScreen) setFullScreen(true);
      }}
    >
      {fullScreen && (
        <ActionIcon
          size='lg'
          variant='subtle'
          className='absolute right-2 top-2 z-10'
          onClick={() => setFullScreen((prev) => !prev)}
        >
          <TbMinimize className='size-[1.5rem]' />
        </ActionIcon>
      )}
      <video className='h-full w-full' ref={videoRef} autoPlay playsInline muted />
      <div
        className={cn(
          'delay bottom-xl delay-250 invisible absolute left-0 flex w-screen items-center justify-center opacity-0 transition-all',
          fullScreen && 'visible opacity-100',
        )}
      >
        <ActionIcon
          radius='xl'
          size='xl'
          color='red.6'
          className='ring-gray-5 ring-4'
          onClick={handleCapture}
        ></ActionIcon>
      </div>
    </div>
  );
}
