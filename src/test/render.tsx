import { type QueryClient } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter } from 'react-router-dom';

import { AppProviders } from '@/app/providers/AppProviders';
import { createQueryClient } from '@/app/providers/query-client';
import { createTestRouter } from '@/app/router/create-app-router';

interface RenderAppOptions {
  queryClient?: QueryClient;
  route?: string;
}

export function renderApp({
  queryClient = createQueryClient({ isTest: true }),
  route = '/auctions',
}: RenderAppOptions = {}) {
  const router = createTestRouter([route]);
  const result = render(
    <AppProviders queryClient={queryClient} router={router} />,
  );

  return { ...result, queryClient, router };
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createQueryClient({ isTest: true }),
    route = '/',
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  const router = createMemoryRouter([{ path: '*', element: ui }], {
    initialEntries: [route],
  });
  const result = render(
    <AppProviders queryClient={queryClient} router={router} />,
    renderOptions,
  );

  return { ...result, queryClient, router };
}
