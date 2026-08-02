import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createAuctionSetBetHandler } from '@/mocks/handlers/auctions';
import { server } from '@/mocks/server';

import { renderApp } from './render';

const activeAuctionUuid = '550e8400-e29b-41d4-a716-446655440002';
const finishedAuctionUuid = '550e8400-e29b-41d4-a716-446655440004';

describe('place auction bid', () => {
  it('submits once and refreshes details, history and the list', async () => {
    const user = userEvent.setup();
    server.use(createAuctionSetBetHandler({ responseDelay: 100 }));

    await renderApp({ route: `/auctions/${activeAuctionUuid}` });

    const amountInput = await screen.findByRole('textbox', {
      name: 'Сумма ставки',
    });
    expect(
      screen.getByText(/Указанный сервером шаг: 1 000 ₽/),
    ).toBeInTheDocument();
    await user.type(amountInput, '62 000');
    await user.dblClick(screen.getByRole('button', { name: 'Сделать ставку' }));

    expect(
      await screen.findByRole('button', { name: 'Отправляем ставку…' }),
    ).toBeDisabled();
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Ставка принята',
    );
    expect(amountInput).toHaveValue('');
    expect(screen.getByText('Вы лидируете')).toBeInTheDocument();
    expect(screen.getAllByText('62 000 ₽')).toHaveLength(3);
    expect(screen.getAllByText('Демо-перевозчик')).toHaveLength(1);

    await user.click(
      screen.getByRole('button', { name: /Вернуться к аукционам$/ }),
    );

    await screen.findByRole(
      'heading',
      { name: 'Аукционы' },
      { timeout: 3_000 },
    );
    const updatedCard = await screen.findByRole('link', {
      name: /CB-000001048/,
    });
    expect(updatedCard).toHaveTextContent('62 000 ₽');
    expect(updatedCard).toHaveTextContent('Вы лидируете');
  });

  it('validates the contract number format and direct bounds on the client', async () => {
    const user = userEvent.setup();

    await renderApp({ route: `/auctions/${activeAuctionUuid}` });

    const amountInput = await screen.findByRole('textbox', {
      name: 'Сумма ставки',
    });
    const submitButton = screen.getByRole('button', { name: 'Сделать ставку' });

    await user.click(submitButton);
    expect(screen.getByText('Введите сумму ставки')).toBeInTheDocument();

    await user.type(amountInput, '6e4');
    await user.click(submitButton);
    expect(
      screen.getByText('Введите сумму числом без букв и специальных символов'),
    ).toBeInTheDocument();

    await user.clear(amountInput);
    await user.type(amountInput, '61000');
    await user.click(submitButton);
    expect(
      screen.getByText('Сумма должна быть не меньше 62 000 ₽'),
    ).toBeInTheDocument();

    await user.clear(amountInput);
    await user.type(amountInput, '100001');
    await user.click(submitButton);
    expect(
      screen.getByText('Сумма должна быть не больше 100 000 ₽'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Ставка принята')).not.toBeInTheDocument();
    expect(screen.queryByText('Демо-перевозчик')).not.toBeInTheDocument();
  });

  it('keeps the amount and page data after a system error and supports retry', async () => {
    const user = userEvent.setup();
    server.use(createAuctionSetBetHandler({ scenario: 'error' }));

    await renderApp({ route: `/auctions/${activeAuctionUuid}` });

    const amountInput = await screen.findByRole('textbox', {
      name: 'Сумма ставки',
    });
    await user.type(amountInput, '62000');
    await user.click(screen.getByRole('button', { name: 'Сделать ставку' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось отправить ставку. Попробуйте ещё раз.',
    );
    expect(screen.getByText(/trace-auction-bet-503/)).toBeInTheDocument();
    expect(amountInput).toHaveValue('62000');
    expect(screen.getByText('Казань, Россия')).toBeInTheDocument();
    expect(screen.getByText('Балтийский Транзит')).toBeInTheDocument();

    server.use(createAuctionSetBetHandler());
    await user.click(screen.getByRole('button', { name: 'Сделать ставку' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Ставка принята',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('refreshes stale server state without showing a false success', async () => {
    const user = userEvent.setup();
    server.use(createAuctionSetBetHandler({ scenario: 'stale' }));

    await renderApp({ route: `/auctions/${activeAuctionUuid}` });

    const amountInput = await screen.findByRole('textbox', {
      name: 'Сумма ставки',
    });
    await user.type(amountInput, '62000');
    await user.click(screen.getByRole('button', { name: 'Сделать ставку' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Условия торгов изменились или сумма отклонена.',
    );
    expect(screen.queryByText('Ставка принята')).not.toBeInTheDocument();
    expect(amountInput).toHaveValue('62000');
    expect(
      await screen.findByText('Конкурирующий перевозчик'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('62 000 ₽')).toHaveLength(2);
    expect(screen.getByText(/От 63 000 ₽/)).toBeInTheDocument();

    server.use(createAuctionSetBetHandler());
    await user.clear(amountInput);
    await user.type(amountInput, '63000');
    await user.click(screen.getByRole('button', { name: 'Сделать ставку' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Ставка принята',
    );
    expect(screen.getByText('Вы лидируете')).toBeInTheDocument();
  });

  it('does not expose an active form for a finished auction', async () => {
    await renderApp({ route: `/auctions/${finishedAuctionUuid}` });

    expect(
      await screen.findByRole('heading', {
        name: 'Аукцион № CB-000001027',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'Сумма ставки' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Установка ставки недоступна')).toBeInTheDocument();
    expect(screen.getByText('Завершён')).toBeInTheDocument();
  });
});
