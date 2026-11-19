import { Fragment } from 'react';
export type PolicyBlock = { readonly kind: string; readonly content: string | readonly string[] };
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith('**')
    ? <strong key={index}>{part.slice(2, -2)}</strong> : <Fragment key={index}>{part}</Fragment>);
}
export default function PolicyContent({ blocks }: { blocks: readonly PolicyBlock[] }) {
  return blocks.map((block, index) => {
    if (typeof block.content !== 'string') return <ul key={index} style={{ paddingLeft: 24, marginBottom: 20 }}>{block.content.map(item => <li key={item}>{inline(item)}</li>)}</ul>;
    const content = inline(block.content);
    switch (block.kind) {
      case 'h1': return <h1 key={index} className="text-h2">{content}</h1>;
      case 'h2': return <h2 key={index} style={{ fontSize: 24, marginTop: 32, marginBottom: 12 }}>{content}</h2>;
      case 'h3': return <h3 key={index} style={{ fontSize: 19, marginTop: 24, marginBottom: 12 }}>{content}</h3>;
      default: return <p key={index} style={{ marginBottom: 16 }}>{content}</p>;
    }
  });
}
