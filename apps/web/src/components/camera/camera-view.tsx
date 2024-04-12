import { useState } from 'react';
import { TbMinimize } from 'react-icons/tb';
import { ActionIcon, Portal } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { cn } from '@/utils/fns';
import { useCamera } from './use-camera';

export type CameraViewProps = {
  onCapture?: (image: File) => void;
};

const cameraPortal = document.createElement('div');
cameraPortal.id = 'camera-portal';
document.body.appendChild(cameraPortal);

export default function CameraView({ onCapture }: CameraViewProps) {
  const { videoRef, captureImage, permissionGranted } = useCamera();
  const [fullScreen, setFullScreen] = useState(false);

  async function handleCapture() {
    if (!permissionGranted) return;
    try {
      const imageFile = await captureImage();
      onCapture?.(imageFile);
      setFullScreen(false);
    } catch (error) {
      console.log(error);
    }
  }

  useHotkeys([['alt+c', handleCapture]], []);

  return (
    <Portal target={cameraPortal}>
      <div
        className={cn(
          'bg-dark-6 fixed bottom-4 right-4 z-[calc(var(--mantine-z-index-modal)+1)] aspect-video w-[10rem] origin-bottom-right rounded-sm transition-all duration-200',
          fullScreen && 'bottom-0 right-0 h-screen w-screen rounded-none',
          !permissionGranted && 'pointer-events-none hidden',
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
    </Portal>
  );
}
