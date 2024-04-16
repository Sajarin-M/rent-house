import { useState } from 'react';
import { cn } from '@/utils/fns';
import { getImageUrl } from '@/utils/images';

const colors = [
  'bg-[#f44336]',
  'bg-[#e91e63]',
  'bg-[#9c27b0]',
  'bg-[#673ab7]',
  'bg-[#3f51b5]',
  'bg-[#2196f3]',
  'bg-[#03a9f4]',
  'bg-[#00bcd4]',
  'bg-[#009688]',
  'bg-[#4caf50]',
  'bg-[#8bc34a]',
  'bg-[#cddc39]',
];

function getRandomColor(letter?: string) {
  if (!letter) return '#fff';
  const index = letter.charCodeAt(0) % colors.length;
  return colors[index];
}

export type AvatarProps = {
  name?: string;
  src?: string;
  text?: string;
  className?: string;
};

export default function Avatar({ name, src, text, className }: AvatarProps) {
  const [error, setError] = useState(false);

  if (!error && (name || src)) {
    return (
      <img
        alt={text}
        src={src || getImageUrl(name!)}
        className={cn('size-[46px] rounded-full', className)}
        onLoad={() => {
          if (error) setError(false);
        }}
        onError={() => {
          setError(true);
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        'border-default-border flex size-[46px] shrink-0 items-center justify-center rounded-full border text-lg font-semibold text-white',
        getRandomColor(text),
        className,
      )}
    >
      {text?.charAt(0).toUpperCase()}
    </div>
  );
}
