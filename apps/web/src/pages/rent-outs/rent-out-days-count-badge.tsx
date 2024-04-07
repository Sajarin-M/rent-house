import { Badge } from '@mantine/core';
import dayjs from 'dayjs';

export default function RentOutDaysCountBadge({ date }: { date: string }) {
  const rentDate = dayjs(date);
  const currentDate = dayjs();
  const daysDifference = currentDate.diff(rentDate, 'days');

  return (
    <Badge
      size='sm'
      variant='outline'
      color={daysDifference > 5 ? 'red' : daysDifference > 2 ? 'yellow' : 'green'}
      title={daysDifference !== 0 ? `${daysDifference} days` : undefined}
    >
      {daysDifference === 0 ? 'Today' : rentDate.from(currentDate)}
    </Badge>
  );
}
