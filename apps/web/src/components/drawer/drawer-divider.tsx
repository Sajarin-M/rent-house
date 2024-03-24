import { DividerProps, Divider as MDivider } from '@mantine/core';
import { cn } from '@/utils/fns';

export default function Divider({ className, ...rest }: DividerProps) {
  return <MDivider className={cn('-mx-lg', className)} {...rest} />;
}
