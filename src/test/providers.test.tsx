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
  it('exposes the supplied QueryClient to application components', async () => {
    const queryClient = createQueryClient({ isTest: true });
    queryClient.setQueryData(['provider-probe'], 'connected');

    await renderWithProviders(<QueryClientProbe />, { queryClient });

    expect(screen.getByText('connected')).toBeInTheDocument();
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(false);
  });

  it('creates an isolated QueryClient for every test render', async () => {
    const firstRender = await renderApp();
    await screen.findByRole('heading', { name: 'Аукционы' });
    firstRender.unmount();

    const secondRender = await renderApp();
    await screen.findByRole('heading', { name: 'Аукционы' });

    expect(firstRender.queryClient).not.toBe(secondRender.queryClient);
  });
});
