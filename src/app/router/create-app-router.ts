import {
  createMemoryHistory,
  createRouter,
  type RouterHistory,
} from '@tanstack/react-router';

import { LoadingFallback } from '@/shared/ui/loading-fallback/LoadingFallback';

import { routeTree } from './routes';

function createCargoBidRouter(
  history?: RouterHistory,
  scrollRestoration = true,
) {
  return createRouter({
    defaultPendingComponent: LoadingFallback,
    defaultPendingMs: 0,
    defaultPreload: 'intent',
    history,
    routeTree,
    scrollRestoration,
  });
}

export function createAppRouter() {
  return createCargoBidRouter();
}

export function createTestRouter(initialEntries: string[]) {
  return createCargoBidRouter(createMemoryHistory({ initialEntries }), false);
}

export type AppRouter = ReturnType<typeof createCargoBidRouter>;

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter;
  }
}
