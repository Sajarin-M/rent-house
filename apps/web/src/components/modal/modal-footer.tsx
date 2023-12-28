import { Divider, Group, GroupProps } from '@mantine/core';

export type ModalFooterProps = GroupProps & {
  withDivider?: boolean;
};

export default function ModalFooter({ withDivider = true, ...rest }: ModalFooterProps) {
  return (
    <>
      {withDivider && <Divider />}
      <Group justify='flex-end' p='lg' {...rest} />
    </>
  );
}
