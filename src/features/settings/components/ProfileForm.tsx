import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { ButtonLoader, Loader } from '@components/common/Loader';
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
import { useCurrentUser } from '@features/auth/hooks';
import { useUpdateProfile } from '@features/settings/hooks/useUpdateProfile';
import { profileSchema, type ProfileFormValues } from '@schemas/profile.schema';
import { useAuthStore } from '@store/auth.store';

export function ProfileForm() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const storeUser = useAuthStore((state) => state.user);
  const { data: currentUser, isLoading } = useCurrentUser();
  const user = currentUser ?? storeUser;

  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  useEffect(() => {
    if (user?.name || user?.email) {
      form.reset({ name: user.name ?? '', email: user.email ?? '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name, user?.email]);

  const onSubmit = (values: ProfileFormValues) => updateProfile.mutate(values);

  if (isLoading && isAuthenticated && !user) {
    return <Loader label="Loading profile..." className="max-w-md py-8" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-5" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input type="email" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? <ButtonLoader className="mr-2" /> : null}
          Save changes
        </Button>
      </form>
    </Form>
  );
}
