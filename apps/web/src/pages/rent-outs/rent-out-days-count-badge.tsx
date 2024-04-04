import { Badge, MantineColor } from '@mantine/core';

const colorMap: Record<number, MantineColor> = {
  0: 'green',
  1: 'green',
  2: 'yellow',
  3: 'yellow',
  4: 'yellow',
  5: 'red',
};

export default function RentOutDaysCountBadge({ days }: { days: number }) {
  const getColor = (days: number): MantineColor => {
    return colorMap[days] || 'red';
  };

  return (
    <Badge variant='outline' size='sm' color={getColor(days)}>
      {days === 0 ? 'Today' : `Day ${days}`}
    </Badge>
  );
}
