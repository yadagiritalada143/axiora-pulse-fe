import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { MarkdownRenderer } from '@components/chat/MarkdownRenderer';

// `react-markdown` (and `remark-gfm`) ship ESM-only builds that Jest/Babel can't transform out of
// the box, and the shared jest config is out of scope for this test suite. Stub `react-markdown`
// with a tiny markdown-ish renderer that still routes through the same `components` overrides
// MarkdownRenderer supplies, so we're exercising MarkdownRenderer's wiring, not react-markdown's
// parser internals.
jest.mock('remark-gfm', () => () => null);

interface MockComponents {
  p?: (props: { children: ReactNode }) => ReactNode;
  a?: (props: { children: ReactNode; href?: string }) => ReactNode;
  ul?: (props: { children: ReactNode }) => ReactNode;
  ol?: (props: { children: ReactNode }) => ReactNode;
  code?: (props: { children: ReactNode; className?: string }) => ReactNode;
  pre?: (props: { children: ReactNode }) => ReactNode;
  blockquote?: (props: { children: ReactNode }) => ReactNode;
  img?: (props: { src?: string; alt?: string }) => ReactNode;
}

jest.mock('react-markdown', () => {
  function renderInline(text: string, components: MockComponents): ReactNode[] {
    const A: NonNullable<MockComponents['a']> =
      components.a ?? (({ children, href }) => <a href={href}>{children}</a>);
    const CODE: NonNullable<MockComponents['code']> =
      components.code ?? (({ children }) => <code>{children}</code>);
    const IMG: NonNullable<MockComponents['img']> =
      components.img ?? (({ src, alt }) => <img src={src} alt={alt} />);

    // Alternatives, in order: image, bold, link, inline code. Images must precede links so
    // `![alt](src)` isn't consumed by the link branch.
    const inlineRegex = /!\[(.*?)\]\(([^)]*)\)|\*\*(.+?)\*\*|\[(.+?)\]\(([^)]*)\)|`([^`]+?)`/g;
    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = inlineRegex.exec(text))) {
      if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

      if (match[1] !== undefined) {
        nodes.push(<IMG key={key++} src={match[2]} alt={match[1]} />);
      } else if (match[3] !== undefined) {
        nodes.push(<strong key={key++}>{match[3]}</strong>);
      } else if (match[4] !== undefined) {
        // react-markdown hands `a` an array of nodes when the label isn't plain text; mirror
        // that so MarkdownRenderer's children-flattening logic is exercised both ways.
        const label = match[4];
        nodes.push(
          <A key={key++} href={match[5]}>
            {label.includes('**') ? renderInline(label, components) : label}
          </A>,
        );
      } else if (match[6] !== undefined) {
        nodes.push(<CODE key={key++}>{match[6]}</CODE>);
      }

      lastIndex = inlineRegex.lastIndex;
    }

    if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
    return nodes;
  }

  return function ReactMarkdown({
    children,
    components = {},
  }: {
    children: string;
    components?: MockComponents;
  }) {
    const P: NonNullable<MockComponents['p']> = components.p ?? (({ children: c }) => <p>{c}</p>);
    const UL: NonNullable<MockComponents['ul']> =
      components.ul ?? (({ children: c }) => <ul>{c}</ul>);
    const OL: NonNullable<MockComponents['ol']> =
      components.ol ?? (({ children: c }) => <ol>{c}</ol>);
    const PRE: NonNullable<MockComponents['pre']> =
      components.pre ?? (({ children: c }) => <pre>{c}</pre>);
    const CODE: NonNullable<MockComponents['code']> =
      components.code ?? (({ children: c }) => <code>{c}</code>);
    const BLOCKQUOTE: NonNullable<MockComponents['blockquote']> =
      components.blockquote ?? (({ children: c }) => <blockquote>{c}</blockquote>);

    const lines = children.split('\n').filter((line) => line.trim().length > 0);

    if (children.trim().startsWith('```')) {
      const [, ...rest] = children.trim().split('\n');
      const body = rest.filter((line) => !line.startsWith('```')).join('\n');
      return (
        <PRE>
          <CODE className="language-ts">{body}</CODE>
        </PRE>
      );
    }

    if (lines.length > 0 && lines.every((line) => line.trim().startsWith('>'))) {
      return <BLOCKQUOTE>{lines.map((line) => line.replace(/^>\s*/, '')).join(' ')}</BLOCKQUOTE>;
    }

    const isUnorderedList = lines.length > 0 && lines.every((line) => /^[-*]\s/.test(line.trim()));
    const isOrderedList = lines.length > 0 && lines.every((line) => /^\d+\.\s/.test(line.trim()));
    const isTable =
      lines.length >= 2 && (lines[0] ?? '').includes('|') && /^\|?\s*-+/.test(lines[1] ?? '');

    if (isTable) {
      const rows = lines
        .filter((_, index) => index !== 1)
        .map((line) =>
          line
            .split('|')
            .map((cell) => cell.trim())
            .filter((cell) => cell.length > 0),
        );
      const [headerRow, ...bodyRows] = rows;
      return (
        <table>
          <thead>
            <tr>
              {(headerRow ?? []).map((cell, index) => (
                <th key={index}>{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (isUnorderedList) {
      return (
        <UL>
          {lines.map((line, index) => (
            <li key={index}>{renderInline(line.replace(/^[-*]\s/, ''), components)}</li>
          ))}
        </UL>
      );
    }

    if (isOrderedList) {
      return (
        <OL>
          {lines.map((line, index) => (
            <li key={index}>{renderInline(line.replace(/^\d+\.\s/, ''), components)}</li>
          ))}
        </OL>
      );
    }

    // A standalone link or image is rendered unwrapped: MarkdownRenderer's attachment card and
    // image overrides emit block-level markup, which React rejects as a descendant of <p>.
    const isStandaloneMedia = /^!?\[.*?\]\([^)]*\)$/.test(children.trim());
    const inline = renderInline(children, components);

    return isStandaloneMedia ? <>{inline}</> : <P>{inline}</P>;
  };
});

describe('MarkdownRenderer', () => {
  it('renders bold text', () => {
    render(<MarkdownRenderer content="This is **bold** text" />);

    const strong = screen.getByText('bold');
    expect(strong.tagName).toBe('STRONG');
  });

  it('renders links with target and rel attributes', () => {
    render(<MarkdownRenderer content="[Axiora](https://axiora.example.com)" />);

    const link = screen.getByRole('link', { name: 'Axiora' });
    expect(link).toHaveAttribute('href', 'https://axiora.example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('renders an unordered list', () => {
    render(<MarkdownRenderer content={'- item one\n- item two'} />);

    const list = screen.getByRole('list');
    expect(list.tagName).toBe('UL');
    expect(screen.getByText('item one')).toBeInTheDocument();
    expect(screen.getByText('item two')).toBeInTheDocument();
  });

  it('renders an ordered list', () => {
    render(<MarkdownRenderer content={'1. first\n2. second'} />);

    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
  });

  it('renders inline code', () => {
    render(<MarkdownRenderer content="Use `npm install`" />);

    expect(screen.getByText('npm install').tagName).toBe('CODE');
  });

  it('renders a table', () => {
    const table = ['| A | B |', '| --- | --- |', '| 1 | 2 |'].join('\n');
    render(<MarkdownRenderer content={table} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('applies the provided className to the wrapper', () => {
    const { container } = render(<MarkdownRenderer content="Plain text" className="extra" />);

    expect(container.firstChild).toHaveClass('extra');
  });

  it('renders a fenced code block inside a pre element', () => {
    render(<MarkdownRenderer content={'```ts\nconst a = 1;\n```'} />);

    const code = screen.getByText('const a = 1;');
    expect(code.tagName).toBe('CODE');
    expect(code).toHaveClass('language-ts');
    expect(code.closest('pre')).toBeInTheDocument();
  });

  it('renders a blockquote', () => {
    render(<MarkdownRenderer content="> Founders should talk to customers" />);

    const quote = screen.getByText('Founders should talk to customers');
    expect(quote.tagName).toBe('BLOCKQUOTE');
  });

  it('renders an image and opens it in a new tab when clicked', async () => {
    const user = userEvent.setup();
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);

    render(<MarkdownRenderer content="![A chart](https://cdn.example.test/chart.png)" />);

    const image = screen.getByRole('img', { name: 'A chart' });
    expect(image).toHaveAttribute('src', 'https://cdn.example.test/chart.png');

    await user.click(image);

    expect(open).toHaveBeenCalledWith('https://cdn.example.test/chart.png', '_blank');
    open.mockRestore();
  });

  it('renders nothing for an image without a source', () => {
    render(<MarkdownRenderer content="![Missing]()" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders nothing for a link without an href', () => {
    render(<MarkdownRenderer content="[Nowhere]()" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders an uploaded PDF as a downloadable file card', () => {
    render(
      <MarkdownRenderer content="[📁 pitch-deck.pdf](https://cdn.example.test/uploads/deck.pdf)" />,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://cdn.example.test/uploads/deck.pdf');
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('pitch-deck.pdf')).toBeInTheDocument();
    expect(screen.getByText('Click to download')).toBeInTheDocument();
  });

  it('labels a non-PDF attachment as a generic document', () => {
    render(<MarkdownRenderer content="[📁 notes.docx](https://cdn.example.test/uploads/n.docx)" />);

    expect(screen.getByText('DOC')).toBeInTheDocument();
    expect(screen.getByText('notes.docx')).toBeInTheDocument();
  });

  it('treats any /uploads/ link as an attachment even without the folder emoji', () => {
    render(<MarkdownRenderer content="[report.pdf](https://cdn.example.test/uploads/r.pdf)" />);

    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('flattens rich link labels when deciding whether a link is an attachment', () => {
    render(<MarkdownRenderer content="[a **bold** label](https://axiora.example.com)" />);

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('a bold label');
    expect(screen.queryByText('Click to download')).not.toBeInTheDocument();
  });
});
