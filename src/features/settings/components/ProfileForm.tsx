import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Mail, Calendar, Shield, UserRound, Camera, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ButtonLoader, Loader } from '@components/common/Loader';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
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
import { useUploadAvatar } from '@features/settings/hooks/useUploadAvatar';
import { profileSchema, type ProfileFormValues } from '@schemas/profile.schema';
import { useAuthStore } from '@store/auth.store';

export function ProfileForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const storeUser = useAuthStore((state) => state.user);
  const { data: currentUser, isLoading } = useCurrentUser();
  const user = currentUser ?? storeUser;

  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(file.type) && !['jpg', 'jpeg', 'png'].includes(ext ?? '')) {
      toast.error('Only JPG, JPEG, and PNG image files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    uploadAvatar.mutate(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (values: ProfileFormValues) => updateProfile.mutate(values);

  if (isLoading && isAuthenticated && !user) {
    return <Loader label="Loading profile..." className="max-w-md py-8" />;
  }

  const joinedDate = user?.createdAt
    ? format(new Date(user.createdAt), 'MMMM d, yyyy')
    : 'Recently';

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="border-border bg-card overflow-hidden border shadow-sm md:col-span-1">
        <CardContent className="relative px-6 pt-16 pb-6 text-center">
          <div className="flex justify-center">
            <div className="relative -mt-12 mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
              <Avatar className="border-background ring-border size-24 border-4 shadow-md ring-1">
                <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.name ?? ''} />
                <AvatarFallback className="bg-gradient-to-tr from-[#FF4500] to-[#FF8C00] text-3xl font-bold text-white select-none">
                  {(user?.name ?? 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {uploadAvatar.isPending && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs">
                  <Loader2 className="size-6 animate-spin text-[#FF4500]" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatar.isPending}
                className="ring-background absolute -right-1 -bottom-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-[#FF4500] text-white shadow-md ring-2 transition-transform hover:bg-[#FF4500]/90 active:scale-95 disabled:opacity-50"
                title="Change Photo"
              >
                <Camera className="size-3.5" />
              </button>
            </div>
          </div>

          <h3 className="text-foreground truncate text-xl font-bold">{user?.name ?? 'Account'}</h3>
          <p className="text-muted-foreground mb-4 truncate text-sm">{user?.email}</p>

          <div className="border-border text-muted-foreground flex flex-col gap-2.5 border-t pt-7 text-left text-sm">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-[#FF4500]" />
              <span className="text-foreground text-xs font-medium tracking-wider uppercase">
                Role:
              </span>
              <Badge variant="secondary" className="px-2 py-0.5 text-xs font-semibold capitalize">
                {user?.role ?? 'User'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-[#FF4500]" />
              <span className="text-foreground text-xs font-medium tracking-wider uppercase">
                Joined:
              </span>
              <span>{joinedDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card border shadow-sm md:col-span-2">
        <CardHeader>
          <CardTitle className="text-foreground text-lg font-bold">Account Information</CardTitle>
          <CardDescription>Update your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full name{' '}
                        <span
                          className="ml-1 inline-block text-sm font-bold text-red-500 select-none"
                          aria-hidden="true"
                        >
                          *
                        </span>
                      </FormLabel>
                      <div className="relative">
                        <UserRound className="text-muted-foreground absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
                        <FormControl>
                          <Input
                            aria-label="Full name"
                            {...field}
                            className="bg-background border-input pl-9 focus:ring-[#FF4500]"
                          />
                        </FormControl>
                      </div>
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
                      <div className="relative">
                        <Mail className="text-muted-foreground/60 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <FormControl>
                          <Input
                            type="email"
                            {...field}
                            disabled
                            className="bg-muted/30 border-input text-muted-foreground cursor-not-allowed pl-9"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="bg-[#FF4500] px-6 font-semibold text-white shadow-sm hover:bg-[#FF4500]/90"
                >
                  {updateProfile.isPending ? <ButtonLoader className="mr-2" /> : null}
                  Save changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
