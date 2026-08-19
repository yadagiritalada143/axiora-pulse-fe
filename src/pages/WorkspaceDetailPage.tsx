import { Bot, ClipboardList, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { ROUTES, buildWorkspaceRoute, buildWorkspaceSurveyRoute } from '@constants/routes';
import { MentorShell, type MentorNavItem } from '@features/ideaValidation/components';
import { WorkspaceMentorChat } from '@features/workspace/components';
import { useWorkspace } from '@features/workspace/hooks/useWorkspaces';

export default function WorkspaceDetailPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const numericId = Number(workspaceId);
  const { data: workspace, isLoading, isError } = useWorkspace(numericId);

  const hasSurvey = workspace?.state === 'VALIDATED';

  const navItems: MentorNavItem[] = [
    {
      label: 'AI Mentor',
      icon: Bot,
      href: workspaceId ? buildWorkspaceRoute(workspaceId) : ROUTES.DASHBOARD,
      end: true,
    },
    {
      label: 'Survey Intelligence',
      icon: ClipboardList,
      href: workspaceId ? buildWorkspaceSurveyRoute(workspaceId) : '#',
      disabled: !hasSurvey,
    },
    // { label: 'Founder Intelligence', icon: Users, disabled: true },
    // { label: 'Startup Intelligence', icon: TrendingUp, disabled: true },
    // { label: 'Documents & reports', icon: FileText, disabled: true },
    // { label: 'Risk Management', icon: ShieldCheck, disabled: true },
  ];

  return (
    <MentorShell navItems={navItems} navSectionLabel={workspace?.name ?? 'Workspace'}>
      {isLoading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="text-muted-foreground size-6 animate-spin" aria-hidden />
        </div>
      ) : isError || !workspace ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
          <h1 className="text-foreground text-lg font-semibold">Workspace not found</h1>
          <p className="text-muted-foreground text-sm">
            This workspace doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link to={ROUTES.DASHBOARD} className="text-primary text-sm font-medium hover:underline">
            Back to workspaces
          </Link>
        </div>
      ) : (
        <WorkspaceMentorChat workspaceId={workspace.id} />
      )}
    </MentorShell>
  );
}
