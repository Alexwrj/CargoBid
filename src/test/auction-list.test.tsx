import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createAuctionListHandler } from '@/mocks/handlers/auctions';
import { server } from '@/mocks/server';

import { renderApp } from './render';

describe('auction list', () => {
  it('renders contract data and opens an auction from the card', async () => {
    const user = userEvent.setup();
    const { router } = await renderApp();
    const auctionLink = await screen.findByRole('link', {
      name: 'Открыть CB-000001059: Пермь → Москва',
    });

    expect(screen.getByText('Вы лидируете')).toBeInTheDocument();
    expect(screen.getByText('28 500 ₽')).toBeInTheDocument();
    expect(screen.getByText('Найдено: 8')).toBeInTheDocument();
    expect(
      screen.getAllByText('Открыть аукцион', { exact: false }),
    ).toHaveLength(6);

    await user.click(auctionLink);

    expect(
      await screen.findByRole('heading', { name: 'Детали аукциона' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(
      '/auctions/550e8400-e29b-41d4-a716-446655440001',
    );
  });

  it('shows a loading skeleton while the request is pending', async () => {
    server.use(createAuctionListHandler({ responseDelay: 100 }));

    await renderApp();

    expect(await screen.findByLabelText('Загрузка аукционов')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(
      await screen.findByRole('link', {
        name: 'Открыть CB-000001059: Пермь → Москва',
      }),
    ).toBeInTheDocument();
  });

  it('shows an empty state for an empty contract response', async () => {
    server.use(createAuctionListHandler({ scenario: 'empty' }));

    await renderApp();

    expect(
      await screen.findByRole('heading', { name: 'Аукционы не найдены' }),
    ).toBeInTheDocument();
  });

  it('recovers from an API error after retry', async () => {
    const user = userEvent.setup();
    server.use(createAuctionListHandler({ scenario: 'error' }));
    await renderApp();

    expect(
      await screen.findByRole('heading', {
        name: 'Не удалось загрузить аукционы',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Request ID: trace-auction-list-503'),
    ).toBeInTheDocument();

    server.use(createAuctionListHandler());
    await user.click(screen.getByRole('button', { name: 'Повторить' }));

    expect(
      await screen.findByRole('link', {
        name: 'Открыть CB-000001059: Пермь → Москва',
      }),
    ).toBeInTheDocument();
  });

  it('requests another contract page and renders nullable fallbacks', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(await screen.findByRole('button', { name: 'Страница 2' }));

    expect(
      await screen.findByRole('link', {
        name: 'Открыть CB-000001003: Ростов-на-Дону → Краснодар',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Организатор не указан')).toBeInTheDocument();
    expect(screen.getByText('Участие подтверждено')).toBeInTheDocument();
  });
});
