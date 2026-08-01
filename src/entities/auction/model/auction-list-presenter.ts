import type { components } from '@/shared/api/generated/types';
import {
  formatDateTime,
  formatMoney,
  formatTimeUntil,
  formatUnit,
} from '@/shared/lib/formatters';

type AuctionListItem = components['schemas']['AuctionListItem'];
type AuctionStatus = NonNullable<
  NonNullable<AuctionListItem['trading']>['status']
>;
type UserStatus = NonNullable<
  NonNullable<AuctionListItem['trading']>['status_mobile']
>;
type AuctionType = NonNullable<
  NonNullable<AuctionListItem['main']>['auc_type']
>;

type StatusTone =
  'neutral' | 'accent' | 'success' | 'danger' | 'warning' | 'info';

interface StatusView {
  label: string;
  tone: StatusTone;
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
} satisfies Record<AuctionStatus, StatusView>;

const userStatusViews = {
  Confirmed: { label: 'Участие подтверждено', tone: 'info' },
  Leading: { label: 'Вы лидируете', tone: 'success' },
  Losing: { label: 'Вас перебили', tone: 'danger' },
  NotParticipating: { label: 'Вы не участвуете', tone: 'neutral' },
  Unknown: { label: 'Положение не определено', tone: 'neutral' },
  Winner: { label: 'Вы победили', tone: 'success' },
} satisfies Record<UserStatus, StatusView>;

const auctionTypeLabels = {
  Down: 'На понижение',
  FixPrice: 'Фиксированная цена',
  Request: 'Заявочный',
  Unknown: 'Тип не определён',
  Up: 'На повышение',
} satisfies Record<AuctionType, string>;

function getUserStatus(item: AuctionListItem): StatusView {
  const trading = item.trading;

  if (
    trading?.is_available === false &&
    trading.status_mobile === 'NotParticipating'
  ) {
    return { label: 'Участие недоступно', tone: 'neutral' };
  }

  return trading?.status_mobile
    ? userStatusViews[trading.status_mobile]
    : { label: 'Положение не указано', tone: 'neutral' };
}

function getCargoDetails(item: AuctionListItem) {
  const cargo = item.cargo;

  return [
    cargo?.weight === undefined ? undefined : formatUnit(cargo.weight, 'т'),
    cargo?.volume === undefined ? undefined : formatUnit(cargo.volume, 'м³'),
    cargo?.body_type,
    cargo?.truck_count === undefined
      ? undefined
      : `${cargo.truck_count} ${cargo.truck_count === 1 ? 'машина' : 'машины'}`,
  ].filter((value): value is string => Boolean(value));
}

function getAdditionalPoints(item: AuctionListItem) {
  const loadPoints = item.route?.load?.points_count ?? 1;
  const unloadPoints = item.route?.unload?.points_count ?? 1;
  const additionalPoints = Math.max(0, loadPoints + unloadPoints - 2);

  return additionalPoints > 0 ? `Доп. точки: ${additionalPoints}` : undefined;
}

export interface AuctionListCardView {
  actionLabel: string;
  auctionStatus: StatusView;
  auctionType: string;
  auctionUuid?: string;
  cargoDetails: string[];
  cargoName: string;
  currentPrice: string;
  currentPriceCaption: string;
  endTime: string;
  loadDate: string;
  organizer: string;
  reference: string;
  route: string;
  routePoints?: string;
  unloadDate: string;
  userStatus: StatusView;
  yourBet?: string;
}

export function presentAuctionListItem(
  item: AuctionListItem,
): AuctionListCardView {
  const main = item.main;
  const trading = item.trading;
  const payment = item.payment;
  const loadCity = item.route?.load?.city ?? 'Пункт погрузки не указан';
  const unloadCity = item.route?.unload?.city ?? 'Пункт выгрузки не указан';
  const currentPrice = trading?.price?.current;
  const lastBet = trading?.your?.last_bet;
  const currencyCode = payment?.currency_code ?? '643';
  const auctionStatus = trading?.status
    ? auctionStatusViews[trading.status]
    : { label: 'Статус не указан', tone: 'neutral' as const };

  return {
    actionLabel: 'Открыть аукцион',
    auctionStatus,
    auctionType: main?.auc_type
      ? auctionTypeLabels[main.auc_type]
      : 'Тип не указан',
    auctionUuid: main?.order_uid,
    cargoDetails: getCargoDetails(item),
    cargoName: item.cargo?.name ?? 'Груз не указан',
    currentPrice:
      currentPrice === undefined
        ? 'Цена не указана'
        : formatMoney(currentPrice, currencyCode),
    currentPriceCaption:
      trading?.bid_measurement_type === 'PerKm'
        ? 'Текущая ставка за км'
        : 'Текущая ставка за рейс',
    endTime: formatTimeUntil(trading?.stop_time),
    loadDate: formatDateTime(item.route?.load?.date),
    organizer: item.organizer?.organization_name ?? 'Организатор не указан',
    reference:
      main?.cargo_num ??
      (main?.id === undefined ? 'Аукцион без номера' : `Аукцион ${main.id}`),
    route: `${loadCity} → ${unloadCity}`,
    routePoints: getAdditionalPoints(item),
    unloadDate: formatDateTime(item.route?.unload?.date),
    userStatus: getUserStatus(item),
    yourBet:
      lastBet == null
        ? undefined
        : `Ваша ставка: ${formatMoney(lastBet, currencyCode)}`,
  };
}
