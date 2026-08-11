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
          a: ({ href, children, ...props }) => {
            if (!href) return null;

            const childrenText =
              typeof children === 'string'
                ? children
                : Array.isArray(children)
                  ? children
                      .map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : ''))
                      .join('')
                  : '';

            const isFile = href.includes('/uploads/') || childrenText.includes('📁');

            if (isFile) {
              const fileName = childrenText.replace(/^📁\s*/, '');
              const isPdf = fileName.toLowerCase().endsWith('.pdf');

              return (
                <a
                  {...props}
                  href={href}
                  className="bg-muted/40 hover:bg-muted border-border group mt-2 inline-flex max-w-sm min-w-[240px] items-center gap-3 rounded-lg border p-3 transition-colors duration-150"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase">
                    {isPdf ? 'PDF' : 'DOC'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground group-hover:text-primary truncate text-sm font-medium transition-colors">
                      {fileName}
                    </p>
                    <p className="text-muted-foreground text-xs">Click to download</p>
                  </div>
                  <div className="text-muted-foreground group-hover:text-primary pl-1">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </div>
                </a>
              );
            }

            return (
              <a
                {...props}
                href={href}
                className="text-primary underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                {children}
              </a>
            );
          },
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
          img: ({ src, alt }) => {
            if (!src) return null;

            return (
              /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
              <img
                src={src}
                alt={alt}
                className="border-border mt-2 max-h-48 max-w-xs cursor-pointer rounded-lg border object-cover shadow-sm transition-transform duration-200 hover:scale-[1.02]"
                onClick={() => {
                  window.open(src, '_blank');
                }}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
