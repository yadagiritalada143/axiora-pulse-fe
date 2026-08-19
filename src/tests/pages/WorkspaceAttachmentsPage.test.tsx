import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { WorkspaceAttachmentResponse } from '@/features/workspace/types';
import WorkspaceAttachmentsPage from '@/pages/WorkspaceAttachmentsPage';

const mockDeleteAttachment = jest.fn();
const mockUploadAttachment = jest.fn();

const MOCK_ATTACHMENTS: WorkspaceAttachmentResponse[] = [
  {
    id: 101,
    user_id: 1,
    workspace_id: 1,
    file_name: 'pitch_deck_v1.pdf',
    file_type: 'pdf',
    mime_type: 'application/pdf',
    s3_key: 'workspaces/1/pitch_deck_v1.pdf',
    file_url: 'https://cdn.example.com/pitch_deck_v1.pdf',
    file_size_bytes: 1024 * 500, // 500 KB
    created_at: '2026-08-15T10:00:00Z',
    updated_at: '2026-08-15T10:00:00Z',
  },
  {
    id: 102,
    user_id: 1,
    workspace_id: 1,
    file_name: 'architecture_diagram.png',
    file_type: 'image',
    mime_type: 'image/png',
    s3_key: 'workspaces/1/architecture_diagram.png',
    file_url: 'https://cdn.example.com/architecture_diagram.png',
    file_size_bytes: 1024 * 1200, // 1.2 MB
    created_at: '2026-08-16T12:00:00Z',
    updated_at: '2026-08-16T12:00:00Z',
  },
  {
    id: 103,
    user_id: 1,
    workspace_id: 1,
    file_name: 'market_research.docx',
    file_type: 'doc',
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    s3_key: 'workspaces/1/market_research.docx',
    file_url: 'https://cdn.example.com/market_research.docx',
    file_size_bytes: 1024 * 350, // 350 KB
    created_at: '2026-08-17T15:00:00Z',
    updated_at: '2026-08-17T15:00:00Z',
  },
];

let mockAttachments = MOCK_ATTACHMENTS;
let mockIsLoading = false;

jest.mock('@features/workspace/hooks/useWorkspaceAttachments', () => ({
  useWorkspaceAttachments: () => ({
    attachments: mockAttachments,
    total: mockAttachments.length,
    isLoading: mockIsLoading,
    deleteAttachment: mockDeleteAttachment,
    isDeleting: false,
    uploadAttachment: mockUploadAttachment,
    isUploading: false,
  }),
}));

jest.mock('@features/workspace/hooks/useWorkspaces', () => ({
  useWorkspace: () => ({
    data: { id: 1, name: 'SaaS Pulse Test', state: 'VALIDATED' },
    isLoading: false,
    isError: false,
  }),
}));

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/workspace/1/attachments']}>
        <Routes>
          <Route
            path="/workspace/:workspaceId/attachments"
            element={<WorkspaceAttachmentsPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('WorkspaceAttachmentsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAttachments = MOCK_ATTACHMENTS;
    mockIsLoading = false;
  });

  it('renders page header and attachment stats', () => {
    renderComponent();

    expect(screen.getByRole('heading', { level: 1, name: /attachments/i })).toBeInTheDocument();
    expect(screen.getByText(/pitch_deck_v1\.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/architecture_diagram\.png/i)).toBeInTheDocument();
    expect(screen.getByText(/market_research\.docx/i)).toBeInTheDocument();
    expect(screen.getByText(/total storage/i)).toBeInTheDocument();
  });

  it('filters attachments by category tabs', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Click PDFs filter
    const pdfTab = screen.getByRole('button', { name: /^PDFs \(1\)$/i });
    await user.click(pdfTab);

    expect(screen.getByText('pitch_deck_v1.pdf')).toBeInTheDocument();
    expect(screen.queryByText('architecture_diagram.png')).not.toBeInTheDocument();
    expect(screen.queryByText('market_research.docx')).not.toBeInTheDocument();

    // Click Images filter
    const imageTab = screen.getByRole('button', { name: /^Images \(1\)$/i });
    await user.click(imageTab);

    expect(screen.queryByText('pitch_deck_v1.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('architecture_diagram.png')).toBeInTheDocument();
  });

  it('filters attachments using the search input', async () => {
    const user = userEvent.setup();
    renderComponent();

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'diagram');

    expect(screen.queryByText('pitch_deck_v1.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('architecture_diagram.png')).toBeInTheDocument();
    expect(screen.queryByText('market_research.docx')).not.toBeInTheDocument();
  });

  it('switches between Grid and Table view', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Switch to table view
    const tableBtn = screen.getByLabelText('Table view');
    await user.click(tableBtn);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /file name/i })).toBeInTheDocument();
  });

  it('opens delete confirmation dialog and triggers deletion', async () => {
    const user = userEvent.setup();
    renderComponent();

    const deleteBtns = screen.getAllByLabelText(/delete/i);
    const firstDeleteBtn = deleteBtns[0];
    if (!firstDeleteBtn) throw new Error('Delete button not found');
    await user.click(firstDeleteBtn);

    expect(screen.getByRole('heading', { name: /delete attachment\?/i })).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /delete file/i });
    await user.click(confirmBtn);

    expect(mockDeleteAttachment).toHaveBeenCalledWith(103);
  });

  it('displays empty state when no attachments exist', () => {
    mockAttachments = [];
    renderComponent();

    expect(screen.getByText(/no attachments uploaded yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/files and documents uploaded in your ai mentor chat will appear here/i),
    ).toBeInTheDocument();
  });
});
