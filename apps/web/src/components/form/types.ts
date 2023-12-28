import { ComponentProps, JSXElementConstructor } from 'react';
import { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';

export type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Pick<ControllerProps<TFieldValues, TName>, 'name' | 'control' | 'rules'>;

export type OmittedComponentProps<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
> = Omit<ComponentProps<T>, 'onChange' | 'onBlur' | 'checked' | 'value' | 'ref'>;
