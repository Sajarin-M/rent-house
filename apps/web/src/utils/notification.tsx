import { TbCheck } from 'react-icons/tb';
import { CloseIcon } from '@mantine/core';
import { NotificationData, showNotification } from '@mantine/notifications';

type Props = NotificationData & { message: string };

const error = (props: Props) =>
  showNotification({ color: 'red', icon: <CloseIcon size='0.9rem' />, ...props });
const success = (props: Props) =>
  showNotification({ color: 'teal', icon: <TbCheck size='0.9rem' />, ...props });

const notification = {
  error,
  success,
  edited: (entity: string) => success({ message: `${entity} updated successfully` }),
  created: (entity: string) => success({ message: `${entity} created successfully` }),
  deleted: (entity: string) => success({ message: `${entity} deleted successfully` }),
};

export default notification;
