import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { CartoonBotLoader } from '@components/common/CartoonBotLoader';
import { ButtonLoader } from '@components/common/Loader';
import { Button } from '@components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { ROUTES } from '@constants/routes';
import { useLogin } from '@features/auth/hooks';
import { loginSchema, type LoginFormValues } from '@schemas/auth.schema';

import { GoogleLoginButton } from './GoogleLoginButton';

export function LoginForm() {
  const login = useLogin();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '', remember: false },
  });

  const onSubmit = (values: LoginFormValues) => login.mutate(values);

  return (
    <div className="relative">
      {login.isPending && (
        <div
          data-testid="login-loading-overlay"
          className="bg-background/90 animate-in fade-in absolute inset-0 z-50 flex flex-col items-center justify-center rounded-xl p-4 backdrop-blur-xs transition-all duration-300"
        >
          <CartoonBotLoader label="Signing you in..." showStatusMessages={false} />
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="placeholder:text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-y-0">
                  <FormControl>
                    <div className="relative flex h-4 w-4 items-center justify-center">
                      <input
                        id="remember"
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="border-input bg-background peer h-4 w-4 appearance-none rounded border"
                      />

                      <span className="text-primary pointer-events-none absolute inset-0 hidden items-center justify-center text-xs font-bold peer-checked:flex">
                        ✓
                      </span>
                    </div>
                  </FormControl>

                  <FormLabel htmlFor="remember" className="text-muted-foreground cursor-pointer">
                    Remember me
                  </FormLabel>
                </FormItem>
              )}
            />

            <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs font-medium hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full text-white" disabled={login.isPending}>
            {login.isPending ? <ButtonLoader className="mr-2" /> : null}
            Get started
          </Button>

          <GoogleLoginButton text="signin_with" />

          <p className="text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have a account? </span>
            <Link to={ROUTES.REGISTER} className="font-medium hover:underline">
              Register
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
}
