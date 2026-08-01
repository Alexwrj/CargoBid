import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createAuctionDetailHandler } from '@/mocks/handlers/auctions';
import { server } from '@/mocks/server';

import { renderApp } from './render';

const leadingAuctionUuid = '550e8400-e29b-41d4-a716-446655440001';
const losingAuctionUuid = '550e8400-e29b-41d4-a716-446655440002';
const nullableAuctionUuid = '550e8400-e29b-41d4-a716-446655440008';

describe('auction details', () => {
  it('loads the selected auction from the route param and renders contract data', async () => {
    await renderApp({ route: `/auctions/${leadingAuctionUuid}` });

    expect(
      await screen.findByRole('heading', {
        name: 'Аукцион № CB-000001059',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Торги идут')).toBeInTheDocument();
    expect(screen.getByText('Вы лидируете')).toBeInTheDocument();
    expect(screen.getByText('Мороженое')).toBeInTheDocument();
    expect(screen.getAllByText('28 500 ₽')).toHaveLength(2);
    expect(screen.queryByText('Сделать ставку')).not.toBeInTheDocument();
  });

  it('orders multiple route points by their contract row number', async () => {
    await renderApp({ route: `/auctions/${losingAuctionUuid}` });

    expect(await screen.findByText('Вас перебили')).toBeInTheDocument();

    const route = screen.getByRole('list', { name: 'Точки маршрута' });
    const points = within(route).getAllByRole('listitem');

    expect(points).toHaveLength(3);
    expect(points[0]).toHaveTextContent('Казань, Россия');
    expect(points[0]).toHaveTextContent('12 т');
    expect(points[0]).toHaveTextContent('60 м³');
    expect(points[1]).toHaveTextContent('Тверь, Россия');
    expect(points[1]).toHaveTextContent('4 т');
    expect(points[1]).toHaveTextContent('20 м³');
    expect(points[2]).toHaveTextContent('Санкт-Петербург, Россия');
    expect(points[2]).toHaveTextContent('8 т');
    expect(points[2]).toHaveTextContent('40 м³');
    expect(screen.getByText('1 420 км')).toBeInTheDocument();
    expect(screen.getByText('43 ₽')).toBeInTheDocument();
    expect(
      screen.queryByText('Установка ставки будет доступна на следующем этапе.'),
    ).not.toBeInTheDocument();
  });

  it('shows a detail skeleton while the request is pending', async () => {
    server.use(createAuctionDetailHandler({ responseDelay: 100 }));

    await renderApp({ route: `/auctions/${leadingAuctionUuid}` });

    expect(
      await screen.findByLabelText('Загрузка данных аукциона'),
    ).toHaveAttribute('aria-busy', 'true');
    expect(
      await screen.findByRole('heading', {
        name: 'Аукцион № CB-000001059',
      }),
    ).toBeInTheDocument();
  });

  it('retries a system error and then renders the auction', async () => {
    const user = userEvent.setup();
    server.use(createAuctionDetailHandler({ scenario: 'error' }));

    await renderApp({ route: `/auctions/${leadingAuctionUuid}` });

    expect(
      await screen.findByRole('heading', {
        name: 'Не удалось загрузить аукцион',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Request ID: trace-auction-detail-503/),
    ).toBeInTheDocument();

    server.use(createAuctionDetailHandler());
    await user.click(screen.getByRole('button', { name: 'Повторить' }));

    expect(
      await screen.findByRole('heading', {
        name: 'Аукцион № CB-000001059',
      }),
    ).toBeInTheDocument();
  });

  it('shows a dedicated not-found state for an unknown identifier', async () => {
    const user = userEvent.setup();
    const { router } = await renderApp({
      route: '/auctions/not-a-known-uuid?weightFrom=5',
    });

    expect(
      await screen.findByRole('heading', { name: 'Аукцион не найден' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Повторить' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Вернуться к аукционам' }),
    ).not.toHaveLength(0);

    await user.click(
      screen.getByRole('button', { name: 'Вернуться к аукционам' }),
    );

    expect(router.state.location.pathname).toBe('/auctions');
    expect(router.state.location.search).toEqual({});
  });

  it('does not invent optional organizer data when it is absent', async () => {
    await renderApp({ route: `/auctions/${nullableAuctionUuid}` });

    expect(
      await screen.findByRole('heading', {
        name: 'Аукцион № CB-000001003',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Организатор' }),
    ).not.toBeInTheDocument();
  });

  it('returns to the filtered list with its search params preserved', async () => {
    const user = userEvent.setup();
    const { router } = await renderApp({
      route: '/auctions?loadCity=%D0%9F%D0%B5%D1%80%D0%BC%D1%8C',
    });

    await user.click(
      await screen.findByRole('link', {
        name: 'Открыть CB-000001059: Пермь → Москва',
      }),
    );

    expect(router.state.location.pathname).toBe(
      `/auctions/${leadingAuctionUuid}`,
    );
    expect(router.state.location.search).toEqual({});

    await user.click(
      await screen.findByRole('button', { name: /Вернуться к аукционам$/ }),
    );

    expect(router.state.location.pathname).toBe('/auctions');
    expect(router.state.location.search).toEqual({ loadCity: 'Пермь' });
    expect(
      await screen.findByRole('combobox', { name: 'Город отправления' }),
    ).toHaveValue('Пермь');
  });
});
