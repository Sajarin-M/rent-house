import { forwardRef, RefObject, useRef } from 'react';
import { ScrollArea, ScrollAreaProps } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';

export type InfiniteScrollAreaProps = Omit<
  ScrollAreaProps,
  'onScrollPositionChange' | 'viewportRef'
> & {
  onEndReached?: VoidFunction;
};

export const InfiniteScrollArea = forwardRef<HTMLDivElement, InfiniteScrollAreaProps>(
  ({ onEndReached, ...rest }, ref) => {
    const innerRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRef(ref, innerRef) as unknown as RefObject<HTMLDivElement>;

    return (
      <ScrollArea
        {...rest}
        viewportRef={mergedRef}
        onScrollPositionChange={({ y }) => {
          if (
            innerRef.current &&
            Math.ceil(y) >= innerRef.current.scrollHeight - innerRef.current.offsetHeight - 5
          ) {
            onEndReached?.();
          }
        }}
      />
    );
  },
);

export const FlexScrollArea = forwardRef<HTMLDivElement, InfiniteScrollAreaProps>(
  ({ style, ...rest }, ref) => {
    return (
      <InfiniteScrollArea ref={ref} style={{ ...style, height: '1px', flexGrow: 1 }} {...rest} />
    );
  },
);
