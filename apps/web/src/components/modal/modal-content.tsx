import { ComponentPropsWithoutRef, ForwardedRef, RefObject } from 'react';
import { LoadingOverlay, ScrollArea } from '@mantine/core';

type ModalContentProps = ComponentPropsWithoutRef<'div'> & {
  scrollerRef?: ForwardedRef<HTMLDivElement>;
  contentRef?: ((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement>;
  isLoading?: boolean;
};

export default function ModalContent({
  scrollerRef,
  contentRef,
  isLoading,
  ...rest
}: ModalContentProps) {
  return (
    <ScrollArea ref={scrollerRef} className='grow'>
      <LoadingOverlay
        visible={Boolean(isLoading)}
        overlayProps={{ blur: 4 }}
        loaderProps={{ size: 'md' }}
      />
      <div ref={contentRef} className='p-md' {...rest} />
    </ScrollArea>
  );
}
