import type { components } from '@/shared/api/generated/types';
import {
  formatDateTime,
  formatMoney,
  formatTimeUntil,
  formatUnit,
} from '@/shared/lib/formatters';
import {
  presentAuctionStatus,
  presentAuctionType,
  presentUserStatus,
  type AuctionStatusView,
} from './auction-display';

type AuctionListItem = components['schemas']['AuctionListItem'];

function getUserStatus(item: AuctionListItem): AuctionStatusView {
  const trading = item.trading;

  if (
    trading?.is_available === false &&
    trading.status_mobile === 'NotParticipating'
  ) {
    return { label: 'Участие недоступно', tone: 'neutral' };
  }

  return presentUserStatus(trading?.status_mobile);
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
  auctionStatus: AuctionStatusView;
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
  userStatus: AuctionStatusView;
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
  const auctionStatus = presentAuctionStatus(trading?.status);

  return {
    actionLabel: 'Открыть аукцион',
    auctionStatus,
    auctionType: presentAuctionType(main?.auc_type),
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
