'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginSchema, type LoginInput } from '../../../lib/validation/auth';
import { useLogin } from '../../../hooks/use-auth';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

export default function LoginPage() {
  const loginMutation = useLogin();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        window.location.href = redirectTo;
      },
    });
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold">Log in</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />

          {loginMutation.isError && (
            <p className="text-sm text-red-600">{(loginMutation.error as Error).message}</p>
          )}

          <Button type="submit" isLoading={loginMutation.isPending}>
            Log in
          </Button>
        </form>

        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-zinc-950 dark:text-zinc-50">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
