import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { ApiRequestError } from '@/types/error.types';
import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { useUpdateWorkspace } from '@features/workspace/hooks/useWorkspaces';
import type { Workspace } from '@features/workspace/types';
import { workspaceSchema, type WorkspaceFormData } from '@schemas/workspace.schema';

interface EditWorkspaceDialogProps {
  open: boolean;
  workspace: Workspace | null;
  onOpenChange: (open: boolean) => void;
}

export function EditWorkspaceDialog({ open, workspace, onOpenChange }: EditWorkspaceDialogProps) {
  const updateWorkspace = useUpdateWorkspace();

  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (workspace) {
      form.reset({
        name: workspace.name ?? '',
        description: workspace.description ?? '',
      });
    }
  }, [workspace, form]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const nameValue = form.watch('name') ?? '';
  const isNameEmpty = !nameValue.trim();

  function onSubmit(values: WorkspaceFormData) {
    if (!workspace) return;

    updateWorkspace.mutate(
      {
        id: workspace.id,
        payload: {
          name: values.name.trim(),
          description: values.description?.trim() ?? '',
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast.success('Workspace updated successfully!');
        },
        onError: (err) => {
          const apiError = err as ApiRequestError;
          toast.error(apiError.message ?? 'Failed to update workspace. Please try again.');
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Workspace</DialogTitle>
          <DialogDescription>Update your workspace details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Workspace Name{' '}
                    <span
                      className="ml-1 inline-block text-sm font-bold text-red-500 select-none"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      aria-label="Workspace Name"
                      placeholder="Enter workspace name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Workspace description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateWorkspace.isPending}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isNameEmpty || updateWorkspace.isPending}>
                {updateWorkspace.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
