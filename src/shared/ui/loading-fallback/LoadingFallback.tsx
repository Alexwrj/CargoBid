import styles from './LoadingFallback.module.scss';

export function LoadingFallback() {
  return (
    <div aria-live="polite" className={styles.loadingFallback} role="status">
      Загружаем страницу…
    </div>
  );
}
