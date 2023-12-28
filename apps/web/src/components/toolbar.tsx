import { ComponentProps, PropsWithChildren } from 'react';
import { cn } from '@/utils/fns';

export default function Toolbar({ className, ...rest }: PropsWithChildren & ComponentProps<'div'>) {
  return (
    <div className={cn('gap-sm h-toolbar -mt-sm py-sm flex items-center', className)} {...rest} />
  );
}
