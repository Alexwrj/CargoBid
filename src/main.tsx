import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppProviders } from '@/app/providers/AppProviders';
import { createQueryClient } from '@/app/providers/query-client';
import { createAppRouter } from '@/app/router/create-app-router';
import '@/app/styles/global.scss';
import { ErrorFallback } from '@/shared/ui/error-fallback/ErrorFallback';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found.');
}

const root = createRoot(rootElement);

async function enableMocking() {
  if (!import.meta.env.DEV) {
    return;
  }

  const { worker } = await import('@/mocks/browser');

  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}

async function bootstrap() {
  await enableMocking();

  root.render(
    <StrictMode>
      <AppProviders
        queryClient={createQueryClient()}
        router={createAppRouter()}
      />
    </StrictMode>,
  );
}

void bootstrap().catch((error: unknown) => {
  console.error('CargoBid bootstrap failed.', error);
  root.render(
    <ErrorFallback description="Не удалось запустить инфраструктуру приложения." />,
  );
});
