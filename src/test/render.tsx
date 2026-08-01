import { type QueryClient } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

import { AppProviders } from '@/app/providers/AppProviders';
import { createQueryClient } from '@/app/providers/query-client';
import { createTestRouter } from '@/app/router/create-app-router';

interface RenderAppOptions {
  queryClient?: QueryClient;
  route?: string;
}

export async function renderApp({
  queryClient = createQueryClient({ isTest: true }),
  route = '/auctions',
}: RenderAppOptions = {}) {
  const router = createTestRouter([route]);
  await router.load();
  const result = render(
    <AppProviders queryClient={queryClient} router={router} />,
  );

  return { ...result, queryClient, router };
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  route?: string;
}

export async function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createQueryClient({ isTest: true }),
    route = '/',
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  const rootRoute = createRootRoute({ component: () => ui });
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: [route] }),
    routeTree: rootRoute,
  });
  await router.load();
  const result = render(
    <AppProviders queryClient={queryClient} router={router} />,
    renderOptions,
  );

  return { ...result, queryClient, router };
}
