import {
  ArrowUpDown,
  Bot,
  ClipboardList,
  Download,
  ExternalLink,
  FileCode,
  FileSpreadsheet,
  FileText,
  Filter,
  Grid,
  Image as ImageIcon,
  LayoutList,
  Loader2,
  Paperclip,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui/alert-dialog';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { Input } from '@components/ui/input';
import {
  ROUTES,
  buildWorkspaceAttachmentsRoute,
  buildWorkspaceRoute,
  buildWorkspaceSurveyRoute,
} from '@constants/routes';
import { MentorShell, type MentorNavItem } from '@features/ideaValidation/components';
import { useWorkspaceAttachments } from '@features/workspace/hooks/useWorkspaceAttachments';
import { useWorkspace } from '@features/workspace/hooks/useWorkspaces';
import type { WorkspaceAttachmentResponse } from '@features/workspace/types';
import { cn } from '@lib/utils';

type FilterCategory = 'all' | 'pdf' | 'image' | 'doc';
type SortOption = 'newest' | 'oldest' | 'name' | 'size';

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop()?.toUpperCase() ?? 'FILE';
  }
  return 'FILE';
}

export default function WorkspaceAttachmentsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const numericId = Number(workspaceId);

  const { data: workspace } = useWorkspace(numericId);
  const {
    attachments,
    isLoading: isAttachmentsLoading,
    isFetching,
    refetch,
    deleteAttachment,
    isDeleting,
  } = useWorkspaceAttachments(numericId);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [fileToDelete, setFileToDelete] = useState<WorkspaceAttachmentResponse | null>(null);

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
    {
      label: 'Attachments',
      icon: Paperclip,
      href: workspaceId ? buildWorkspaceAttachmentsRoute(workspaceId) : '#',
    },
  ];

  const counts = useMemo(() => {
    const pdfCount = attachments.filter((a) => (a.file_type || '').toLowerCase() === 'pdf').length;
    const imageCount = attachments.filter(
      (a) => (a.file_type || '').toLowerCase() === 'image',
    ).length;
    const docCount = attachments.filter((a) => (a.file_type || '').toLowerCase() === 'doc').length;
    const totalBytes = attachments.reduce((acc, curr) => acc + (curr.file_size_bytes ?? 0), 0);

    return {
      all: attachments.length,
      pdf: pdfCount,
      image: imageCount,
      doc: docCount,
      totalBytes,
    };
  }, [attachments]);

  const filteredAttachments = useMemo(() => {
    const filtered = attachments.filter((item) => {
      const matchesSearch = item.file_name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesCat =
        selectedCategory === 'all' || (item.file_type || '').toLowerCase() === selectedCategory;
      return matchesSearch && matchesCat;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'name') {
        return a.file_name.localeCompare(b.file_name);
      }
      if (sortBy === 'size') {
        return (b.file_size_bytes ?? 0) - (a.file_size_bytes ?? 0);
      }
      return 0;
    });
  }, [attachments, searchQuery, selectedCategory, sortBy]);

  const handleDeleteConfirm = () => {
    if (fileToDelete) {
      deleteAttachment(fileToDelete.id);
      setFileToDelete(null);
    }
  };

  const renderFileTypeIcon = (fileType: string, filename: string, className = 'size-4') => {
    const norm = (fileType || '').toLowerCase();
    const ext = filename.toLowerCase();

    if (norm === 'pdf' || ext.endsWith('.pdf')) {
      return <FileText className={cn(className, 'text-red-500')} />;
    }
    if (norm === 'image' || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(ext)) {
      return <ImageIcon className={cn(className, 'text-sky-500')} />;
    }
    if (ext.endsWith('.csv') || ext.endsWith('.xlsx') || ext.endsWith('.xls')) {
      return <FileSpreadsheet className={cn(className, 'text-emerald-500')} />;
    }
    if (ext.endsWith('.json') || ext.endsWith('.md') || ext.endsWith('.txt')) {
      return <FileCode className={cn(className, 'text-amber-500')} />;
    }
    return <FileText className={cn(className, 'text-orange-500')} />;
  };

  return (
    <MentorShell navItems={navItems} navSectionLabel={workspace?.name ?? 'Workspace'}>
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col space-y-6 overflow-y-auto p-4 sm:p-6">
        {/* Professional Page Header */}
        <div className="border-border/80 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#FF4500]/10 text-[#FF4500]">
                <Paperclip className="size-5" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                  Attachments
                </h1>
                <span className="bg-muted/80 text-muted-foreground rounded-full px-2.5 py-0.5 font-mono text-xs font-medium">
                  {counts.all} {counts.all === 1 ? 'file' : 'files'}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground pl-11 text-xs sm:text-sm">
              Documents, images, and data files attached during your AI Mentor chat sessions.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start pl-11 sm:self-auto sm:pl-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="gap-1.5 text-xs font-medium"
            >
              <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Card className="bg-card/70 border-border/70 hover:border-border shadow-xs transition-all">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                  Total Storage
                </p>
                <h3 className="text-foreground mt-0.5 text-xl font-bold sm:text-2xl">
                  {formatBytes(counts.totalBytes)}
                </h3>
                <p className="text-muted-foreground mt-0.5 font-mono text-[11px]">
                  {counts.all} total files
                </p>
              </div>
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                <Paperclip className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70 border-border/70 shadow-xs transition-all hover:border-red-500/30">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[11px] font-medium tracking-wider text-red-500 uppercase">
                  PDF Documents
                </p>
                <h3 className="text-foreground mt-0.5 text-xl font-bold sm:text-2xl">
                  {counts.pdf}
                </h3>
                <p className="text-muted-foreground mt-0.5 text-[11px]">Pitch decks & briefs</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <FileText className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70 border-border/70 shadow-xs transition-all hover:border-sky-500/30">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[11px] font-medium tracking-wider text-sky-500 uppercase">
                  Images
                </p>
                <h3 className="text-foreground mt-0.5 text-xl font-bold sm:text-2xl">
                  {counts.image}
                </h3>
                <p className="text-muted-foreground mt-0.5 text-[11px]">
                  Screenshots & visual data
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                <ImageIcon className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70 border-border/70 shadow-xs transition-all hover:border-orange-500/30">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[11px] font-medium tracking-wider text-orange-500 uppercase">
                  Documents
                </p>
                <h3 className="text-foreground mt-0.5 text-xl font-bold sm:text-2xl">
                  {counts.doc}
                </h3>
                <p className="text-muted-foreground mt-0.5 text-[11px]">DOCX, TXT, MD, CSV</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <FileCode className="size-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'h-8 text-xs font-medium',
                selectedCategory === 'all' &&
                  'bg-[#FF4500] text-white shadow-xs hover:bg-[#FF4500]/90',
              )}
            >
              All Files ({counts.all})
            </Button>
            <Button
              type="button"
              variant={selectedCategory === 'pdf' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('pdf')}
              className={cn(
                'h-8 gap-1.5 text-xs font-medium',
                selectedCategory === 'pdf' &&
                  'bg-[#FF4500] text-white shadow-xs hover:bg-[#FF4500]/90',
              )}
            >
              <FileText className="size-3 text-red-500" />
              PDFs ({counts.pdf})
            </Button>
            <Button
              type="button"
              variant={selectedCategory === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('image')}
              className={cn(
                'h-8 gap-1.5 text-xs font-medium',
                selectedCategory === 'image' &&
                  'bg-[#FF4500] text-white shadow-xs hover:bg-[#FF4500]/90',
              )}
            >
              <ImageIcon className="size-3 text-sky-500" />
              Images ({counts.image})
            </Button>
            <Button
              type="button"
              variant={selectedCategory === 'doc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('doc')}
              className={cn(
                'h-8 gap-1.5 text-xs font-medium',
                selectedCategory === 'doc' &&
                  'bg-[#FF4500] text-white shadow-xs hover:bg-[#FF4500]/90',
              )}
            >
              <FileCode className="size-3 text-orange-500" />
              Documents ({counts.doc})
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-56 sm:flex-initial">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <Input
                placeholder="Search file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pr-7 pl-8 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="border-border/70 bg-card text-muted-foreground flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs">
              <ArrowUpDown className="size-3" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort attachments"
                className="text-foreground cursor-pointer bg-transparent text-xs font-medium outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="size">Size (Largest)</option>
              </select>
            </div>

            <div className="border-border/70 bg-muted/40 flex h-8 items-center rounded-lg border p-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'size-7 rounded-md',
                  viewMode === 'grid' && 'bg-background text-foreground shadow-xs',
                )}
                aria-label="Grid view"
              >
                <Grid className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('table')}
                className={cn(
                  'size-7 rounded-md',
                  viewMode === 'table' && 'bg-background text-foreground shadow-xs',
                )}
                aria-label="Table view"
              >
                <LayoutList className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {isAttachmentsLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="size-7 animate-spin text-[#FF4500]" />
            <p className="text-muted-foreground text-xs">Loading workspace attachments...</p>
          </div>
        ) : filteredAttachments.length === 0 ? (
          <div className="border-border/80 bg-card/40 flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
            <div className="bg-muted/80 text-muted-foreground mb-4 flex size-14 items-center justify-center rounded-2xl shadow-xs">
              {searchQuery ? (
                <Filter className="size-6" />
              ) : (
                <Paperclip className="size-6 text-[#FF4500]" />
              )}
            </div>
            <h3 className="text-foreground text-base font-semibold">
              {searchQuery ? 'No matching attachments found' : 'No attachments uploaded yet'}
            </h3>
            <p className="text-muted-foreground mt-1 mb-4 max-w-md text-xs leading-relaxed">
              {searchQuery
                ? `No files matching "${searchQuery}". Try clearing your search or filter category.`
                : 'Files and documents uploaded in your AI Mentor chat will appear here for easy preview and access.'}
            </p>
            {searchQuery ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs"
              >
                Clear Search & Filters
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                className="gap-1.5 bg-[#FF4500] text-xs font-semibold text-white hover:bg-[#FF4500]/90"
              >
                <Link to={workspaceId ? buildWorkspaceRoute(workspaceId) : ROUTES.DASHBOARD}>
                  <Bot className="size-3.5" />
                  Go to AI Mentor Chat
                </Link>
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAttachments.map((file) => {
              const fileType = (file.file_type || '').toLowerCase();
              const isImg = fileType === 'image';
              const isPdf = fileType === 'pdf';
              const fileExt = getFileExtension(file.file_name);

              return (
                <div
                  key={file.id}
                  className="group border-border/80 bg-card relative flex flex-col justify-between rounded-xl border p-4 transition-all hover:border-[#FF4500]/50 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'flex size-8 items-center justify-center rounded-lg shadow-2xs',
                            isPdf ? 'bg-red-500/10' : isImg ? 'bg-sky-500/10' : 'bg-orange-500/10',
                          )}
                        >
                          {renderFileTypeIcon(file.file_type, file.file_name, 'size-4')}
                        </div>
                        <span className="bg-muted/80 text-foreground/80 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold">
                          {fileExt}
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFileToDelete(file)}
                        className="text-muted-foreground hover:text-destructive size-7 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label={`Delete ${file.file_name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    {isImg && file.file_url ? (
                      <div className="bg-muted/30 border-border/40 relative h-32 w-full overflow-hidden rounded-lg border">
                        <img
                          src={file.file_url}
                          alt={file.file_name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    ) : isPdf ? (
                      <div className="flex h-24 w-full flex-col items-center justify-center rounded-lg border border-red-500/15 bg-red-500/5 text-red-500/80">
                        <FileText className="mb-1 size-7 opacity-75" />
                        <span className="font-mono text-[10px] font-semibold tracking-wider uppercase">
                          PDF Document
                        </span>
                      </div>
                    ) : (
                      <div className="flex h-24 w-full flex-col items-center justify-center rounded-lg border border-orange-500/15 bg-orange-500/5 text-orange-500/80">
                        <FileCode className="mb-1 size-7 opacity-75" />
                        <span className="font-mono text-[10px] font-semibold tracking-wider uppercase">
                          Document File
                        </span>
                      </div>
                    )}

                    <div>
                      <h3
                        className="text-foreground line-clamp-1 text-xs font-semibold transition-colors group-hover:text-[#FF4500]"
                        title={file.file_name}
                      >
                        {file.file_name}
                      </h3>

                      <div className="text-muted-foreground mt-1 flex items-center gap-2 text-[11px]">
                        <span className="font-mono">{formatBytes(file.file_size_bytes)}</span>
                        <span>•</span>
                        <span>{formatDate(file.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-border/60 mt-4 flex items-center justify-between gap-2 border-t pt-3">
                    <span className="text-muted-foreground/80 max-w-[120px] truncate font-mono text-[10px]"></span>

                    <div className="items-right flex gap-1.5">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 px-2 text-[11px] font-medium"
                      >
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open file in new tab"
                        >
                          <ExternalLink className="size-3" />
                          View
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground size-7"
                        title="Download file"
                      >
                        <a
                          href={file.file_url}
                          download={file.file_name}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="size-3.5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-border/80 bg-card overflow-hidden rounded-xl border shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-border/60 bg-muted/40 text-muted-foreground border-b font-medium">
                  <tr>
                    <th className="px-4 py-3">File Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Uploaded Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-border/40 divide-y">
                  {filteredAttachments.map((file) => {
                    const fileExt = getFileExtension(file.file_name);

                    return (
                      <tr key={file.id} className="hover:bg-muted/20 transition-colors">
                        <td className="text-foreground px-4 py-3 font-medium">
                          <div className="flex max-w-sm items-center gap-2.5 sm:max-w-md">
                            {renderFileTypeIcon(file.file_type, file.file_name, 'size-4 shrink-0')}
                            <span className="truncate" title={file.file_name}>
                              {file.file_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-muted/80 text-muted-foreground rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase">
                            {fileExt}
                          </span>
                        </td>
                        <td className="text-muted-foreground px-4 py-3 font-mono">
                          {formatBytes(file.file_size_bytes)}
                        </td>
                        <td className="text-muted-foreground px-4 py-3">
                          {formatDate(file.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              title="Open in new tab"
                            >
                              <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="text-muted-foreground hover:text-foreground size-3.5" />
                              </a>
                            </Button>
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              title="Download"
                            >
                              <a
                                href={file.file_url}
                                download={file.file_name}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="text-muted-foreground hover:text-foreground size-3.5" />
                              </a>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setFileToDelete(file)}
                              className="text-muted-foreground hover:text-destructive size-7"
                              title="Delete File"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <AlertDialog
          open={Boolean(fileToDelete)}
          onOpenChange={(open) => !open && setFileToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Attachment?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{' '}
                <span className="text-foreground font-semibold">{fileToDelete?.file_name}</span>?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete File'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MentorShell>
  );
}
