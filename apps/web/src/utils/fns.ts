import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFormTItle(entityName: string, isEditing?: boolean) {
  return `${isEditing ? 'Edit' : 'Create'} ${entityName}`;
}
