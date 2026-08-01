import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from './render';

describe('application routing', () => {
  it('redirects the root route to the auctions page', async () => {
    const { router } = await renderApp({ route: '/' });

    expect(
      await screen.findByRole('heading', { name: 'Аукционы' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/auctions');
  });

  it('passes auctionUuid to the place bet page', async () => {
    await renderApp({ route: '/auctions/auction-42/bet' });

    expect(
      await screen.findByRole('heading', { name: 'Установка ставки' }),
    ).toBeInTheDocument();
    expect(screen.getByText('auction-42')).toBeInTheDocument();
  });

  it('shows the not found page for an unknown URL', async () => {
    await renderApp({ route: '/unknown-route' });

    expect(
      await screen.findByRole('heading', { name: 'Страница не найдена' }),
    ).toBeInTheDocument();
  });

  it('shows only the production auction navigation item', async () => {
    await renderApp();

    const navigation = await screen.findByRole('navigation', {
      name: 'Основная навигация',
    });

    expect(navigation).toHaveTextContent('Аукционы');
    expect(navigation).not.toHaveTextContent('Пример деталей');
    expect(navigation).not.toHaveTextContent('Пример ставки');
    expect(navigation).not.toHaveTextContent('UI kit');
    expect(screen.getByRole('link', { name: 'Аукционы' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
