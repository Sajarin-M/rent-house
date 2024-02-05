import { useForm } from 'react-hook-form';
import { Button, Group, Stack } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { closeAllModals, openModal } from '@mantine/modals';
import { getQueryKey } from '@trpc/react-query';
import { queryClient } from '@/context/trpc';
import { PasswordInput, SubmitButton, validation } from '@/components/form';

export function useDebouncedQuery<TQueryFn extends (input: any, opts: any) => any>(
  tRouter: { useInfiniteQuery: TQueryFn },
  input: Parameters<TQueryFn>[0],
  opts: Parameters<TQueryFn>[1],
): ReturnType<TQueryFn> {
  const [debouncedValue] = useDebouncedValue(input.searchQuery || '', 500);

  let modifiedInput = { ...input, searchQuery: debouncedValue };

  const queryResult = tRouter.useInfiniteQuery(modifiedInput, opts);

  let isPending = queryResult.isPending;

  let isDebouncing = input.searchQuery !== modifiedInput.searchQuery;
  const cached = queryClient.getQueryState(getQueryKey(tRouter as any, input, 'infinite'));

  isPending = isPending || isDebouncing;

  if (isDebouncing && cached) {
    return {
      ...queryResult,
      ...cached,
    };
  }

  return { ...queryResult, isPending };
}

export function useConfirmedDeletion<TData, TInput, TOpts>(
  fn: (input: TInput, opts?: TOpts) => Promise<TData>,
  { entityName }: { entityName: string },
) {
  const { control, handleSubmit, reset, setError } = useForm({
    defaultValues: { password: '' },
  });

  function deleteWithConfirmation(input: TInput, opts?: TOpts) {
    reset();
    openModal({
      title: `Delete ${entityName}?`,
      children: (
        <form
          onSubmit={handleSubmit(async (values) => {
            try {
              const variables: TInput = {
                ...input,
                password: values.password,
              };

              await fn(variables, opts);
              closeAllModals();
            } catch (error) {
              setError('password', { message: 'Invalid password' });
            }
          })}
        >
          <Stack gap='md' mb='md'>
            <div>Are you sure you want to delete the selected {entityName.toLowerCase()}?</div>
            <PasswordInput
              data-autofocus
              name='password'
              control={control}
              placeholder='Password'
              autoComplete='current-password'
              rules={validation().required().password()}
            />
          </Stack>
          <Group justify='flex-end'>
            <Button variant='default' onClick={() => closeAllModals()}>
              Cancel
            </Button>
            <SubmitButton control={control}>Confirm</SubmitButton>
          </Group>
        </form>
      ),
    });
  }

  return deleteWithConfirmation;
}

export type PageVm<T> = {
  items: T[];
};

export function getCombinedData<T>(pages?: PageVm<T>[]) {
  return (
    pages?.reduce((combined, page) => {
      combined.push(...page.items);
      return combined;
    }, [] as T[]) || []
  );
}
