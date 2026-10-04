export type PurposeBlock =
  | { type: 'paragraph' | 'h2' | 'h3' | 'quote'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] };

export type PurposePage = {
  slug: string;
  title: string;
  description: string;
  heading: string;
  summary: string;
  body: PurposeBlock[];
  cta: { heading: string; body: PurposeBlock[]; label?: string };
  afterCta: PurposeBlock[];
  related: string[];
};
