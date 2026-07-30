import { useQueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createQueryClient } from '@/app/providers/query-client';

import { renderApp, renderWithProviders } from './render';

function QueryClientProbe() {
  const queryClient = useQueryClient();

  return <output>{queryClient.getQueryData(['provider-probe'])}</output>;
}

describe('application providers', () => {
  it('exposes the supplied QueryClient to application components', () => {
    const queryClient = createQueryClient({ isTest: true });
    queryClient.setQueryData(['provider-probe'], 'connected');

    renderWithProviders(<QueryClientProbe />, { queryClient });

    expect(screen.getByText('connected')).toBeInTheDocument();
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(false);
  });

  it('creates an isolated QueryClient for every test render', async () => {
    const firstRender = renderApp();
    await screen.findByRole('heading', { name: 'Грузовые аукционы' });
    firstRender.unmount();

    const secondRender = renderApp();
    await screen.findByRole('heading', { name: 'Грузовые аукционы' });

    expect(firstRender.queryClient).not.toBe(secondRender.queryClient);
  });
});
