import { ComponentPropsWithoutRef, ForwardedRef, RefObject } from 'react';
import { Box, BoxProps, LoadingOverlay, ScrollArea } from '@mantine/core';

type ModalContentProps = BoxProps &
  Omit<ComponentPropsWithoutRef<'div'>, keyof BoxProps> & {
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
  const mergedRest: typeof rest = { p: 'lg', ...rest };
  return (
    <ScrollArea ref={scrollerRef} className='grow'>
      <LoadingOverlay
        visible={Boolean(isLoading)}
        overlayProps={{ blur: 4 }}
        loaderProps={{ size: 'md' }}
      />
      <Box ref={contentRef} {...mergedRest} />
    </ScrollArea>
  );
}
