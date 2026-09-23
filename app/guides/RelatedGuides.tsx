import Link from 'next/link';
import styles from './GuideArticle.module.css';

export type RelatedGuide = {
  href: string;
  title: string;
};

type RelatedGuidesProps = {
  guides: readonly RelatedGuide[];
};

export default function RelatedGuides({ guides }: RelatedGuidesProps) {
  return (
    <section aria-labelledby="related-guides" className={`${styles.section} ${styles.related}`}>
      <h2 id="related-guides" className={styles.sectionTitle}>Related Guides</h2>
      <div className={styles.cardGrid}>
        {guides.map((guide) => (
          <div key={guide.href} className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Link href={guide.href}>{guide.title}</Link>
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}
