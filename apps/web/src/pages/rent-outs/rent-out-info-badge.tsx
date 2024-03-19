import { Badge, MantineColor } from '@mantine/core';
import { RentOutStatus } from '@/types';

const colorMap: Record<RentOutStatus, MantineColor> = {
  Pending: 'red',
  Partially_Returned: 'yellow',
  Returned: 'green',
};

export default function RentOutInfoBadge({ status }: { status: RentOutStatus }) {
  return (
    <Badge variant='outline' size='sm' color={colorMap[status]}>
      {status.replaceAll('_', ' ')}
    </Badge>
  );
}
