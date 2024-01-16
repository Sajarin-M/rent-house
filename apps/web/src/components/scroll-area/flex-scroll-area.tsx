import { forwardRef } from 'react';
import InfiniteScrollArea, { InfiniteScrollAreaProps } from './infinite-scroll-area';

export type FlexScrollAreaProps = InfiniteScrollAreaProps;

const FlexScrollArea = forwardRef<HTMLDivElement, InfiniteScrollAreaProps>(
  ({ style, ...rest }, ref) => {
    return (
      <InfiniteScrollArea ref={ref} style={{ ...style, height: '1px', flexGrow: 1 }} {...rest} />
    );
  },
);

export default FlexScrollArea;
