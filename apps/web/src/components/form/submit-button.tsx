import { ComponentPropsWithoutRef, useState } from 'react';
import { Control, FieldValues, useFormState } from 'react-hook-form';
import { Button, ButtonProps, Tooltip } from '@mantine/core';

export type SubmitButtonProps<T extends FieldValues = FieldValues> = ButtonProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonProps> & {
    control: Control<T>;
    checkDirty?: (forDirty: boolean) => boolean;
    disableOnFresh?: boolean;
  };

export default function SubmitButton<T extends FieldValues>({
  control,
  loading,
  onClick,
  children,
  type = 'submit',
  checkDirty,
  disableOnFresh,
  ...rest
}: SubmitButtonProps<T>) {
  const { isSubmitting, isDirty: formIsDirty } = useFormState({
    control,
  });
  const [showTooltip, setShowTooltip] = useState(false);

  const isDirty = checkDirty ? checkDirty(formIsDirty) : formIsDirty;

  return (
    <Tooltip
      withArrow
      withinPortal
      label='Change something to save'
      disabled={isDirty || !disableOnFresh || !showTooltip}
    >
      <Button
        {...rest}
        type={type}
        loading={loading || isSubmitting}
        onClick={(e) => {
          if (disableOnFresh) {
            if (isDirty) {
              onClick?.(e);
            } else {
              setShowTooltip(true);
              e.preventDefault();
              e.stopPropagation();
            }
          } else {
            onClick?.(e);
          }
        }}
      >
        {children}
      </Button>
    </Tooltip>
  );
}
