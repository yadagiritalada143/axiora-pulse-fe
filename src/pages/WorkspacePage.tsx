import { PageHeader } from '@components/common/PageHeader';
import { WorkspaceList } from '@features/workspace/components/WorkspaceList';

export default function WorkspacePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Workspace" description="Switch between your organization's workspaces." />
      <WorkspaceList />
    </div>
  );
}
