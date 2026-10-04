import type { PurposePage } from './types';
import page0 from './what-is-my-purpose';
import page1 from './personal-values';
import page2 from './personal-mission-statement';
import page3 from './life-purpose-vs-goals';
import page4 from './self-reflection-questions';
import page5 from './find-purpose-when-stuck';
import page6 from './purpose-into-action';

export const purposePages: PurposePage[] = [page0, page1, page2, page3, page4, page5, page6];

export function getPurposePage(slug: string) {
  return purposePages.find((page) => page.slug === slug);
}
