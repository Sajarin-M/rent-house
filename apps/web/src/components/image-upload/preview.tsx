import { FaImage } from 'react-icons/fa6';
import { cn } from '@/utils/fns';

type PreviewProps = {
  src?: string;
  onClick?: VoidFunction;
  isSelected?: boolean;
  onLoad?: VoidFunction;
};

export default function Preview({ src, onClick, isSelected }: PreviewProps) {
  return (
    <div
      className={cn(
        'border-default-border dark:bg-dark-6 relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-sm border',
        isSelected && 'ring-1',
      )}
      onClick={onClick}
    >
      {src ? <img className='h-full w-full object-cover' src={src} /> : <FaImage size='3.2rem' />}
    </div>
  );
}
