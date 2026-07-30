import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { ErrorFallback } from '@/shared/ui/error-fallback/ErrorFallback';

export function RouteErrorPage() {
  const error = useRouteError();
  const description = isRouteErrorResponse(error)
    ? `Маршрут завершился с ошибкой ${error.status}.`
    : 'Во время отображения страницы произошла непредвиденная ошибка.';

  return (
    <ErrorFallback
      description={description}
      title="Не удалось открыть страницу"
    />
  );
}
