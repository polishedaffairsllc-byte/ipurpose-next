import Link from 'next/link';
import type { ReactNode } from 'react';
import type { PurposeBlock } from '@/content/purpose/types';

export const purposeLinkClass = 'purpose:rounded-sm purpose:text-indigoDeep purpose:underline purpose:decoration-lavenderViolet purpose:decoration-2 purpose:underline-offset-4 purpose:hover:decoration-indigoDeep purpose:focus-visible:outline-2 purpose:focus-visible:outline-offset-4 purpose:focus-visible:outline-indigoDeep';

// The copy uses only links, emphasis and strong text. React escapes all text;
// raw HTML is deliberately unsupported. Block structure lives in typed data.
function Inline({ text }: { text: string }) {
  const pattern = /\[([^\]]+)\]\((\/[^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index!;
    nodes.push(text.slice(cursor, index));
    if (match[1]) {
      nodes.push(<Link key={index} href={match[2]} className={purposeLinkClass}>{match[1]}</Link>);
    } else if (match[3]) {
      nodes.push(<strong key={index} className="purpose:font-semibold"><Inline text={match[3]} /></strong>);
    } else {
      nodes.push(<em key={index}>{match[4]}</em>);
    }
    cursor = index + match[0].length;
  }
  nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}

export default function PurposeBody({ blocks }: { blocks: PurposeBlock[] }) {
  return (
    <div className="purpose:space-y-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'h2': return <h2 key={index} className="purpose:pt-8 purpose:font-italiana purpose:text-display-h2 purpose:text-indigoDeep"><Inline text={block.text} /></h2>;
          case 'h3': return <h3 key={index} className="purpose:pt-4 purpose:font-italiana purpose:text-display-h3 purpose:text-indigoDeep"><Inline text={block.text} /></h3>;
          case 'paragraph': return <p key={index}><Inline text={block.text} /></p>;
          case 'quote': return <blockquote key={index} className="purpose:border-l-4 purpose:border-lavenderViolet purpose:bg-lavenderViolet/10 purpose:px-5 purpose:py-6"><p><Inline text={block.text} /></p></blockquote>;
          case 'list': {
            const List = block.ordered ? 'ol' : 'ul';
            return <List key={index} className={`purpose:space-y-3 purpose:pl-6 ${block.ordered ? 'purpose:list-decimal' : 'purpose:list-disc'}`}>
              {block.items.map((item, itemIndex) => <li key={itemIndex} className="purpose:pl-1"><Inline text={item} /></li>)}
            </List>;
          }
          case 'table': return (
            <div key={index} role="region" aria-label="Purpose and goals comparison — scroll horizontally to read all columns" tabIndex={0} className="purpose:max-w-full purpose:overflow-x-auto purpose:rounded-xl purpose:border purpose:border-indigoDeep/20 purpose:focus-visible:outline-2 purpose:focus-visible:outline-offset-4 purpose:focus-visible:outline-indigoDeep">
              <table className="purpose:w-full purpose:min-w-[36rem] purpose:border-collapse purpose:text-left purpose:text-base">
                <caption className="purpose:sr-only">Purpose and goals comparison</caption>
                <thead className="purpose:bg-indigoDeep purpose:text-lightMistGray"><tr>{block.headers.map((cell, cellIndex) => <th key={cellIndex} scope="col" className="purpose:px-5 purpose:py-4 purpose:font-semibold">{cell ? <Inline text={cell} /> : <span className="purpose:sr-only">Comparison</span>}</th>)}</tr></thead>
                <tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex} className="purpose:border-t purpose:border-indigoDeep/20 purpose:even:bg-lavenderViolet/10">{row.map((cell, cellIndex) => cellIndex === 0
                  ? <th key={cellIndex} scope="row" className="purpose:px-5 purpose:py-4 purpose:font-semibold"><Inline text={cell} /></th>
                  : <td key={cellIndex} className="purpose:px-5 purpose:py-4 purpose:align-top"><Inline text={cell} /></td>)}</tr>)}</tbody>
              </table>
            </div>
          );
        }
      })}
    </div>
  );
}
