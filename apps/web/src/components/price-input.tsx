import { ComponentPropsWithoutRef, forwardRef } from 'react';
import { NumberInput } from '@mantine/core';

export type PriceInputProps = ComponentPropsWithoutRef<typeof NumberInput>;

const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(({ onClick, ...rest }, ref) => (
  <NumberInput
    ref={ref}
    hideControls
    decimalScale={2}
    thousandSeparator=','
    thousandsGroupStyle='lakh'
    onClick={(e) => {
      if (!document.getSelection()?.toString()) e.currentTarget.select();
      onClick?.(e);
    }}
    {...rest}
  />
));

export default PriceInput;
