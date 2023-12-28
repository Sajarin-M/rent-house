import { ComponentProps, PropsWithChildren } from 'react';
import { ScrollArea, ScrollAreaProps } from '@mantine/core';
import { cn } from '@/utils/fns';

export default function Content({ className, ...rest }: PropsWithChildren & ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'p-md flex h-full flex-col overflow-y-auto ',

        className,
      )}
      {...rest}
    />
  );
}

function Scroller({ className, ...rest }: PropsWithChildren & ScrollAreaProps) {
  return (
    <ScrollArea
      className={cn(
        'p-md relative flex flex-col overflow-y-auto',

        className,
      )}
      {...rest}
    />
  );
}

Content.Scroller = Scroller;
