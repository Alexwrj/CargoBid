import classNames from 'classnames';

import styles from './Pagination.module.scss';

export interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  totalPages: number;
}

function getVisiblePages(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
) {
  const first = Math.max(1, currentPage - siblingCount);
  const last = Math.min(totalPages, currentPage + siblingCount);

  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
}

export function Pagination({
  currentPage,
  onPageChange,
  siblingCount = 1,
  totalPages,
}: PaginationProps) {
  const visiblePages = getVisiblePages(currentPage, totalPages, siblingCount);

  return (
    <nav aria-label="Пагинация" className={styles.pagination}>
      <button
        aria-label="Предыдущая страница"
        className={styles.pageButton}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        ←
      </button>
      {visiblePages.map((page) => (
        <button
          aria-current={page === currentPage ? 'page' : undefined}
          aria-label={`Страница ${page}`}
          className={classNames(
            styles.pageButton,
            page === currentPage && styles.current,
          )}
          key={page}
          onClick={() => onPageChange(page)}
          type="button"
        >
          {page}
        </button>
      ))}
      <button
        aria-label="Следующая страница"
        className={styles.pageButton}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        →
      </button>
    </nav>
  );
}
