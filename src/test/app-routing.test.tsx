import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderApp } from './render';

describe('application routing', () => {
  it('redirects the root route to the auctions page', async () => {
    const { router } = renderApp({ route: '/' });

    expect(
      await screen.findByRole('heading', { name: 'Грузовые аукционы' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/auctions');
  });

  it('passes auctionUuid to the auction details page', async () => {
    renderApp({ route: '/auctions/auction-42' });

    expect(
      await screen.findByRole('heading', { name: 'Детали аукциона' }),
    ).toBeInTheDocument();
    expect(screen.getByText('auction-42')).toBeInTheDocument();
  });

  it('passes auctionUuid to the place bet page', async () => {
    renderApp({ route: '/auctions/auction-42/bet' });

    expect(
      await screen.findByRole('heading', { name: 'Установка ставки' }),
    ).toBeInTheDocument();
    expect(screen.getByText('auction-42')).toBeInTheDocument();
  });

  it('shows the not found page for an unknown URL', async () => {
    renderApp({ route: '/unknown-route' });

    expect(
      await screen.findByRole('heading', { name: 'Страница не найдена' }),
    ).toBeInTheDocument();
  });

  it('provides accessible navigation for checking the routes', async () => {
    const user = userEvent.setup();
    renderApp();

    expect(
      await screen.findByRole('navigation', { name: 'Основная навигация' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Пример деталей' }));

    expect(
      await screen.findByRole('heading', { name: 'Детали аукциона' }),
    ).toBeInTheDocument();
    expect(screen.getByText('demo-auction')).toBeInTheDocument();
  });
});
