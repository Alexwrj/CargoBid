import styles from './ErrorFallback.module.scss';

interface ErrorFallbackProps {
  description?: string;
  title?: string;
}

export function ErrorFallback({
  description = 'Попробуйте обновить страницу. Если ошибка повторится, сообщите о ней разработчикам.',
  title = 'Не удалось открыть приложение',
}: ErrorFallbackProps) {
  return (
    <main className={styles.errorFallback} role="alert">
      <h1 className={styles.errorTitle}>{title}</h1>
      <p>{description}</p>
    </main>
  );
}
