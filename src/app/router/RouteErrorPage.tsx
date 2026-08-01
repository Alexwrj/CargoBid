import { ErrorFallback } from '@/shared/ui/error-fallback/ErrorFallback';

export function RouteErrorPage() {
  const description =
    'Во время отображения страницы произошла непредвиденная ошибка.';

  return (
    <ErrorFallback
      description={description}
      title="Не удалось открыть страницу"
    />
  );
}
