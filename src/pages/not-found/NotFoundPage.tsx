import { Link } from 'react-router-dom';

import { PageContainer } from '@/shared/ui/page-container/PageContainer';

import styles from './NotFoundPage.module.scss';

export function NotFoundPage() {
  return (
    <PageContainer eyebrow="Ошибка 404" title="Страница не найдена">
      <p>Проверьте адрес или вернитесь к списку грузовых аукционов.</p>
      <Link className={styles.backLink} to="/auctions">
        Перейти к аукционам
      </Link>
    </PageContainer>
  );
}
