import { Badge, MantineColor } from '@mantine/core';
import { RentOutStatus } from '@/types';

const colorMap: Record<RentOutStatus, MantineColor> = {
  Pending: 'red',
  Partially_Returned: 'indigo',
  Returned: 'green.8',
};

export default function RentOutStatusBadge({ status }: { status: RentOutStatus }) {
  return (
    <Badge size='sm' color={colorMap[status]}>
      {status.replaceAll('_', ' ')}
    </Badge>
  );
}
