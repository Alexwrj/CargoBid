import type { GetAuctionResponse } from '@/shared/api/generated/auctions/getAuction';
import {
  formatDateTime,
  formatMoney,
  formatNumber,
  formatTimeUntil,
  formatUnit,
} from '@/shared/lib/formatters';

import {
  presentAuctionStatus,
  presentAuctionType,
  presentUserStatus,
  type AuctionStatusView,
} from './auction-display';

export interface AuctionDetailFact {
  label: string;
  value: string;
}

export interface AuctionRoutePointView {
  address?: string;
  cargoFacts: AuctionDetailFact[];
  city?: string;
  comment?: string;
  id: string;
  operation: string;
  period?: string;
}

export interface AuctionDetailView {
  auctionStatus: AuctionStatusView;
  auctionType: string;
  cargoFacts: AuctionDetailFact[];
  cargoTitle?: string;
  createdAt?: string;
  endTime: string;
  organizerFacts: AuctionDetailFact[];
  paymentFacts: AuctionDetailFact[];
  reference: string;
  routePoints: AuctionRoutePointView[];
  tradeFacts: AuctionDetailFact[];
  userStatus: AuctionStatusView;
}

function compactFacts(
  facts: Array<{ label: string; value?: string }>,
): AuctionDetailFact[] {
  return facts.filter((fact): fact is AuctionDetailFact =>
    Boolean(fact.value?.trim()),
  );
}

function formatOptionalDate(value?: string) {
  return value ? formatDateTime(value) : undefined;
}

function formatPeriod(start?: string, end?: string) {
  const formattedStart = formatOptionalDate(start);
  const formattedEnd = formatOptionalDate(end);

  if (formattedStart && formattedEnd) {
    return `${formattedStart} — ${formattedEnd}`;
  }

  return formattedStart ?? formattedEnd;
}

function formatNumericString(value: string | undefined, unit: string) {
  if (!value?.trim()) return undefined;

  const number = Number(value);

  return Number.isFinite(number)
    ? formatUnit(number, unit)
    : `${value} ${unit}`;
}

function formatTemperature(
  from: number | null | undefined,
  to: number | null | undefined,
) {
  if (from == null && to == null) return undefined;
  if (from != null && to != null)
    return `${formatNumber(from)}…${formatNumber(to)} °C`;
  if (from != null) return `от ${formatNumber(from)} °C`;

  return `до ${formatNumber(to as number)} °C`;
}

function presentRoutePoints(
  response: GetAuctionResponse,
): AuctionRoutePointView[] {
  return response.routes
    .map((point, index) => ({ index, point }))
    .sort(
      (left, right) =>
        (left.point.row_num ?? left.index) -
        (right.point.row_num ?? right.index),
    )
    .map(({ index, point }) => ({
      address: point.location?.loading_address || undefined,
      cargoFacts: compactFacts([
        {
          label: 'Вес',
          value: formatNumericString(point.cargo?.weight, 'т'),
        },
        {
          label: 'Объём',
          value: formatNumericString(point.cargo?.volume, 'м³'),
        },
        { label: 'Упаковка', value: point.cargo?.package_name },
        {
          label: 'Количество мест',
          value:
            point.cargo?.package_amount == null
              ? undefined
              : formatNumber(point.cargo.package_amount, 0),
        },
      ]),
      city:
        point.location?.city_full_name ||
        point.location?.city_name ||
        undefined,
      comment: point.comment || undefined,
      id: `${point.row_num ?? index}-${point.op_type ?? 'Unknown'}`,
      operation:
        point.op_type === 'Loading'
          ? 'Погрузка'
          : point.op_type === 'Unloading'
            ? 'Выгрузка'
            : 'Точка маршрута',
      period: formatPeriod(point.start_date, point.end_date),
    }));
}

export function presentAuctionDetail(
  response: GetAuctionResponse,
): AuctionDetailView {
  const main = response.main;
  const cargo = response.cargo;
  const trading = response.trading;
  const payment = response.payment;
  const currencyCode = payment.currency_code ?? '643';
  const firstRouteCargo = response.routes.find((point) => point.cargo)?.cargo;
  const car = cargo.car;

  return {
    auctionStatus: presentAuctionStatus(trading.status),
    auctionType: presentAuctionType(main.auc_type),
    cargoFacts: compactFacts([
      { label: 'Тип кузова', value: cargo.body_type },
      {
        label: 'Машин',
        value:
          cargo.truck_count === undefined
            ? undefined
            : formatNumber(cargo.truck_count, 0),
      },
      {
        label: 'Расстояние',
        value:
          cargo.distance == null ? undefined : formatUnit(cargo.distance, 'км'),
      },
      {
        label: 'Температура',
        value: formatTemperature(cargo.temp_from, cargo.temp_to),
      },
      { label: 'Тип контейнера', value: cargo.container_type ?? undefined },
      { label: 'Размер контейнера', value: cargo.container_size ?? undefined },
      { label: 'Транспорт', value: car?.type },
      {
        label: 'Грузоподъёмность ТС',
        value: car?.weight == null ? undefined : formatUnit(car.weight, 'т'),
      },
      {
        label: 'Объём ТС',
        value: car?.volume == null ? undefined : formatUnit(car.volume, 'м³'),
      },
    ]),
    cargoTitle: firstRouteCargo?.name || undefined,
    createdAt: formatOptionalDate(main.created_at),
    endTime: formatTimeUntil(trading.stop_time),
    organizerFacts: compactFacts([
      { label: 'Организация', value: response.organizer.organization_name },
      { label: 'ИНН', value: response.organizer.organization_inn },
      { label: 'КПП', value: response.organizer.organization_kpp },
    ]),
    paymentFacts: compactFacts([
      { label: 'Форма оплаты', value: payment.form },
      { label: 'Условия оплаты', value: payment.condition ?? undefined },
      {
        label: 'Отсрочка',
        value:
          payment.delay == null
            ? undefined
            : `${formatNumber(payment.delay, 0)} дн.`,
      },
      { label: 'Предоплата', value: payment.prepay ?? undefined },
    ]),
    reference:
      main.cargo_num ??
      (main.id === undefined ? 'Без номера' : String(main.id)),
    routePoints: presentRoutePoints(response),
    tradeFacts: compactFacts([
      {
        label: 'Текущая ставка',
        value:
          trading.price?.current == null
            ? undefined
            : formatMoney(trading.price.current, currencyCode),
      },
      {
        label: 'Начальная ставка',
        value:
          trading.price?.start == null
            ? undefined
            : formatMoney(trading.price.start, currencyCode),
      },
      {
        label: 'Ваша ставка',
        value:
          trading.your?.last_bet == null
            ? undefined
            : formatMoney(trading.your.last_bet, currencyCode),
      },
      {
        label: 'Шаг ставки',
        value:
          trading.price?.step == null
            ? undefined
            : formatMoney(trading.price.step, currencyCode),
      },
      {
        label: 'Цена за км',
        value:
          trading.price?.price_per_km === undefined
            ? undefined
            : formatMoney(trading.price.price_per_km, currencyCode),
      },
      {
        label: 'Единица ставки',
        value:
          trading.bid_measurement_type === 'PerKm'
            ? 'За километр'
            : trading.bid_measurement_type === 'PerRoute'
              ? 'За рейс'
              : undefined,
      },
      {
        label: 'Возможность ставки',
        value:
          trading.can_set_bet === undefined
            ? undefined
            : trading.can_set_bet
              ? 'Доступна'
              : 'Недоступна',
      },
    ]),
    userStatus: presentUserStatus(trading.status_mobile),
  };
}
