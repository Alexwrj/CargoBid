import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  createAuctionBidHistoryHandler,
  createAuctionDetailHandler,
} from '@/mocks/handlers/auctions';
import { server } from '@/mocks/server';

import { renderApp } from '../render';

const leadingAuctionUuid = '550e8400-e29b-41d4-a716-446655440001';
const losingAuctionUuid = '550e8400-e29b-41d4-a716-446655440002';
const emptyHistoryAuctionUuid = '550e8400-e29b-41d4-a716-446655440003';
const hiddenHistoryAuctionUuid = '550e8400-e29b-41d4-a716-446655440006';
const confirmedAuctionUuid = '550e8400-e29b-41d4-a716-446655440007';
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
    expect(
      screen.getByRole('button', { name: 'Сделать ставку' }),
    ).toBeInTheDocument();
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
    expect(screen.getByText('36 ₽')).toBeInTheDocument();

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

  it('renders only the selected auction history in server order', async () => {
    await renderApp({ route: `/auctions/${losingAuctionUuid}` });

    const table = await screen.findByRole('table');
    const rows = within(table).getAllByRole('row');

    expect(rows).toHaveLength(3);
    expect(rows[1]).toHaveTextContent('Балтийский Транзит');
    expect(rows[1]).toHaveTextContent('61 000 ₽');
    expect(rows[1]).toHaveTextContent('Встречная');
    expect(rows[2]).toHaveTextContent('Демо-перевозчик');
    expect(rows[2]).toHaveTextContent('· Вы');
    expect(rows[2]).toHaveTextContent('60 000 ₽');
    expect(rows[2]).toHaveAttribute('data-own-bid', 'true');
    expect(rows[1]).not.toHaveAttribute('data-own-bid');
    expect(within(table).queryByText('58 000 ₽')).not.toBeInTheDocument();
    expect(
      within(table).queryByText('Северный Экспресс'),
    ).not.toBeInTheDocument();
  });

  it('keeps auction details visible while bid history is loading', async () => {
    server.use(createAuctionBidHistoryHandler({ responseDelay: 100 }));

    await renderApp({ route: `/auctions/${leadingAuctionUuid}` });

    expect(
      await screen.findByRole('heading', {
        name: 'Аукцион № CB-000001059',
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText('Загрузка истории ставок'),
    ).toHaveAttribute('aria-busy', 'true');
    expect(await screen.findByText('ТрансЛиния')).toBeInTheDocument();
  });

  it('shows an empty state for an auction without bids', async () => {
    await renderApp({ route: `/auctions/${emptyHistoryAuctionUuid}` });

    expect(
      await screen.findByRole('heading', { name: 'Ставок пока нет' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Участники ещё не сделали ни одной ставки.'),
    ).toBeInTheDocument();
  });

  it('localizes a bid history error and retries only its request', async () => {
    const user = userEvent.setup();
    server.use(createAuctionBidHistoryHandler({ scenario: 'error' }));

    await renderApp({ route: `/auctions/${leadingAuctionUuid}` });

    expect(
      await screen.findByRole('heading', {
        name: 'Аукцион № CB-000001059',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Пермь, Россия')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', {
        name: 'Не удалось загрузить историю ставок',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/trace-auction-bets-503/)).toBeInTheDocument();

    server.use(createAuctionBidHistoryHandler());
    await user.click(screen.getByRole('button', { name: 'Попробовать снова' }));

    expect(await screen.findByText('ТрансЛиния')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: 'Не удалось загрузить историю ставок',
      }),
    ).not.toBeInTheDocument();
  });

  it('renders nullable bid fields without inventing an owner', async () => {
    await renderApp({ route: `/auctions/${nullableAuctionUuid}` });

    const table = await screen.findByRole('table');

    expect(within(table).getByText('Участник не указан')).toBeInTheDocument();
    expect(within(table).getByText('71 500 ₽')).toBeInTheDocument();
    expect(within(table).queryByText('Вы')).not.toBeInTheDocument();
  });

  it('does not invent an own bid or an empty status column', async () => {
    await renderApp({ route: `/auctions/${confirmedAuctionUuid}` });

    const table = await screen.findByRole('table');

    expect(screen.getByText('Участие подтверждено')).toBeInTheDocument();
    expect(screen.queryByText('Ваша ставка')).not.toBeInTheDocument();
    expect(within(table).getByText('Поволжье Транс')).toBeInTheDocument();
    expect(within(table).getByText('40 000 ₽')).toBeInTheDocument();
    expect(
      within(table).queryByRole('columnheader', { name: 'Статус' }),
    ).not.toBeInTheDocument();
    expect(within(table).queryByText('Вы')).not.toBeInTheDocument();
    expect(screen.getByText('76 ₽')).toBeInTheDocument();
  });

  it('does not keep the previous auction history after navigation', async () => {
    const { router } = await renderApp({
      route: `/auctions/${leadingAuctionUuid}`,
    });

    expect(await screen.findByText('ТрансЛиния')).toBeInTheDocument();
    server.use(createAuctionBidHistoryHandler({ responseDelay: 100 }));

    await act(async () => {
      await router.navigate({
        params: { auctionUuid: losingAuctionUuid },
        to: '/auctions/$auctionUuid',
      });
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Аукцион № CB-000001048',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText('ТрансЛиния')).not.toBeInTheDocument();
    expect(
      await screen.findByLabelText('Загрузка истории ставок'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Балтийский Транзит')).toBeInTheDocument();
  });

  it('does not request or render history hidden by the detail contract', async () => {
    server.use(createAuctionBidHistoryHandler({ scenario: 'error' }));

    await renderApp({ route: `/auctions/${hiddenHistoryAuctionUuid}` });

    expect(
      await screen.findByRole('heading', {
        name: 'Аукцион № CB-000001014',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'История ставок' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Не удалось загрузить историю ставок'),
    ).not.toBeInTheDocument();
  });
});
