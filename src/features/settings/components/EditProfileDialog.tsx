import { User, UserCheck, Phone, Calendar, Globe, Bell } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import type { User as AuthUser, UserDetails } from '@/types/api.types';
import { ButtonLoader } from '@components/common/Loader';
import { Button } from '@components/ui/button';
import { DatePicker } from '@components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';

import { useUpdateUserDetails } from '../hooks/useUpdateUserDetails';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUser | null;
  userDetails?: UserDetails | null;
}

interface FormValues {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  emailPref: boolean;
  smsPref: boolean;
  pushPref: boolean;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
  userDetails,
}: EditProfileDialogProps) {
  const updateMutation = useUpdateUserDetails();

  const getInitialValues = (): FormValues => {
    const fn = userDetails?.first_name ?? user?.firstName ?? user?.name?.split(' ')[0] ?? '';
    const ln =
      userDetails?.last_name ?? user?.lastName ?? user?.name?.split(' ').slice(1).join(' ') ?? '';
    const phone = userDetails?.mobile_number ?? user?.mobileNumber ?? '';
    const dob =
      (userDetails?.date_of_birth ? String(userDetails.date_of_birth) : null) ??
      (user?.dateOfBirth ? String(user.dateOfBirth) : null) ??
      '';
    const gender = userDetails?.gender ?? user?.gender ?? '';
    const nationality = userDetails?.nationality ?? user?.nationality ?? '';
    const prefs = userDetails?.communication_preferences ?? user?.communicationPreferences ?? [];

    return {
      firstName: fn,
      lastName: ln,
      mobileNumber: phone,
      dateOfBirth: dob,
      gender,
      nationality,
      emailPref: prefs.includes('Email'),
      smsPref: prefs.includes('SMS'),
      pushPref: prefs.includes('Push'),
    };
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    values: getInitialValues(),
  });

  const onSubmit = (data: FormValues) => {
    const communication_preferences: ('Email' | 'SMS' | 'Push')[] = [];
    if (data.emailPref) communication_preferences.push('Email');
    if (data.smsPref) communication_preferences.push('SMS');
    if (data.pushPref) communication_preferences.push('Push');

    updateMutation.mutate(
      {
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        mobile_number: data.mobileNumber.trim(),
        date_of_birth: data.dateOfBirth ? data.dateOfBirth : null,
        gender: data.gender || null,
        nationality: data.nationality.trim() || null,
        communication_preferences,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-90vh] border-border/80 min-h-[560px] overflow-y-auto rounded-2xl p-6 shadow-2xl sm:max-w-xl sm:p-7">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/10 text-[#FF4500]">
              <User className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold sm:text-lg">
                Edit Profile Information
              </DialogTitle>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Update your personal and contact details
              </p>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Update personal and contact details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="firstName"
                className="flex items-center gap-1.5 text-xs font-semibold"
              >
                <User className="size-3.5 text-blue-500" />
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                className="h-9.5 text-sm"
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && (
                <p className="text-destructive mt-1 text-xs">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="flex items-center gap-1.5 text-xs font-semibold">
                <User className="size-3.5 text-indigo-500" />
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                className="h-9.5 text-sm"
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && (
                <p className="text-destructive mt-1 text-xs">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="mobileNumber"
                className="flex items-center gap-1.5 text-xs font-semibold"
              >
                <Phone className="size-3.5 text-emerald-500" />
                Mobile Number
              </Label>
              <Input
                id="mobileNumber"
                placeholder="9876543210"
                className="h-9.5 text-sm"
                {...register('mobileNumber', {
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^(?:\+?91)?[6-9]\d{9}$/,
                    message: 'Enter a valid 10-digit Indian mobile number',
                  },
                })}
              />
              {errors.mobileNumber && (
                <p className="text-destructive mt-1 text-xs">{errors.mobileNumber.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="dateOfBirth"
                className="flex items-center gap-1.5 text-xs font-semibold"
              >
                <Calendar className="size-3.5 text-amber-500" />
                Date of Birth
              </Label>
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <DatePicker
                    id="dateOfBirth"
                    value={field.value}
                    onChange={(dateStr) => {
                      field.onChange(dateStr);
                    }}
                    valueFormat="DD/MM/YYYY"
                    placeholder="DD/MM/YYYY"
                    clearable
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="genderSelect"
                className="flex items-center gap-1.5 text-xs font-semibold"
              >
                <UserCheck className="size-3.5 text-purple-500" />
                Gender
              </Label>
              <select
                id="genderSelect"
                className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9.5 w-full cursor-pointer rounded-md border px-3 py-1 text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-none"
                {...register('gender')}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="nationality"
                className="flex items-center gap-1.5 text-xs font-semibold"
              >
                <Globe className="size-3.5 text-teal-500" />
                Nationality
              </Label>
              <Input
                id="nationality"
                placeholder="United States / India"
                className="h-9.5 text-sm"
                {...register('nationality')}
              />
            </div>
          </div>

          <div className="border-border/70 bg-muted/20 space-y-2.5 rounded-xl border p-4">
            <p className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
              <Bell className="size-3.5 text-pink-500" />
              Communication Preferences
            </p>
            <div className="flex flex-wrap gap-4 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emailPrefCheckbox"
                  className="border-input size-4 cursor-pointer rounded accent-[#FF4500]"
                  {...register('emailPref')}
                />
                <Label
                  htmlFor="emailPrefCheckbox"
                  className="text-muted-foreground cursor-pointer text-xs font-medium select-none"
                >
                  Email Notifications
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="smsPrefCheckbox"
                  className="border-input size-4 cursor-pointer rounded accent-[#FF4500]"
                  {...register('smsPref')}
                />
                <Label
                  htmlFor="smsPrefCheckbox"
                  className="text-muted-foreground cursor-pointer text-xs font-medium select-none"
                >
                  SMS Updates
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pushPrefCheckbox"
                  className="border-input size-4 cursor-pointer rounded accent-[#FF4500]"
                  {...register('pushPref')}
                />
                <Label
                  htmlFor="pushPrefCheckbox"
                  className="text-muted-foreground cursor-pointer text-xs font-medium select-none"
                >
                  Push Alerts
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="cursor-pointer bg-[#FF4500] text-white shadow-xs hover:bg-[#FF4500]/90"
            >
              {updateMutation.isPending ? <ButtonLoader className="mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
