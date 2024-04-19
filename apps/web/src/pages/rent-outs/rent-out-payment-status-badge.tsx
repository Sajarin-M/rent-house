import { Badge, MantineColor } from '@mantine/core';
import { RentOutPaymentStatus } from '@/types';

const colorMap: Record<RentOutPaymentStatus, MantineColor> = {
  Pending: 'red',
  Partially_Paid: 'indigo',
  Paid: 'green',
};

export default function RentOutPaymentStatusBadge({ status }: { status: RentOutPaymentStatus }) {
  return (
    <Badge size='sm' color={colorMap[status]}>
      {status.replaceAll('_', ' ')}
    </Badge>
  );
}
