import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/** Renders AI/user message content as GitHub-flavored markdown with app-consistent typography. */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('space-y-3 text-sm leading-relaxed', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
          a: ({ children, ...props }) => (
            <a
              {...props}
              className="text-primary underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          code: ({ children, className: codeClassName }) => (
            <code className={cn('bg-muted rounded px-1.5 py-0.5 font-mono text-xs', codeClassName)}>
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-primary/40 text-muted-foreground border-l-2 pl-3">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
