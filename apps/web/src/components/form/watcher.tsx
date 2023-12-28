import { Control, FieldPath, FieldPathValues, FieldValues, useWatch } from 'react-hook-form';

type WatcherProps<
  T extends FieldValues = FieldValues,
  U extends readonly FieldPath<T>[] = readonly FieldPath<T>[],
> = {
  control: Control<T>;
  name: readonly [...U];
  render: (value: FieldPathValues<T, U>) => JSX.Element;
};

export default function Watcher<
  T extends FieldValues = FieldValues,
  U extends readonly FieldPath<T>[] = readonly FieldPath<T>[],
>({ control, name, render }: WatcherProps<T, U>) {
  const value = useWatch({ control, name });
  return render(value);
}
