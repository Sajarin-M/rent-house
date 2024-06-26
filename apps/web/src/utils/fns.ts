import { clsx, type ClassValue } from 'clsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { twMerge } from 'tailwind-merge';

dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFormTItle(entityName: string, isEditing?: boolean) {
  return `${isEditing ? 'Edit' : 'Create'} ${entityName}`;
}

export function formatDate(date: Date | string) {
  return dayjs(date).format('DD/MM/YYYY');
}

export function formatDateWithTime(date: Date | string) {
  return dayjs(date).format('DD/MM/YYYY - hh:mm A');
}

export function formatCurrency(amount: number) {
  return amount.toLocaleString('en-IN', {
    currency: 'INR',
    maximumFractionDigits: 2,
  });
}

export function numberOrZero(value: number | string) {
  const number = Number(value);
  return isNaN(number) ? 0 : number;
}
