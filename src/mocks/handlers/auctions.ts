import { delay, http, HttpResponse } from 'msw';

import { auctionStatusIds } from '@/entities/auction/model/auction-status';
import {
  auctionBidHistoryStore,
  auctionDetailStore,
  auctionListStore,
} from '@/mocks/data/auction-contract-fixtures';
import type { ListAuctionsRequestBody } from '@/shared/api/generated/auctions/list/listAuctions';
import type { components } from '@/shared/api/generated/types';

const auctionApiUrl = '*/api/v1/auctions';

type AuctionListItem = components['schemas']['AuctionListItem'];
type AuctionListResponse = components['schemas']['AuctionListResponseBase'];
type AuctionResponse = components['schemas']['AuctionShowResponse'];
type AuctionBet = components['schemas']['BetItem'];
type AuctionBetsResponse = components['schemas']['BetListResponse'];
type ProblemDetail = components['schemas']['ProblemDetail'];
type SetBetRequest = components['schemas']['SetBetRequest'];
type ValidationProblem = components['schemas']['ValidationProblem'];

interface AuctionListHandlerOptions {
  items?: AuctionListItem[];
  responseDelay?: number | 'infinite';
  scenario?: 'success' | 'empty' | 'error';
}

interface AuctionDetailHandlerOptions {
  items?: AuctionResponse[];
  responseDelay?: number | 'infinite';
  scenario?: 'success' | 'error';
}

interface AuctionBidHistoryHandlerOptions {
  histories?: Array<{ auctionUuid: string; bets: AuctionBet[] }>;
  responseDelay?: number | 'infinite';
  scenario?: 'success' | 'error';
}

interface AuctionSetBetHandlerOptions {
  responseDelay?: number | 'infinite';
  scenario?: 'error' | 'stale' | 'success';
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('ru-RU');
}

function matchesSubstring(
  actual: string | undefined,
  expected: string | undefined,
) {
  return expected === undefined
    ? true
    : actual !== undefined &&
        normalizeText(actual).includes(normalizeText(expected));
}

function matchesAuctionListRequest(
  item: AuctionListItem,
  request: ListAuctionsRequestBody,
) {
  const auctionStatus = item.trading?.status;
  const auctionStatusId =
    auctionStatus && auctionStatus !== 'Unknown'
      ? auctionStatusIds[auctionStatus]
      : undefined;
  const weight = item.cargo?.weight;

  if (
    request.status &&
    (!item.trading?.status_mobile ||
      !request.status.includes(item.trading.status_mobile))
  ) {
    return false;
  }

  if (
    request.statuses &&
    (auctionStatusId === undefined ||
      !request.statuses.includes(auctionStatusId))
  ) {
    return false;
  }

  if (!matchesSubstring(item.route?.load?.city, request.load_city))
    return false;
  if (!matchesSubstring(item.route?.unload?.city, request.unload_city)) {
    return false;
  }
  if (!matchesSubstring(item.main?.cargo_num, request.cargo_num)) return false;

  if (
    request.body_types &&
    (!item.cargo?.body_type ||
      !request.body_types.some(
        (bodyType) =>
          normalizeText(bodyType) ===
          normalizeText(item.cargo?.body_type ?? ''),
      ))
  ) {
    return false;
  }

  if (
    request.weight_from !== undefined &&
    (weight ?? -Infinity) < request.weight_from
  ) {
    return false;
  }

  if (
    request.weight_to !== undefined &&
    (weight ?? Infinity) > request.weight_to
  ) {
    return false;
  }

  if (
    request.is_available !== undefined &&
    item.trading?.is_available !== request.is_available
  ) {
    return false;
  }

  return true;
}

async function readListRequest(request: Request) {
  const body = await request.text();

  return body ? (JSON.parse(body) as ListAuctionsRequestBody) : {};
}

async function readSetBetRequest(
  request: Request,
): Promise<Partial<SetBetRequest>> {
  const body = await request.text();

  return body ? (JSON.parse(body) as SetBetRequest) : {};
}

function validationResponse(message: string) {
  return HttpResponse.json(
    {
      code: 'validation_failed',
      errors: [{ code: 'invalid_value', field: 'price', message }],
      message: 'Запрос содержит некорректные поля.',
      title: 'Ошибка валидации',
      trace_id: 'trace-auction-bet-422',
    } satisfies ValidationProblem,
    { status: 422 },
  );
}

function findMutableAuction(
  auctionUuid: string | readonly string[] | undefined,
) {
  const normalizedUuid = String(auctionUuid);
  const detail = auctionDetailStore.items.find(
    (item) => item.main.order_uid === normalizedUuid,
  );
  const listItem = auctionListStore.items.find(
    (item) => item.main?.order_uid === normalizedUuid,
  );
  const history = auctionBidHistoryStore.items.find(
    (item) => item.auctionUuid === normalizedUuid,
  );

  return { detail, history, listItem, normalizedUuid };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function applyBidToMockState({
  amount,
  isOwn,
  state,
}: {
  amount: number;
  isOwn: boolean;
  state: NonNullable<ReturnType<typeof findMutableAuction>>;
}) {
  const { detail, history, listItem } = state;

  if (!detail || !history || !listItem) return;

  const amountNoVat = roundMoney(amount / 1.2);
  const previousIds = history.bets
    .map((bet) => bet.id)
    .filter((id): id is number => id !== undefined);
  const nextId = Math.max(0, ...previousIds) + 1;
  const step = detail.trading.price?.step ?? 0;
  const auctionType = detail.main.auc_type;

  history.bets.unshift({
    auction_id: detail.main.id,
    created_at: new Date().toISOString(),
    id: nextId,
    is_counter: !isOwn,
    organization_name: isOwn ? 'Демо-перевозчик' : 'Конкурирующий перевозчик',
    price_no_vat: amountNoVat,
    price_with_vat: amount,
    subscriber_id: isOwn ? 999 : 998,
  });

  detail.trading.price ??= {};
  detail.trading.price.current = amount;
  detail.trading.price.current_no_vat = amountNoVat;
  if (detail.cargo.distance) {
    detail.trading.price.price_per_km = amountNoVat / detail.cargo.distance;
  }

  listItem.trading ??= {};
  listItem.trading.price ??= {};
  listItem.trading.price.current = amount;
  listItem.trading.price.current_no_vat = amountNoVat;
  if (listItem.main && detail.cargo.distance) {
    listItem.main.price_per_km = amountNoVat / detail.cargo.distance;
  }

  if (auctionType === 'Up' && step > 0) {
    detail.trading.price.min = amount + step;
  }
  if (auctionType === 'Down' && step > 0) {
    detail.trading.price.max = amount - step;
  }

  if (isOwn) {
    detail.trading.is_bidder = true;
    detail.trading.status_mobile = 'Leading';
    detail.trading.your = {
      bet: true,
      last_bet: amount,
      last_bet_with_vat: amount,
      win: false,
    };
    listItem.trading.is_bidder = true;
    listItem.trading.status_mobile = 'Leading';
    listItem.trading.your = { bet: true, last_bet: amount };
  } else if (detail.trading.your?.bet) {
    detail.trading.status_mobile = 'Losing';
    listItem.trading.status_mobile = 'Losing';
  }
}

export function createAuctionListHandler({
  items = auctionListStore.items,
  responseDelay,
  scenario = 'success',
}: AuctionListHandlerOptions = {}) {
  return http.post(`${auctionApiUrl}/list`, async ({ request }) => {
    if (responseDelay !== undefined) {
      await delay(responseDelay);
    }

    if (scenario === 'error') {
      return HttpResponse.json(
        {
          code: 'auction_list_unavailable',
          title: 'Сервис временно недоступен',
          message: 'Не удалось загрузить список аукционов',
          trace_id: 'trace-auction-list-503',
        } satisfies ProblemDetail,
        { status: 503 },
      );
    }

    const requestBody = await readListRequest(request);
    const page = requestBody.page ?? 1;
    const perPage = requestBody.per_page ?? 20;
    const availableItems =
      scenario === 'empty'
        ? []
        : items.filter((item) => matchesAuctionListRequest(item, requestBody));
    const total = availableItems.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const offset = (page - 1) * perPage;
    const data = availableItems.slice(offset, offset + perPage);
    const from = data.length > 0 ? offset + 1 : 0;
    const to = data.length > 0 ? offset + data.length : 0;

    return HttpResponse.json({
      data,
      meta: {
        current_page: page,
        from,
        last_page: lastPage,
        per_page: perPage,
        to,
        total,
      },
    } satisfies AuctionListResponse);
  });
}

export function createAuctionDetailHandler({
  items = auctionDetailStore.items,
  responseDelay,
  scenario = 'success',
}: AuctionDetailHandlerOptions = {}) {
  return http.get(
    `${auctionApiUrl}/:auctionUuid`,
    async ({ params: { auctionUuid } }) => {
      if (responseDelay !== undefined) {
        await delay(responseDelay);
      }

      if (scenario === 'error') {
        return HttpResponse.json(
          {
            code: 'auction_unavailable',
            title: 'Сервис временно недоступен',
            message: 'Не удалось загрузить данные аукциона',
            trace_id: 'trace-auction-detail-503',
          } satisfies ProblemDetail,
          { status: 503 },
        );
      }

      const auction = items.find((item) => item.main.order_uid === auctionUuid);

      if (!auction) {
        return HttpResponse.json(
          {
            code: 'resource_not_found',
            title: 'Не найдено',
            message: 'Аукцион не найден',
            trace_id: 'trace-auction-detail-404',
          } satisfies ProblemDetail,
          { status: 404 },
        );
      }

      return HttpResponse.json(auction);
    },
  );
}

export function createAuctionBidHistoryHandler({
  histories = auctionBidHistoryStore.items,
  responseDelay,
  scenario = 'success',
}: AuctionBidHistoryHandlerOptions = {}) {
  return http.get(
    `${auctionApiUrl}/:auctionUuid/bets`,
    async ({ params: { auctionUuid }, request }) => {
      if (responseDelay !== undefined) {
        await delay(responseDelay);
      }

      if (scenario === 'error') {
        return HttpResponse.json(
          {
            code: 'auction_bets_unavailable',
            title: 'Сервис временно недоступен',
            message: 'Не удалось загрузить историю ставок',
            trace_id: 'trace-auction-bets-503',
          } satisfies ProblemDetail,
          { status: 503 },
        );
      }

      const auctionExists = auctionDetailStore.items.some(
        (item) => item.main.order_uid === auctionUuid,
      );

      if (!auctionExists) {
        return HttpResponse.json(
          {
            code: 'resource_not_found',
            title: 'Не найдено',
            message: 'Аукцион не найден',
            trace_id: 'trace-auction-bets-404',
          } satisfies ProblemDetail,
          { status: 404 },
        );
      }

      const history = histories.find(
        (item) => item.auctionUuid === auctionUuid,
      );
      const includeRejected =
        new URL(request.url).searchParams.get('all') === 'true';
      const bets = (history?.bets ?? []).filter(
        (bet) => includeRejected || !bet.is_rejected,
      );

      return HttpResponse.json({ bets } satisfies AuctionBetsResponse);
    },
  );
}

export function createAuctionSetBetHandler({
  responseDelay,
  scenario = 'success',
}: AuctionSetBetHandlerOptions = {}) {
  return http.post(
    `${auctionApiUrl}/:auctionUuid/bets`,
    async ({ params: { auctionUuid }, request }) => {
      if (responseDelay !== undefined) {
        await delay(responseDelay);
      }

      if (scenario === 'error') {
        return HttpResponse.json(
          {
            code: 'auction_bet_unavailable',
            message: 'Не удалось установить ставку',
            title: 'Сервис временно недоступен',
            trace_id: 'trace-auction-bet-503',
          } satisfies ProblemDetail,
          { status: 503 },
        );
      }

      const state = findMutableAuction(auctionUuid);

      if (!state.detail || !state.listItem || !state.history) {
        return HttpResponse.json(
          {
            code: 'resource_not_found',
            message: 'Аукцион не найден',
            title: 'Не найдено',
            trace_id: 'trace-auction-bet-404',
          } satisfies ProblemDetail,
          { status: 404 },
        );
      }

      if (
        state.detail.trading.can_set_bet !== true ||
        state.detail.trading.status !== 'Auction'
      ) {
        return validationResponse('Установка ставки недоступна.');
      }

      if (scenario === 'stale') {
        const current = state.detail.trading.price?.current ?? 0;
        const step = state.detail.trading.price?.step ?? 1;
        const competingAmount =
          state.detail.main.auc_type === 'Down'
            ? current - step
            : current + step;

        applyBidToMockState({ amount: competingAmount, isOwn: false, state });

        return validationResponse(
          'Сумма ставки больше не соответствует актуальным условиям.',
        );
      }

      const { price } = await readSetBetRequest(request);

      if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
        return validationResponse('Сумма ставки должна быть положительной.');
      }

      const minimum = state.detail.trading.price?.min;
      const maximum = state.detail.trading.price?.max;

      if (minimum != null && price < minimum) {
        return validationResponse(`Минимальная сумма ставки: ${minimum}.`);
      }
      if (maximum != null && price > maximum) {
        return validationResponse(`Максимальная сумма ставки: ${maximum}.`);
      }

      applyBidToMockState({ amount: price, isOwn: true, state });

      return new HttpResponse(null, { status: 200 });
    },
  );
}

export const auctionHandlers = [
  createAuctionListHandler(),
  createAuctionDetailHandler(),
  createAuctionBidHistoryHandler(),
  createAuctionSetBetHandler(),
];
