import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createAuctionListHandler } from '@/mocks/handlers/auctions';
import { server } from '@/mocks/server';

import { renderApp } from '../render';

describe('auction list', () => {
  it('renders contract data and opens an auction from the card', async () => {
    const user = userEvent.setup();
    const { router } = await renderApp();
    const auctionLink = await screen.findByRole('link', {
      name: 'Открыть CB-000001059: Пермь → Москва',
    });

    expect(screen.getByText('Вы лидируете')).toBeInTheDocument();
    expect(screen.getByText('28 500 ₽')).toBeInTheDocument();
    expect(screen.getByText('Найдено: 8 аукционов')).toBeInTheDocument();
    expect(
      screen.getAllByText('Открыть аукцион', { exact: false }),
    ).toHaveLength(6);

    await user.click(auctionLink);

    expect(
      await screen.findByRole('heading', {
        name: 'Аукцион № CB-000001059',
      }),
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

  it('shows an empty state when applied filters have no matches', async () => {
    await renderApp({ route: '/auctions?cargoNum=missing' });

    expect(
      await screen.findByRole('heading', { name: 'Аукционы не найдены' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Найдено: 0 аукционов')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Номер заявки' })).toHaveValue(
      'missing',
    );
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

  it('hydrates applied filters from a direct URL into the form and request', async () => {
    await renderApp({
      route:
        '/auctions?auctionStatus=Auction&bodyType=%D1%80%D0%B5%D1%84%D1%80%D0%B8%D0%B6%D0%B5%D1%80%D0%B0%D1%82%D0%BE%D1%80&cargoNum=1059&isAvailable=true&loadCity=%D0%BF%D0%B5%D1%80&unloadCity=%D0%BC%D0%BE%D1%81%D0%BA&userStatus=Leading&weightFrom=18&weightTo=18',
    });

    expect(
      screen.getByRole('combobox', { name: 'Город отправления' }),
    ).toHaveValue('пер');
    expect(
      screen.getByRole('combobox', { name: 'Моё положение' }),
    ).toHaveTextContent('Лидирую');
    expect(
      await screen.findByRole('link', {
        name: 'Открыть CB-000001059: Пермь → Москва',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Найдено: 1 аукцион')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: 'Открыть CB-000001048: Казань → Санкт-Петербург',
      }),
    ).not.toBeInTheDocument();
  });

  it('filters by the contract auction type stored in the URL', async () => {
    await renderApp({ route: '/auctions?auctionType=FixPrice' });

    expect(
      screen.getByRole('combobox', { name: 'Тип аукциона' }),
    ).toHaveTextContent('Фиксированная цена');
    expect(
      await screen.findByRole('link', {
        name: 'Открыть CB-000001019: Екатеринбург → Тюмень',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Найдено: 1 аукцион')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: 'Открыть CB-000001059: Пермь → Москва',
      }),
    ).not.toBeInTheDocument();
  });

  it('keeps draft values local until apply and resets pagination on submit', async () => {
    const user = userEvent.setup();
    const { router } = await renderApp({ route: '/auctions?page=2' });
    const loadCity = screen.getByRole('combobox', {
      name: 'Город отправления',
    });

    await user.type(loadCity, 'пер');

    expect(
      await screen.findByRole('option', { name: 'Пермь' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Москва' }),
    ).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(loadCity).toHaveValue('пер');

    expect(router.state.location.search).toEqual({ page: 2 });
    expect(screen.getByText('Найдено: 8 аукционов')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Применить' }));

    expect(
      await screen.findByRole('link', {
        name: 'Открыть CB-000001059: Пермь → Москва',
      }),
    ).toBeInTheDocument();
    expect(router.state.location.search).toEqual({ loadCity: 'пер' });
    expect(screen.getByText('Найдено: 1 аукцион')).toBeInTheDocument();

    const appliedLocation = router.history.location;

    await user.click(screen.getByRole('button', { name: 'Применить' }));
    expect(router.history.location).toBe(appliedLocation);
  });

  it('clears the URL, form and applied result on reset', async () => {
    const user = userEvent.setup();
    const { router } = await renderApp({
      route: '/auctions?unloadCity=%D0%9E%D0%BC%D1%81%D0%BA',
    });

    expect(await screen.findByText('Найдено: 1 аукцион')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Сбросить' }));

    expect(await screen.findByText('Найдено: 8 аукционов')).toBeInTheDocument();
    expect(router.state.location.search).toEqual({});
    expect(
      screen.getByRole('combobox', { name: 'Город назначения' }),
    ).toHaveValue('');
  });

  it('ignores invalid optional URL values without breaking the page', async () => {
    await renderApp({
      route:
        '/auctions?auctionStatus=Broken&isAvailable=perhaps&page=-2&weightFrom=-1&weightTo=NaN',
    });

    expect(
      await screen.findByRole('link', {
        name: 'Открыть CB-000001059: Пермь → Москва',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Найдено: 8 аукционов')).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Статус аукциона' }),
    ).toHaveTextContent('Любой статус');
    expect(
      screen.getByRole('combobox', { name: 'Доступность участия' }),
    ).toHaveTextContent('Любая');
  });

  it('restores applied filters and form values with browser history', async () => {
    const user = userEvent.setup();
    const { router } = await renderApp();
    const loadCity = screen.getByRole('combobox', {
      name: 'Город отправления',
    });

    await user.type(loadCity, 'Пермь');
    await user.click(await screen.findByRole('option', { name: 'Пермь' }));
    await user.click(screen.getByRole('button', { name: 'Применить' }));
    expect(await screen.findByText('Найдено: 1 аукцион')).toBeInTheDocument();

    await user.clear(loadCity);
    await user.type(loadCity, 'Казань');
    await user.click(await screen.findByRole('option', { name: 'Казань' }));
    await user.click(screen.getByRole('button', { name: 'Применить' }));
    expect(
      await screen.findByRole('link', {
        name: 'Открыть CB-000001048: Казань → Санкт-Петербург',
      }),
    ).toBeInTheDocument();

    act(() => {
      router.history.back();
    });

    expect(
      await screen.findByRole('combobox', { name: 'Город отправления' }),
    ).toHaveValue('Пермь');
    expect(
      await screen.findByRole('link', {
        name: 'Открыть CB-000001059: Пермь → Москва',
      }),
    ).toBeInTheDocument();

    act(() => {
      router.history.forward();
    });

    expect(
      await screen.findByRole('combobox', { name: 'Город отправления' }),
    ).toHaveValue('Казань');
    expect(
      await screen.findByRole('link', {
        name: 'Открыть CB-000001048: Казань → Санкт-Петербург',
      }),
    ).toBeInTheDocument();
  });
});
