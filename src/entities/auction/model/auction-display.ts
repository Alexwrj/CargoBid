import type { components } from '@/shared/api/generated/types';

type AuctionStatus = components['schemas']['AuctionStatus'];
type AuctionType = components['schemas']['AuctionType'];
type UserStatus = components['schemas']['TradingStatus'];

export interface AuctionStatusView {
  label: string;
  tone: 'neutral' | 'accent' | 'success' | 'danger' | 'warning' | 'info';
}

const auctionStatusViews = {
  Auction: { label: 'Торги идут', tone: 'success' },
  Canceled: { label: 'Отменён', tone: 'neutral' },
  DeterminateWinner: { label: 'Определение победителя', tone: 'warning' },
  Finished: { label: 'Завершён', tone: 'neutral' },
  InProgress: { label: 'В работе', tone: 'info' },
  Planning: { label: 'Планирование', tone: 'warning' },
  Stopped: { label: 'Остановлен', tone: 'neutral' },
  Unknown: { label: 'Статус не определён', tone: 'neutral' },
  WaitDeal: { label: 'Ожидание сделки', tone: 'info' },
} satisfies Record<AuctionStatus, AuctionStatusView>;

const userStatusViews = {
  Confirmed: { label: 'Участие подтверждено', tone: 'info' },
  ChoosingWinner: { label: 'Выбор победителя', tone: 'warning' },
  Leading: { label: 'Вы лидируете', tone: 'success' },
  Losing: { label: 'Вас перебили', tone: 'danger' },
  NotParticipating: { label: 'Вы не участвуете', tone: 'neutral' },
  OnPending: { label: 'Ожидает подтверждения', tone: 'info' },
  Accepted: { label: 'Предложение принято', tone: 'success' },
  Unknown: { label: 'Положение не определено', tone: 'neutral' },
  Winner: { label: 'Вы победили', tone: 'success' },
} satisfies Record<UserStatus, AuctionStatusView>;

const auctionTypeLabels = {
  Down: 'На понижение',
  FixPrice: 'Фиксированная цена',
  Request: 'Заявочный',
  Unknown: 'Тип не определён',
  Up: 'На повышение',
} satisfies Record<AuctionType, string>;

export function presentAuctionStatus(
  status: AuctionStatus | undefined,
): AuctionStatusView {
  return status
    ? auctionStatusViews[status]
    : { label: 'Статус не указан', tone: 'neutral' };
}

export function presentUserStatus(
  status: UserStatus | undefined,
): AuctionStatusView {
  return status
    ? userStatusViews[status]
    : { label: 'Положение не указано', tone: 'neutral' };
}

export function presentAuctionType(type: AuctionType | undefined) {
  return type ? auctionTypeLabels[type] : 'Тип не указан';
}
