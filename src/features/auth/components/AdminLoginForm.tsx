import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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
import { useAdminLogin } from '@features/auth/hooks';
import { loginSchema, type LoginFormValues } from '@schemas/auth.schema';

export function AdminLoginForm() {
  const adminLogin = useAdminLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    adminLogin.mutate({
      username: values.username,
      password: values.password,
    });
  };

  return (
    <div className="relative">
      {adminLogin.isPending && (
        <div className="bg-background/85 animate-in fade-in absolute inset-0 z-50 flex flex-col items-center justify-center rounded-xl p-4 backdrop-blur-xs transition-all duration-300">
          <CartoonBotLoader label="Authenticating administrator..." showStatusMessages={false} />
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admin Email</FormLabel>

                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="Enter admin email"
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
                <FormLabel>Password</FormLabel>

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

          <Button type="submit" className="w-full text-white" disabled={adminLogin.isPending}>
            {adminLogin.isPending ? <ButtonLoader className="mr-2" /> : null}
            Login
          </Button>
        </form>
      </Form>
    </div>
  );
}
