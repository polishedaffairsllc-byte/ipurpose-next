import 'server-only';
import { jsPDF } from 'jspdf';

const PURPLE = '#8D7BEE';
const NAVY = '#505675';
const INK = '#303548';
const LIGHT = '#F7F8FB';
const GREEN = '#7FAE43';
const GOLD = '#E4BD59';
const CORAL = '#F3A998';
const PAGE_URL = 'https://ipurposesoul.com/partnerships/knust/career-services?utm_source=knust&utm_medium=pdf&utm_campaign=knust_career_services_2026&utm_content=downloaded_asset';

type Card = { title: string; body: string };
type DeckSlide = { title: string; subtitle?: string; cards?: Card[]; note?: string; dark?: boolean };

const slides: DeckSlide[] = [
  {
    title: 'Student Clarity & Career Navigation Pilot',
    subtitle: 'Partnership Concept · An 8-week, Career Services-centered pilot connecting self-discovery, responsible AI-guided decision support and verified Ghana pathways.',
    dark: true,
    cards: [
      { title: 'UP TO 40', body: 'KNUST students, age 18+' },
      { title: '8 WEEKS', body: 'structured discovery pilot' },
      { title: 'PILOT TERMS', body: 'to be agreed with KNUST' },
    ],
    note: 'Prepared for KNUST Career Services Centre · Mrs. Selina Doe Angmor, Director',
  },
  {
    title: 'What is iPurpose?',
    subtitle: 'iPurpose helps students and emerging leaders move from uncertainty to clarity, informed decisions and practical next steps.',
    cards: [
      { title: 'Soul', body: 'Understand values, strengths, direction and what matters.' },
      { title: 'Systems', body: 'Turn self-understanding into options, pathways, plans and next steps.' },
      { title: 'AI', body: 'Navigate possibilities with practical support. AI supports judgment; it does not replace career professionals.' },
    ],
    note: 'Renita Hamilton, MPS — Founder & CEO · Educator, entrepreneur and social-impact leader with more than two decades across education, nonprofit leadership, philanthropy, strategic development, consulting and business ownership.',
  },
  {
    title: 'Why KNUST. Why now.',
    subtitle: 'KNUST already combines career coaching, self-exploration, industry pathways and fast-moving AI and digital-skills initiatives.',
    dark: true,
    cards: [
      { title: 'Career coaching + self-exploration', body: 'KCSC provides one-on-one coaching and tested self-exploration tools focused on values, personality, strengths and aspirations.' },
      { title: 'Industry + digital readiness', body: 'KCSC bridges academia and industry through internships, job placement, IBM SkillBuild and the EU-UNCDF Pact for Skills.' },
      { title: 'Responsible AI already scaling', body: 'KNUST is expanding responsible AI adoption across faculty and students, including 2026 Gemini training and AI-focused workforce programmes.' },
    ],
    note: 'The opportunity: create a structured continuation layer between KCSC touchpoints — reflection before and after coaching, verified Ghana pathways and follow-through on real next steps.',
  },
  {
    title: 'KNUST Career Services stays at the center',
    subtitle: 'AI supports reflection and follow-through; KCSC retains the professional role.',
    cards: [
      { title: '1 · CLARITY', body: 'What goals, values and uncertainties are present?' },
      { title: '2 · KCSC', body: 'Coaching, context and referral remain central.' },
      { title: '3 · COMPASS', body: 'AI helps organize options and questions for exploration.' },
      { title: '4 · OPPORTUNITY', body: 'Which verified Ghana-specific pathways fit?' },
      { title: '5 · ACTION', body: 'What did I decide or do — and what comes next?' },
    ],
    note: 'Design principle: iPurpose extends career-development support without replacing KCSC, professional judgment or university career services.',
  },
  {
    title: 'Proposed 8-week pilot: up to 40 KNUST students',
    subtitle: 'Small enough to manage responsibly. Structured enough to produce useful evidence.',
    cards: [
      { title: 'KNUST cohort', body: 'Up to 40 students age 18+ recruited with KCSC; final participation criteria co-designed before launch.' },
      { title: 'Career Services touchpoints', body: 'Orientation plus midpoint and closeout touchpoints, with a clear KCSC referral pathway.' },
      { title: 'Weekly learning loop', body: 'Usage analytics, short check-ins and selected interviews assess clarity, usefulness, cultural fit and movement toward action.' },
    ],
    note: 'Week 0: baseline + consent · Weeks 1–2: Clarity + Purpose + Compass · Weeks 3–6: guidance + verified pathways · Weeks 7–8: action + retention + interviews · Closeout: KCSC readout + recommendations.',
  },
  {
    title: 'What KNUST receives — and what we ask',
    subtitle: 'A deliberately light institutional lift with a concrete evidence package at the end.',
    cards: [
      { title: 'Pilot access', body: 'Full iPurpose pilot access for up to 40 KNUST students.' },
      { title: 'Localized pathway layer', body: 'A Ghana-focused starter library of verified education, career, entrepreneurship and skills opportunities.' },
      { title: 'Evidence package', body: 'Aggregated analytics, participant feedback and a concise closeout report for KCSC.' },
      { title: 'One liaison', body: 'A primary KCSC contact for scope, scheduling, recruitment coordination and issue escalation.' },
      { title: 'Recruitment + orientation', body: 'Recruit the agreed adult cohort and help coordinate one short virtual or hybrid orientation.' },
      { title: 'Two learning touchpoints', body: 'Participate in midpoint and closeout reviews and advise on KNUST and Ghana relevance.' },
    ],
    note: 'Pilot fee and implementation terms: to be agreed with KNUST. Any longer-term commitment would follow evidence from the pilot.',
  },
  {
    title: 'Guardrails: Career Services, privacy and trust',
    subtitle: 'The pilot must be useful without blurring the line between AI guidance and KCSC professional services.',
    cards: [
      { title: 'Decision support — not replacement', body: 'iPurpose will not be positioned as a diagnostic tool or replacement for KCSC or professional career services.' },
      { title: 'KCSC referral pathway', body: 'Clear escalation and referral prompts direct students back to KCSC when needs exceed iPurpose scope.' },
      { title: '18+ initial cohort', body: 'The initial pilot is limited to adults age 18+ while the model and safeguards are evaluated.' },
      { title: 'Data minimization', body: 'Collect only what is needed; clearly state purpose, retention and deletion choices.' },
      { title: 'Aggregated reporting', body: 'KCSC receives cohort-level findings; individual participant content is not included in routine reporting.' },
      { title: 'Compliance review before launch', body: 'Cross-border processing, consent, controller responsibilities and Ghana data-protection requirements are confirmed before recruitment.' },
    ],
  },
  {
    title: 'How we would learn, and the next step',
    subtitle: 'Downloads are not the goal. Progress from uncertainty toward informed action is.',
    cards: [
      { title: 'Activation', body: '% completing onboarding' },
      { title: 'Clarity', body: 'Change in “I know what to do next”' },
      { title: 'Compass use', body: 'Repeat guided navigation' },
      { title: 'Retention', body: 'Week 2 / 4 / 8 return' },
      { title: 'Opportunity', body: 'Verified pathway exploration' },
      { title: 'Action', body: 'Reported real-world next steps' },
    ],
    note: 'Core questions: “How clear are you about what you should do next?” and “What next step have you decided on or taken?” · NEXT STEP: a 30-minute exploratory conversation.',
  },
];

function brand(doc: jsPDF, page: number, dark = false) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFillColor(dark ? NAVY : LIGHT); doc.rect(0, 0, w, h, 'F');
  doc.setFillColor(PURPLE); doc.rect(0, 0, w, 2.5, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(dark ? '#FFFFFF' : NAVY); doc.text('iPurpose', 18, 18);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(dark ? '#EDEFFF' : '#6D7289');
  doc.text('Soul · Systems · AI.', 18, 24);
  doc.text(`CONFIDENTIAL CONCEPT FOR DISCUSSION · ${page}`, w - 18, h - 9, { align: 'right' });
}
function wrap(doc: jsPDF, text: string, width: number) { return doc.splitTextToSize(text, width) as string[]; }
function card(doc: jsPDF, x: number, y: number, w: number, h: number, item: Card, accent: string, dark = false) {
  doc.setFillColor(dark ? '#626984' : '#FFFFFF'); doc.setDrawColor(dark ? '#8389A0' : '#D9DCE7'); doc.roundedRect(x, y, w, h, 3, 3, 'FD');
  doc.setFillColor(accent); doc.roundedRect(x, y, 2.4, h, 1.2, 1.2, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(dark ? '#FFFFFF' : NAVY); doc.text(item.title, x + 7, y + 10);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(dark ? '#F5F6FF' : INK); doc.text(wrap(doc, item.body, w - 13), x + 7, y + 18, { lineHeightFactor: 1.3 });
}
function note(doc: jsPDF, text: string, y: number, dark = false) {
  const w = doc.internal.pageSize.getWidth();
  doc.setDrawColor(dark ? GOLD : PURPLE); doc.setLineWidth(.7); doc.setFillColor(dark ? '#5C637E' : '#FFFFFF'); doc.roundedRect(18, y, w - 36, 22, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.8); doc.setTextColor(dark ? '#FFFFFF' : NAVY); doc.text(wrap(doc, text, w - 48), 24, y + 7, { lineHeightFactor: 1.25 });
}

export function buildKNUSTDeckPdf() {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  const accents = [PURPLE, GREEN, GOLD, CORAL, '#7B82A3', PURPLE];
  slides.forEach((slide, index) => {
    if (index) doc.addPage('a4', 'landscape');
    brand(doc, index + 1, slide.dark);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(index === 0 ? 24 : 20); doc.setTextColor(slide.dark ? '#FFFFFF' : NAVY);
    doc.text(wrap(doc, slide.title, 240), 18, index === 0 ? 52 : 42, { lineHeightFactor: 1.05 });
    if (slide.subtitle) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(slide.dark ? '#F0F1FF' : '#51566E');
      doc.text(wrap(doc, slide.subtitle, 245), 18, index === 0 ? 72 : 58, { lineHeightFactor: 1.25 });
    }
    const items = slide.cards || [];
    if (items.length) {
      const cols = items.length > 3 ? 3 : items.length;
      const rows = Math.ceil(items.length / cols);
      const gap = 5;
      const totalW = 261;
      const cw = (totalW - gap * (cols - 1)) / cols;
      const ch = rows > 1 ? 45 : (index === 0 ? 42 : 58);
      const startY = index === 0 ? 98 : 78;
      items.forEach((item, i) => card(doc, 18 + (i % cols) * (cw + gap), startY + Math.floor(i / cols) * (ch + gap), cw, ch, item, accents[i % accents.length], Boolean(slide.dark)));
      if (slide.note) note(doc, slide.note, startY + rows * (ch + gap) + 3, Boolean(slide.dark));
    } else if (slide.note) note(doc, slide.note, 90, Boolean(slide.dark));
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(slide.dark ? '#EDEFFF' : '#6D7289');
    doc.textWithLink('View the private KNUST partnership page', 18, 201, { url: PAGE_URL });
  });
  return new Uint8Array(doc.output('arraybuffer'));
}

export function buildKNUSTOnePagePdf() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(LIGHT); doc.rect(0, 0, w, 297, 'F'); doc.setFillColor(PURPLE); doc.rect(0, 0, w, 3, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.setTextColor(NAVY); doc.text('iPurpose × KNUST', 15, 18);
  doc.setFontSize(9); doc.setTextColor('#565C75'); doc.text('Student Clarity & Career Navigation Discovery Pilot · One-page overview', 15, 26);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(INK); doc.text(wrap(doc, 'An 8-week, Career Services-centered pilot for up to 40 KNUST students age 18+, designed to extend support between coaching touchpoints while keeping KCSC central.', 180), 15, 36, { lineHeightFactor: 1.35 });

  const section = (title: string, y: number, text: string, accent = PURPLE) => {
    doc.setFillColor('#FFFFFF'); doc.setDrawColor('#D9DCE7'); doc.roundedRect(15, y, 180, 41, 3, 3, 'FD'); doc.setFillColor(accent); doc.rect(15, y, 2.2, 41, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(NAVY); doc.text(title, 22, y + 9);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.8); doc.setTextColor(INK); doc.text(wrap(doc, text, 163), 22, y + 16, { lineHeightFactor: 1.35 });
  };
  section('WHY KNUST', 52, 'KNUST Career Services Centre already combines one-on-one career coaching and self-exploration around values, personality, strengths and aspirations with internships, job placement and industry pathways. KNUST is also expanding digital and responsible-AI readiness through initiatives including IBM SkillBuild, the EU/UNCDF Pact for Skills and 2026 Gemini training.', PURPLE);
  section('PROPOSED PILOT', 98, 'Up to 40 adult KNUST students · 8 weeks. Week 0 baseline/consent; Weeks 1–2 Clarity + Purpose + Compass; Weeks 3–6 guidance and verified Ghana pathways; Weeks 7–8 action, retention and interviews; closeout readout with KCSC.', GREEN);
  section('WHAT KNUST RECEIVES', 144, 'Full pilot access; a localized Ghana pathway starter layer; aggregated usage and participant feedback; and a concise evidence-based closeout report. iPurpose serves as a continuation layer, not a replacement for KCSC or professional career services.', GOLD);
  section('WHAT WE ASK', 190, 'Pilot fee and implementation terms would be agreed with KNUST before launch. We ask for one KCSC liaison; support recruiting the agreed adult cohort; one short orientation; participation in midpoint and closeout learning reviews; and advice on KNUST and Ghana relevance.', CORAL);
  section('GUARDRAILS + NEXT STEP', 236, '18+ initial cohort; clear KCSC referral pathway; data minimization; aggregated institutional reporting; and pre-launch review of consent, cross-border processing and Ghana data-protection requirements. Suggested next step: a 30-minute exploratory conversation.', '#7B82A3');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(NAVY); doc.textWithLink('View the private KNUST partnership page', 15, 287, { url: PAGE_URL });
  doc.textWithLink('renita@ipurposesoul.com', w - 15, 287, { url: 'mailto:renita@ipurposesoul.com', align: 'right' });
  return new Uint8Array(doc.output('arraybuffer'));
}