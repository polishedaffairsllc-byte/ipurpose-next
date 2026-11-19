import type { SDSNConfig } from './sdsn';

// Existing SDSN pages keep their defaults; other recipients reuse the same template.
export type PartnershipConfig = SDSNConfig & {
  analyticsPrefix?: 'ug' | 'knust';
  overviewUrl?: string;
  videoUrl?: string;
};

export function partnershipEventName(name: string, prefix = 'sdsn') {
  return prefix === 'sdsn' ? name : name.replace(/^sdsn_/, `${prefix}_`);
}
