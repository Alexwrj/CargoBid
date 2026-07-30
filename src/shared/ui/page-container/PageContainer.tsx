import type { PropsWithChildren } from 'react';

import styles from './PageContainer.module.scss';

interface PageContainerProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
}

export function PageContainer({
  children,
  eyebrow,
  title,
}: PageContainerProps) {
  return (
    <section className={styles.pageContainer}>
      <p className={styles.pageEyebrow}>{eyebrow}</p>
      <h1 className={styles.pageTitle}>{title}</h1>
      <div className={styles.pageContent}>{children}</div>
    </section>
  );
}
