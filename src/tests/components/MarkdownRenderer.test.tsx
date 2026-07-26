import { render, screen } from '@testing-library/react';
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
}

jest.mock('react-markdown', () => {
  function renderInline(text: string, components: MockComponents): ReactNode[] {
    const A: NonNullable<MockComponents['a']> =
      components.a ?? (({ children, href }) => <a href={href}>{children}</a>);
    const CODE: NonNullable<MockComponents['code']> =
      components.code ?? (({ children }) => <code>{children}</code>);

    const inlineRegex = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)|`([^`]+?)`/g;
    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = inlineRegex.exec(text))) {
      if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

      if (match[1] !== undefined) {
        nodes.push(<strong key={key++}>{match[1]}</strong>);
      } else if (match[2] !== undefined) {
        nodes.push(
          <A key={key++} href={match[3]}>
            {match[2]}
          </A>,
        );
      } else if (match[4] !== undefined) {
        nodes.push(<CODE key={key++}>{match[4]}</CODE>);
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

    const lines = children.split('\n').filter((line) => line.trim().length > 0);
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

    return <P>{renderInline(children, components)}</P>;
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
});
