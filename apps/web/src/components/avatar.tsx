import { ComponentPropsWithoutRef } from 'react';
import { Avatar as MAvatar, AvatarProps as MAvatarProps } from '@mantine/core';
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

export type AvatarProps = MAvatarProps &
  Omit<ComponentPropsWithoutRef<'div'>, keyof MAvatarProps> & {
    text?: string;
    name?: string;
  };

export default function Avatar({ text, name, src, size = 46, className, ...rest }: AvatarProps) {
  src = name ? getImageUrl(name) : src;

  return (
    <MAvatar
      {...rest}
      src={src}
      size={size}
      radius='xl'
      className={cn('border-default-border border border-solid', className)}
      classNames={{ placeholder: cn(getRandomColor(text), 'text-lg text-white') }}
    >
      {text?.charAt(0).toUpperCase()}
    </MAvatar>
  );
}
