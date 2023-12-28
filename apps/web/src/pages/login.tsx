import { useForm } from 'react-hook-form';
import { TbLock } from 'react-icons/tb';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { trpc } from '@/context/trpc';
import { PasswordInput, SubmitButton, validation } from '@/components/form';

type LocationState = { from?: string } | undefined;

export default function Login() {
  const navigate = useNavigate();
  const state = useLocation().state as LocationState;

  const { isLoggedIn, setLoggedIn } = useAuth();
  const { mutateAsync: login } = trpc.auth.login.useMutation();

  const { control, handleSubmit, setError } = useForm({
    defaultValues: {
      password: '',
    },
  });

  if (isLoggedIn) {
    return <Navigate to='/' replace />;
  }

  return (
    <div className='flex h-screen w-screen items-center justify-center'>
      <form
        className='border-default-border px-lg w-full max-w-sm rounded-lg border shadow-xl'
        onSubmit={handleSubmit(async (values) => {
          try {
            const result = await login(values);
            setLoggedIn(result);
            navigate(state?.from || '/', { replace: true });
          } catch (_) {
            setError('password', { message: 'Invalid password' });
          }
        })}
      >
        <PasswordInput
          autoFocus
          radius='md'
          withAsterisk
          name='password'
          label='Password'
          className='mt-10'
          control={control}
          leftSection={<TbLock size='1.2rem' />}
          leftSectionWidth={'2.6rem'}
          leftSectionPointerEvents='none'
          classNames={{ label: 'mb-1' }}
          rules={validation().required().password()}
        />
        <SubmitButton fullWidth mx='auto' control={control} className='mb-10 mt-5'>
          Sign In
        </SubmitButton>
      </form>
    </div>
  );
}
