import { delay, http, HttpResponse } from 'msw';

import { auctionStatusIds } from '@/entities/auction/model/auction-status';
import {
  auctionBetsFixture,
  auctionDetailStore,
  auctionListStore,
} from '@/mocks/data/auction-contract-fixtures';
import type { ListAuctionsRequestBody } from '@/shared/api/generated/auctions/list/listAuctions';
import type { components } from '@/shared/api/generated/types';

const auctionApiUrl = '*/api/v1/auctions';

type AuctionListItem = components['schemas']['AuctionListItem'];
type AuctionListResponse = components['schemas']['AuctionListResponseBase'];
type AuctionResponse = components['schemas']['AuctionShowResponse'];
type ProblemDetail = components['schemas']['ProblemDetail'];

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

export const auctionHandlers = [
  createAuctionListHandler(),
  createAuctionDetailHandler(),
  http.get(`${auctionApiUrl}/:auctionUuid/bets`, () => {
    return HttpResponse.json(auctionBetsFixture);
  }),
  http.post(`${auctionApiUrl}/:auctionUuid/bets`, () => {
    return new HttpResponse(null, { status: 200 });
  }),
];
