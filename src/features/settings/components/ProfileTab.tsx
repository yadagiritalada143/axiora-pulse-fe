import { format } from 'date-fns';
import {
  Calendar,
  CalendarDays,
  Camera,
  Check,
  Edit2,
  FileEdit,
  Globe,
  IdCard,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  Upload,
  User as UserIcon,
  UserCheck,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { useCurrentUser } from '@features/auth/hooks';
import { useAuthStore } from '@store/auth.store';

import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useUploadAvatar } from '../hooks/useUploadAvatar';
import { useUserDetails } from '../hooks/useUserDetails';

import { EditProfileDialog } from './EditProfileDialog';

export function ProfileTab() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: currentUser } = useCurrentUser();
  const storeUser = useAuthStore((state) => state.user);
  const user = currentUser ?? storeUser;

  const { data: userDetails } = useUserDetails();
  const uploadAvatarMutation = useUploadAvatar();
  const updateProfileMutation = useUpdateProfile();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

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

    uploadAvatarMutation.mutate(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    updateProfileMutation.mutate(
      {
        name: user?.name ?? 'User',
        email: user?.email ?? '',
        avatarUrl: '',
      },
      {
        onSuccess: () => {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      },
    );
  };

  const profileId =
    userDetails?.profile_id ??
    user?.profile_id ??
    user?.profileId ??
    (user?.id ? 'AXR-' + String(user.id) : 'N/A');
  const firstName =
    userDetails?.first_name ??
    user?.first_name ??
    user?.firstName ??
    (user?.name ? user.name.split(' ')[0] : 'N/A');
  const lastName =
    userDetails?.last_name ??
    user?.last_name ??
    user?.lastName ??
    (user?.name && user.name.split(' ').length > 1
      ? user.name.split(' ').slice(1).join(' ')
      : 'N/A');
  const resolvedName = [firstName !== 'N/A' ? firstName : '', lastName !== 'N/A' ? lastName : '']
    .filter(Boolean)
    .join(' ');
  const fullName =
    (resolvedName.length > 0 ? resolvedName : null) ?? user?.name ?? user?.email ?? 'User';
  const email = userDetails?.email ?? user?.email ?? 'N/A';
  const mobileNumber =
    userDetails?.mobile_number ?? user?.mobile_number ?? user?.mobileNumber ?? 'N/A';
  const rawDob = userDetails?.date_of_birth ?? user?.date_of_birth ?? user?.dateOfBirth;
  const dateOfBirth = rawDob ? format(new Date(rawDob), 'dd/MM/yyyy') : 'N/A';
  const gender = userDetails?.gender ?? user?.gender ?? 'N/A';
  const profileStatus =
    userDetails?.profile_status ?? user?.profile_status ?? user?.profileStatus ?? 'Active';
  const nationality = userDetails?.nationality ?? user?.nationality ?? 'N/A';
  const commPrefs =
    (userDetails?.communication_preferences && userDetails.communication_preferences.length > 0
      ? userDetails.communication_preferences.join(', ')
      : null) ??
    (user?.communication_preferences && user.communication_preferences.length > 0
      ? user.communication_preferences.join(', ')
      : null) ??
    (user?.communicationPreferences && user.communicationPreferences.length > 0
      ? user.communicationPreferences.join(', ')
      : null) ??
    'N/A';

  const createdDate = user?.createdAt
    ? format(new Date(user.createdAt), 'MMM dd, yyyy hh:mm a')
    : userDetails?.created_at
      ? format(new Date(userDetails.created_at), 'MMM dd, yyyy hh:mm a')
      : 'N/A';

  const updatedDate = user?.updatedAt
    ? format(new Date(user.updatedAt), 'MMM dd, yyyy hh:mm a')
    : userDetails?.updated_at
      ? format(new Date(userDetails.updated_at), 'MMM dd, yyyy hh:mm a')
      : 'N/A';

  const rawAvatar =
    userDetails?.avatar_url ?? userDetails?.avatarUrl ?? user?.avatar_url ?? user?.avatarUrl;
  const avatarSrc =
    rawAvatar && typeof rawAvatar === 'string' && rawAvatar.trim() !== '' ? rawAvatar : undefined;

  const initialLetter =
    fullName && fullName !== 'N/A' && fullName !== 'User'
      ? fullName.charAt(0).toUpperCase()
      : user?.email
        ? user.email.charAt(0).toUpperCase()
        : 'U';

  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-card rounded-none border-0 border-b pb-6 shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-foreground text-base font-bold tracking-tight sm:text-lg">
                    Profile Information
                  </h3>
                  <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                    View and manage your personal details and public profile.
                  </p>
                </div>
                <div className="block lg:hidden">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditOpen(true)}
                    className="cursor-pointer gap-1.5 text-xs font-semibold hover:border-[#FF4500]/50 hover:text-[#FF4500]"
                  >
                    <Edit2 className="size-3.5 text-[#FF4500]" />
                    Edit Profile
                  </Button>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className="group relative">
                  <Avatar className="border-border/80 size-16 border-2 shadow-sm ring-2 ring-[#FF4500]/20 transition-transform group-hover:scale-105 sm:size-18">
                    {avatarSrc ? (
                      <AvatarImage src={avatarSrc} alt={fullName} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-tr from-[#FF4500] to-[#FFA07A] text-lg font-bold text-white select-none sm:text-xl">
                      {initialLetter}
                    </AvatarFallback>
                  </Avatar>
                  {uploadAvatarMutation.isPending && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs">
                      <Loader2 className="size-5 animate-spin text-[#FF4500]" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={uploadAvatarMutation.isPending}
                    className="ring-background absolute -right-1 -bottom-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-[#FF4500] text-white shadow-md ring-2 transition-transform hover:bg-[#FF4500]/90 active:scale-95 disabled:opacity-50 sm:size-7"
                    title="Change Photo"
                  >
                    <Camera className="size-3 sm:size-3.5" />
                  </button>
                </div>

                <div className="min-w-0">
                  <h4 className="text-foreground truncate text-base font-bold sm:text-lg">
                    {fullName}
                  </h4>
                  <p className="text-muted-foreground mt-0.5 truncate text-xs sm:text-sm">
                    {email}
                  </p>
                  <p className="text-muted-foreground truncate text-xs sm:text-sm">
                    {mobileNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:border-border/60 flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:border-l lg:pl-8">
              <div>
                <p className="text-foreground text-xs font-semibold sm:text-sm">Change Photo</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  JPG, JPEG or PNG. Max size 5MB.
                </p>
                <div className="mt-3 flex items-center gap-2.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={updateProfileMutation.isPending || uploadAvatarMutation.isPending}
                    onClick={handleRemovePhoto}
                    className="text-muted-foreground hover:text-foreground h-8.5 cursor-pointer px-3 text-xs font-medium"
                  >
                    Remove
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadAvatarMutation.isPending}
                    onClick={handleUploadClick}
                    className="h-8.5 cursor-pointer gap-1.5 border-[#FF4500]/40 px-3.5 text-xs font-semibold text-[#FF4500] shadow-2xs hover:bg-[#FF4500]/10 hover:text-[#FF4500]"
                  >
                    {uploadAvatarMutation.isPending ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin text-[#FF4500]" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="size-3.5 text-[#FF4500]" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="ml-4 hidden lg:block">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                  className="h-9 cursor-pointer gap-1.5 px-4 text-xs font-semibold shadow-2xs hover:border-[#FF4500]/50 hover:text-[#FF4500]"
                >
                  <Edit2 className="size-3.5 text-[#FF4500]" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="border-border/70 bg-card/60 flex items-center gap-3.5 rounded-xl border-0 border-b p-4 transition-colors hover:border-[#FF4500]/40">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-[#FF4500]">
            <IdCard className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
              Profile ID
            </p>
            <p className="text-foreground mt-0.5 truncate text-xs font-bold sm:text-sm">
              {profileId}
            </p>
          </div>
        </div>

        <div className="border-border/70 bg-card/60 flex items-center gap-3.5 rounded-xl border-0 border-b p-4 transition-colors hover:border-blue-500/40">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <UserIcon className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground flex items-center text-[11px] font-medium tracking-wider uppercase">
              <span>First Name</span>
              <span
                className="ml-1 inline-block text-xs font-bold text-red-500 select-none"
                aria-hidden="true"
              >
                *
              </span>
            </p>
            <p className="text-foreground mt-0.5 truncate text-xs font-bold sm:text-sm">
              {firstName}
            </p>
          </div>
        </div>

        <div className="border-border/70 bg-card/60 flex items-center gap-3.5 rounded-xl border-0 border-b p-4 transition-colors hover:border-indigo-500/40">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
            <UserIcon className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground flex items-center text-[11px] font-medium tracking-wider uppercase">
              <span>Last Name</span>
              <span
                className="ml-1 inline-block text-xs font-bold text-red-500 select-none"
                aria-hidden="true"
              >
                *
              </span>
            </p>
            <p className="text-foreground mt-0.5 truncate text-xs font-bold sm:text-sm">
              {lastName}
            </p>
          </div>
        </div>

        <div className="border-border/70 bg-card/60 flex items-center gap-3.5 rounded-xl border-0 border-b p-4 transition-colors hover:border-sky-500/40">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400">
            <Mail className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
              Email
            </p>
            <p className="text-foreground mt-0.5 truncate text-xs font-bold sm:text-sm">{email}</p>
          </div>
        </div>

        <div className="border-border/70 bg-card/60 flex items-center gap-3.5 rounded-xl border-0 border-b p-4 transition-colors hover:border-emerald-500/40">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
            <Phone className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground flex items-center text-[11px] font-medium tracking-wider uppercase">
              <span>Mobile Number</span>
              <span
                className="ml-1 inline-block text-xs font-bold text-red-500 select-none"
                aria-hidden="true"
              >
                *
              </span>
            </p>
            <p className="text-foreground mt-0.5 truncate text-xs font-bold sm:text-sm">
              {mobileNumber}
            </p>
          </div>
        </div>

        <div className="border-border/70 bg-card/60 flex items-center gap-3.5 rounded-xl border-0 border-b p-4 transition-colors hover:border-amber-500/40">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
            <Calendar className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
              Date of Birth
            </p>
            <p className="text-foreground mt-0.5 truncate text-xs font-bold sm:text-sm">
              {dateOfBirth}
            </p>
          </div>
        </div>

        <div className="border-border/70 bg-card/60 flex items-center gap-3.5 rounded-xl border-0 border-b p-4 transition-colors hover:border-purple-500/40">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400">
            <UserCheck className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
              Gender
            </p>
            <p className="text-foreground mt-0.5 truncate text-xs font-bold sm:text-sm">{gender}</p>
          </div>
        </div>

        <div className="border-border/70 bg-card/60 flex items-center justify-between rounded-xl border-0 border-b p-4 transition-colors hover:border-emerald-500/40">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                Profile Status
              </p>
              <p className="text-foreground mt-0.5 truncate text-xs font-bold sm:text-sm">
                {profileStatus}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
          >
            <Check className="mr-1 size-3" />
            Active
          </Badge>
        </div>

        <div className="border-border/70 bg-card/60 flex items-center gap-3.5 rounded-xl border-0 border-b p-4 transition-colors hover:border-violet-500/40">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 dark:text-violet-400">
            <CalendarDays className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
              Created Date
            </p>
            <p className="text-foreground mt-0.5 truncate text-xs font-bold sm:text-sm">
              {createdDate}
            </p>
          </div>
        </div>

        <div className="border-border/70 bg-card/60 flex items-center gap-3.5 rounded-xl border-0 border-b p-4 transition-colors hover:border-teal-500/40">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500 dark:text-teal-400">
            <Globe className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
              Nationality
            </p>
            <p className="text-foreground mt-0.5 truncate text-xs font-bold sm:text-sm">
              {nationality}
            </p>
          </div>
        </div>

        <div className="border-border/70 bg-card/60 flex items-center gap-3.5 rounded-xl border-0 border-b p-4 transition-colors hover:border-pink-500/40">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 dark:text-pink-400">
            <MessageSquare className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
              Communication Preferences
            </p>
            <p className="text-foreground mt-0.5 truncate text-xs font-bold sm:text-sm">
              {commPrefs}
            </p>
          </div>
        </div>

        <div className="border-border/70 bg-card/60 flex items-center gap-3.5 rounded-xl border-0 border-b p-4 transition-colors hover:border-rose-500/40">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400">
            <FileEdit className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
              Updated Date
            </p>
            <p className="text-foreground mt-0.5 truncate text-xs font-bold sm:text-sm">
              {updatedDate}
            </p>
          </div>
        </div>
      </div>

      <EditProfileDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={user}
        userDetails={userDetails}
      />
    </div>
  );
}
